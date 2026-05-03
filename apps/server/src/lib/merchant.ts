import { JWT } from "google-auth-library";

interface ProductImageInput {
  url: string;
  alt?: string | null;
}

interface MerchantProductInput {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  retailPrice: number | string;
  active: boolean;
  images?: ProductImageInput[];
}

interface MerchantSyncResult {
  ok: boolean;
  operation: "upsert" | "delete";
  status?: number;
  message: string;
}

const MERCHANT_API_BASE = "https://merchantapi.googleapis.com";
const AUTH_SCOPE = "https://www.googleapis.com/auth/content";

let authClient: JWT | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function boolFromEnv(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  return raw.toLowerCase() === "true";
}

export function isMerchantSyncEnabled(): boolean {
  return boolFromEnv("MERCHANT_SYNC_ENABLED", true);
}

export function isMerchantSyncBlocking(): boolean {
  return boolFromEnv("MERCHANT_SYNC_BLOCKING", true);
}

function getWebBaseUrl(): string {
  const raw = process.env.WEB_URL ?? "http://localhost:3000";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function getMerchantSettings() {
  const accountId = requiredEnv("MERCHANT_CENTER_ACCOUNT_ID");
  const dataSourceId = requiredEnv("MERCHANT_DATASOURCE_ID");
  const contentLanguage = process.env.MERCHANT_CONTENT_LANGUAGE ?? "en";
  const feedLabel = process.env.MERCHANT_FEED_LABEL ?? "ZW";
  const currency = process.env.MERCHANT_CURRENCY ?? "USD";

  return {
    accountId,
    dataSourceId,
    contentLanguage,
    feedLabel,
    currency,
  };
}

function getJwtClient(): JWT {
  if (authClient) {
    return authClient;
  }

  const clientEmail = requiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");

  authClient = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [AUTH_SCOPE],
  });

  return authClient;
}

async function getAccessToken(): Promise<string> {
  const client = getJwtClient();
  const tokenResponse = await client.getAccessToken();
  const token =
    typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;

  if (!token) {
    throw new Error("Unable to obtain Google access token for Merchant API");
  }

  return token;
}

function mapProductToAttributes(product: MerchantProductInput) {
  const imageLink = product.images?.[0]?.url;
  if (!imageLink) {
    throw new Error("Product must have at least one image for Merchant Center sync");
  }

  const { currency } = getMerchantSettings();
  const normalizedPrice = Number(product.retailPrice);

  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    throw new Error("Product retailPrice must be a positive number for Merchant Center sync");
  }

  const productLink = `${getWebBaseUrl()}/products/${product.slug}`;

  return {
    title: product.name,
    description:
      product.description?.trim() ||
      `${product.name} available at Accessories World. Contact us for more details.`,
    link: productLink,
    imageLink,
    availability: product.active ? "in_stock" : "out_of_stock",
    condition: "new",
    price: {
      amountMicros: String(Math.round(normalizedPrice * 1_000_000)),
      currencyCode: currency,
    },
    identifierExists: false,
  };
}

async function merchantRequest<T>(path: string, init: RequestInit): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${MERCHANT_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Merchant API ${response.status}: ${errorText || "Unknown error"}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

function getProductInputId(offerId: string): string {
  const { contentLanguage, feedLabel } = getMerchantSettings();
  return `online~${contentLanguage}~${feedLabel}~${offerId}`;
}

export async function upsertProductInMerchantCenter(
  product: MerchantProductInput
): Promise<MerchantSyncResult> {
  if (!isMerchantSyncEnabled()) {
    return {
      ok: true,
      operation: "upsert",
      message: "Merchant sync disabled by configuration",
    };
  }

  const { accountId, dataSourceId, contentLanguage, feedLabel } = getMerchantSettings();

  const body = {
    dataSource: `accounts/${accountId}/dataSources/${dataSourceId}`,
    productInput: {
      offerId: product.id,
      channel: "ONLINE",
      contentLanguage,
      feedLabel,
      attributes: mapProductToAttributes(product),
    },
  };

  await merchantRequest(`/accounts/${accountId}/productInputs:insert`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    ok: true,
    operation: "upsert",
    message: `Synced product ${product.id} to Merchant Center`,
  };
}

export async function deleteProductFromMerchantCenter(offerId: string): Promise<MerchantSyncResult> {
  if (!isMerchantSyncEnabled()) {
    return {
      ok: true,
      operation: "delete",
      message: "Merchant sync disabled by configuration",
    };
  }

  const { accountId } = getMerchantSettings();
  const productInputId = encodeURIComponent(getProductInputId(offerId));

  await merchantRequest(`/accounts/${accountId}/productInputs/${productInputId}`, {
    method: "DELETE",
  });

  return {
    ok: true,
    operation: "delete",
    message: `Deleted product ${offerId} from Merchant Center`,
  };
}

/**
 * Scheduler for delayed follow-up messages
 * Dev: 10 seconds
 * Prod: 3 days (259200000 ms)
 */

const isDev = process.env.NODE_ENV !== "production";
const DELAY_MS = isDev ? 10 * 1000 : 3 * 24 * 60 * 60 * 1000; // 10s dev, 3 days prod

export interface FollowUpData {
  customerName: string;
  customerPhone: string;
  productNames: string[];
  agentUrl: string;
  businessWhatsapp: string;
}

/**
 * Schedule a follow-up message to be sent after the delay
 * In dev: 10 seconds
 * In prod: 3 days
 */
export function scheduleFollowUp(data: FollowUpData) {
  setTimeout(async () => {
    try {
      await sendFollowUpMessage(data);
    } catch (err) {
      console.error("Failed to send scheduled follow-up:", err);
    }
  }, DELAY_MS);

  if (isDev) {
    console.log(`[SCHEDULER] Follow-up scheduled for ${data.customerPhone} in ${DELAY_MS / 1000}s`);
  }
}

/**
 * Send the actual follow-up message via WhatsApp
 */
async function sendFollowUpMessage(data: FollowUpData) {
  const { customerName, customerPhone, productNames, agentUrl, businessWhatsapp } = data;
  const firstName = customerName.split(" ")[0];
  const productList = productNames.join(", ");

  const followUpMessage = `Hello ${firstName}, how are you?

This is Shantel from Accessories World 😊 You recently purchased ${productList} from us — thank you again for your support.

I just wanted to check in and make sure everything is working perfectly. Please feel free to let us know if you need any assistance.`;

  try {
    const res = await fetch(`${agentUrl}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: customerPhone,
        message: followUpMessage,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      // If number is not on WhatsApp, log but don't treat as critical error
      if (res.status === 400 || errorBody.includes("not registered on WhatsApp")) {
        console.warn(`[FOLLOW-UP] ⚠️  Customer number ${customerPhone} is not on WhatsApp — skipping follow-up`);
      } else {
        console.error(`[FOLLOW-UP] Failed to send to ${customerPhone}: ${res.statusText}`);
      }
    } else {
      console.log(`[FOLLOW-UP] ✓ Message sent to ${customerPhone}`);
    }
  } catch (err) {
    console.error(`[FOLLOW-UP] Error sending to ${customerPhone}:`, err);
  }
}

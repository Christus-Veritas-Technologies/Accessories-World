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
  const delaySeconds = DELAY_MS / 1000;
  const scheduledTime = new Date(Date.now() + DELAY_MS).toLocaleTimeString();
  
  console.log(`[SCHEDULER] 📅 Scheduled follow-up for ${data.customerPhone}`);
  console.log(`[SCHEDULER]    Delay: ${delaySeconds} seconds`);
  console.log(`[SCHEDULER]    Scheduled send time: ${scheduledTime}`);
  console.log(`[SCHEDULER]    Message will be sent to: ${data.customerPhone}`);
  console.log(`[SCHEDULER]    Products: ${data.productNames.join(", ")}`);
  
  const timeoutId = setTimeout(async () => {
    console.log(`[SCHEDULER] ⏰ Timer fired! Sending follow-up to ${data.customerPhone}...`);
    try {
      await sendFollowUpMessage(data);
    } catch (err) {
      console.error(`[SCHEDULER] ❌ Failed to send scheduled follow-up:`, err);
    }
  }, DELAY_MS);

  if (isDev) {
    console.log(`[SCHEDULER] Timeout ID: ${timeoutId}`);
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

  console.log(`[FOLLOW-UP] 📤 Attempting to send message to ${customerPhone}`);
  console.log(`[FOLLOW-UP] Agent URL: ${agentUrl}/api/whatsapp/send`);
  console.log(`[FOLLOW-UP] Message preview: ${followUpMessage.substring(0, 50)}...`);

  try {
    const res = await fetch(`${agentUrl}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: customerPhone,
        message: followUpMessage,
      }),
    });

    console.log(`[FOLLOW-UP] Response status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const errorBody = await res.text();
      // If number is not on WhatsApp, log but don't treat as critical error
      if (res.status === 400 || errorBody.includes("not registered on WhatsApp")) {
        console.warn(`[FOLLOW-UP] ⚠️  Customer number ${customerPhone} is not on WhatsApp — skipping follow-up`);
      } else if (res.status === 503) {
        console.warn(`[FOLLOW-UP] ⚠️  Agent not connected (${res.statusText}) — follow-up could not be sent`);
      } else {
        console.error(`[FOLLOW-UP] ❌ Failed to send to ${customerPhone}: ${res.statusText}`);
        console.error(`[FOLLOW-UP] Response body:`, errorBody);
      }
    } else {
      console.log(`[FOLLOW-UP] ✅ Message sent to ${customerPhone}`);
    }
  } catch (err) {
    console.error(`[FOLLOW-UP] ❌ Network error sending to ${customerPhone}:`, err);
  }
}

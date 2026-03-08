/**
 * Scheduler for delayed follow-up messages
 * Default: 72 hours (259200000 ms)
 * Override for dev/testing: set FOLLOW_UP_DELAY_MS in .env (e.g. FOLLOW_UP_DELAY_MS=10000)
 */

const SEVENTY_TWO_HOURS_MS = 72 * 60 * 60 * 1000; // 259200000 ms
const DELAY_MS = process.env.FOLLOW_UP_DELAY_MS
  ? Number(process.env.FOLLOW_UP_DELAY_MS)
  : SEVENTY_TWO_HOURS_MS;

export interface FollowUpData {
  customerName: string;
  customerPhone: string;
  productNames: string[];
  agentUrl: string;
  businessWhatsapp: string;
  senderName: string;
}

/**
 * Schedule a follow-up message to be sent after the delay (default: 72 hours)
 */
export function scheduleFollowUp(data: FollowUpData) {
  const delayHours = (DELAY_MS / 1000 / 60 / 60).toFixed(1);
  const scheduledAt = new Date(Date.now() + DELAY_MS).toISOString();
  
  console.log(`[SCHEDULER] 📅 Scheduled follow-up for ${data.customerPhone}`);
  console.log(`[SCHEDULER]    Delay: ${delayHours} hours (${DELAY_MS} ms)`);
  console.log(`[SCHEDULER]    Will send at: ${scheduledAt}`);
  console.log(`[SCHEDULER]    Products: ${data.productNames.join(", ")}`);
  
  setTimeout(async () => {
    console.log(`[SCHEDULER] ⏰ Timer fired! Sending follow-up to ${data.customerPhone}...`);
    try {
      await sendFollowUpMessage(data);
    } catch (err) {
      console.error(`[SCHEDULER] ❌ Failed to send scheduled follow-up:`, err);
    }
  }, DELAY_MS);
}

/**
 * Send the actual follow-up message via WhatsApp
 */
async function sendFollowUpMessage(data: FollowUpData) {
  const { customerName, customerPhone, productNames, agentUrl, businessWhatsapp, senderName } = data;
  const firstName = customerName.split(" ")[0];
  const productList = productNames.join(", ");

  const followUpMessage = `Hello ${firstName}, how are you?

This is ${senderName} from Accessories World 😊 You recently purchased ${productList} from us — thank you again for your support.

I just wanted to check in and make sure everything is working perfectly. Please feel free to let us know if you need any assistance.`;

  console.log(`[FOLLOW-UP] 📤 Attempting to send message to ${customerPhone}`);
  console.log(`[FOLLOW-UP] Agent URL: ${agentUrl}/api/whatsapp/send`);
  console.log(`[FOLLOW-UP] Message length: ${followUpMessage.length} characters`);
  console.log(`[FOLLOW-UP] Message preview: ${followUpMessage.substring(0, 50)}...`);

  try {
    const payload = {
      phone: customerPhone,
      message: followUpMessage,
    };
    
    console.log(`[FOLLOW-UP] 📦 Payload being sent:`, JSON.stringify(payload, null, 2));

    const res = await fetch(`${agentUrl}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log(`[FOLLOW-UP] Response status: ${res.status} ${res.statusText}`);
    console.log(`[FOLLOW-UP] Response content-type: ${res.headers.get("content-type")}`);

    const responseText = await res.text();
    console.log(`[FOLLOW-UP] Raw response body: ${responseText}`);

    if (!res.ok) {
      // If number is not on WhatsApp, log but don't treat as critical error
      if (res.status === 400 || responseText.includes("not registered on WhatsApp")) {
        console.warn(`[FOLLOW-UP] ⚠️  Customer number ${customerPhone} is not on WhatsApp — skipping follow-up`);
      } else if (res.status === 503) {
        console.warn(`[FOLLOW-UP] ⚠️  Agent not connected (${res.statusText}) — follow-up could not be sent`);
      } else {
        console.error(`[FOLLOW-UP] ❌ Failed to send to ${customerPhone}: ${res.statusText}`);
        console.error(`[FOLLOW-UP] Response body:`, responseText);
      }
    } else {
      console.log(`[FOLLOW-UP] ✅ Message sent to ${customerPhone}`);
    }
  } catch (err) {
    console.error(`[FOLLOW-UP] ❌ Network error sending to ${customerPhone}:`, err);
  }
}

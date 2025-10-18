import crypto from 'crypto';

/**
 * Verifies the HMAC signature from Thinkific webhooks
 * @param payload - The raw request body
 * @param signature - The X-Thinkific-Hmac-Sha256 header value
 * @param secret - The API key or app secret
 * @returns boolean indicating if the signature is valid
 */
export function verifyThinkificWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    if (!signature || !secret) {
      console.warn('⚠️ Missing signature or secret for webhook verification');
      return false;
    }

    // Create HMAC digest
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Compare signatures using timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      console.warn('❌ Invalid webhook signature:', {
        expected: expectedSignature,
        received: signature,
        payloadLength: payload.length
      });
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Extracts the signature from the X-Thinkific-Hmac-Sha256 header
 * @param headers - Request headers object
 * @returns The signature string or null if not found
 */
export function extractWebhookSignature(headers: any): string | null {
  const signature = headers['x-thinkific-hmac-sha256'] || 
                   headers['X-Thinkific-Hmac-Sha256'] ||
                   headers['X-THINKIFIC-HMAC-SHA256'];
  
  return signature || null;
}

/**
 * Gets the webhook secret from environment variables
 * @returns The webhook secret or empty string
 */
export function getWebhookSecret(): string {
  return process.env.THINKIFIC_WEBHOOK_SECRET || 
         process.env.API_KEY || 
         '';
}


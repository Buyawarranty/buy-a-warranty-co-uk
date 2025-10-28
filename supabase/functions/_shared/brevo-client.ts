// Brevo API Client for Supabase Edge Functions
// Handles contact management, event tracking, and transactional emails

const BREVO_API_URL = 'https://api.brevo.com/v3';

export interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    PHONE?: string;
    VEHICLE_REG?: string;
    VEHICLE_MAKE?: string;
    VEHICLE_MODEL?: string;
    PLAN_NAME?: string;
    PAYMENT_TYPE?: string;
    POLICY_NUMBER?: string;
    ORDER_VALUE?: number;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

export interface BrevoEvent {
  email: string;
  event: string;
  eventdata?: Record<string, any>;
}

export interface BrevoTransactionalEmail {
  to: Array<{ email: string; name?: string }>;
  templateId: number;
  params?: Record<string, any>;
  tags?: string[];
}

export class BrevoClient {
  private apiKey: string;
  private maKey: string;

  constructor(apiKey: string, maKey: string) {
    this.apiKey = apiKey;
    this.maKey = maKey;
  }

  /**
   * Create or update a contact in Brevo
   */
  async createOrUpdateContact(contact: BrevoContact): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      const response = await fetch(`${BREVO_API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          email: contact.email,
          attributes: contact.attributes || {},
          listIds: contact.listIds || [],
          updateEnabled: contact.updateEnabled !== false, // Default to true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, contactId: data.id?.toString() };
      }

      // If contact already exists (HTTP 400), that's okay - it means updateEnabled worked
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.message?.includes('already exists')) {
          return { success: true, contactId: contact.email };
        }
      }

      const errorText = await response.text();
      console.error('Brevo create/update contact error:', errorText);
      return { success: false, error: errorText };
    } catch (error) {
      console.error('Exception in createOrUpdateContact:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Track a marketing automation event in Brevo
   */
  async trackEvent(event: BrevoEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${BREVO_API_URL}/trackEvent`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ma-key': this.maKey,
        },
        body: JSON.stringify({
          email: event.email,
          event: event.event,
          eventdata: event.eventdata || {},
        }),
      });

      if (response.ok) {
        return { success: true };
      }

      const errorText = await response.text();
      console.error('Brevo track event error:', errorText);
      return { success: false, error: errorText };
    } catch (error) {
      console.error('Exception in trackEvent:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send a transactional email via Brevo
   */
  async sendTransactionalEmail(email: BrevoTransactionalEmail): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          to: email.to,
          templateId: email.templateId,
          params: email.params || {},
          tags: email.tags || [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.messageId };
      }

      const errorText = await response.text();
      console.error('Brevo send email error:', errorText);
      return { success: false, error: errorText };
    } catch (error) {
      console.error('Exception in sendTransactionalEmail:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get contact information by email
   */
  async getContact(email: string): Promise<{ success: boolean; contact?: any; error?: string }> {
    try {
      const response = await fetch(`${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'api-key': this.apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, contact: data };
      }

      if (response.status === 404) {
        return { success: false, error: 'Contact not found' };
      }

      const errorText = await response.text();
      return { success: false, error: errorText };
    } catch (error) {
      console.error('Exception in getContact:', error);
      return { success: false, error: String(error) };
    }
  }
}

/**
 * Factory function to create a Brevo client instance
 */
export function createBrevoClient(apiKey?: string, maKey?: string): BrevoClient {
  const key = apiKey || Deno.env.get('BREVO_API_KEY');
  const ma = maKey || Deno.env.get('BREVO_MA_KEY');
  
  if (!key || !ma) {
    throw new Error('BREVO_API_KEY and BREVO_MA_KEY environment variables are required');
  }
  
  return new BrevoClient(key, ma);
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_URL = "https://api.paystack.co";

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    metadata: any;
    customer: {
      email: string;
    };
  };
}

export const paystack = {
  async initializeTransaction(email: string, amountCents: number, metadata: any) {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined");
    }

    const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountCents, // Paystack expects amount in sub-units (cents/pesewas)
        metadata,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sessions`,
      }),
    });

    const result = await response.json();
    if (!result.status) {
      throw new Error(result.message || "Failed to initialize Paystack transaction");
    }

    return result as PaystackInitializeResponse;
  },

  async verifyTransaction(reference: string) {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined");
    }

    const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const result = await response.json();
    if (!result.status) {
      throw new Error(result.message || "Failed to verify Paystack transaction");
    }

    return result as PaystackVerifyResponse;
  },
};

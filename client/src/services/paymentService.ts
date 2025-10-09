import apiService from "./api";

export interface PaymentInitiateRequest {
  orderId: string;
  amount: string;
  currency: string;
  billingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  redirectUrl: string;
  cancelUrl: string;
  userId: string;
  jewelryId?: string; // Add optional jewelryId
}

export interface PaymentInitiateResponse {
  success: boolean;
  data: {
    encryptedData: string;
    accessCode: string;
    orderId: string;
    paymentUrl: string;
  };
  message: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  data: {
    orderId: string;
    status: "success" | "failed" | "pending";
    amount: string;
    transactionId?: string;
    paymentDate?: string;
  };
  message: string;
}

class PaymentService {
  private baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  async initiatePayment(
    paymentData: PaymentInitiateRequest
  ): Promise<PaymentInitiateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment initiation failed");
      }

      return data;
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw error;
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/status/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get payment status");
      }

      return data;
    } catch (error) {
      console.error("Payment status error:", error);
      throw error;
    }
  }

  async getUserPaymentOrders(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/payment/orders/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get payment orders");
      }

      return data;
    } catch (error) {
      console.error("Get payment orders error:", error);
      throw error;
    }
  }

  // Create a form and submit to CCAvenue
  submitPaymentForm(
    encryptedData: string,
    accessCode: string,
    paymentUrl: string
  ) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    const encDataInput = document.createElement("input");
    encDataInput.type = "hidden";
    encDataInput.name = "encRequest";
    encDataInput.value = encryptedData;

    const accessCodeInput = document.createElement("input");
    accessCodeInput.type = "hidden";
    accessCodeInput.name = "access_code";
    accessCodeInput.value = accessCode;

    form.appendChild(encDataInput);
    form.appendChild(accessCodeInput);
    document.body.appendChild(form);

    console.log("🚀 Submitting payment form to CCAvenue:", {
      paymentUrl,
      accessCode,
      encryptedDataLength: encryptedData.length,
    });

    form.submit();
  }
}

export const paymentService = new PaymentService();

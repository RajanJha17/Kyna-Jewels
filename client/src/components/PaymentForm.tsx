import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CreditCard, Lock, Shield } from "lucide-react";
import {
  paymentService,
  PaymentInitiateRequest,
} from "../services/paymentService";

interface PaymentFormProps {
  orderData: {
    orderId: string;
    amount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  userInfo: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  onPaymentInitiated?: (orderId: string) => void;
  onError?: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  orderData,
  userInfo,
  onPaymentInitiated,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    name: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
    email: userInfo.email,
    phone: userInfo.phone || "",
    address: userInfo.address || "",
    city: userInfo.city || "",
    state: userInfo.state || "",
    zip: userInfo.zipCode || "",
    country: userInfo.country || "India",
  });

  const handleInputChange = (field: string, value: string) => {
    setBillingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const required = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zip",
    ];
    const missing = required.filter(
      (field) => !billingInfo[field as keyof typeof billingInfo]
    );

    if (missing.length > 0) {
      onError?.(`Please fill in all required fields: ${missing.join(", ")}`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      onError?.("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(billingInfo.phone.replace(/[-\s]/g, ""))) {
      onError?.("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const initiatePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const paymentData: PaymentInitiateRequest = {
        orderId: orderData.orderId,
        amount: orderData.amount.toString(),
        currency: "INR",
        billingInfo: billingInfo,
        redirectUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
        userId: userInfo.userId,
        // jewelryId: orderData.jewelryId, // Include jewelryId if available
      };

      console.log("💳 Initiating payment:", paymentData);

      const response = await paymentService.initiatePayment(paymentData);

      if (response.success) {
        console.log("✅ Payment initiated successfully:", response.data);

        onPaymentInitiated?.(response.data.orderId); // Use the returned order ID

        // Submit to CCAvenue
        paymentService.submitPaymentForm(
          response.data.encryptedData,
          response.data.accessCode,
          response.data.paymentUrl
        );
      } else {
        throw new Error(response.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error("❌ Payment initiation failed:", error);
      onError?.(
        error instanceof Error ? error.message : "Payment initiation failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Order Summary */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Order Summary
        </h3>
        <div className="space-y-2">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{orderData.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input
              type="text"
              value={billingInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={billingInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <Input
              type="tel"
              value={billingInfo.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+91-9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              value={billingInfo.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              required
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <Input
              type="text"
              value={billingInfo.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <Input
              type="text"
              value={billingInfo.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Mumbai"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <Input
              type="text"
              value={billingInfo.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="Maharashtra"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <Input
              type="text"
              value={billingInfo.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              placeholder="400001"
              required
            />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 text-green-800 mb-2">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Secure Payment</span>
        </div>
        <p className="text-sm text-green-700">
          Your payment is secured with 256-bit SSL encryption. We don't store
          your card details.
        </p>
      </div>

      {/* Payment Button */}
      <Button
        onClick={initiatePayment}
        disabled={isProcessing}
        className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white py-3 text-lg font-medium flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ₹{orderData.amount.toLocaleString()} Securely
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By clicking "Pay Securely", you agree to our Terms of Service and
        Privacy Policy. You will be redirected to CCAvenue for secure payment
        processing.
      </p>
    </div>
  );
};

export default PaymentForm;

import { useState, useEffect, useCallback } from "react";
import { Package, Search, Mail, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { trackingApi } from "@/services/api";
import TrackingProgress from "@/components/tracking/TrackingProgress";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import TrackingCard from "@/components/tracking/TrackingCard";
import SEO from "@/components/SEO";

interface TrackingData {
  orderNumber: string;
  customerEmail: string;
  status: string;
  estimatedDelivery?: string;
  docketNumber?: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  trackingHistory: Array<{
    status: string;
    description: string;
    location?: string;
    timestamp: string;
    code: string;
  }>;
  items?: Array<{
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount?: number;
  updatedAt: string;
}


const AUTO_REFRESH_INTERVAL = 180000; // 3 minutes

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load cached data on mount
  useEffect(() => {
    const cachedData = localStorage.getItem("lastTrackedOrder");
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setTrackingData(parsed.data);
        setOrderNumber(parsed.orderNumber);
        setEmail(parsed.email);
      } catch (e) {
        console.error("Failed to load cached data", e);
      }
    }
  }, []);

  const fetchTrackingData = useCallback(async (showLoader = true) => {
    if (!orderNumber || !email) {
      setError("Please enter both order number and email");
      return;
    }

    if (showLoader) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError("");

    try {
      const response = await trackingApi.trackOrder(orderNumber, email);
      
      if (response.success && response.data) {
        setTrackingData(response.data as TrackingData);
        
        // Cache the data
        localStorage.setItem(
          "lastTrackedOrder",
          JSON.stringify({
            data: response.data,
            orderNumber,
            email,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        setError(response.error || "Order not found. Please check your details.");
        setTrackingData(null);
      }
    } catch (err) {
      setError("Failed to fetch tracking data. Please try again.");
      console.error("Tracking error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [orderNumber, email]);

  // Auto-refresh tracking data
  useEffect(() => {
    if (!trackingData || trackingData.status === "DELIVERED") return;

    const interval = setInterval(() => {
      fetchTrackingData(false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [trackingData, fetchTrackingData]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchTrackingData();
  };

  const handleRefresh = () => {
    fetchTrackingData(false);
  };

  return (
    <>
      <SEO
        title="Track Your Order | Kyna Jewels"
        description="Track your jewelry order in real-time with Kyna Jewels. Get instant updates on your package delivery status."
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Track Your Order Details
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your order details to get real-time tracking updates
            </p>
          </div>

          {/* Demo Orders Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Test Orders from Database:</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>ORD123456</strong> - customer@example.com (Delivered)</p>
              <p><strong>ORD789012</strong> - test@example.com (Packaging)</p>
              <p><strong>ORD345678</strong> - demo@example.com (On The Road)</p>
              <p><strong>ORD999888</strong> - customer@example.com (Processing)</p>
              <p><strong>ORD111222</strong> - test@example.com (Order Placed)</p>
            </div>
          </div>

          {/* Tracking Form */}
          {!trackingData && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
              <form onSubmit={handleTrackOrder} className="space-y-5">
                <div>
                  <label
                    htmlFor="orderNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Order Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="orderNumber"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                      placeholder="e.g., ORD123456"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#126180] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="your.email@example.com"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#126180] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#126180] hover:bg-[#0f4f6b] text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                      Tracking...
                    </span>
                  ) : (
                    "Track Order"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tracking Results */}
          {trackingData && (
            <div className="space-y-4">
              {/* Order Info Header */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order #{trackingData.orderNumber}
                    </h2>
                    {trackingData.docketNumber && (
                      <p className="text-sm text-gray-600 mt-1">
                        Tracking ID: {trackingData.docketNumber}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setTrackingData(null)}
                    className="text-sm text-[#126180] hover:underline font-medium"
                  >
                    Track Another Order
                  </button>
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Last updated: {new Date(trackingData.updatedAt).toLocaleString()}
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center text-[#126180] hover:text-[#0f4f6b] font-medium disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-1 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <TrackingProgress status={trackingData.status} />

              {/* Order Details and Timeline */}
              <div className="grid md:grid-cols-2 gap-4">
                <TrackingCard
                  trackingData={trackingData}
                  courierPartner="Sequel247"
                />
                <TrackingTimeline events={trackingData.trackingHistory} />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!trackingData && !loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tracking data yet
              </h3>
              <p className="text-gray-600">
                Enter your order details above to track your package
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

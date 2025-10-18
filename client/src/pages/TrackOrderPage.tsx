import { useState, useEffect, useCallback } from "react";
import { Package, Search, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { trackingApi } from "@/services/api";
import TrackingProgress from "@/components/tracking/TrackingProgress";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import TrackingCard from "@/components/tracking/TrackingCard";
import SEO from "@/components/SEO";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

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
  const [userId, setUserId] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get user from Redux store
  const authUser = useSelector((state: RootState) => state.auth.user);

  // Get userId from multiple sources on component mount
  useEffect(() => {
    const getUserId = () => {
      // Try multiple sources for userId
      let userIdFromStorage = "";

      // 1. Try Redux store first
      if (authUser?.id) {
        userIdFromStorage = String(authUser.id);
        console.log("📍 Got userId from Redux store:", userIdFromStorage);
      }

      // 2. Try localStorage if Redux doesn't have it
      if (!userIdFromStorage) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userIdFromStorage = String(
              parsedUser.id || parsedUser._id || parsedUser.userId || ""
            );
            console.log(
              "📍 Got userId from localStorage user object:",
              userIdFromStorage
            );
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }
      }

      // 3. Try direct userId from localStorage
      if (!userIdFromStorage) {
        const directUserId = localStorage.getItem("userId");
        if (directUserId) {
          userIdFromStorage = String(directUserId);
          console.log(
            "📍 Got userId from direct localStorage:",
            userIdFromStorage
          );
        }
      }

      // 4. Try auth token payload
      if (!userIdFromStorage) {
        const token = localStorage.getItem("accessToken");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userIdFromStorage = String(
              payload.id || payload.userId || payload.sub || ""
            );
            console.log("📍 Got userId from token payload:", userIdFromStorage);
          } catch (e) {
            console.error("Error parsing token:", e);
          }
        }
      }

      return userIdFromStorage;
    };

    const detectedUserId = getUserId();
    if (detectedUserId) {
      setUserId(detectedUserId);
      console.log("✅ Auto-detected userId:", detectedUserId);
    } else {
      console.warn("⚠️ No userId found in any storage location");
    }

    // Load cached tracking data
    const cachedData = localStorage.getItem("lastTrackedOrder");
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setTrackingData(parsed.data);
        setOrderNumber(parsed.orderNumber);
        // Only override userId if we didn't auto-detect one
        if (!detectedUserId && parsed.userId) {
          setUserId(String(parsed.userId));
        }
      } catch (e) {
        console.error("Failed to load cached data", e);
      }
    }
  }, [authUser]);

  const fetchTrackingData = useCallback(
    async (showLoader = true) => {
      if (!orderNumber || !userId) {
        setError("Please enter both order number and user ID");
        return;
      }

      if (showLoader) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError("");

      try {
        const response = await trackingApi.trackOrder(orderNumber, userId);

        if (response.success && response.data) {
          setTrackingData(response.data as TrackingData);

          // Cache the data
          localStorage.setItem(
            "lastTrackedOrder",
            JSON.stringify({
              data: response.data,
              orderNumber,
              userId,
              timestamp: new Date().toISOString(),
            })
          );
        } else {
          setError(
            response.error || "Order not found. Please check your details."
          );
          setTrackingData(null);
        }
      } catch (err) {
        setError("Failed to fetch tracking data. Please try again.");
        console.error("Tracking error:", err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [orderNumber, userId]
  );

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
              Enter your order number to get real-time tracking updates
              {userId && (
                <span className="block text-green-600 mt-1">
                  ✅ Logged in as User ID: {userId}
                </span>
              )}
            </p>
          </div>

          {/* Demo Orders Info - Updated */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              {userId
                ? "Ready to Track Your Orders:"
                : "Test with Sample Data:"}
            </h3>
            <div className="text-xs text-blue-800 space-y-1">
              {userId ? (
                <p>
                  Your User ID has been automatically detected. Just enter your
                  order number below.
                </p>
              ) : (
                <>
                  <p>
                    <strong>Order Number:</strong> KYNA1760721116496jj2u0oia6
                  </p>
                  <p>
                    <strong>User ID:</strong> 68c85306d7202412be3bb05a
                  </p>
                  <p>Please log in for automatic user detection</p>
                </>
              )}
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
                      onChange={(e) => setOrderNumber(e.target.value.trim())}
                      placeholder="e.g., KYNA1760721116496jj2u0oia6"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#126180] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="userId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    User ID
                    {userId && (
                      <span className="text-green-600 ml-2">
                        ✅ Auto-detected
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(String(e.target.value.trim()))}
                      placeholder="e.g., 68c85306d7202412be3bb05a"
                      className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#126180] focus:border-transparent transition-all ${
                        userId ? "bg-green-50 border-green-300" : ""
                      }`}
                      required
                    />
                  </div>
                  {!userId && !authUser && (
                    <p className="text-xs text-amber-600 mt-1">
                      💡 Log in to auto-detect your User ID
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !orderNumber || !userId}
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
                    Last updated:{" "}
                    {new Date(trackingData.updatedAt).toLocaleString()}
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
                {userId
                  ? "Enter your order number above to track your package"
                  : "Please log in or enter your details above to track your package"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

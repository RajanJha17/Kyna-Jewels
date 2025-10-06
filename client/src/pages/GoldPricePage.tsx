// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../store";
// import {
//   setLoading,
//   setError,
//   updatePrices,
//   clearError,
//   GoldPrice,
//   SilverPrice,
// } from "../store/slices/goldPriceSlice";
// import GoldAPIService from "../services/goldApiService";
// import { TrendingUp, TrendingDown, Clock } from "lucide-react";

// const GoldPricePage: React.FC = () => {
//   const dispatch = useDispatch();
//   const { gold24k, silver, isLoading, error, lastFetchTime } = useSelector(
//     (state: RootState) => state.goldPrice
//   );

//   const [countdown, setCountdown] = useState<number>(120);
//   const countdownRef = useRef<NodeJS.Timeout | null>(null);
//   const refreshIntervalHours = 8; // 8 hours interval

//   // Format price with Indian number system
//   const formatPrice = (price: number): string =>
//     new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(price);

//   // Format time
//   const formatTime = (timestamp: string | null): string => {
//     if (!timestamp) return "Never";
//     const date = new Date(timestamp);
//     return date.toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });
//   };

//   // Mock change calculation
//   const getChangeData = (price: number) => {
//     const change = Math.random() * 200 - 100;
//     const changePercentage = (change / price) * 100;
//     return { change, changePercentage };
//   };

//   // Fetch prices from GoldAPIService
//   const fetchPrices = async () => {
//     dispatch(setLoading(true));
//     dispatch(clearError());

//     try {
//       const prices = await GoldAPIService.getLivePrices();

//       const goldPrice: GoldPrice = {
//         price: prices.gold.gold,
//         currency: prices.gold.currency,
//         purity: "24K",
//         lastUpdated: prices.gold.timestamp,
//         ...getChangeData(prices.gold.gold),
//       };

//       const silverPrice: SilverPrice = {
//         price: prices.silver.silver,
//         currency: prices.silver.currency,
//         purity: "Pure",
//         lastUpdated: prices.silver.timestamp,
//         ...getChangeData(prices.silver.silver),
//       };

//       dispatch(updatePrices({ gold: goldPrice, silver: silverPrice }));
//     } catch (err) {
//       dispatch(setError("Failed to fetch live prices. Please try again."));
//       console.error("Error fetching prices:", err);
//     }
//   };

//   // Countdown timer
//   const startCountdown = () => {
//     if (countdownRef.current) clearInterval(countdownRef.current);

//     setCountdown(480); // 8 minutes for demo (adjust if needed)

//     countdownRef.current = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev <= 1) {
//           fetchPrices(); // auto-fetch
//           return 120; // reset countdown
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const formatCountdown = (seconds: number): string => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
//   };

//   // Initial fetch and setup
//   useEffect(() => {
//     fetchPrices();

//     const intervalMs = refreshIntervalHours * 60 * 60 * 1000;
//     const id = setInterval(() => fetchPrices(), intervalMs);

//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     if (lastFetchTime) startCountdown();
//   }, [lastFetchTime]);

//   const ChangeIndicator: React.FC<{
//     change?: number;
//     changePercentage?: number;
//   }> = ({ change, changePercentage }) => {
//     if (!change || !changePercentage) return null;
//     const isPositive = change > 0;
//     const Icon = isPositive ? TrendingUp : TrendingDown;
//     const colorClass = isPositive ? "text-green-600" : "text-red-600";
//     const bgClass = isPositive ? "bg-green-50" : "bg-red-50";

//     return (
//       <div
//         className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass} ${bgClass}`}
//       >
//         <Icon className="w-3 h-3 mr-1" />
//         {formatPrice(Math.abs(change))} ({Math.abs(changePercentage).toFixed(2)}
//         %)
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-4xl">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">
//             Live Gold & Silver Prices
//           </h1>
//           <p className="text-gray-600">
//             Real-time precious metal prices in India
//           </p>
//           <div className="flex items-center justify-center gap-4 mt-4">
//             <div className="flex items-center text-sm text-gray-500">
//               <Clock className="w-4 h-4 mr-1" />
//               Last updated: {formatTime(lastFetchTime)}
//             </div>
//             <div className="flex items-center text-sm text-gray-500">
//               Next update in: {formatCountdown(countdown)}
//             </div>
//           </div>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
//             <p className="font-medium">Error</p>
//             <p className="text-sm">{error}</p>
//           </div>
//         )}

//         {/* Loading */}
//         {isLoading && (
//           <div className="text-center py-8">
//             <Clock className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
//             <p className="text-gray-500">Fetching live prices...</p>
//           </div>
//         )}

//         {/* Price Cards */}
//         <div className="grid md:grid-cols-2 gap-6">
//           {/* Gold */}
//           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h2 className="text-2xl font-bold text-yellow-600">Gold 24K</h2>
//                 <p className="text-sm text-gray-500">Pure Gold (per 10g)</p>
//               </div>
//               <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
//                 <span className="text-white font-bold text-lg">Au</span>
//               </div>
//             </div>
//             {gold24k ? (
//               <>
//                 <div className="text-3xl font-bold text-gray-900 mb-2">
//                   {formatPrice(gold24k.price)}
//                 </div>
//                 <div className="mb-4">
//                   <ChangeIndicator
//                     change={gold24k.change}
//                     changePercentage={gold24k.changePercentage}
//                   />
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   Updated: {formatTime(gold24k.lastUpdated)}
//                 </div>
//               </>
//             ) : (
//               <div className="text-gray-500">Price data not available</div>
//             )}
//           </div>

//           {/* Silver */}
//           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-600">
//                   Silver Pure
//                 </h2>
//                 <p className="text-sm text-gray-500">Pure Silver (per kg)</p>
//               </div>
//               <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
//                 <span className="text-white font-bold text-lg">Ag</span>
//               </div>
//             </div>
//             {silver ? (
//               <>
//                 <div className="text-3xl font-bold text-gray-900 mb-2">
//                   {formatPrice(silver.price)}
//                 </div>
//                 <div className="mb-4">
//                   <ChangeIndicator
//                     change={silver.change}
//                     changePercentage={silver.changePercentage}
//                   />
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   Updated: {formatTime(silver.lastUpdated)}
//                 </div>
//               </>
//             ) : (
//               <div className="text-gray-500">Price data not available</div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GoldPricePage;
import React from "react";

export default function GoldPricePage() {
  return <div>GoldPricePage</div>;
}

import React, { Suspense, lazy, useState, useEffect } from "react";
const FaqPage = lazy(() => import("./pages/FaqPage"));
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

import config from "./config/config";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const Header = lazy(() => import("./components/Header"));
const LeftSidebar = lazy(() => import("./components/LeftSidebar"));
const ChartHeader = lazy(() => import("./components/ChartHeader"));
const TradingViewChart = lazy(() => import("./components/TradingViewChart"));
const PositionsTable = lazy(() => import("./components/PositionsTable"));
const Orderbook = lazy(() => import("./components/Orderbook"));
const TradePanel = lazy(() => import("./components/TradePanel"));
const TradeModal = lazy(() => import("./components/TradeModal"));
const CoinsList = lazy(() => import("./components/CoinsList"));

const App = () => {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [inputPrice, setInputPrice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderType, setOrderType] = useState("buy");
  const [activeSection, setActiveSection] = useState("chart");
  const [tickerData, setTickerData] = useState({});
  // Coin selection: persist in localStorage
  const [selectedCoin, setSelectedCoin] = useState(() => {
    const saved = localStorage.getItem("selectedCoin");
    return saved ? JSON.parse(saved) : { symbol: "BTC", name: "Bitcoin" };
  });

  // Whenever selectedCoin changes, save to localStorage
  useEffect(() => {
    if (selectedCoin) {
      localStorage.setItem("selectedCoin", JSON.stringify(selectedCoin));
    }
  }, [selectedCoin]);

 useEffect(() => {
  let socket;
  let reconnectTimeout;
  let isUnmounted = false;

  const symbol = selectedCoin.symbol.toLowerCase() + "usdt";

  const connect = () => {
    socket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol}@ticker`
    );

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const livePrice = Number(data.c); // current price

        if (!Number.isNaN(livePrice)) {
          setCurrentPrice(livePrice);

          setInputPrice(
            livePrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
        }

        // ✅ REAL 24h DATA
        setTickerData({
          change24h: Number(data.P), // %
          high24h: Number(data.h),
          low24h: Number(data.l),
          volume: Number(data.v),
        });

      } catch (error) {
        console.error("Ticker socket error:", error);
      }
    };

    socket.onclose = () => {
      if (!isUnmounted) {
        reconnectTimeout = setTimeout(connect, 2000);
      }
    };
  };

  connect();

  return () => {
    isUnmounted = true;
    clearTimeout(reconnectTimeout);
    if (socket && socket.readyState <= 1) {
      socket.close();
    }
  };
}, [selectedCoin]);

  const handleOpenModal = (type) => {
    setOrderType(type);
    setIsModalOpen(true);
  };

  const renderProfileSection = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    return (
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="bg-[#15181C] border border-[#262930] rounded-xl p-5 max-w-2xl">
          <h3 className="text-white text-lg font-semibold">Profile</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Username</span>
              <span className="text-white">
                {storedUser?.username || "User"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Email</span>
              <span className="text-white">{storedUser?.email || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Real Balance</span>
              <span className="text-[#0ECB81] font-semibold">
                $
                {Number(storedUser?.balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardLayout = () => {
    if (activeSection === "profile") {
      return (
        <>
          <LeftSidebar
            activeItem={activeSection}
            onItemClick={setActiveSection}
          />
          {renderProfileSection()}
        </>
      );
    }

    return (
      <>
        <LeftSidebar
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />

        {(activeSection === "chart" || activeSection === "order") && (
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {activeSection === "chart" && (
              <ChartHeader
                currentPrice={currentPrice}
                selectedCoin={selectedCoin}
                ticker={tickerData}
              />
            )}
            <TradingViewChart selectedCoin={selectedCoin} />
            <PositionsTable
              selectedCoin={selectedCoin}
              setSelectedCoin={setSelectedCoin}
              userId={JSON.parse(localStorage.getItem("user") || "{}")._id}
            />
          </div>
        )}

       <aside className="w-full xl:w-[360px] bg-[#15181C] border-l border-[#262930] flex flex-col shrink-0 overflow-hidden">
          {(activeSection === "chart" || activeSection === "order") && (
            <Orderbook currentPrice={currentPrice} />
          )}

          {(activeSection === "chart" || activeSection === "trade") && (
            <TradePanel
              onOpenModal={handleOpenModal}
              inputPrice={inputPrice}
              setInputPrice={setInputPrice}
              selectedCoin={selectedCoin}
            />
          )}
        </aside>
      </>
    );
  };

  return (
    <>
      <AuthProvider>
        <style>{`
          body { 
            background-color: #0B0E11; 
            color: #EAECEF; 
            min-height: 100vh; 
            margin: 0; 
            font-family: 'Inter', sans-serif; 
            overflow-x: hidden; /* Prevent horizontal scroll only */
          }
        `}</style>

        <Suspense
          fallback={
            <div className="min-h-screen w-full bg-[#0B0E11] text-[#EAECEF] flex items-center justify-center">
              Loading...
            </div>
          }
        >
          {/* Global Components (Modal) */}
          <TradeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            orderType={orderType}
            inputPrice={inputPrice}
            selectedCoin={selectedCoin}
          />

          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <div className="antialiased flex flex-col min-h-dvh md:h-screen">
               <Header selectedCoin={selectedCoin} />
                  <div className="flex-1 flex overflow-auto max-[1280px]:flex-col pb-24 md:pb-0">
                    {renderDashboardLayout()}
                  </div>
                </div>
              }
            />

            {/* Wallet & Coins */}
            <Route path="/wallet" element={<WalletPage />} />
            <Route
              path="/coin"
              element={<CoinsList setSelectedCoin={setSelectedCoin} />}
            />
            <Route path="/faq" element={<FaqPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </>
  );
};

export default App;

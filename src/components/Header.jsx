import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { COIN_SOURCE_MAP } from "../config/coinSources";

const Header = ({ selectedCoin: selectedCoinProp }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [wallet, setWallet] = useState({ usdBalance: user?.balance || 0 });

  const [market, setMarket] = useState({
    price: 0,
    change24h: 0,
    high24h: 0,
    low24h: 0,
    volume: 0,
  });

  const [priceDirection, setPriceDirection] = useState("neutral");

  const previousPriceRef = useRef(null);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const selectedCoin =
    selectedCoinProp ||
    JSON.parse(localStorage.getItem("selectedCoin") || '{"symbol":"BTC"}');

  const selectedSymbol = selectedCoin?.symbol?.toUpperCase() || "BTC";
  const coinInfo = COIN_SOURCE_MAP[selectedSymbol];
  const isBinance = coinInfo?.exchange === "BINANCE";
  const streamSymbol = coinInfo?.symbolPair?.toLowerCase() || `${selectedSymbol.toLowerCase()}usdt`;
  const isPositive = market.change24h >= 0;

  useEffect(() => {
    if (user) {
      setWallet({ usdBalance: Number(user.balance || 0) });
    }
  }, [user]);

  useEffect(() => {
    let socket;
    let reconnectTimeout;
    let isUnmounted = false;

    const connect = () => {
      if (!isBinance) return;

      socket = new WebSocket(
        `wss://stream.binance.com:9443/ws/${streamSymbol}@ticker`
      );

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const livePrice = Number(data.c);

          if (!Number.isFinite(livePrice)) return;

          const previousPrice = previousPriceRef.current;

          if (previousPrice !== null) {
            setPriceDirection(livePrice > previousPrice ? "up" : "down");
          }

          previousPriceRef.current = livePrice;

          setMarket({
            price: livePrice,
            change24h: Number(data.P || 0),
            high24h: Number(data.h || 0),
            low24h: Number(data.l || 0),
            volume: Number(data.v || 0),
          });

          setTimeout(() => setPriceDirection("neutral"), 450);
        } catch (error) {
          console.error("Header ticker error:", error);
        }
      };

      socket.onclose = () => {
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connect, 2000);
        }
      };

      socket.onerror = () => {
        if (socket) socket.close();
      };
    };

    if (!isBinance) {
      previousPriceRef.current = null;
      setMarket({
        price: null,
        change24h: 0,
        high24h: 0,
        low24h: 0,
        volume: 0,
      });
      return;
    }

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimeout);
      if (socket && socket.readyState <= 1) socket.close();
    };
  }, [selectedSymbol, streamSymbol, isBinance]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPrice = (value) => {
    const num = Number(value);

    if (!Number.isFinite(num)) return "--";

    return num.toLocaleString("en-US", {
      minimumFractionDigits: num < 1 ? 6 : 2,
      maximumFractionDigits: num < 1 ? 8 : 2,
    });
  };

  const formatVolume = (value) => {
    const num = Number(value);

    if (!Number.isFinite(num)) return "--";
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;

    return num.toFixed(2);
  };

  const formatChange = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "--";
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const getInitials = (userData) => {
    if (userData?.username) return userData.username.charAt(0).toUpperCase();
    if (userData?.name) return userData.name.charAt(0).toUpperCase();
    if (userData?.email) return userData.email.charAt(0).toUpperCase();
    return "?";
  };

  const displayName = (() => {
    const raw = user?.username || user?.name;

    if (!raw) return "User";

    return String(raw)
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((part) =>
        part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""
      )
      .join(" ");
  })();

  return (
    <header className="sticky top-0 z-100 w-full border-b border-[#262930] bg-[#0B0E11]/95 backdrop-blur-xl">
      <div className="h-16 px-3 sm:px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="flex items-center shrink-0 rounded-lg transition hover:opacity-90"
          >
            <img
              src="/logo.png"
              alt="PasaMeme"
              className="h-10 sm:h-10 w-auto object-contain"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-4 rounded-xl border border-[#262930] bg-[#15181C] px-4 py-2 shadow-sm">
            <div className="min-w-22.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">
                  {selectedSymbol}/USDT
                </span>
                <span className="rounded border border-[#FCD535]/20 bg-[#FCD535]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#FCD535]">
                  SPOT
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                Spot market price
              </p>
            </div>

            <div
              className={`font-mono text-lg font-black transition-all duration-300 ${
                priceDirection === "up"
                  ? "scale-105 text-[#0ECB81]"
                  : priceDirection === "down"
                  ? "scale-105 text-[#F6465D]"
                  : isPositive
                  ? "text-[#0ECB81]"
                  : "text-[#F6465D]"
              }`}
            >
              ${formatPrice(market.price)}
            </div>

            <div
              className={`rounded-md px-2 py-1 font-mono text-xs font-bold ${
                isPositive
                  ? "bg-[#0ECB81]/10 text-[#0ECB81]"
                  : "bg-[#F6465D]/10 text-[#F6465D]"
              }`}
            >
              {formatChange(market.change24h)}
            </div>

            <div className="hidden xl:flex items-center gap-4 border-l border-[#262930] pl-4 font-mono text-[11px]">
              <div>
                <span className="text-slate-500">High </span>
                <span className="text-white">${formatPrice(market.high24h)}</span>
              </div>

              <div>
                <span className="text-slate-500">Low </span>
                <span className="text-white">${formatPrice(market.low24h)}</span>
              </div>

              <div>
                <span className="text-slate-500">Vol </span>
                <span className="text-white">{formatVolume(market.volume)}</span>
              </div>
            </div>
          </div>

          <div className="lg:hidden min-w-0 rounded-lg border border-[#262930] bg-[#15181C] px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-black text-white">{selectedSymbol}/USDT</p>
              <span
                className={`text-[10px] font-bold ${
                  isPositive ? "text-[#0ECB81]" : "text-[#F6465D]"
                }`}
              >
                {formatChange(market.change24h)}
              </span>
            </div>
            <p
              className={`font-mono text-xs font-black ${
                priceDirection === "down" ? "text-[#F6465D]" : "text-[#0ECB81]"
              }`}
            >
              ${formatPrice(market.price)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => navigate("/wallet")}
            className="hidden sm:flex items-center rounded-lg border border-[#262930] bg-[#15181C] px-3 py-2 text-xs font-bold text-[#FCD535] transition hover:bg-[#1E2329]"
          >
            Wallet
          </button>

          <button
            onClick={() => navigate("/wallet")}
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#262930] bg-[#15181C] text-[#FCD535]"
            title="Wallet"
          >
            $
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#15181C] hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31M5 19.5A2.5 2.5 0 017.5 22h9a2.5 2.5 0 010-5"
                />
              </svg>

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-[#0B0E11] bg-[#F6465D]" />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-[#262930] bg-[#1E2329] shadow-2xl">
                <div className="border-b border-[#262930] px-4 py-3">
                  <p className="text-sm font-bold text-white">Notifications</p>
                  <p className="text-[11px] text-slate-500">
                    Latest wallet and market alerts
                  </p>
                </div>

                <div className="p-4 text-sm text-slate-400">
                  No new notifications.
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FCD535] text-sm font-black text-black ring-2 ring-black transition hover:scale-105"
            >
              {getInitials(user)}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-[#262930] bg-[#1E2228] shadow-2xl">
                <div className="border-b border-[#262930] bg-[#15181C] p-4">
                  <p className="truncate text-[13px] font-bold text-white">
                    {displayName}
                  </p>

                  <p className="truncate text-[10px] text-slate-400">
                    {user?.email || "-"}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-[10px] text-slate-500">
                      Spot Balance
                    </span>

                    <p className="font-mono text-[12px] font-bold text-[#0ECB81]">
                      $
                      {wallet?.usdBalance?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      navigate("/wallet");
                      setIsProfileOpen(false);
                    }}
                    className="w-full rounded px-4 py-2.5 text-left text-[12px] text-slate-300 hover:bg-[#262930]"
                  >
                    My Assets
                  </button>

                  <button
                    onClick={() => {
                      navigate("/faq");
                      setIsProfileOpen(false);
                    }}
                    className="w-full rounded px-4 py-2.5 text-left text-[12px] text-yellow-400 hover:bg-[#262930]"
                  >
                    FAQ & Terms
                  </button>

                  <button
                    onClick={logout}
                    className="w-full rounded px-4 py-2.5 text-left text-[12px] text-red-400 hover:bg-red-900/10"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
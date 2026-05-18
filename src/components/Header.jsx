import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { COIN_SOURCE_MAP } from "../config/coinSources";
import {
  Bell,
  ChevronDown,
  CircleDollarSign,
  LogOut,
  ShieldCheck,
  Wallet,
} from "lucide-react";

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
  const streamSymbol =
    coinInfo?.symbolPair?.toLowerCase() ||
    `${selectedSymbol.toLowerCase()}usdt`;
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
    const raw = userData?.username || userData?.name || userData?.email || "U";
    const parts = String(raw).trim().split(" ");

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return raw.charAt(0).toUpperCase();
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
<header className="sticky top-0 z-100 w-full bg-[#0B0E11]/95 backdrop-blur-xl">
  <div className="min-h-[60px] px-3 sm:px-5 flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <Link
        to="/dashboard"
        className="flex items-center shrink-0 rounded-xl transition hover:opacity-90"
      >
        <img
          src="/logo.png"
          alt="PasaMeme"
          className="h-8 sm:h-10 w-auto object-contain"
        />
      </Link>

      <div className="min-w-0 flex-1 rounded-xl bg-[#11151A] px-2.5 py-1.5 sm:px-3 sm:py-2 lg:max-w-fit">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="truncate text-[10px] sm:text-xs font-black text-white">
            {selectedSymbol}/USDT
          </p>

          <span className="rounded bg-[#FCD535]/10 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black text-[#FCD535]">
            SPOT
          </span>

          <span
            className={`text-[10px] sm:text-xs font-black ${
              isPositive ? "text-[#0ECB81]" : "text-[#F6465D]"
            }`}
          >
            {formatChange(market.change24h)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center gap-2 min-w-0">
          <p
            className={`font-mono text-xs sm:text-sm lg:text-lg font-black ${
              priceDirection === "down" ? "text-[#F6465D]" : "text-[#0ECB81]"
            }`}
          >
            ${formatPrice(market.price)}
          </p>

          <div className="hidden lg:flex items-center gap-3 font-mono text-[11px]">
            <span className="text-slate-500">
              H <b className="text-white">${formatPrice(market.high24h)}</b>
            </span>
            <span className="text-slate-500">
              L <b className="text-white">${formatPrice(market.low24h)}</b>
            </span>
            <span className="text-slate-500">
              V <b className="text-white">{formatVolume(market.volume)}</b>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={() => navigate("/wallet")}
        className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#FCD535]/10 px-3 py-2 text-xs font-black text-[#FCD535] transition hover:bg-[#FCD535]/15"
      >
        <Wallet className="h-4 w-4" />
        Wallet
      </button>

      <button
        onClick={() => navigate("/wallet")}
        className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCD535]/10 text-[#FCD535]"
        title="Wallet"
      >
        <CircleDollarSign className="h-5 w-5" />
      </button>

      <div className="relative" ref={notificationRef}>
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#11151A] text-slate-400 transition hover:bg-[#181D24] hover:text-white"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F6465D]" />
        </button>

        {isNotificationOpen && (
          <div className="absolute right-0 top-full mt-3 w-[calc(100vw-24px)] sm:w-80 overflow-hidden rounded-2xl bg-[#11151A] shadow-2xl">
            <div className="bg-[#181D24] px-4 py-3">
              <p className="text-sm font-black text-white">Notifications</p>
              <p className="text-[11px] text-slate-500">
                Latest wallet and market alerts
              </p>
            </div>

            <div className="p-4">
              <div className="rounded-xl bg-[#0B0E11] p-4 text-center">
                <p className="text-sm font-semibold text-slate-300">
                  No new notifications
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Market and wallet alerts will appear here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 rounded-xl bg-[#11151A] px-1.5 py-1.5 transition hover:bg-[#181D24]"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FCD535] to-[#F0B90B] text-xs font-black text-black">
            {getInitials(user)}
          </div>

          <div className="hidden md:block text-left">
            <p className="max-w-24 truncate text-xs font-bold text-white">
              {displayName}
            </p>
            <p className="font-mono text-[10px] font-semibold text-[#0ECB81]">
              $
              {wallet?.usdBalance?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          <ChevronDown className="hidden md:block h-4 w-4 text-slate-500" />
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-3 w-[calc(100vw-24px)] sm:w-72 overflow-hidden rounded-2xl bg-[#11151A] shadow-2xl">
            <div className="bg-[#181D24] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FCD535] to-[#F0B90B] text-sm font-black text-black">
                  {getInitials(user)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {displayName}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {user?.email || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#0B0E11] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Spot Balance
                  </span>

                  <p className="font-mono text-sm font-black text-[#0ECB81]">
                    $
                    {wallet?.usdBalance?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  navigate("/wallet");
                  setIsProfileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-slate-300 hover:bg-[#181D24]"
              >
                <Wallet className="h-4 w-4 text-[#FCD535]" />
                My Assets
              </button>

              <button
                onClick={() => {
                  navigate("/faq");
                  setIsProfileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-slate-300 hover:bg-[#181D24]"
              >
                <ShieldCheck className="h-4 w-4 text-[#0ECB81]" />
                FAQ & Terms
              </button>

              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-[#F6465D] hover:bg-[#F6465D]/10"
              >
                <LogOut className="h-4 w-4" />
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
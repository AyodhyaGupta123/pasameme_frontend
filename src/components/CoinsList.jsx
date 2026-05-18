import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import { Search } from "lucide-react";
import {
  MEME_COIN_DATA,
  COIN_SOURCE_MAP,
  getBinanceStreamUrl,
} from "../config/coinSources";

const binanceStreamUrl = getBinanceStreamUrl();

const useIsMobile = () => {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return mobile;
};

const Sparkline = ({ up, symbol, width = 64 }) => {
  const H = 24;
  const POINTS = 10;
  const color = up === true ? "#02c076" : up === false ? "#f6465d" : "#6b7280";
  const seed = symbol ? symbol.charCodeAt(0) + (symbol.charCodeAt(1) || 0) : 42;
  const seededRand = (i) => Math.sin(seed * 9301 + i * 49297) * 0.5 + 0.5;

  const [prices, setPrices] = React.useState(() => {
    const raw = [];
    let val = 50;
    let lastSwing = 10;

    for (let i = 0; i < POINTS; i++) {
      lastSwing = (seededRand(i) - 0.5) * 28;
      val = Math.max(8, Math.min(92, val + lastSwing));
      raw.push(val);
    }

    const first = raw[0];
    const last = raw[raw.length - 1];

    if (up === true && last < first) {
      raw[raw.length - 1] = first + Math.abs(lastSwing) * 0.6;
    }

    if (up === false && last > first) {
      raw[raw.length - 1] = first - Math.abs(lastSwing) * 0.6;
    }

    return raw;
  });

  React.useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = [...prev.slice(1)];
        const nudge = (Math.random() - (up ? 0.38 : 0.62)) * 14;
        next.push(Math.max(6, Math.min(94, next[next.length - 1] + nudge)));
        return next;
      });
    }, 1800 + (seed % 600));

    return () => clearInterval(id);
  }, [up, seed]);

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const pad = 3;

  const coords = prices.map((p, i) => [
    (i / (POINTS - 1)) * width,
    pad + ((maxP - p) / range) * (H - pad * 2),
  ]);

  const smooth = (() => {
    let d = `M${coords[0][0]},${coords[0][1]}`;

    for (let i = 1; i < coords.length; i++) {
      const [px, py] = coords[i - 1];
      const [cx, cy] = coords[i];
      const mx = (px + cx) / 2;
      d += ` C${mx},${py} ${mx},${cy} ${cx},${cy}`;
    }

    return d;
  })();

  const fill = `${smooth} L${width},${H} L0,${H} Z`;
  const id = `sf-${symbol}`;

  return (
    <svg
      width={width}
      height={H}
      viewBox={`0 0 ${width} ${H}`}
      fill="none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={fill} fill={`url(#${id})`} style={{ transition: "d 0.6s ease" }} />

      <path
        d={smooth}
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "d 0.6s ease" }}
      />

      <circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r="2"
        fill={color}
      />
    </svg>
  );
};

const SkeletonRow = ({ mobile }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: mobile
        ? "32px 1fr 80px 60px"
        : "28px 36px 1fr 110px 72px 72px 72px",
      padding: mobile ? "10px 12px" : "12px 16px",
      alignItems: "center",
      borderBottom: "1px solid #1e2329",
      gap: 8,
    }}
  >
    {(mobile ? [24, "auto", 60, 44] : [24, 24, "auto", 80, 50, 50, 60]).map(
      (w, i) => (
        <div
          key={i}
          style={{
            height: i === (mobile ? 1 : 2) ? 34 : 13,
            width: typeof w === "number" ? w : "65%",
            borderRadius: 5,
            background:
              "linear-gradient(90deg,#1e2329 25%,#2a2e37 50%,#1e2329 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            marginLeft: i > (mobile ? 1 : 2) ? "auto" : 0,
          }}
        />
      )
    )}
  </div>
);

const TABS = ["Top", "Trending", "Watchlists", "Overview", "Predictions"];

const MemeCoinsList = ({ setSelectedCoin }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getLocalIcon = (symbol) => {
    try {
      return new URL(`../assets/coins/${symbol.toLowerCase()}.png`, import.meta.url)
        .href;
    } catch {
      return `https://via.placeholder.com/32/1e2329/f0b90b?text=${symbol[0]}`;
    }
  };

  const [memeCoins, setMemeCoins] = useState(() =>
    MEME_COIN_DATA.map((coin, i) => ({
      symbol: coin.symbol,
      name: coin.name,
      price: "--",
      change: "--",
      up: null,
      rank: i + 1,
      localIcon: getLocalIcon(coin.symbol),
    }))
  );

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Top");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCoins = memeCoins.filter((coin) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      coin.symbol.toLowerCase().includes(query) ||
      coin.name.toLowerCase().includes(query)
    );
  });

  const renderChangeChip = (value, multiplier = 1) => {
    const num = Number(value);

    if (!Number.isFinite(num)) {
      return (
        <span style={{ fontSize: 12, fontWeight: 600, color: "#848e9c" }}>
          --
        </span>
      );
    }

    const result = num * multiplier;
    const positive = result >= 0;

    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: positive ? "#02c076" : "#f6465d",
          background: positive
            ? "rgba(2,192,118,0.08)"
            : "rgba(246,70,93,0.08)",
          padding: "2px 6px",
          borderRadius: 4,
        }}
      >
        {positive ? "+" : ""}
        {result.toFixed(2)}%
      </span>
    );
  };

  useEffect(() => {
    let socket;
    let reconnectTimeout;
    let isUnmounted = false;

    const connect = () => {
      if (!binanceStreamUrl) return;

      socket = new WebSocket(binanceStreamUrl);

      socket.onmessage = (event) => {
        try {
          const { data: ticker } = JSON.parse(event.data);

          if (!ticker?.s || !ticker?.c || ticker.P === undefined) return;

          const symbol = ticker.s.replace("USDT", "");
          const priceValue = parseFloat(ticker.c);
          const changePercent = parseFloat(ticker.P);

          setMemeCoins((prev) =>
            prev.map((coin) =>
              coin.symbol !== symbol
                ? coin
                : {
                    ...coin,
                    price: Number.isFinite(priceValue)
                      ? priceValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })
                      : coin.price,
                    change: Number.isFinite(changePercent)
                      ? changePercent.toFixed(2)
                      : coin.change,
                    up: Number.isFinite(changePercent)
                      ? changePercent >= 0
                      : coin.up,
                  }
            )
          );

          setLoading(false);
        } catch (e) {
          console.error(e);
        }
      };

      socket.onerror = () => {
        if (!isUnmounted) reconnectTimeout = setTimeout(connect, 2000);
      };

      socket.onclose = () => {
        if (!isUnmounted) reconnectTimeout = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimeout);
      if (socket?.readyState <= 1) socket.close();
    };
  }, []);

  useEffect(() => {
    const fallbackIds = MEME_COIN_DATA.filter(
      (coin) => coin.exchange !== "BINANCE" && coin.coingeckoId
    ).map((coin) => coin.coingeckoId);

    if (!fallbackIds.length) return;

    let active = true;

    const loadFallbackPrices = async () => {
      try {
        const marketResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(
            fallbackIds.join(",")
          )}&price_change_percentage=24h`
        );

        const markets = await marketResponse.json();

        if (!active || !Array.isArray(markets)) return;

        const marketById = markets.reduce((map, item) => {
          map[item.id] = item;
          map[item.symbol.toUpperCase()] = item;
          return map;
        }, {});

        setMemeCoins((prev) =>
          prev.map((coin) => {
            const source = COIN_SOURCE_MAP[coin.symbol];

            if (source?.exchange === "BINANCE") return coin;

            const market =
              marketById[source?.coingeckoId] ||
              marketById[coin.symbol.toUpperCase()];

            if (!market) return coin;

            const changePercent = Number(market.price_change_percentage_24h);

            return {
              ...coin,
              price: Number.isFinite(market.current_price)
                ? market.current_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })
                : coin.price,
              change: Number.isFinite(changePercent)
                ? changePercent.toFixed(2)
                : coin.change,
              up: Number.isFinite(changePercent)
                ? changePercent >= 0
                : coin.up,
            };
          })
        );

        setLoading(false);
      } catch (error) {
        console.error("CoinGecko fallback error:", error);
      }
    };

    loadFallbackPrices();

    return () => {
      active = false;
    };
  }, []);

  if (isMobile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b0e11",
          fontFamily: "'Inter','Segoe UI',sans-serif",
          display: "flex",
          flexDirection: "column",
          color: "#eaeaeb",
        }}
      >
        <style>{`
          @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
          .crow:active { background: #131720 !important; }
          ::-webkit-scrollbar { width: 3px; height: 3px; }
          ::-webkit-scrollbar-thumb { background: #2a2e37; border-radius: 2px; }
          .market-search-input::placeholder { color: #5e6673; }
        `}</style>

        <Header />

        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid #1e2329",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#848e9c",
              }}
            />

            <input
              className="market-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coins..."
              style={{
                width: "100%",
                height: 38,
                background: "#161a1f",
                border: "1px solid #2a2e37",
                borderRadius: 10,
                color: "#eaeaeb",
                fontSize: 13,
                fontWeight: 500,
                outline: "none",
                padding: "0 14px 0 38px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "10px 12px",
            overflowX: "auto",
            borderBottom: "1px solid #1e2329",
          }}
        >
          {[
            { label: "Mkt Cap", value: "$2.56T", change: "▼1.71%", up: false },
            { label: "CMC20", value: "$155.69", change: "▼1.86%", up: false },
            { label: "Fear/Greed", value: "42", isGauge: true },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "#161a1f",
                border: "1px solid #1e2329",
                borderRadius: 7,
                padding: "6px 10px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "#5e6673",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: 2,
                }}
              >
                {s.label}
              </div>

              {s.isGauge ? (
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0b90b" }}>
                  {s.value}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#eaeaeb" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 10, color: s.up ? "#02c076" : "#f6465d" }}>
                    {s.change}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            overflowX: "auto",
            borderBottom: "1px solid #1e2329",
            padding: "0 12px",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "9px 12px",
                fontSize: 12,
                fontWeight: activeTab === tab ? 700 : 400,
                color: activeTab === tab ? "#f0f0f0" : "#5e6673",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === tab ? "2px solid #f0b90b" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "8px 12px",
            borderBottom: "1px solid #1e2329",
          }}
        >
          {["Memes ▾", "24h % ▾"].map((f) => (
            <button
              key={f}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#eaeaeb",
                background: "#1e2329",
                border: "1px solid #2a2e37",
                borderRadius: 5,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 85px 62px",
            padding: "6px 12px",
            fontSize: 9,
            fontWeight: 600,
            color: "#5e6673",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            borderBottom: "1px solid #1e2329",
          }}
        >
          <div>#</div>
          <div>Name</div>
          <div style={{ textAlign: "right" }}>Price</div>
          <div style={{ textAlign: "right" }}>24h</div>
        </div>

        <main style={{ flex: 1, overflowY: "auto", paddingBottom: 70 }}>
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} mobile />)
          ) : filteredCoins.length > 0 ? (
            filteredCoins.map((coin, idx) => (
              <div
                key={coin.symbol}
                className="crow"
                onClick={() => {
                  setSelectedCoin(coin);
                  navigate("/dashboard");
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 85px 62px",
                  padding: "10px 12px",
                  alignItems: "center",
                  borderBottom: "1px solid #161a1f",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
              >
                <div style={{ fontSize: 11, color: "#5e6673", fontWeight: 500 }}>
                  {idx + 1}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 0,
                  }}
                >
                  <img
                    src={coin.localIcon}
                    alt={coin.symbol}
                    loading="lazy"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#1e2329",
                      objectFit: "contain",
                      border: "1px solid #2a2e37",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/32/1e2329/f0b90b?text=${coin.symbol[0]}`;
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#eaeaeb",
                        lineHeight: 1.3,
                      }}
                    >
                      {coin.symbol}
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        color: "#5e6673",
                        lineHeight: 1.2,
                      }}
                    >
                      {coin.name}/USDT
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#eaeaeb" }}>
                    ${coin.price}
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Sparkline up={coin.up} symbol={coin.symbol} width={48} />
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>{renderChangeChip(coin.change)}</div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: 30,
                textAlign: "center",
                color: "#848e9c",
                fontSize: 13,
              }}
            >
              No coins found.
            </div>
          )}
        </main>

        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: 58,
            background: "#161a1f",
            borderTop: "1px solid #1e2329",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            zIndex: 100,
          }}
        >
          {[
            { icon: "🏠", label: "Home", active: false, path: "/" },
            { icon: "📈", label: "Markets", active: true, path: "/markets" },
            { icon: "💰", label: "Wallet", active: false, path: "/wallet" },
            { icon: "AG", label: "Profile", active: false, path: "/profile" },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                cursor: "pointer",
                color: item.active ? "#f0b90b" : "#5e6673",
              }}
            >
              <span
                style={{
                  fontSize: item.icon === "AG" ? 11 : 18,
                  fontWeight: item.icon === "AG" ? 800 : 400,
                }}
              >
                {item.icon}
              </span>

              <span
                style={{
                  fontSize: 9,
                  fontWeight: item.active ? 700 : 400,
                  letterSpacing: "0.02em",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0e11",
        fontFamily: "'Inter','Segoe UI',sans-serif",
        display: "flex",
        flexDirection: "column",
        color: "#eaeaeb",
      }}
    >
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .coin-row:hover { background: #131720 !important; }
        .tab-btn:hover { color: #eaeaeb !important; }
        .market-search-input::placeholder { color: #5e6673; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0b0e11; }
        ::-webkit-scrollbar-thumb { background: #2a2e37; border-radius: 2px; }
      `}</style>

      <Header />

      <div style={{ display: "flex", flex: 1 }}>
        <LeftSidebar />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              padding: "14px 20px 0",
              borderBottom: "1px solid #1e2329",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: 0,
                  color: "#f0f0f0",
                }}
              >
                Markets
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  maxWidth: 440,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    flex: 1,
                    minWidth: 220,
                  }}
                >
                  <Search
                    size={17}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#848e9c",
                    }}
                  />

                  <input
                    className="market-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search coins..."
                    style={{
                      width: "100%",
                      height: 40,
                      background: "#161a1f",
                      border: "1px solid #2a2e37",
                      borderRadius: 12,
                      color: "#eaeaeb",
                      fontSize: 13,
                      fontWeight: 500,
                      outline: "none",
                      padding: "0 14px 0 40px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "1px solid #2a2e37",
                    background: "linear-gradient(135deg,#f0b90b,#f8d12f)",
                    color: "#0b0e11",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 8px 22px rgba(240,185,11,0.18)",
                  }}
                >
                  AG
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 10,
              }}
            >
              {[
                { label: "Market Cap", value: "$2.56T", change: "▼ 1.71%", up: false },
                { label: "CMC20", value: "$155.69", change: "▼ 1.86%", up: false },
                { label: "Altcoin Index", value: "40/100", change: "▼ 1.86%", up: false },
                { label: "Fear & Greed", value: "42", isGauge: true },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#161a1f",
                    border: "1px solid #1e2329",
                    borderRadius: 8,
                    padding: "7px 12px",
                    minWidth: 82,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      color: "#848e9c",
                      marginBottom: 3,
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </div>

                  {s.isGauge ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          border: "2.5px solid #f0b90b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#f0b90b",
                        }}
                      >
                        {s.value}
                      </div>

                      <span style={{ fontSize: 9, color: "#848e9c" }}>Fear</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#eaeaeb" }}>
                        {s.value}
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          color: s.up ? "#02c076" : "#f6465d",
                          marginTop: 1,
                        }}
                      >
                        {s.change}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#848e9c",
                paddingBottom: 10,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              📰 Crypto funds attract $1.2B weekly &nbsp;·&nbsp;
              <span style={{ color: "#f0b90b" }}>
                Why is the market down today?
              </span>
            </div>

            <div style={{ display: "flex", overflowX: "auto", gap: 2 }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className="tab-btn"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: activeTab === tab ? 700 : 400,
                    color: activeTab === tab ? "#f0f0f0" : "#848e9c",
                    background: "none",
                    border: "none",
                    borderBottom:
                      activeTab === tab ? "2px solid #f0b90b" : "2px solid transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    marginBottom: -1,
                    transition: "color 0.15s",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "10px 20px",
              borderBottom: "1px solid #1e2329",
              alignItems: "center",
            }}
          >
            {["Rank", "Memes ▾", "1h % ▾"].map((f, i) => (
              <button
                key={f}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: i === 0 ? "#848e9c" : "#eaeaeb",
                  background: i === 0 ? "none" : "#1e2329",
                  border: i === 0 ? "none" : "1px solid #2a2e37",
                  borderRadius: 6,
                  padding: i === 0 ? 0 : "4px 10px",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "28px 40px 1fr 120px 80px 80px 80px",
              padding: "8px 20px",
              fontSize: 10,
              fontWeight: 600,
              color: "#5e6673",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid #1e2329",
              background: "#0b0e11",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <div></div>
            <div>#</div>
            <div>Name</div>
            <div style={{ textAlign: "right" }}>Price</div>
            <div style={{ textAlign: "right" }}>1h %</div>
            <div style={{ textAlign: "right" }}>24h %</div>
            <div style={{ textAlign: "right" }}>7d Chart</div>
          </div>

          <main style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filteredCoins.length > 0 ? (
              filteredCoins.map((coin, idx) => (
                <div
                  key={coin.symbol}
                  className="coin-row"
                  onClick={() => {
                    setSelectedCoin(coin);
                    navigate("/dashboard");
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px 40px 1fr 120px 80px 80px 80px",
                    padding: "12px 20px",
                    alignItems: "center",
                    borderBottom: "1px solid #161a1f",
                    cursor: "pointer",
                    transition: "background 0.12s",
                    background: "transparent",
                  }}
                >
                  <div style={{ color: "#3a3f4a", fontSize: 13 }}>☆</div>

                  <div style={{ fontSize: 12, color: "#5e6673", fontWeight: 500 }}>
                    {idx + 1}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minWidth: 0,
                    }}
                  >
                    <img
                      src={coin.localIcon}
                      alt={coin.symbol}
                      loading="lazy"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#1e2329",
                        objectFit: "contain",
                        border: "1px solid #2a2e37",
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/32/1e2329/f0b90b?text=${coin.symbol[0]}`;
                      }}
                    />

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#eaeaeb",
                          lineHeight: 1.3,
                        }}
                      >
                        {coin.symbol}
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          color: "#5e6673",
                          lineHeight: 1.2,
                          marginTop: 1,
                        }}
                      >
                        {coin.name}/USDT
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#eaeaeb",
                    }}
                  >
                    ${coin.price}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {renderChangeChip(coin.change, 0.3)}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {renderChangeChip(coin.change)}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Sparkline up={coin.up} symbol={coin.symbol} width={72} />
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#848e9c",
                  fontSize: 14,
                }}
              >
                No coins found.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MemeCoinsList;
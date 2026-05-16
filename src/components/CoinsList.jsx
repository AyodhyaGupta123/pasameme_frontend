import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";

const memeCoinsDefinition = [
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "SHIB", name: "Shiba Inu" },
  { symbol: "PEPE", name: "Pepe" },
  { symbol: "FLOKI", name: "Floki" },
  { symbol: "WIF", name: "Wif" },
  { symbol: "BONK", name: "Bonk" },
  { symbol: "BRETT", name: "Brett" },
  { symbol: "POPCAT", name: "Popcat" },
  { symbol: "MOG", name: "Mog" },
  { symbol: "BOME", name: "Bome" },
  { symbol: "BABYDOGE", name: "Baby Doge" },
  { symbol: "SAFEMOON", name: "SafeMoon" },
  { symbol: "WOJAK", name: "Wojak" },
  { symbol: "BONE", name: "Bone" },
  { symbol: "PEPE2", name: "Pepe 2" },
];
const symbols = memeCoinsDefinition.map((coin) => coin.symbol);
const streams = symbols.map((s) => `${s.toLowerCase()}usdt@ticker`).join("/");

// ── Responsive hook ──────────────────────────────────────────
const useIsMobile = () => {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
};

// ── Zigzag Sparkline ─────────────────────────────────────────
const Sparkline = ({ up, symbol, width = 64 }) => {
  const H = 24, POINTS = 10;
  const color = up ? "#02c076" : "#f6465d";
  const seed = symbol ? symbol.charCodeAt(0) + (symbol.charCodeAt(1) || 0) : 42;
  const seededRand = (i) => Math.sin(seed * 9301 + i * 49297) * 0.5 + 0.5;

  const [prices, setPrices] = React.useState(() => {
    const raw = [];
    let val = 50, lastSwing = 10;
    for (let i = 0; i < POINTS; i++) {
      lastSwing = (seededRand(i) - 0.5) * 28;
      val = Math.max(8, Math.min(92, val + lastSwing));
      raw.push(val);
    }
    const first = raw[0], last = raw[raw.length - 1];
    if (up && last < first) raw[raw.length - 1] = first + Math.abs(lastSwing) * 0.6;
    if (!up && last > first) raw[raw.length - 1] = first - Math.abs(lastSwing) * 0.6;
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
  }, [up]);

  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const range = maxP - minP || 1, pad = 3;
  const coords = prices.map((p, i) => [
    (i / (POINTS - 1)) * width,
    pad + ((maxP - p) / range) * (H - pad * 2),
  ]);

  const smooth = (() => {
    let d = `M${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length; i++) {
      const [px, py] = coords[i - 1], [cx, cy] = coords[i];
      const mx = (px + cx) / 2;
      d += ` C${mx},${py} ${mx},${cy} ${cx},${cy}`;
    }
    return d;
  })();

  const fill = `${smooth} L${width},${H} L0,${H} Z`;
  const id = `sf-${symbol}`;

  return (
    <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} fill="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${id})`} style={{ transition: "d 0.6s ease" }} />
      <path d={smooth} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "d 0.6s ease" }} />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="2" fill={color} />
    </svg>
  );
};

// ── Skeleton Row ─────────────────────────────────────────────
const SkeletonRow = ({ mobile }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: mobile ? "32px 1fr 80px 60px" : "28px 36px 1fr 110px 72px 72px 72px",
    padding: mobile ? "10px 12px" : "12px 16px",
    alignItems: "center",
    borderBottom: "1px solid #1e2329",
    gap: 8,
  }}>
    {(mobile ? [24, "auto", 60, 44] : [24, 24, "auto", 80, 50, 50, 60]).map((w, i) => (
      <div key={i} style={{
        height: i === (mobile ? 1 : 2) ? 34 : 13,
        width: typeof w === "number" ? w : "65%",
        borderRadius: 5,
        background: "linear-gradient(90deg,#1e2329 25%,#2a2e37 50%,#1e2329 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
        marginLeft: i > (mobile ? 1 : 2) ? "auto" : 0,
      }} />
    ))}
  </div>
);

const TABS = ["Top", "Trending", "Watchlists", "Overview", "Predictions"];

// ── Main Component ────────────────────────────────────────────
const MemeCoinsList = ({ setSelectedCoin }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getLocalIcon = (symbol) => {
    try {
      return new URL(`../assets/coins/${symbol.toLowerCase()}.png`, import.meta.url).href;
    } catch {
      return `https://via.placeholder.com/32/1e2329/f0b90b?text=${symbol[0]}`;
    }
  };

  const [memeCoins, setMemeCoins] = useState(() =>
    symbols.map((symbol, i) => ({
      symbol, name: symbol,
      price: "0.00", change: "0.00",
      up: true, rank: i + 1,
      localIcon: getLocalIcon(symbol),
    }))
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Top");

  useEffect(() => {
    let socket, reconnectTimeout, isUnmounted = false;
    const connect = () => {
      socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      socket.onmessage = (event) => {
        try {
          const { data: ticker } = JSON.parse(event.data);
          if (!ticker?.s || !ticker?.c || ticker.P === undefined) return;
          const symbol = ticker.s.replace("USDT", "");
          const priceValue = parseFloat(ticker.c);
          const changePercent = parseFloat(ticker.P);
          setMemeCoins((prev) => prev.map((coin) =>
            coin.symbol !== symbol ? coin : {
              ...coin,
              price: isNaN(priceValue) ? coin.price : priceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
              change: isNaN(changePercent) ? coin.change : changePercent.toFixed(2),
              up: !isNaN(changePercent) && changePercent >= 0,
            }
          ));
          setLoading(false);
        } catch (e) { console.error(e); }
      };
      socket.onclose = () => { if (!isUnmounted) reconnectTimeout = setTimeout(connect, 2000); };
    };
    connect();
    return () => { isUnmounted = true; clearTimeout(reconnectTimeout); if (socket?.readyState <= 1) socket.close(); };
  }, []);

  // ── MOBILE LAYOUT ──────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0e11", fontFamily: "'Inter','Segoe UI',sans-serif", display: "flex", flexDirection: "column", color: "#eaeaeb" }}>
        <style>{`
          @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
          .crow:active { background: #131720 !important; }
          ::-webkit-scrollbar { width: 3px; height: 3px; }
          ::-webkit-scrollbar-thumb { background: #2a2e37; border-radius: 2px; }
        `}</style>

        <Header />

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 6, padding: "10px 12px", overflowX: "auto", borderBottom: "1px solid #1e2329" }}>
          {[
            { label: "Mkt Cap", value: "$2.56T", change: "▼1.71%", up: false },
            { label: "CMC20", value: "$155.69", change: "▼1.86%", up: false },
            { label: "Fear/Greed", value: "42", isGauge: true },
          ].map((s, i) => (
            <div key={i} style={{ background: "#161a1f", border: "1px solid #1e2329", borderRadius: 7, padding: "6px 10px", flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: "#5e6673", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{s.label}</div>
              {s.isGauge
                ? <div style={{ fontSize: 13, fontWeight: 700, color: "#f0b90b" }}>{s.value}</div>
                : <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#eaeaeb" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: s.up ? "#02c076" : "#f6465d" }}>{s.change}</div>
                  </>
              }
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid #1e2329", padding: "0 12px" }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "9px 12px", fontSize: 12,
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? "#f0f0f0" : "#5e6673",
              background: "none", border: "none",
              borderBottom: activeTab === tab ? "2px solid #f0b90b" : "2px solid transparent",
              cursor: "pointer", whiteSpace: "nowrap", marginBottom: -1,
            }}>{tab}</button>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderBottom: "1px solid #1e2329" }}>
          {["Memes ▾", "24h % ▾"].map((f) => (
            <button key={f} style={{ fontSize: 11, fontWeight: 600, color: "#eaeaeb", background: "#1e2329", border: "1px solid #2a2e37", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}>{f}</button>
          ))}
        </div>

        {/* Mobile Table Header */}
        <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 85px 62px", padding: "6px 12px", fontSize: 9, fontWeight: 600, color: "#5e6673", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #1e2329" }}>
          <div>#</div>
          <div>Name</div>
          <div style={{ textAlign: "right" }}>Price</div>
          <div style={{ textAlign: "right" }}>24h</div>
        </div>

        {/* Mobile Coin Rows */}
        <main style={{ flex: 1, overflowY: "auto", paddingBottom: 70 }}>
          {loading
            ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} mobile />)
            : memeCoins.map((coin, idx) => (
                <div
                  key={coin.symbol}
                  className="crow"
                  onClick={() => { setSelectedCoin(coin); navigate("/dashboard"); }}
                  style={{ display: "grid", gridTemplateColumns: "32px 1fr 85px 62px", padding: "10px 12px", alignItems: "center", borderBottom: "1px solid #161a1f", cursor: "pointer", transition: "background 0.1s" }}
                >
                  {/* Rank */}
                  <div style={{ fontSize: 11, color: "#5e6673", fontWeight: 500 }}>{idx + 1}</div>

                  {/* Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <img src={coin.localIcon} alt={coin.symbol} loading="lazy"
                      style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e2329", objectFit: "contain", border: "1px solid #2a2e37", flexShrink: 0 }}
                      onError={(e) => { e.target.src = `https://via.placeholder.com/32/1e2329/f0b90b?text=${coin.symbol[0]}`; }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#eaeaeb", lineHeight: 1.3 }}>{coin.symbol}</div>
                      <div style={{ fontSize: 10, color: "#5e6673", lineHeight: 1.2 }}>{coin.name}/USDT</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#eaeaeb" }}>${coin.price}</div>
                    <div style={{ marginTop: 3, display: "flex", justifyContent: "flex-end" }}>
                      <Sparkline up={coin.up} symbol={coin.symbol} width={48} />
                    </div>
                  </div>

                  {/* Change badge */}
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      display: "inline-block",
                      fontSize: 11, fontWeight: 700,
                      color: coin.up ? "#02c076" : "#f6465d",
                      background: coin.up ? "rgba(2,192,118,0.1)" : "rgba(246,70,93,0.1)",
                      padding: "3px 7px", borderRadius: 5,
                    }}>
                      {coin.up ? "+" : ""}{coin.change}%
                    </span>
                  </div>
                </div>
              ))
          }
        </main>

        {/* Mobile Bottom Nav */}
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 58, background: "#161a1f", borderTop: "1px solid #1e2329", display: "flex", alignItems: "center", justifyContent: "space-around", zIndex: 100 }}>
          {[
            { icon: "🏠", label: "Home", active: false, path: "/" },
            { icon: "📈", label: "Markets", active: true, path: "/markets" },
            { icon: "💰", label: "Wallet", active: false, path: "/wallet" },
            { icon: "👤", label: "Profile", active: false, path: "/profile" },
          ].map((item) => (
            <div key={item.label} onClick={() => navigate(item.path)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", color: item.active ? "#f0b90b" : "#5e6673" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: item.active ? 700 : 400, letterSpacing: "0.02em" }}>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ─────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0b0e11", fontFamily: "'Inter','Segoe UI',sans-serif", display: "flex", flexDirection: "column", color: "#eaeaeb" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .coin-row:hover { background: #131720 !important; }
        .tab-btn:hover { color: #eaeaeb !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0b0e11; }
        ::-webkit-scrollbar-thumb { background: #2a2e37; border-radius: 2px; }
      `}</style>

      <Header />

      <div style={{ display: "flex", flex: 1 }}>
        <LeftSidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Stats + Tabs header */}
          <div style={{ padding: "14px 20px 0", borderBottom: "1px solid #1e2329" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#f0f0f0" }}>Markets</h1>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ background: "none", border: "none", color: "#848e9c", fontSize: 18, cursor: "pointer" }}>🔍</button>
                <button style={{ background: "none", border: "none", color: "#848e9c", fontSize: 18, cursor: "pointer" }}>👤</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10 }}>
              {[
                { label: "Market Cap", value: "$2.56T", change: "▼ 1.71%", up: false },
                { label: "CMC20", value: "$155.69", change: "▼ 1.86%", up: false },
                { label: "Altcoin Index", value: "40/100", change: "▼ 1.86%", up: false },
                { label: "Fear & Greed", value: "42", isGauge: true },
              ].map((s, i) => (
                <div key={i} style={{ background: "#161a1f", border: "1px solid #1e2329", borderRadius: 8, padding: "7px 12px", minWidth: 82, flexShrink: 0 }}>
                  <div style={{ fontSize: 9, color: "#848e9c", marginBottom: 3, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
                  {s.isGauge
                    ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", border: "2.5px solid #f0b90b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#f0b90b" }}>{s.value}</div>
                        <span style={{ fontSize: 9, color: "#848e9c" }}>Fear</span>
                      </div>
                    : <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#eaeaeb" }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: s.up ? "#02c076" : "#f6465d", marginTop: 1 }}>{s.change}</div>
                      </>
                  }
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, color: "#848e9c", paddingBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              📰 Crypto funds attract $1.2B weekly &nbsp;·&nbsp; <span style={{ color: "#f0b90b" }}>Why is the market down today?</span>
            </div>

            <div style={{ display: "flex", overflowX: "auto", gap: 2 }}>
              {TABS.map((tab) => (
                <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{
                  padding: "8px 16px", fontSize: 13,
                  fontWeight: activeTab === tab ? 700 : 400,
                  color: activeTab === tab ? "#f0f0f0" : "#848e9c",
                  background: "none", border: "none",
                  borderBottom: activeTab === tab ? "2px solid #f0b90b" : "2px solid transparent",
                  cursor: "pointer", whiteSpace: "nowrap", marginBottom: -1, transition: "color 0.15s",
                }}>{tab}</button>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div style={{ display: "flex", gap: 8, padding: "10px 20px", borderBottom: "1px solid #1e2329", alignItems: "center" }}>
            {["Rank", "Memes ▾", "1h % ▾"].map((f, i) => (
              <button key={f} style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? "#848e9c" : "#eaeaeb", background: i === 0 ? "none" : "#1e2329", border: i === 0 ? "none" : "1px solid #2a2e37", borderRadius: 6, padding: i === 0 ? 0 : "4px 10px", cursor: "pointer" }}>{f}</button>
            ))}
          </div>

          {/* Desktop Table Header */}
          <div style={{ display: "grid", gridTemplateColumns: "28px 40px 1fr 120px 80px 80px 80px", padding: "8px 20px", fontSize: 10, fontWeight: 600, color: "#5e6673", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #1e2329", background: "#0b0e11", position: "sticky", top: 0, zIndex: 10 }}>
            <div></div>
            <div>#</div>
            <div>Name</div>
            <div style={{ textAlign: "right" }}>Price</div>
            <div style={{ textAlign: "right" }}>1h %</div>
            <div style={{ textAlign: "right" }}>24h %</div>
            <div style={{ textAlign: "right" }}>7d Chart</div>
          </div>

          {/* Desktop Rows */}
          <main style={{ flex: 1, overflowY: "auto" }}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : memeCoins.map((coin, idx) => (
                  <div key={coin.symbol} className="coin-row"
                    onClick={() => { setSelectedCoin(coin); navigate("/dashboard"); }}
                    style={{ display: "grid", gridTemplateColumns: "28px 40px 1fr 120px 80px 80px 80px", padding: "12px 20px", alignItems: "center", borderBottom: "1px solid #161a1f", cursor: "pointer", transition: "background 0.12s", background: "transparent" }}
                  >
                    <div style={{ color: "#3a3f4a", fontSize: 13 }}>☆</div>
                    <div style={{ fontSize: 12, color: "#5e6673", fontWeight: 500 }}>{idx + 1}</div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <img src={coin.localIcon} alt={coin.symbol} loading="lazy"
                        style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e2329", objectFit: "contain", border: "1px solid #2a2e37", flexShrink: 0 }}
                        onError={(e) => { e.target.src = `https://via.placeholder.com/32/1e2329/f0b90b?text=${coin.symbol[0]}`; }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#eaeaeb", lineHeight: 1.3 }}>{coin.symbol}</div>
                        <div style={{ fontSize: 10, color: "#5e6673", lineHeight: 1.2, marginTop: 1 }}>{coin.name}/USDT</div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: "#eaeaeb" }}>${coin.price}</div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: coin.up ? "#02c076" : "#f6465d", background: coin.up ? "rgba(2,192,118,0.08)" : "rgba(246,70,93,0.08)", padding: "2px 6px", borderRadius: 4 }}>
                        {coin.up ? "+" : ""}{(parseFloat(coin.change) * 0.3).toFixed(2)}%
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: coin.up ? "#02c076" : "#f6465d", background: coin.up ? "rgba(2,192,118,0.08)" : "rgba(246,70,93,0.08)", padding: "2px 6px", borderRadius: 4 }}>
                        {coin.up ? "+" : ""}{coin.change}%
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Sparkline up={coin.up} symbol={coin.symbol} width={72} />
                    </div>
                  </div>
                ))
            }
          </main>
        </div>
      </div>
    </div>
  );
};

export default MemeCoinsList;
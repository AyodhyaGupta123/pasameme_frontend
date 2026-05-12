import React, { useEffect, useRef } from "react";

const TradingViewChart = ({ selectedCoin }) => {
  const containerRef = useRef(null);

  const symbolMap = {
    BTC: "BINANCE:BTCUSDT.P",
    ETH: "BINANCE:ETHUSDT.P",
    DOGE: "BINANCE:DOGEUSDT.P",
    SHIB: "BINANCE:SHIBUSDT.P",
    PEPE: "BINANCE:PEPEUSDT.P",
    WIF: "BINANCE:WIFUSDT.P",
    FLOKI: "BINANCE:FLOKIUSDT.P",
    BONK: "BINANCE:BONKUSDT.P",
    BRETT: "BITGET:BRETTUSDT.P",
    POPCAT: "BINANCE:POPCATUSDT.P",
    MOG: "BITGET:MOGUSDT.P",
    BOME: "BINANCE:BOMEUSDT.P",
  };

  const tvSymbol = symbolMap[selectedCoin?.symbol] || symbolMap.BTC;

  useEffect(() => {
    const containerId = "tradingview_chart";

    const createWidget = () => {
      if (!window.TradingView || !containerRef.current) return;

      containerRef.current.innerHTML = "";

      new window.TradingView.widget({
        autosize: true,
        symbol: tvSymbol,
        interval: "15",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#15181C",
        enable_publishing: false,
        backgroundColor: "#0B0E11",
        gridColor: "rgba(38, 41, 48, 0.3)",
        hide_top_toolbar: window.innerWidth < 768,
        hide_side_toolbar: window.innerWidth < 1024,
        save_image: false,
        container_id: containerId,
      });
    };

    if (window.TradingView) {
      createWidget();
      return;
    }

    const scriptId = "tradingview-script";
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = createWidget;
      document.head.appendChild(script);
    } else {
      script.onload = createWidget;
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [tvSymbol]);

  return (
    <div className="w-full h-[350px] md:h-full md:flex-1 bg-[#0B0E11] border-b border-[#262930] overflow-hidden">
      <div className="tradingview-widget-container h-full w-full">
        <div
          id="tradingview_chart"
          ref={containerRef}
          className="h-full w-full"
        />
      </div>
    </div>
  );
};

export default TradingViewChart;
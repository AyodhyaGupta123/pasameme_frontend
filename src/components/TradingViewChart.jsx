import React, { useEffect, useRef } from "react";
import { COIN_SOURCE_MAP } from "../config/coinSources";

const TradingViewChart = ({ selectedCoin }) => {
  const containerRef = useRef(null);

  const selectedSymbol = selectedCoin?.symbol?.toUpperCase();
  const tvSymbol = COIN_SOURCE_MAP[selectedSymbol]?.chartSymbol || null;

  useEffect(() => {
    const containerId = "tradingview_chart";
    const container = containerRef.current;

    const createWidget = () => {
      if (!window.TradingView || !container || !tvSymbol) return;

      container.innerHTML = "";

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
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [tvSymbol]);

  if (!tvSymbol) {
    return (
      <div className="w-full h-87.5 md:h-full md:flex-1 bg-[#0B0E11] border-b border-[#262930] text-center text-[#d0d4da] flex items-center justify-center px-4">
        <div>
          <p className="text-sm font-semibold">Chart unavailable for {selectedSymbol || "this symbol"}.</p>
          <p className="text-xs text-slate-500 mt-1">This coin is not currently connected to a supported chart source.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-87.5 md:h-full md:flex-1 bg-[#0B0E11] border-b border-[#262930] overflow-hidden">
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
import React from "react";

const TradeModal = ({
  isOpen,
  onClose,
  orderType,
  inputPrice,
  selectedCoin,
}) => {
  if (!isOpen) return null;

  const isBuy = orderType === "buy";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div
        className={`
          relative bg-[#15181C] border-[#262930] w-full shadow-2xl transition-all duration-300 ease-out
          /* Mobile: Bottom Sheet Styles */
          fixed bottom-0 rounded-t-2xl border-t p-5 translate-y-0
          /* Desktop: Center Modal Styles */
          md:relative md:bottom-auto md:rounded-xl md:border md:max-w-sm md:p-6 md:translate-y-0
          ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 md:scale-95"}
        `}
      >
        {/* Mobile Handle (The little line at the top) */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4 md:hidden"></div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Confirm Order
            <span
              className={`text-[10px] px-2 py-0.5 rounded ${isBuy ? "bg-[#0ECB81]/10 text-[#0ECB81]" : "bg-[#F6465D]/10 text-[#F6465D]"}`}
            >
              {isBuy ? "LONG" : "SHORT"}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-8 font-mono text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Contract</span>
            <span className="font-bold text-white">
              {(selectedCoin?.symbol || "BTC").toUpperCase()}USDT PERP
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Price</span>
            <span className="text-white">${inputPrice}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Amount</span>
            <span className="text-white">
              0.500 {(selectedCoin?.symbol || "BTC").toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Leverage</span>
            <span className="text-[#FCD535]">Cross 20x</span>
          </div>

          <div className="h-px bg-[#262930] my-4"></div>

          <div className="flex justify-between items-end">
            <span className="text-slate-400">Estimated Margin</span>
            <div className="text-right">
              <p className="text-base font-bold text-white">$1,687.25</p>
              <p className="text-[10px] text-slate-500">Incl. Fees</p>
            </div>
          </div>
        </div>

        {/* Buttons: Stacked on small mobile, Side-by-side on desktop */}
        <div className="flex flex-col-reverse sm:grid sm:grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3.5 bg-[#262930] rounded-xl font-bold text-sm text-slate-300 hover:bg-[#2f333b] transition-all"
          >
            Cancel
          </button>
          <button
            className={`py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all ${
              isBuy ? "bg-[#0ECB81] text-black" : "bg-[#F6465D] text-white"
            }`}
          >
            {isBuy ? "Confirm Buy / Long" : "Confirm Sell / Short"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;

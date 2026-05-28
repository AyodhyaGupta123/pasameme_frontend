import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const TradePanel = ({ inputPrice, selectedCoin }) => {
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState("market");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [balance, setBalance] = useState(0);
  const [loadingSide, setLoadingSide] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const coinSymbol = selectedCoin?.symbol || "BTC";

  const currentPrice = useMemo(() => {
    const raw =
      inputPrice ||
      selectedCoin?.price ||
      selectedCoin?.currentPrice ||
      selectedCoin?.lastPrice ||
      selectedCoin?.marketPrice ||
      0;

    const num = Number(String(raw).replace(/,/g, ""));

    return Number.isFinite(num) ? num : 0;
  }, [inputPrice, selectedCoin]);

  const executionPrice =
    orderType === "limit" && Number(limitPrice) > 0
      ? Number(limitPrice)
      : currentPrice;

  const estimatedQty =
    executionPrice > 0 && Number(amount) > 0
      ? Number(amount) / executionPrice
      : 0;

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/header/wallet");

        if (res.data?.success) {
          const walletBalance = Number(
            res.data.wallet?.realUsdBalance ?? res.data.wallet?.usdBalance ?? 0,
          );
          setBalance(walletBalance);
        }
      } catch {
        const storedUser =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(localStorage.getItem("user_data")) ||
          {};
        setBalance(Number(storedUser.balance || 0));
      }
    };

    fetchWallet();
  }, []);

  const handlePercentage = (percentage) => {
    const value = (balance * percentage) / 100;
    setAmount(value.toFixed(2));
  };

  const validateTrade = () => {
    const tradeAmount = Number(amount);

    if (!tradeAmount || tradeAmount <= 0) {
      alert("Please enter a valid amount.");
      return false;
    }

    if (!executionPrice || executionPrice <= 0) {
      alert("Live price not loaded yet. Please wait few seconds.");
      return false;
    }

    if (tradeAmount > balance) {
      alert("Insufficient balance. Please add funds to your wallet.");
      navigate("/wallet");
      return false;
    }

    if (
      orderType === "limit" &&
      (!Number(limitPrice) || Number(limitPrice) <= 0)
    ) {
      alert("Please enter a valid limit price.");
      return false;
    }

    return true;
  };

  const placeTrade = async (side) => {
    if (!validateTrade()) return;

    try {
      setLoadingSide(side);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await api.post("/trade/place", {
        userId: user._id || user.id,
        side,
        symbol: coinSymbol,
        price: executionPrice,
        amount: Number(amount),
        size: estimatedQty,
        type: orderType,
      });

      const remainingBalance =
        res.data?.wallet?.realUsdBalance ??
        res.data?.wallet?.usdBalance ??
        res.data?.remainingBalance ??
        balance - Number(amount);

      setBalance(Number(remainingBalance));

      // IMPORTANT
      window.dispatchEvent(new Event("walletUpdated"));

      setOrderData({
        side,
        symbol: coinSymbol,
        amount: Number(amount),
        price: executionPrice,
        qty: estimatedQty,
        type: orderType,
        status: orderType === "market" ? "Executed" : "Open",
      });

      setShowModal(true);
      setAmount("");
      setLimitPrice("");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Trade failed. Please try again.",
      );
    } finally {
      setLoadingSide("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#15181C] text-white border-l border-[#2B3139]">
      {showModal && orderData && (
        <div className="fixed lg:absolute inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-[#1E2329] border border-[#2B3139] p-5 shadow-2xl">
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-black ${
                orderData.side === "buy"
                  ? "bg-[#0ECB81]/15 text-[#0ECB81]"
                  : "bg-[#F6465D]/15 text-[#F6465D]"
              }`}
            >
              ✓
            </div>

            <h3 className="text-center text-sm font-black uppercase">
              Order {orderData.status}
            </h3>

            <div className="mt-4 space-y-2 rounded-xl bg-[#15181C] p-3 text-[11px] font-mono border border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-500">Pair</span>
                <span>{orderData.symbol}/USDT</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="uppercase">{orderData.type}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Side</span>
                <span
                  className={
                    orderData.side === "buy"
                      ? "text-[#0ECB81]"
                      : "text-[#F6465D]"
                  }
                >
                  {orderData.side.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span>${orderData.amount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Price</span>
                <span>${orderData.price.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Qty</span>
                <span>{orderData.qty.toFixed(6)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full rounded-xl bg-[#FCD535] py-3 text-xs font-black uppercase text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-[#2B3139] p-4">
        <div className="flex rounded-xl bg-[#0B0E11] p-1">
          {["market", "limit"].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 rounded-lg py-2 text-xs font-black uppercase transition ${
                orderType === type
                  ? "bg-[#2B3139] text-[#FCD535]"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 font-bold uppercase">Available</span>
          <span className="font-mono font-bold">
            ${balance.toLocaleString()}
          </span>
        </div>

        <div className="rounded-xl bg-[#0B0E11] border border-[#2B3139] p-3">
          <div className="flex justify-between text-[10px] uppercase text-slate-500">
            <span>Live Price</span>
            <span className="text-[#0ECB81]">● Streaming</span>
          </div>

          <div className="mt-1 font-mono text-lg font-black text-white">
            ${currentPrice ? currentPrice.toLocaleString() : "0.00"}
          </div>
        </div>

        {orderType === "limit" && (
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">
              Limit Price
            </label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="Enter limit price"
              className="w-full rounded-xl border border-[#2B3139] bg-[#1E2329] p-3 font-mono text-sm font-bold text-white outline-none focus:border-[#FCD535]"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">
            Amount USDT
          </label>
          <input
            type="number"
            value={amount}
            min="0"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-xl border border-[#2B3139] bg-[#1E2329] p-3 font-mono text-sm font-bold text-[#FCD535] outline-none focus:border-[#FCD535]"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercentage(pct)}
              className="rounded-lg bg-[#2B3139] py-2 text-[11px] font-black text-slate-300 hover:bg-[#3a414c] hover:text-white"
            >
              {pct}%
            </button>
          ))}
        </div>

        <div className="space-y-2 rounded-xl bg-[#0B0E11] border border-[#2B3139] p-3 text-[11px] font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated Qty</span>
            <span>
              {estimatedQty ? estimatedQty.toFixed(6) : "0.000000"} {coinSymbol}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Order Value</span>
            <span>${Number(amount || 0).toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Execution Price</span>
            <span>
              ${executionPrice ? executionPrice.toLocaleString() : "0.00"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-[#2B3139] bg-[#15181C] p-4">
        <button
          onClick={() => placeTrade("buy")}
          disabled={!!loadingSide}
          className="rounded-xl bg-[#0ECB81] py-4 text-xs font-black uppercase text-black transition active:scale-95 disabled:opacity-60"
        >
          {loadingSide === "buy" ? "Processing..." : "Buy / Long"}
        </button>

        <button
          onClick={() => placeTrade("sell")}
          disabled={!!loadingSide}
          className="rounded-xl bg-[#F6465D] py-4 text-xs font-black uppercase text-white transition active:scale-95 disabled:opacity-60"
        >
          {loadingSide === "sell" ? "Processing..." : "Sell / Short"}
        </button>
      </div>
    </div>
  );
};

export default TradePanel;

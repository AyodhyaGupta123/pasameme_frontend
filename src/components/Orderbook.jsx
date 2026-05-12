import React, { useEffect, useState } from "react";
import OrderbookRow from "./OrderbookRow";

const Orderbook = ({ currentPrice }) => {
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const updateBook = () => {
      if (!currentPrice || Number.isNaN(Number(currentPrice))) return;

      const newAsks = [];
      const newBids = [];
      let askTotal = 0;
      let bidTotal = 0;

      const rowCount = window.innerWidth < 768 ? 8 : 14;
      const priceStep = currentPrice < 1 ? 0.0001 : 0.5;

      for (let i = 0; i < rowCount; i++) {
        const askSize = 0.05 + Math.random() * 1.4;
        askTotal += askSize;

        newAsks.unshift({
          price: Number(currentPrice) + (i + 1) * priceStep,
          size: askSize,
          total: askTotal,
        });

        const bidSize = 0.05 + Math.random() * 1.4;
        bidTotal += bidSize;

        newBids.push({
          price: Number(currentPrice) - (i + 1) * priceStep,
          size: bidSize,
          total: bidTotal,
        });
      }

      setAsks(newAsks);
      setBids(newBids);
    };

    updateBook();
    const interval = setInterval(updateBook, 900);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const formatCurrentPrice = (value) => {
    const num = Number(value);

    if (!Number.isFinite(num)) return "--";

    return num.toLocaleString("en-US", {
      minimumFractionDigits: num < 1 ? 4 : 2,
      maximumFractionDigits: num < 1 ? 6 : 2,
    });
  };

  return (
    <div className="w-full min-w-0 bg-[#15181C] border-b border-[#262930] overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[320px] w-full font-mono">
          <div className="grid grid-cols-3 px-3 py-2 text-[10px] sm:text-[11px] font-semibold text-[#7D8FB3] border-b border-[#262930] uppercase">
            <span className="text-left">Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Sum</span>
          </div>

          <div className="max-h-[430px] xl:max-h-none overflow-hidden">
            <div className="flex flex-col-reverse">
              {asks.map((ask, i) => (
                <OrderbookRow
                  key={`ask-${i}`}
                  price={ask.price}
                  size={ask.size}
                  total={ask.total}
                  type="ask"
                />
              ))}
            </div>

            <div className="grid grid-cols-3 items-center px-3 py-2 border-y border-[#262930] bg-[#0B0E11]">
              <span className="font-black text-base text-[#0ECB81]">
                {formatCurrentPrice(currentPrice)}
              </span>
              <span className="text-right text-[10px] text-slate-500 col-span-2">
                Last Price
              </span>
            </div>

            <div className="flex flex-col">
              {bids.map((bid, i) => (
                <OrderbookRow
                  key={`bid-${i}`}
                  price={bid.price}
                  size={bid.size}
                  total={bid.total}
                  type="bid"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderbook;
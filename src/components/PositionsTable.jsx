import { useState, useEffect } from "react";
import axios from "../api/axios";

const PositionsTable = ({ selectedCoin, setSelectedCoin, userId }) => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    // Fetch positions from microservice
    const fetchPositions = async () => {
      try {
        const res = await axios.get(`/trade/positions?userId=${userId}`);
        setPositions(res.data.positions || []);
      } catch (err) {
        console.error("FULL ERROR:", err);
  console.error("RESPONSE:", err.response);
  console.error("DATA:", err.response?.data);
        setPositions([]);
      }
    };
    if (userId) fetchPositions();
  }, [userId]);

  // Responsive table and card view
  return (
    <div className="flex-1 bg-[#15181C] border-t border-[#262930] flex flex-col w-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#262930] text-[11px] sm:text-xs font-bold bg-[#15181C] sticky top-0 z-30">
        <button className="px-3 sm:px-4 py-3 text-[#FCD535] border-b-2 border-[#FCD535] whitespace-nowrap">
          Positions ({positions.length})
        </button>
        <button className="px-3 sm:px-4 py-3 text-slate-400 hover:text-white whitespace-nowrap">
          Open Orders (0)
        </button>
        <button className="px-3 sm:px-4 py-3 text-slate-400 hover:text-white whitespace-nowrap">
          History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-xs">
        {/* DESKTOP TABLE */}
        <table className="w-full text-left hidden md:table">
          <thead className="text-slate-500 sticky top-0 bg-[#15181C] z-20">
            <tr>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Entry Price</th>
              <th className="px-4 py-3 font-medium">Mark Price</th>
              <th className="px-4 py-3 font-medium text-right">PNL (ROE%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262930]">
            {positions.map((pos, i) => (
              <tr
                key={pos._id || i}
                className={`hover:bg-[#0B0E11] transition-colors cursor-pointer ${selectedCoin?.symbol === pos.symbol ? "bg-[#23262b]" : ""}`}
                onClick={() =>
                  setSelectedCoin({ symbol: pos.symbol, name: pos.symbol })
                }
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[#0ECB81] font-bold">
                      {pos.symbol}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Isolated {pos.leverage}x
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white">
                  {pos.size} {pos.symbol.replace(/USDT$/, "")}
                </td>
                <td className="px-4 py-3 text-slate-300">{pos.price}</td>
                <td className="px-4 py-3 text-slate-300">
                  {pos.markPrice || "-"}
                </td>
                <td className="px-4 py-3 text-[#0ECB81] font-bold text-right">
                  +0.00 (0.0%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden px-3 py-3 space-y-4 pb-6">
          {positions.map((pos, i) => (
            <div
              key={pos._id || i}
              className={`bg-[#0B0E11] rounded-xl p-4 border border-[#262930] space-y-4 ${selectedCoin?.symbol === pos.symbol ? "border-[#FCD535]" : ""}`}
              onClick={() =>
                setSelectedCoin({ symbol: pos.symbol, name: pos.symbol })
              }
            >
              <div className="flex justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#0ECB81]/10 text-[#0ECB81] text-[10px] px-2 py-0.5 rounded font-bold">
                      {pos.side?.toUpperCase() || "LONG"}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {pos.symbol}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {pos.leverage}x • Perp
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Cross Margin
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px]">Unrealized PNL</p>
                  <p className="text-[#0ECB81] font-bold text-sm">+0.00</p>
                  <p className="text-[#0ECB81] text-[10px] font-bold">0.0%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#262930]">
                <div>
                  <p className="text-slate-500 text-[10px]">Size</p>
                  <p className="text-white text-[12px]">
                    {pos.size} {pos.symbol.replace(/USDT$/, "")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px]">Margin</p>
                  <p className="text-white text-[12px]">-</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Entry</p>
                  <p className="text-slate-300 text-[12px]">{pos.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px]">Mark</p>
                  <p className="text-slate-300 text-[12px]">
                    {pos.markPrice || "-"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-[#262930] py-3 sm:py-2.5 rounded-lg text-sm sm:text-[11px] font-bold text-white">
                  Close
                </button>
                <button className="flex-1 bg-[#262930] py-3 sm:py-2.5 rounded-lg text-sm sm:text-[11px] font-bold text-white">
                  TP / SL
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PositionsTable;

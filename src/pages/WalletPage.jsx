import React, { useEffect, useState } from "react";
import ManualQRCode from "../components/ManualQRCode";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const WalletPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();

  const [wallet, setWallet] = useState({
    usdBalance: 0,
    realUsdBalance: 0,
    tokenBalance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [depositAmount, setDepositAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMessage, setDepositMessage] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  const canWithdraw = () => {
    if (!lastUpdated) return false;

    const last = new Date(lastUpdated);
    const now = new Date();
    const diff = (now - last) / (1000 * 60 * 60 * 24);

    return diff >= 7;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchWalletData();
    }
  }, [user, authLoading, navigate]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const res = await api.get("/header/wallet");

      if (res.data?.success) {
        setWallet({
          usdBalance: Number(res.data.wallet?.usdBalance || 0),
          realUsdBalance: Number(
            res.data.wallet?.realUsdBalance ?? res.data.wallet?.usdBalance ?? 0
          ),
          tokenBalance: Number(res.data.wallet?.tokenBalance || 0),
        });

        setLastUpdated(
          res.data.wallet?.updatedAt || res.data.wallet?.createdAt || null
        );
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(err.response?.data?.error || "Unauthorized access");
    } finally {
      setLoading(false);
    }
  };

  const handleManualDeposit = async () => {
    const amount = Number(depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setDepositMessage("Enter a valid amount greater than $0.");
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setDepositMessage("Enter a valid UTR / transaction reference ID.");
      return;
    }

    try {
      setDepositLoading(true);
      setDepositMessage("");

      const res = await api.post("/auth/deposit-request", {
        amount,
        transactionId: transactionId.trim(),
        method: "manual_bank_upi",
      });

      if (res.data?.success) {
        setDepositMessage(
          "Deposit request submitted successfully. Balance will be updated after admin verification."
        );
        setDepositAmount("");
        setTransactionId("");
      } else {
        setDepositMessage(res.data?.message || "Deposit request failed.");
      }
    } catch (err) {
      setDepositMessage(
        err?.response?.data?.message || "Deposit request failed."
      );
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawMessage("Enter a valid amount greater than $0.");
      return;
    }

    if (amount > wallet.realUsdBalance) {
      setWithdrawMessage("Insufficient wallet balance.");
      return;
    }

    if (!canWithdraw()) {
      setWithdrawMessage(
        "Withdrawal allowed only after 7 days from last deposit/update."
      );
      return;
    }

    try {
      setWithdrawLoading(true);
      setWithdrawMessage("");

      const res = await api.post("/auth/withdraw", { amount });

      if (res.data?.success) {
        setWithdrawMessage(
          "Withdrawal request submitted. Await admin approval."
        );

        setWallet((prev) => ({
          ...prev,
          realUsdBalance: prev.realUsdBalance - amount,
        }));

        setWithdrawAmount("");
      } else {
        setWithdrawMessage(res.data?.message || "Withdrawal failed.");
      }
    } catch (err) {
      setWithdrawMessage(
        err?.response?.data?.message || "Withdrawal failed."
      );
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0e11]">
        <div className="h-10 w-10 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const activeUsdBalance = wallet.realUsdBalance;
  const portfolioValue = activeUsdBalance + wallet.tokenBalance * 0.05;

  return (
    <div className="min-h-screen w-full bg-[#0b0e11] text-slate-200">
      <header className="bg-[#0e1117] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                error ? "bg-red-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span className="text-xs uppercase tracking-widest text-slate-500">
              {error ? "Disconnected" : "Wallet Active"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-[#11151c] border border-white/5 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                  Portfolio Value
                </p>

                <h1 className="text-4xl md:text-5xl font-semibold text-white">
                  $
                  {portfolioValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </h1>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                Verified Wallet
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#0b0e11] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500">Available Balance</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  $
                  {wallet.realUsdBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="bg-[#0b0e11] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500">Token Balance</p>
                <p className="mt-1 text-xl font-semibold text-amber-400">
                  {wallet.tokenBalance.toLocaleString()} PM
                </p>
              </div>

              <div className="bg-[#0b0e11] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500">Daily Limit</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  $10,000
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#11151c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-semibold">Add Funds</h3>

            <p className="text-xs text-slate-500 mt-1">
              Transfer funds manually and submit the reference ID for admin
              verification.
            </p>

            <div className="mt-5 space-y-3">
              <div className="bg-[#0b0e11] border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-slate-500">Account Name</span>
                  <span className="text-white font-medium text-right">
                    PasaMeme Trading
                  </span>
                </div>

                <div className="flex justify-between text-sm gap-3">
                  <span className="text-slate-500">UPI ID</span>
                  <span className="text-white font-medium text-right">
                    8175847774@okbizaxis
                  </span>
                </div>

                <div className="flex justify-between text-sm gap-3">
                  <span className="text-slate-500">Verification</span>
                  <span className="text-emerald-400 font-medium text-right">
                    Manual Approval
                  </span>
                </div>
              </div>

              <input
                type="number"
                min="1"
                step="1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0b0e11] border border-white/10 text-white text-sm outline-none focus:border-[#FCD535]"
                placeholder="Enter deposit amount"
              />

              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0b0e11] border border-white/10 text-white text-sm outline-none focus:border-[#FCD535]"
                placeholder="Enter UTR / transaction reference ID"
              />

              <button
                onClick={handleManualDeposit}
                disabled={depositLoading}
                className="w-full px-6 py-3 rounded-xl bg-[#FCD535] text-black text-sm font-bold hover:brightness-110 disabled:opacity-60 transition"
              >
                {depositLoading ? "Submitting..." : "Submit Deposit Request"}
              </button>

              {depositMessage && (
                <p className="text-sm text-slate-300">{depositMessage}</p>
              )}

              <p className="text-[11px] leading-relaxed text-slate-500">
                Do not share card number, CVV, OTP, or password with anyone.
                Balance will update only after admin verification.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-slate-400">
              Assets
            </h3>

            <div className="bg-[#11151c] border border-white/5 rounded-xl p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-white font-medium">Real Balance</p>
                  <p className="text-xs text-slate-500">Available</p>
                </div>

                <p className="font-semibold text-white">
                  $
                  {wallet.realUsdBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-5">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-sm outline-none focus:border-red-400"
                  placeholder="Withdraw amount"
                  disabled={withdrawLoading}
                />

                <button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || !canWithdraw()}
                  className="px-6 py-3 rounded-lg bg-red-500 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60"
                >
                  {withdrawLoading ? "Processing..." : "Withdraw"}
                </button>
              </div>

              {withdrawMessage && (
                <p className="mt-3 text-sm text-red-300">
                  {withdrawMessage}
                </p>
              )}

              {!canWithdraw() && (
                <p className="mt-2 text-xs text-yellow-400">
                  Withdrawal allowed only after 7 days from last deposit/update.
                </p>
              )}
            </div>

            <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex justify-between">
              <div>
                <p className="text-white font-medium">Pasa Meme Token</p>
                <p className="text-xs text-slate-500">Tradable</p>
              </div>

              <p className="font-semibold text-amber-400">
                {wallet.tokenBalance.toLocaleString()} PM
              </p>
            </div>
          </div>

          <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 space-y-4">
            <h4 className="text-sm uppercase tracking-wider text-slate-400">
              Account
            </h4>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">KYC</span>
              <span className="text-emerald-500">Verified</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Daily Limit</span>
              <span className="text-white">$10,000</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Risk Level</span>
              <span className="text-amber-400">Moderate</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Deposit Mode</span>
              <span className="text-white">Manual</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm uppercase tracking-wider text-slate-400">
            Wallet Activity
          </h3>

          <div className="bg-[#11151c] border border-white/5 rounded-xl overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead className="bg-[#0e1117] text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-white/5">
                  <td className="px-4 py-3 text-slate-400">
                    {new Date().toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-white">Wallet Sync</td>

                  <td className="px-4 py-3 text-right text-emerald-500">
                    Completed
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* <section>
          <ManualQRCode />
        </section> */}
      </main>

      <footer className="mt-12 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} PasaMeme Trading
      </footer>
    </div>
  );
};

export default WalletPage;
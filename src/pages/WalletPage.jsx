import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Copy,
  Check,
  Users,
  TrendingUp,
  Percent,
  AlertCircle,
  Share2,
} from "lucide-react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaTelegramPlane,
  FaTwitter,
} from "react-icons/fa";

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
  const [paymentUpiId, setPaymentUpiId] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);
  const [copied, setCopied] = useState(false);

  const [referralData, setReferralData] = useState({
    referralCode: "",
    referralLink: "",
    totalReferrals: 0,
    referralEarnings: 0,
  });

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getUserId = () => user?._id || user?.id || "";

  const getReferralCode = () => {
    const id = getUserId();
    return `PASA${id ? id.slice(-6).toUpperCase() : "USER"}`;
  };

  const fetchPaymentUpiId = async () => {
    try {
      const res = await api.get("/upi");

      if (res.data?.success) {
        setPaymentUpiId(res.data.upiId || "");
      }
    } catch {
      setPaymentUpiId("");
    }
  };

  const fetchWalletData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please login again.");
        if (showLoader) setLoading(false);
        return;
      }

      const res = await api.get("/header/wallet");

      if (res.data?.success) {
        const walletData = res.data.wallet || {};

        const balance = Number(
          walletData.realUsdBalance ?? walletData.usdBalance ?? 0,
        );

        setWallet({
          usdBalance: Number(walletData.usdBalance ?? balance),
          realUsdBalance: balance,
          tokenBalance: Number(walletData.tokenBalance || 0),
        });

        setLastUpdated(walletData.updatedAt || walletData.createdAt || null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(err.response?.data?.error || "Unauthorized access");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const fetchReferralData = async () => {
    try {
      const res = await api.get("/auth/referral-data");

      const code = res.data?.referralCode || getReferralCode();
      const baseUrl = window.location.origin;

      setReferralData({
        referralCode: code,
        referralLink: `${baseUrl}/signup?ref=${code}`,
        totalReferrals: Number(res.data?.totalReferrals || 0),
        referralEarnings: Number(res.data?.referralEarnings || 0),
      });
    } catch {
      const code = getReferralCode();

      setReferralData({
        referralCode: code,
        referralLink: `${window.location.origin}/signup?ref=${code}`,
        totalReferrals: 0,
        referralEarnings: 0,
      });
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchWalletData(true);
      fetchReferralData();
      fetchPaymentUpiId();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const handleWalletUpdate = () => {
      fetchWalletData(false);
    };

    const handleFocus = () => {
      if (user) fetchWalletData(false);
    };

    window.addEventListener("walletUpdated", handleWalletUpdate);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("walletUpdated", handleWalletUpdate);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  const canWithdraw = () => {
    if (!lastUpdated) return false;

    const last = new Date(lastUpdated);

    if (Number.isNaN(last.getTime())) return false;

    const now = new Date();
    const diff = (now - last) / (1000 * 60 * 60 * 24);

    return diff >= 7;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareOnWhatsApp = () => {
    const message = `Join PasaMeme Trading with my referral code ${referralData.referralCode}. ${referralData.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareOnTwitter = () => {
    const text = `Join PasaMeme Trading using my referral code: ${referralData.referralCode}. ${referralData.referralLink}`;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        referralData.referralLink,
      )}`,
      "_blank",
    );
  };

  const shareOnTelegram = () => {
    const message = `Join PasaMeme Trading with referral code ${referralData.referralCode}.`;

    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        referralData.referralLink,
      )}&text=${encodeURIComponent(message)}`,
      "_blank",
    );
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
          "Deposit request submitted successfully. Balance will be updated after admin verification.",
        );
        setDepositAmount("");
        setTransactionId("");
        fetchWalletData(false);
      } else {
        setDepositMessage(res.data?.message || "Deposit request failed.");
      }
    } catch (err) {
      setDepositMessage(
        err?.response?.data?.message || "Deposit request failed.",
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

    try {
      setWithdrawLoading(true);
      setWithdrawMessage("");

      const res = await api.post("/withdraw/request", {
        amount,
      });

      if (res.data?.success) {
        setWithdrawMessage(
          "Withdrawal request submitted successfully. Await admin approval.",
        );

        setWithdrawAmount("");
        fetchWalletData(false);
        window.dispatchEvent(new Event("walletUpdated"));
      } else {
        setWithdrawMessage(res.data?.message || "Withdrawal failed.");
      }
    } catch (err) {
      setWithdrawMessage(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Withdrawal request failed.",
      );
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0e11]">
        <div className="h-10 w-10 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const portfolioValue =
    Number(wallet.realUsdBalance || 0) +
    Number(wallet.tokenBalance || 0) * 0.05;

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
                  ${formatMoney(portfolioValue)}
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
                  ${formatMoney(wallet.realUsdBalance)}
                </p>
              </div>

              <div className="bg-[#0b0e11] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500">Token Balance</p>
                <p className="mt-1 text-xl font-semibold text-amber-400">
                  {Number(wallet.tokenBalance || 0).toLocaleString()} PM
                </p>
              </div>

              <div className="bg-[#0b0e11] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500">Daily Limit</p>
                <p className="mt-1 text-xl font-semibold text-white">$10,000</p>
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
                    {paymentUpiId || "UPI not available"}
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
          <div className="lg:col-span-2 bg-[#11151c] border border-white/5 rounded-2xl p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users size={18} className="text-emerald-400" />
                <h3 className="text-white font-semibold">Refer & Earn</h3>
              </div>

              <p className="text-xs text-slate-500">
                Share your referral link and earn rewards when friends join.
              </p>
            </div>

            <div className="bg-[#0b0e11] border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Your Referral Code</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">
                    {referralData.referralCode}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-semibold">
                  Active
                </span>
              </div>

              <div className="border-t border-white/5 pt-3">
                <p className="text-xs text-slate-500 mb-2">Referral Link</p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralData.referralLink}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0b0e11] border border-white/10 text-white text-xs outline-none"
                  />

                  <button
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
                      copied
                        ? "bg-emerald-500/30 text-emerald-400 border border-emerald-500/50"
                        : "bg-[#FCD535] text-black hover:brightness-110"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={14} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Share2 size={14} /> Share On
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition text-sm font-semibold"
                >
                  <FaWhatsapp size={16} />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                <button
                  onClick={shareOnTwitter}
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition text-sm font-semibold"
                >
                  <FaTwitter size={16} />
                  <span className="hidden sm:inline">Twitter</span>
                </button>

                <button
                  onClick={shareOnTelegram}
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc]/20 transition text-sm font-semibold"
                >
                  <FaTelegramPlane size={16} />
                  <span className="hidden sm:inline">Telegram</span>
                </button>

                <button
                  onClick={shareOnFacebook}
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20 transition text-sm font-semibold"
                >
                  <FaFacebookF size={16} />
                  <span className="hidden sm:inline">Facebook</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#11151c] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <h4 className="text-sm uppercase tracking-wider text-slate-400">
                Referral Stats
              </h4>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0b0e11] rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-slate-500" />
                  <p className="text-xs text-slate-500">Total Referrals</p>
                </div>

                <p className="text-2xl font-bold text-white">
                  {Number(referralData.totalReferrals || 0)}
                </p>
              </div>

              <div className="bg-[#0b0e11] rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <p className="text-xs text-slate-500">Referral Earnings</p>
                </div>

                <p className="text-2xl font-bold text-emerald-400">
                  ${formatMoney(referralData.referralEarnings)}
                </p>
              </div>

              <div className="bg-[#0b0e11] rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Percent size={14} className="text-amber-400" />
                  <p className="text-xs text-slate-500">Commission Rate</p>
                </div>

                <p className="text-2xl font-bold text-amber-400">10%</p>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex gap-2">
              <AlertCircle
                size={16}
                className="text-emerald-400 flex-shrink-0 mt-0.5"
              />

              <p className="text-[11px] leading-relaxed text-emerald-300">
                Earn 10% commission on every referral's first deposit.
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
                  ${formatMoney(wallet.realUsdBalance)}
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
                  disabled={withdrawLoading}
                  className="px-6 py-3 rounded-lg bg-red-500 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60"
                >
                  {withdrawLoading ? "Processing..." : "Withdraw"}
                </button>
              </div>

              {withdrawMessage && (
                <p className="mt-3 text-sm text-red-300">{withdrawMessage}</p>
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
                {Number(wallet.tokenBalance || 0).toLocaleString()} PM
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
      </main>

      <footer className="mt-12 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} PasaMeme Trading
      </footer>
    </div>
  );
};

export default WalletPage;

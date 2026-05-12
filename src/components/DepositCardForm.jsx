import React, { useState } from "react";
import api from "../api/axios";

const DepositCardForm = ({ userId, onDepositSuccess }) => {
  const [form, setForm] = useState({
    amount: "",
    gateway: "stripe",
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    otp: "",
  });
  const [step, setStep] = useState(1); // 1: card, 2: otp
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/api/auth/deposit-card", {
        ...form,
        amount: Number(form.amount),
      });
      if (res.success) {
        setMessage("Deposit successful!");
        onDepositSuccess && onDepositSuccess();
      } else if (res.error === "OTP_SENT") {
        setStep(2);
        setMessage("OTP sent to your registered mobile/email.");
      } else {
        setMessage(res.error || "Deposit failed");
      }
    } catch (err) {
      setMessage(err.error || "Deposit failed");
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/api/auth/deposit-card", {
        ...form,
        amount: Number(form.amount),
      });
      if (res.success) {
        setMessage("Deposit successful!");
        onDepositSuccess && onDepositSuccess();
      } else {
        setMessage(res.error || "OTP verification failed");
      }
    } catch (err) {
      setMessage(err.error || "OTP verification failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      {step === 1 && (
        <form onSubmit={handleDeposit}>
          <h2 className="text-lg font-bold mb-2">Deposit by Card</h2>
          <input
            className="block border p-2 mb-2 w-full"
            name="amount"
            placeholder="Amount (USD)"
            type="number"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <input
            className="block border p-2 mb-2 w-full"
            name="cardHolder"
            placeholder="Card Holder Name"
            value={form.cardHolder}
            onChange={handleChange}
            required
          />
          <input
            className="block border p-2 mb-2 w-full"
            name="cardNumber"
            placeholder="Card Number"
            value={form.cardNumber}
            onChange={handleChange}
            required
            maxLength={19}
          />
          <input
            className="block border p-2 mb-2 w-full"
            name="expiry"
            placeholder="Expiry (MM/YY)"
            value={form.expiry}
            onChange={handleChange}
            required
          />
          <input
            className="block border p-2 mb-2 w-full"
            name="cvv"
            placeholder="CVV"
            value={form.cvv}
            onChange={handleChange}
            required
            maxLength={4}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : "Deposit & Get OTP"}
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <h2 className="text-lg font-bold mb-2">Enter OTP</h2>
          <input
            className="block border p-2 mb-2 w-full"
            name="otp"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
            required
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Deposit"}
          </button>
        </form>
      )}
      {message && (
        <div className="mt-4 text-center text-sm text-red-600">{message}</div>
      )}
    </div>
  );
};

export default DepositCardForm;

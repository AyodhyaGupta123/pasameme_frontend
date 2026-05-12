import React, { useState, useEffect } from "react";
import api from "../api/axios";

const PaymentForm = ({ userId, onPaymentSuccess }) => {
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [showNewCard, setShowNewCard] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    holderName: "",
    brand: "Visa",
  });
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: card, 2: otp
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch saved cards
    api.get(`/api/cards/user/${userId}`).then((res) => {
      if (res.data.success) setCards(res.data.cards);
    });
  }, [userId]);

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId);
    setShowNewCard(false);
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/cards/save", { ...cardDetails, userId });
      if (res.data.success) {
        setCards([...cards, res.data.card]);
        setSelectedCardId(res.data.card.cardId);
        setShowNewCard(false);
        setMessage("Card saved!");
      }
    } catch (err) {
      setMessage("Card save failed");
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!selectedCardId || !amount)
      return setMessage("Select card and enter amount");
    setLoading(true);
    try {
      // Generate OTP
      const res = await api.post("/api/payment-otp/generate", {
        userId,
        cardId: selectedCardId,
        amount,
      });
      if (res.data.success) {
        setStep(2);
        setMessage("OTP sent to your registered mobile.");
      }
    } catch (err) {
      setMessage("OTP generation failed");
    }
    setLoading(false);
  };

  const handleOtpVerify = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/payment/process", {
        userId,
        cardId: selectedCardId,
        amount,
        otp,
      });
      if (res.data.success) {
        setMessage("Payment successful!");
        onPaymentSuccess && onPaymentSuccess();
      } else {
        setMessage(res.data.error || "Payment failed");
      }
    } catch (err) {
      setMessage("OTP verification/payment failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      {step === 1 && (
        <>
          <h2 className="text-lg font-bold mb-2">Select Card</h2>
          {cards.length > 0 && (
            <div className="mb-4">
              {cards.map((card) => (
                <div key={card.cardId} className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="card"
                    value={card.cardId}
                    checked={selectedCardId === card.cardId}
                    onChange={() => handleCardSelect(card.cardId)}
                  />
                  <span className="ml-2">
                    {card.brand} ****{card.last4} ({card.expiry})
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            className="text-blue-600 underline mb-4"
            onClick={() => setShowNewCard(true)}
          >
            + Add New Card
          </button>
          {showNewCard && (
            <form onSubmit={handleAddCard} className="mb-4">
              <input
                className="block border p-2 mb-2 w-full"
                placeholder="Card Number"
                required
                maxLength={19}
                value={cardDetails.cardNumber}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                }
              />
              <input
                className="block border p-2 mb-2 w-full"
                placeholder="Expiry (MM/YY)"
                required
                value={cardDetails.expiry}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, expiry: e.target.value })
                }
              />
              <input
                className="block border p-2 mb-2 w-full"
                placeholder="Card Holder Name"
                required
                value={cardDetails.holderName}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, holderName: e.target.value })
                }
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Card"}
              </button>
            </form>
          )}
          <input
            className="block border p-2 mb-2 w-full"
            placeholder="Amount (USD)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay & Get OTP"}
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="text-lg font-bold mb-2">Enter OTP</h2>
          <input
            className="block border p-2 mb-2 w-full"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            onClick={handleOtpVerify}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Pay"}
          </button>
        </>
      )}
      {message && (
        <div className="mt-4 text-center text-sm text-red-600">{message}</div>
      )}
    </div>
  );
};

export default PaymentForm;

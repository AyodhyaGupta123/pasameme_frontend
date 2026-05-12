import { useState } from "react";

const FAQ_DATA = [
  {
    q: "How do I deposit funds?",
    a: "Go to the Wallet page and use the Deposit by Card or Add Funds button. Follow the on-screen instructions to complete your deposit.",
  },
  {
    q: "How do I withdraw funds?",
    a: "On the Wallet page, enter the amount you wish to withdraw and click Withdraw. Withdrawals are only available after 7 days from your last deposit or balance update.",
  },
  {
    q: "When are daily notifications sent?",
    a: "Daily notifications are sent at 18:00 (6 PM) every day.",
  },
  {
    q: "How are bonus points calculated?",
    a: "You receive 10% of your deposit amount as bonus points each time you deposit. Bonus points are non-transferable and hold no cash value.",
  },
  {
    q: "How do I make a manual payment?",
    a: "Scan the QR code on the Wallet page to initiate a manual payment. Funds are credited after admin confirmation.",
  },
];

const TERMS = [
  {
    id: "01",
    text: "All users must provide accurate information during registration.",
    type: "info",
  },
  {
    id: "02",
    text: "Withdrawals are subject to a 7-day lock period after each deposit.",
    type: "info",
  },
  {
    id: "03",
    text: "Bonus points are non-transferable and carry no cash value.",
    type: "info",
  },
  {
    id: "04",
    text: "Manual payments must be confirmed by an admin before funds are credited to your account.",
    type: "info",
  },
  {
    id: "05",
    text: "The platform is not responsible for losses resulting from market volatility.",
    type: "warning",
  },
  {
    id: "06",
    text: "By using this platform, you agree to all terms and conditions stated here.",
    type: "info",
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 8,
        background: "#1C2030",
        border: "1px solid #2A2F45",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: "#F3F4F6", lineHeight: 1.5 }}>
          {q}
        </span>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: open ? "#FCD535" : "#2A2F45",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 16,
            color: open ? "#11151c" : "#FCD535",
            fontWeight: 500,
            transition: "all 0.2s",
          }}
        >
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid #2A2F45" }}>
          <p style={{ fontSize: 14, color: "#9CA3AF", margin: "14px 0 0", lineHeight: 1.75 }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
};

const FaqAndTerms = () => {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── FAQ Section ── */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#FCD535",
          margin: "0 0 8px",
        }}
      >
        Support
      </p>
      <h2 style={{ fontSize: 24, fontWeight: 600, color: "#F9FAFB", margin: "0 0 24px" }}>
        Frequently asked questions
      </h2>

      <div style={{ marginBottom: 8 }}>
        {FAQ_DATA.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} />
        ))}
      </div>

      {/* ── Divider ── */}
      <hr style={{ border: "none", borderTop: "1px solid #2A2F45", margin: "40px 0" }} />

      {/* ── Terms Section ── */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#FCD535",
          margin: "0 0 8px",
        }}
      >
        Legal
      </p>
      <h2 style={{ fontSize: 24, fontWeight: 600, color: "#F9FAFB", margin: "0 0 20px" }}>
        Terms &amp; conditions
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TERMS.map(({ id, text, type }) => (
          <div
            key={id}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              padding: "14px 18px",
              background: "#1C2030",
              border: "1px solid #2A2F45",
              borderRadius: 10,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 9px",
                borderRadius: 99,
                flexShrink: 0,
                marginTop: 2,
                background: type === "warning" ? "#3D2E0A" : "#0F2340",
                color: type === "warning" ? "#FCD535" : "#60A5FA",
                border: `1px solid ${type === "warning" ? "#7A5C10" : "#1E4080"}`,
              }}
            >
              {id}
            </span>
            <p style={{ fontSize: 14, color: "#D1D5DB", margin: 0, lineHeight: 1.75 }}>
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* ── Footer Note ── */}
      <p
        style={{
          fontSize: 12,
          color: "#4B5563",
          marginTop: 36,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        Last updated: April 2025 &nbsp;·&nbsp; For support, contact us via the Help section.
      </p>
    </div>
  );
};

export default FaqAndTerms;
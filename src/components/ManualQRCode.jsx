import React from "react";

// QR code for fixed $15 payment
const QR_CODE_IMAGE =
  "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pay+15+USD+to+Manual+Payment+Address";

const ManualQRCode = () => (
  <div style={{ textAlign: "center", margin: "2rem 0" }}>
    <h2>Manual Payment QR Code</h2>
    <img
      src={QR_CODE_IMAGE}
      alt="Manual Payment QR Code"
      style={{ width: 200, height: 200 }}
    />
    <p style={{ marginTop: 16 }}>Scan this QR code to pay $15 manually.</p>
  </div>
);

export default ManualQRCode;

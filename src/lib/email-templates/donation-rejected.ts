export interface DonationRejectedData {
  donorName: string;
  amountUSD: number;
  currency: string;
  convertedAmount: number;
  projectName?: string;
  transactionRef: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦", GHS: "₵", KES: "KSh",
  ZAR: "R", CAD: "CA$", AUD: "A$", JPY: "¥", INR: "₹",
};

function fmtAmount(amount: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${sym}${amount.toLocaleString("en-US")}`;
}

export function donationRejectedEmail(data: DonationRejectedData): string {
  const { donorName, amountUSD, currency, convertedAmount, projectName, transactionRef } = data;
  const firstName = donorName.split(" ")[0];
  const displayAmount = currency !== "USD"
    ? `${fmtAmount(convertedAmount, currency)} <span style="color:#6b7280;font-size:14px;">(≈ $${amountUSD.toLocaleString("en-US")} USD)</span>`
    : `$${amountUSD.toLocaleString("en-US")} USD`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We Could Not Confirm Your Donation</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a2b3c;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0c1620 0%,#0f2a3a 100%);padding:40px 32px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:rgba(239,68,68,0.15);border:2px solid rgba(239,68,68,0.35);line-height:56px;font-size:26px;margin-bottom:16px;">🔔</div>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                We Could Not Confirm Your Transfer
              </h1>
              <p style="margin:8px 0 0;font-size:15px;color:#fca5a5;font-weight:600;">
                Don't worry — we're here to help sort this out.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">

              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">
                Hi <strong>${donorName}</strong>,
              </p>

              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">
                Thank you so much for your kind intention to support the Jade D'Val Foundation.
                It truly means the world to us. Unfortunately, our team was unable to confirm the
                transfer for the donation below.
              </p>

              <!-- Amount box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#fff5f5;border:1.5px solid #fecaca;border-radius:12px;padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ef4444;">Could Not Be Confirmed</p>
                    <p style="margin:0;font-size:32px;font-weight:900;color:#0c1620;">${displayAmount}</p>
                    ${projectName ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280;">For: <strong style="color:#0c1620;">${projectName}</strong></p>` : ""}
                    <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;letter-spacing:1px;">REF: ${transactionRef}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">
                This can happen for a number of reasons — perhaps the transfer details didn't
                match what we have on record, or the payment hasn't reached us yet.
                <strong>Please do not be discouraged.</strong>
              </p>

              <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#374151;">
                Our support team is ready and happy to help you resolve this quickly so your
                generosity can still make the difference you intended. Please reach out to us
                and we'll get this sorted together.
              </p>

              <!-- Contact CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#f0fdfb;border:1.5px solid #ccfaf5;border-radius:12px;padding:24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#374151;letter-spacing:0.5px;">
                      REACH OUT TO OUR SUPPORT TEAM
                    </p>
                    <a href="mailto:jadedvalfoundation@gmail.com"
                      style="display:inline-block;font-size:15px;font-weight:700;color:#00ccbb;text-decoration:none;margin-bottom:12px;">
                      jadedvalfoundation@gmail.com
                    </a>
                    <br/>
                    <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">or use our contact form</p>
                    <a href="https://jadedvalfoundation.org/en/contact"
                      style="display:inline-block;background:#00ccbb;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:12px 28px;border-radius:100px;text-decoration:none;">
                      Contact Support →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">
                Your heart to give is something we deeply respect and appreciate.
                We believe this is just a small hiccup, and we look forward to celebrating
                your confirmed donation with you very soon. 💚
              </p>

              <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
                With warm regards,<br />
                <strong>The Jade D'Val Foundation Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
                This is an automated notification. Please do not reply to this email —
                use the contact details above to reach our team.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Jade D'Val Foundation ·
                <a href="https://jadedvalfoundation.org" style="color:#00ccbb;text-decoration:none;">jadedvalfoundation.org</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

export interface DonationVerifiedData {
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

export function donationVerifiedEmail(data: DonationVerifiedData): string {
  const { donorName, amountUSD, currency, convertedAmount, projectName, transactionRef } = data;
  const firstName = donorName.split(" ")[0];
  const displayAmount = currency !== "USD"
    ? `${fmtAmount(convertedAmount, currency)} <span style="color:#6b7280;font-size:14px;">(≈ $${amountUSD.toLocaleString("en-US")} USD)</span>`
    : `$${amountUSD.toLocaleString("en-US")} USD`;

  const projectLine = projectName
    ? `<p style="margin:0 0 8px;">Your generous gift is going directly towards <strong style="color:#00ccbb;">${projectName}</strong> — a cause that is already changing lives.</p>`
    : `<p style="margin:0 0 8px;">Your generous gift is going directly into our programs, powering real change in the communities we serve.</p>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Donation Has Been Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a2b3c;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0c1620 0%,#0f2a3a 100%);padding:40px 32px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:rgba(0,204,187,0.15);border:2px solid rgba(0,204,187,0.4);line-height:56px;font-size:26px;margin-bottom:16px;">💚</div>
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Thank You, ${firstName}!
              </h1>
              <p style="margin:8px 0 0;font-size:15px;color:#00ccbb;font-weight:600;">
                Your donation has been confirmed.
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
                We have received and confirmed your donation — and from the bottom of our hearts,
                <strong>thank you</strong>. You didn't just send money; you sent hope, opportunity,
                and a future to someone who needs it most.
              </p>

              <!-- Amount box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#f0fdfb;border:1.5px solid #ccfaf5;border-radius:12px;padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#00ccbb;">Donation Confirmed</p>
                    <p style="margin:0;font-size:32px;font-weight:900;color:#0c1620;">${displayAmount}</p>
                    ${projectName ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280;">For: <strong style="color:#0c1620;">${projectName}</strong></p>` : ""}
                    <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;letter-spacing:1px;">REF: ${transactionRef}</p>
                  </td>
                </tr>
              </table>

              ${projectLine}

              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">
                Every contribution — no matter the size — moves us one step closer to a world where
                every child has access to education, every family has stability, and every community
                can thrive. <strong>Your name is part of that story now.</strong>
              </p>

              <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#374151;">
                We'll keep you updated on the impact your gift is making. If you ever have questions
                or just want to say hi, our team is always here for you.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td align="center">
                    <a href="https://jadedvalfoundation.org"
                      style="display:inline-block;background:#00ccbb;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:14px 36px;border-radius:100px;text-decoration:none;">
                      See Our Work →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
                With deep gratitude,<br />
                <strong>The Jade D'Val Foundation Team</strong> 💚
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
                This is an automated confirmation. Please do not reply to this email.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Jade D'Val Foundation · <a href="https://jadedvalfoundation.org" style="color:#00ccbb;text-decoration:none;">jadedvalfoundation.org</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">
                100% of your donation goes directly to our programs.
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

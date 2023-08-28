import { Theme } from "next-auth";

export const { format, utcToZonedTime } = require("date-fns-tz");

export const formatInTimeZone = (date: string, fmt: string) =>
  format(utcToZonedTime(date, "UTC"), fmt, { timeZone: "UTC" });

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
export function html(params: {
  url: string;
  host: string;
  theme: Theme;
  type: string;
}) {
  const { url, host, theme, type } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = theme.brandColor || "#346df1";
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText || "#fff",
  };
  switch (type) {
    case "reset-password":
      return `
        <body style="background: ${color.background};">
          <table width="100%" border="0" cellspacing="20" cellpadding="0"
            style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
            <tr>
              <td align="center"
                style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
                Reset Password for <strong>${escapedHost}</strong>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                        target="_blank"
                        style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                        in</a></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center"
                style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
                If you did not request this email you can safely ignore it.
              </td>
            </tr>
          </table>
        </body>
      `;
    case "verify-email":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Successful Registration</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #f6f6f6;
              font-family: Arial, sans-serif;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
              background-color: #fff;
            }
            h1 {
              font-size: 28px;
              color: #333;
              text-align: center;
              margin-bottom: 30px;
            }
            p {
              font-size: 16px;
              color: #666;
              line-height: 24px;
              margin-bottom: 30px;
              text-align: center;
            }
            .btn {
              display: block;
              width: 200px;
              height: 50px;
              line-height: 50px;
              background-color: #FF7A00;
              color: #fff;
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              text-decoration: none;
              border-radius: 25px;
              margin: 0 auto;
            }
            .logo {
              display: block;
              margin: 0 auto;
              text-align: center;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            .demo {
              font-size: 14px;
              color: #999;
              line-height: 20px;
              text-align: center;
              margin-top: 30px;
            }
            .demo a {
              color: #FF7A00;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://reg.terraacademyforarts.com/static/images/header-img.png" alt="TAFTA">
            </div>
            <h1>Successful Registration</h1>
            <p>Thank you for registering with us! To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${url}" class="btn">Verify Email</a>
            <p class="demo">If the button doesn't work, please copy and paste the following link into your browser:</p>
            <p class="demo"><a href="${url}">${url}</a></p>
          </div>
        </body>
        </html>`;
    case "seat-booking-confirmation":
      return `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Seat Booking Confirmation</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                /* CSS styles for the Seat Booking Confirmation email */
                /* ... Insert the CSS styles from the admin-booking.html file ... */
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">
                  <!-- Insert the company logo here -->
                  <img src="[Company Logo]" alt="[Company Name]">
                </div>
                <h1>Seat Booking Confirmation</h1>
                <!-- Insert the content of the admin-booking.html file here -->
                <p>Dear [Applicant Name],</p>
                <p>We are pleased to inform you that your seat for the event on <span class="highlight">[Date and Time]</span> has been successfully booked by [Admin Name]. Your seat number is <span class="highlight">[Seat Number]</span>.</p>
                <p>Please bring this confirmation email with you to the event as proof of your booking. We look forward to seeing you there!</p>
                <p>Thank you for choosing [Company Name].</p>
                <p>Applicant Name: <span class="highlight">[Applicant Name]</span></p>
                <p>Applicant Email: <span class="highlight">[Applicant Email]</span></p>
              </div>
            </body>
            </html>`;
    default:
      return `
        <body style="background: ${color.background};">
          <table width="100%" border="0" cellspacing="20" cellpadding="0"
            style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
            <tr>
              <td align="center"
                style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
                Sign in to <strong>${escapedHost}</strong>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                        target="_blank"
                        style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                        in</a></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center"
                style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
                If you did not request this email you can safely ignore it.
              </td>
            </tr>
          </table>
        </body>
      `;
  }
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
export function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}

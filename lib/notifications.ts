import { Resend } from "resend";
import type { BookingEntry } from "./bookings";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Resend API key is missing.");
  }

  return new Resend(apiKey);
}

export async function sendBookingNotification(booking: BookingEntry) {
  const resend = getResendClient();
  const notificationEmail =
    process.env.NOTIFICATION_EMAIL ?? "comeup.detailing@gmail.com";

  await resend.emails.send({
    from: "Comeup Car Detailing <onboarding@resend.dev>",
    to: [notificationEmail],
    subject: `New booking request: ${booking.service} on ${booking.date} at ${booking.slot}`,
    text: [
      "New appointment request received.",
      "",
      `Service: ${booking.service}`,
      `Vehicle type: ${booking.vehicleType}`,
      `Date: ${booking.date}`,
      `Slot: ${booking.slot}`,
      `Customer: ${booking.name}`,
      `Phone: ${booking.phone}`,
      `Email: ${booking.email}`,
      `Address: ${booking.address}`,
      `Notes: ${booking.notes || "None"}`,
      "",
      `Status: ${booking.status ?? "new"}`,
      `Deposit status: ${booking.depositStatus ?? "not_required"}`,
    ].join("\n"),
  });
}

import { Resend } from "resend";
import type { BookingEntry } from "./bookings";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Resend API key is missing.");
  }

  return new Resend(apiKey);
}

function getMailConfig() {
  return {
    resend: getResendClient(),
    notificationEmail:
      process.env.NOTIFICATION_EMAIL ?? "comeup.detailing@gmail.com",
    fromEmail:
      process.env.RESEND_FROM_EMAIL ??
      "Comeup Car Detailing <onboarding@resend.dev>",
  };
}

function formatDepositStatus(status?: string) {
  return status === "yes" ? "yes" : "no";
}

export async function sendBookingNotification(booking: BookingEntry) {
  const { resend, notificationEmail, fromEmail } = getMailConfig();

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [notificationEmail],
    replyTo: booking.email,
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
      `Paid: ${formatDepositStatus(booking.depositStatus)}`,
    ].join("\n"),
  });

  if (error) {
    throw new Error(
      `Resend could not send the booking notification: ${error.message}`,
    );
  }

  return data;
}

export async function sendBookingConfirmation(booking: BookingEntry) {
  const { resend, fromEmail, notificationEmail } = getMailConfig();

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [booking.email],
    replyTo: notificationEmail,
    subject: `Booking request received for ${booking.date} at ${booking.slot}`,
    text: [
      `Hi ${booking.name},`,
      "",
      "Thanks for booking with Comeup Car Detailing.",
      "We received your appointment request and will follow up if anything needs to be confirmed or adjusted.",
      "",
      "Booking details:",
      `Service: ${booking.service}`,
      `Vehicle type: ${booking.vehicleType}`,
      `Date: ${booking.date}`,
      `Slot: ${booking.slot}`,
      `Address: ${booking.address}`,
      `Phone: ${booking.phone}`,
      `Email: ${booking.email}`,
      `Notes: ${booking.notes || "None"}`,
      "",
      "If you need to update anything, reply to this email or contact us directly.",
      "",
      "Comeup Car Detailing",
    ].join("\n"),
  });

  if (error) {
    throw new Error(
      `Resend could not send the booking confirmation: ${error.message}`,
    );
  }

  return data;
}

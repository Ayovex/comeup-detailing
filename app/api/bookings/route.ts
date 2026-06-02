import { NextResponse } from "next/server";
import { readBookings, saveBooking } from "@/lib/bookings";
import {
  sendBookingConfirmation,
  sendBookingNotification,
} from "@/lib/notifications";

const ALLOWED_SLOTS = new Set(["10:00 AM", "2:00 PM", "6:00 PM"]);

function blocksAvailability(status?: string) {
  return status !== "cancelled";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const bookings = await readBookings();

  return NextResponse.json({
    bookings: bookings.map((booking) => ({
      date: booking.date,
      slot: booking.slot,
      service: booking.service,
      vehicleType: booking.vehicleType,
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      address: booking.address,
      notes: booking.notes,
      status: booking.status,
      depositStatus: booking.depositStatus,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      date?: string;
      slot?: string;
      service?: string;
      vehicleType?: string;
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
    };

    if (
      !body.date ||
      !body.slot ||
      !body.service ||
      !body.vehicleType ||
      !body.name ||
      !body.phone ||
      !body.email ||
      !body.address
    ) {
      return NextResponse.json(
        { message: "Please complete all required booking fields." },
        { status: 400 },
      );
    }

    if (!ALLOWED_SLOTS.has(body.slot)) {
      return NextResponse.json(
        { message: "That time slot is not part of the current schedule." },
        { status: 400 },
      );
    }

    const bookings = await readBookings();
    const slotTaken = bookings.some(
      (booking) =>
        booking.date === body.date &&
        booking.slot === body.slot &&
        blocksAvailability(booking.status),
    );

    if (slotTaken) {
      return NextResponse.json(
        { message: "That slot has already been reserved. Please choose another." },
        { status: 409 },
      );
    }

    const savedBooking = await saveBooking({
      date: body.date,
      slot: body.slot,
      service: body.service,
      vehicleType: body.vehicleType,
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes ?? "",
      createdAt: new Date().toISOString(),
      status: "new",
      depositStatus: "not_required",
    });

    try {
      await Promise.all([
        sendBookingNotification(savedBooking),
        sendBookingConfirmation(savedBooking),
      ]);
    } catch (notificationError) {
      console.error("Booking saved, but at least one email send failed:", notificationError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Booking API failed:", error);

    return NextResponse.json(
      {
        message:
          "Booking storage is not fully configured yet. Finish the Supabase table setup and try again.",
      },
      { status: 500 },
    );
  }
}

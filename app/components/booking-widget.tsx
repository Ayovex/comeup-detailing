"use client";

import { FormEvent, useState } from "react";

type Booking = {
  date: string;
  slot: string;
  service: string;
  vehicleType: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status?: string;
};

type BookingResponse = {
  bookings: Booking[];
};

function blocksAvailability(booking: Booking) {
  return booking.status !== "cancelled";
}

type BookingWidgetProps = {
  initialBookings: Booking[];
  initialService?: string;
};

const SLOTS = ["10:00 AM", "2:00 PM", "6:00 PM"];
const SERVICES = [
  "Basic Wash",
  "VIP Wash",
  "Disaster Detail",
];
const VEHICLE_TYPES = ["SUV", "Truck", "Van", "Sedan", "Coupe"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatDateValue(date: Date) {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
    .toISOString()
    .split("T")[0];
}

function isPastDay(date: Date) {
  const today = new Date();
  const currentDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return date.getTime() < currentDay.getTime();
}

function buildCalendarDays(month: Date) {
  const monthStart = startOfMonth(month);
  const startOffset = monthStart.getDay();
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - startOffset);
  const days: Date[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    days.push(date);
  }

  return days;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildYearOptions() {
  const currentYear = new Date().getFullYear();

  return [currentYear, currentYear + 1, currentYear + 2];
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T12:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function isSlotPast(dateValue: string, slot: string) {
  const now = new Date();
  const [time, meridiem] = slot.split(" ");
  const [rawHours, minutes] = time.split(":").map(Number);
  let hours = rawHours;

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  const slotDate = new Date(`${dateValue}T00:00:00`);
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate.getTime() < now.getTime();
}

function buildInitialForm(initialService?: string) {
  const normalizedService = SERVICES.find(
    (service) => service.toLowerCase() === initialService?.toLowerCase(),
  );

  return {
    service: normalizedService ?? SERVICES[0],
    vehicleType: VEHICLE_TYPES[0],
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  };
}

export function BookingWidget({
  initialBookings,
  initialService,
}: BookingWidgetProps) {
  const today = new Date();
  const yearOptions = buildYearOptions();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today));
  const calendarDays = buildCalendarDays(visibleMonth);
  const currentMonthValue = visibleMonth.getMonth();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedDate, setSelectedDate] = useState(() => formatDateValue(today));
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(() => buildInitialForm(initialService));

  async function loadBookings() {
    setLoading(true);

    try {
      const response = await fetch("/api/bookings", { cache: "no-store" });
      const data = (await response.json()) as BookingResponse;
      setBookings(data.bookings);
    } catch {
      setMessage("Booking calendar could not load right now. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedSlotUnavailable =
      !selectedSlot ||
      bookings.some(
        (booking) =>
          booking.date === selectedDate &&
          booking.slot === selectedSlot &&
          blocksAvailability(booking),
      ) ||
      isSlotPast(selectedDate, selectedSlot);

    if (selectedSlotUnavailable) {
      setMessage("Choose a date and one of the available time slots first.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          slot: selectedSlot,
          ...formData,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "That time just became unavailable.");
        return;
      }

      setFormData(buildInitialForm(initialService));
      setSelectedSlot("");
      setMessage(
        "Appointment request saved. Reach out to confirm by text and send any required deposit by Zelle.",
      );
      await loadBookings();
    } catch {
      setMessage("Something went wrong while saving your appointment request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
      <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/75 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5">
          <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
            Book now
          </span>
          <h3 className="text-2xl font-semibold text-white">
            Choose your day and claim an open slot
          </h3>
          <p className="text-sm leading-7 text-slate-300">
            We currently open three mobile-detailing appointments daily at 10:00
            AM, 2:00 PM, and 6:00 PM across DFW.
          </p>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Pick a date
          </p>
          <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-3 sm:rounded-[1.6rem] sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
                className="rounded-full border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-white sm:px-4"
              >
                Prev
              </button>
              <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.22em]">
                {formatMonthLabel(visibleMonth)}
              </p>
              <button
                type="button"
                onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
                className="rounded-full border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-white sm:px-4"
              >
                Next
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Month
                <select
                  value={visibleMonth.getMonth()}
                  onChange={(event) =>
                    setVisibleMonth(
                      new Date(
                        visibleMonth.getFullYear(),
                        Number(event.target.value),
                        1,
                      ),
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-medium normal-case tracking-normal text-white outline-none transition focus:border-cyan-400"
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Year
                <select
                  value={visibleMonth.getFullYear()}
                  onChange={(event) =>
                    setVisibleMonth(
                      new Date(
                        Number(event.target.value),
                        visibleMonth.getMonth(),
                        1,
                      ),
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-medium normal-case tracking-normal text-white outline-none transition focus:border-cyan-400"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center">
              {WEEKDAYS.map((day) => (
                <p
                  key={day}
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500"
                >
                  {day}
                </p>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((date) => {
                const dateValue = formatDateValue(date);
                const active = selectedDate === dateValue;
                const inCurrentMonth = date.getMonth() === currentMonthValue;
                const pastDay = isPastDay(date);
                const disabled = !inCurrentMonth || pastDay;

                return (
                  <button
                    key={dateValue}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDate(dateValue)}
                    className={`aspect-square rounded-xl border text-sm font-semibold transition sm:rounded-2xl ${
                      active
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : disabled
                          ? "cursor-not-allowed border-white/5 bg-white/[0.03] text-slate-600"
                          : "border-white/10 bg-white/5 text-white hover:border-cyan-300 hover:bg-cyan-400/10"
                    }`}
                  >
                    <span className={inCurrentMonth ? "" : "opacity-50"}>
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <p className="text-sm font-semibold text-white">
                Selected date: {formatDateLabel(selectedDate)}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                {selectedDate}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Available slots
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {SLOTS.map((slot) => {
              const isBooked = bookings.some(
                (booking) =>
                  booking.date === selectedDate &&
                  booking.slot === slot &&
                  blocksAvailability(booking),
              );
              const isPast = isSlotPast(selectedDate, slot);
              const disabled = isBooked || isPast || loading;
              const active = selectedSlot === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-2xl border px-4 py-4 text-center transition sm:py-5 ${
                    disabled
                      ? "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
                      : active
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : "border-white/10 bg-white/5 text-white hover:border-cyan-300 hover:bg-cyan-400/10"
                  }`}
                >
                  <p className="text-lg font-semibold">{slot}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em]">
                    {isBooked ? "Booked" : isPast ? "Closed" : "Open"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        className="rounded-[1.6rem] border border-slate-200 bg-white p-4 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.16)] sm:rounded-[2rem] sm:p-6"
      >
        <div className="border-b border-slate-200 pb-5">
          <h3 className="text-2xl font-semibold">Request your appointment</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Final confirmation happens directly with Comeup Car Detailing. Zelle
            payments are accepted, and some appointments may require a non-refundable
            deposit to hold the slot.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:mt-6">
          <label className="grid gap-2 text-sm font-medium">
            Service requested
            <select
              value={formData.service}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  service: event.target.value,
                }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500"
            >
              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Vehicle type
            <select
              value={formData.vehicleType}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  vehicleType: event.target.value,
                }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500"
            >
              {VEHICLE_TYPES.map((vehicleType) => (
                <option key={vehicleType} value={vehicleType}>
                  {vehicleType}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Full name
            <input
              required
              name="name"
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500"
              placeholder="Your name"
              autoComplete="name"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Phone
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500"
                placeholder="469-793-2207"
                autoComplete="tel"
                inputMode="tel"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Email
              <input
                required
                name="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500"
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            Service address
            <input
              required
              name="street-address"
              value={formData.address}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500"
              placeholder="Where should we come to you?"
              autoComplete="street-address"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Notes
            <textarea
              value={formData.notes}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500"
              placeholder="Vehicle type, condition, or anything we should know"
            />
          </label>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-950 px-4 py-4 text-sm text-slate-200 sm:mt-6">
          <p className="font-semibold text-white">
            <span className="block sm:inline">
              Selected appointment: {formatDateLabel(selectedDate)}
            </span>
            {selectedSlot &&
            !bookings.some(
              (booking) =>
                booking.date === selectedDate &&
                booking.slot === selectedSlot &&
                blocksAvailability(booking),
            ) &&
            !isSlotPast(selectedDate, selectedSlot)
              ? ` at ${selectedSlot}`
              : " | choose a time"}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || loading}
          className="mt-6 w-full rounded-full bg-cyan-500 px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Saving..." : "Reserve this slot"}
        </button>

        {message ? (
          <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>
        ) : null}
      </form>
    </div>
  );
}

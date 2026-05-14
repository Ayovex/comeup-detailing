import { createClient } from "@supabase/supabase-js";

export type BookingEntry = {
  id?: string;
  date: string;
  slot: string;
  service: string;
  vehicleType: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
  status?: string;
  depositStatus?: string;
};

export type CustomerProfile = {
  customerKey: string;
  name: string;
  phone: string;
  email: string;
  internalNotes: string;
  updatedAt?: string;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function buildCustomerKey(input: {
  phone?: string;
  email?: string;
  name?: string;
}) {
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const email = input.email ? normalizeEmail(input.email) : "";

  if (phone) {
    return `phone:${phone}`;
  }

  if (email) {
    return `email:${email}`;
  }

  return `name:${(input.name ?? "").trim().toLowerCase()}`;
}

export async function readBookings() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, booking_date, booking_slot, service, vehicle_type, customer_name, phone, email, address, notes, created_at, status, deposit_status",
      )
      .order("booking_date", { ascending: true })
      .order("booking_slot", { ascending: true });

    if (error) {
      console.error("Failed to read bookings from Supabase:", error.message);
      return [] as BookingEntry[];
    }

    return (data ?? []).map((booking) => ({
      date: booking.booking_date,
      id: booking.id,
      slot: booking.booking_slot,
      service: booking.service,
      vehicleType: booking.vehicle_type,
      name: booking.customer_name,
      phone: booking.phone,
      email: booking.email,
      address: booking.address,
      notes: booking.notes ?? "",
      createdAt: booking.created_at,
      status: booking.status ?? "new",
      depositStatus: booking.deposit_status ?? "not_required",
    })) as BookingEntry[];
  } catch (error) {
    console.error("Supabase readBookings failed:", error);
    return [] as BookingEntry[];
  }
}

export async function saveBooking(entry: BookingEntry) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      booking_date: entry.date,
      booking_slot: entry.slot,
      service: entry.service,
      vehicle_type: entry.vehicleType,
      customer_name: entry.name,
      phone: entry.phone,
      email: entry.email,
      address: entry.address,
      notes: entry.notes,
      status: entry.status ?? "new",
      deposit_status: entry.depositStatus ?? "not_required",
    })
    .select(
      "id, booking_date, booking_slot, service, vehicle_type, customer_name, phone, email, address, notes, created_at, status, deposit_status",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Booking could not be saved to Supabase.");
  }

  return {
    date: data.booking_date,
    id: data.id,
    slot: data.booking_slot,
    service: data.service,
    vehicleType: data.vehicle_type,
    name: data.customer_name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    notes: data.notes ?? "",
    createdAt: data.created_at,
    status: data.status ?? "new",
    depositStatus: data.deposit_status ?? "not_required",
  } satisfies BookingEntry;
}

export async function updateBookingStatus(input: {
  id: string;
  status?: string;
  depositStatus?: string;
}) {
  const supabase = getSupabaseAdmin();
  const updates: Record<string, string> = {};

  if (input.status) {
    updates.status = input.status;
  }

  if (input.depositStatus) {
    updates.deposit_status = input.depositStatus;
  }

  const { error } = await supabase.from("bookings").update(updates).eq("id", input.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function readCustomerProfiles() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("customer_profiles")
      .select("customer_key, name, phone, email, internal_notes, updated_at");

    if (error) {
      console.error("Failed to read customer profiles from Supabase:", error.message);
      return [] as CustomerProfile[];
    }

    return (data ?? []).map((profile) => ({
      customerKey: profile.customer_key,
      name: profile.name ?? "",
      phone: profile.phone ?? "",
      email: profile.email ?? "",
      internalNotes: profile.internal_notes ?? "",
      updatedAt: profile.updated_at ?? undefined,
    })) as CustomerProfile[];
  } catch (error) {
    console.error("Supabase readCustomerProfiles failed:", error);
    return [] as CustomerProfile[];
  }
}

export async function upsertCustomerProfile(profile: CustomerProfile) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("customer_profiles").upsert(
    {
      customer_key: profile.customerKey,
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      internal_notes: profile.internalNotes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "customer_key" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

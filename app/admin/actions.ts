"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAuth } from "@/lib/admin-auth";
import { upsertCustomerProfile, updateBookingStatus } from "@/lib/bookings";

function buildAdminRedirect(formData: FormData) {
  const search = String(formData.get("search") ?? "").trim();
  const customer = String(formData.get("customer") ?? "").trim();
  const page = String(formData.get("page") ?? "").trim();
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (customer) {
    params.set("customer", customer);
  }

  if (page) {
    params.set("page", page);
  }

  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

export async function updateBookingStatusAction(formData: FormData) {
  await requireAdminAuth();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const depositStatus = String(formData.get("depositStatus") ?? "");

  if (!id) {
    return;
  }

  await updateBookingStatus({
    id,
    status,
    depositStatus,
  });

  revalidatePath("/admin");
  redirect(buildAdminRedirect(formData));
}

export async function saveCustomerNotesAction(formData: FormData) {
  await requireAdminAuth();

  const customerKey = String(formData.get("customerKey") ?? "");
  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const email = String(formData.get("email") ?? "");
  const internalNotes = String(formData.get("internalNotes") ?? "");

  if (!customerKey) {
    return;
  }

  await upsertCustomerProfile({
    customerKey,
    name,
    phone,
    email,
    internalNotes,
  });

  revalidatePath("/admin");
  redirect(buildAdminRedirect(formData));
}

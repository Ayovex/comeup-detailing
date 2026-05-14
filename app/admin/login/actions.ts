"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  validateAdminCredentials,
} from "@/lib/admin-auth";

export async function signInAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!validateAdminCredentials({ username, password })) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function signOutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

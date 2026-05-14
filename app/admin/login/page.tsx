import Link from "next/link";
import { hasValidAdminSession, isAdminAuthConfigured } from "@/lib/admin-auth";
import { SubmitButton } from "../submit-button";
import { signInAction } from "./actions";
import { redirect } from "next/navigation";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params?.error === "invalid";
  const isConfigured = isAdminAuthConfigured();

  if (await hasValidAdminSession()) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#081225_38%,#eef4fb_38%,#f8fbff_100%)] px-6 py-10 sm:px-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/82 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.4)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-orange-200">
            Admin login
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase tracking-[0.08em]">
            Private dashboard access
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Sign in to manage bookings, deposits, and customer notes.
          </p>
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white/96 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
          {!isConfigured ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              Admin auth is not configured yet. Add
              ` ADMIN_LOGIN_USERNAME `, ` ADMIN_LOGIN_PASSWORD `, and
              ` ADMIN_SESSION_SECRET ` to your environment variables, then reload
              this page.
            </div>
          ) : (
            <form action={signInAction} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Username
                <input
                  required
                  name="username"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Your admin username"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Password
                <input
                  required
                  name="password"
                  type="password"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Your admin password"
                />
              </label>

              {hasError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  That username or password was not correct.
                </p>
              ) : null}

              <SubmitButton
                idleLabel="Sign in"
                pendingLabel="Signing in..."
                className="mt-2 rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              />
            </form>
          )}

          <div className="mt-6">
            <Link
              href="/"
              className="text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              Back to main site
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

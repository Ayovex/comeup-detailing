import Link from "next/link";
import { requireAdminAuth } from "@/lib/admin-auth";
import {
  buildCustomerKey,
  normalizeEmail,
  normalizePhone,
  readBookings,
  readCustomerProfiles,
  type BookingEntry,
  type CustomerProfile,
} from "@/lib/bookings";
import {
  saveCustomerNotesAction,
  updateBookingStatusAction,
} from "./actions";
import { signOutAction } from "./login/actions";
import { SubmitButton } from "./submit-button";

type CustomerSummary = {
  key: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  bookings: BookingEntry[];
  totalVisits: number;
  lastVisit: string;
  internalNotes: string;
  confirmedCount: number;
  cancelledCount: number;
};

type GroupNode = {
  key: string;
  booking: BookingEntry;
};

function getStatusValue(status?: string) {
  if (status === "completed") {
    return "confirmed";
  }

  if (status === "new") {
    return "pending";
  }

  return status ?? "pending";
}

function isConfirmedStatus(status?: string) {
  return status === "confirmed" || status === "completed";
}

function isUpcomingStatus(status?: string) {
  const value = getStatusValue(status);
  return value === "pending" || value === "confirmed";
}

function to24HourTime(slot: string) {
  const [time, period] = slot.split(" ");
  const [hourPart, minutePart] = time.split(":");
  let hour = Number(hourPart);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, "0")}:${minutePart}:00`;
}

function getBookingDateTimeValue(booking: BookingEntry) {
  return new Date(`${booking.date}T${to24HourTime(booking.slot)}`).getTime();
}

function groupBookingsIntoCustomers(
  bookings: BookingEntry[],
  profiles: CustomerProfile[],
) {
  const nodes: GroupNode[] = bookings.map((booking, index) => ({
    key: booking.id ?? `booking-${index}`,
    booking,
  }));

  const parent = new Map<string, string>();

  function find(key: string): string {
    const current = parent.get(key) ?? key;

    if (current === key) {
      return key;
    }

    const root = find(current);
    parent.set(key, root);
    return root;
  }

  function union(a: string, b: string) {
    const rootA = find(a);
    const rootB = find(b);

    if (rootA !== rootB) {
      parent.set(rootB, rootA);
    }
  }

  for (const node of nodes) {
    parent.set(node.key, node.key);
  }

  const phoneOwners = new Map<string, string>();
  const emailOwners = new Map<string, string>();

  for (const node of nodes) {
    const phone = normalizePhone(node.booking.phone);
    const email = normalizeEmail(node.booking.email);

    if (phone) {
      const existing = phoneOwners.get(phone);

      if (existing) {
        union(existing, node.key);
      } else {
        phoneOwners.set(phone, node.key);
      }
    }

    if (email) {
      const existing = emailOwners.get(email);

      if (existing) {
        union(existing, node.key);
      } else {
        emailOwners.set(email, node.key);
      }
    }
  }

  const grouped = new Map<string, CustomerSummary>();
  const profileMap = new Map(profiles.map((profile) => [profile.customerKey, profile]));

  for (const node of nodes) {
    const root = find(node.key);
    const booking = node.booking;
    const existing = grouped.get(root);

    if (existing) {
      existing.bookings.push(booking);
      existing.totalVisits += 1;
      existing.confirmedCount += isConfirmedStatus(booking.status) ? 1 : 0;
      existing.cancelledCount += booking.status === "cancelled" ? 1 : 0;

      if (`${booking.date} ${booking.slot}` > `${existing.lastVisit} 00:00 AM`) {
        existing.lastVisit = booking.date;
      }

      continue;
    }

    const customerKey = buildCustomerKey({
      phone: booking.phone,
      email: booking.email,
      name: booking.name,
    });

    grouped.set(root, {
      key: customerKey,
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      address: booking.address,
      bookings: [booking],
      totalVisits: 1,
      lastVisit: booking.date,
      internalNotes: profileMap.get(customerKey)?.internalNotes ?? "",
      confirmedCount: isConfirmedStatus(booking.status) ? 1 : 0,
      cancelledCount: booking.status === "cancelled" ? 1 : 0,
    });
  }

  return [...grouped.values()]
    .map((customer) => ({
      ...customer,
      bookings: customer.bookings.sort((a, b) =>
        `${b.date} ${b.slot}`.localeCompare(`${a.date} ${a.slot}`),
      ),
    }))
    .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatDateTime(booking: BookingEntry) {
  return `${formatDate(booking.date)} at ${booking.slot}`;
}

function filterCustomers(customers: CustomerSummary[], search: string) {
  if (!search.trim()) {
    return customers;
  }

  const normalized = search.trim().toLowerCase();

  return customers.filter((customer) =>
    [customer.name, customer.phone, customer.email, customer.address].some((value) =>
      value.toLowerCase().includes(normalized),
    ),
  );
}

function statusClasses(status?: string) {
  switch (status) {
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function depositClasses(status?: string) {
  switch (status) {
    case "yes":
      return "bg-emerald-100 text-emerald-700";
    case "no":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-orange-100 text-orange-700";
  }
}

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled"];
const DEPOSIT_OPTIONS = ["yes", "no"];
const CUSTOMERS_PER_PAGE = 25;

function getDepositValue(status?: string) {
  return status === "yes" ? "yes" : "no";
}

function buildAdminHref(input: {
  search?: string;
  customer?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (input.search?.trim()) {
    params.set("search", input.search.trim());
  }

  if (input.customer?.trim()) {
    params.set("customer", input.customer.trim());
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; customer?: string; page?: string }>;
}) {
  await requireAdminAuth();

  const [bookings, profiles, params] = await Promise.all([
    readBookings(),
    readCustomerProfiles(),
    searchParams,
  ]);

  const search = params?.search ?? "";
  const selectedCustomerKey = params?.customer ?? "";
  const requestedPage = Number(params?.page ?? "1");

  const customers = filterCustomers(groupBookingsIntoCustomers(bookings, profiles), search);
  const totalPages = Math.max(1, Math.ceil(customers.length / CUSTOMERS_PER_PAGE));
  const selectedCustomerIndex = customers.findIndex(
    (customer) => customer.key === selectedCustomerKey,
  );
  const selectedCustomerPage =
    selectedCustomerIndex >= 0
      ? Math.floor(selectedCustomerIndex / CUSTOMERS_PER_PAGE) + 1
      : undefined;
  const normalizedRequestedPage = Number.isFinite(requestedPage)
    ? Math.max(1, Math.min(totalPages, Math.floor(requestedPage)))
    : 1;
  const currentPage = selectedCustomerPage ?? normalizedRequestedPage;
  const pageStart = (currentPage - 1) * CUSTOMERS_PER_PAGE;
  const pagedCustomers = customers.slice(pageStart, pageStart + CUSTOMERS_PER_PAGE);
  const selectedCustomer =
    customers.find((customer) => customer.key === selectedCustomerKey) ??
    pagedCustomers[0] ??
    customers[0];
  const showingStart = customers.length === 0 ? 0 : pageStart + 1;
  const showingEnd = Math.min(pageStart + CUSTOMERS_PER_PAGE, customers.length);

  const totalCustomers = customers.length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (booking) => getStatusValue(booking.status) === "pending",
  ).length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthBookings = bookings.filter((booking) =>
    booking.date.startsWith(thisMonth),
  ).length;
  const now = new Date().getTime();
  const upcomingBookings = bookings
    .filter(
      (booking) =>
        isUpcomingStatus(booking.status) && getBookingDateTimeValue(booking) >= now,
    )
    .sort((a, b) => getBookingDateTimeValue(a) - getBookingDateTimeValue(b));
  const selectedCustomerUpcomingBookings = (selectedCustomer?.bookings ?? [])
    .filter(
      (booking) =>
        isUpcomingStatus(booking.status) && getBookingDateTimeValue(booking) >= now,
    )
    .sort((a, b) => getBookingDateTimeValue(a) - getBookingDateTimeValue(b));

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#081225_28%,#eef4fb_28%,#f8fbff_100%)]">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/78 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.4)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-orange-200">
                Admin dashboard
              </p>
              <h1 className="mt-3 font-display text-5xl uppercase tracking-[0.08em]">
                Customer history and booking records
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                Search customers, review all bookings, update appointment status,
                and keep internal notes in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/5"
              >
                Back to site
              </Link>
              <form action={signOutAction}>
                <SubmitButton
                  idleLabel="Log out"
                  pendingLabel="Logging out..."
                  className="rounded-full border border-orange-300/30 bg-orange-400/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-100 transition hover:bg-orange-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </form>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Total customers
              </p>
              <p className="mt-2 text-3xl font-semibold">{totalCustomers}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Total bookings
              </p>
              <p className="mt-2 text-3xl font-semibold">{totalBookings}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Pending requests
              </p>
              <p className="mt-2 text-3xl font-semibold">{pendingBookings}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                This month
              </p>
              <p className="mt-2 text-3xl font-semibold">{thisMonthBookings}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="grid gap-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white/96 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
                    Upcoming appointments
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Quick view of what is coming up
                  </h2>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {upcomingBookings.length} upcoming
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {upcomingBookings.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                    No pending or confirmed appointments are scheduled in the future yet.
                  </div>
                ) : (
                  upcomingBookings.map((booking) => (
                    <article
                      key={`upcoming-${booking.id ?? `${booking.date}-${booking.slot}-${booking.email}`}`}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{booking.name}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {booking.service} • {booking.vehicleType}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDateTime(booking)}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{booking.address}</p>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClasses(
                              getStatusValue(booking.status),
                            )}`}
                          >
                            {getStatusValue(booking.status)}
                          </span>
                          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Paid: {getDepositValue(booking.depositStatus)}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/96 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
                  Customers
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Search and select a customer
                </h2>
              </div>
            </div>

            <form className="mt-5">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Search by name, phone, email, or address
                <input
                  name="search"
                  defaultValue={search}
                  suppressHydrationWarning
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Type a customer name or number"
                />
              </label>
            </form>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
              <span>
                Showing {showingStart}-{showingEnd} of {customers.length}
              </span>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {customers.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                  No customers matched that search yet.
                </div>
              ) : (
                pagedCustomers.map((customer) => {
                  const isActive = customer.key === selectedCustomer?.key;

                  return (
                    <Link
                      key={customer.key}
                      href={buildAdminHref({
                        search,
                        customer: customer.key,
                        page: currentPage,
                      })}
                      scroll={false}
                      className={`rounded-[1.5rem] border p-4 transition ${
                        isActive
                          ? "border-blue-500 bg-blue-50 shadow-[0_10px_25px_rgba(37,99,235,0.08)]"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">
                            {customer.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {customer.phone}
                          </p>
                          <p className="text-sm text-slate-500">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Visits
                          </p>
                          <p className="text-2xl font-semibold text-slate-900">
                            {customer.totalVisits}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                        <span>Last visit</span>
                        <span>{formatDate(customer.lastVisit)}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {customers.length > CUSTOMERS_PER_PAGE ? (
              <div className="mt-6 flex items-center justify-between gap-3">
                <Link
                  href={buildAdminHref({
                    search,
                    page: Math.max(1, currentPage - 1),
                  })}
                  scroll={false}
                  aria-disabled={currentPage === 1}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    currentPage === 1
                      ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-700"
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={buildAdminHref({
                    search,
                    page: Math.min(totalPages, currentPage + 1),
                  })}
                  scroll={false}
                  aria-disabled={currentPage === totalPages}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    currentPage === totalPages
                      ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-700"
                  }`}
                >
                  Next
                </Link>
              </div>
            ) : null}
          </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/96 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            {!selectedCustomer ? (
              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm text-slate-500">
                Once customers start booking, you’ll be able to click into their
                profile here and review all their history.
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
                      Customer profile
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                      {selectedCustomer.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedCustomer.address}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      {selectedCustomer.phone}
                    </a>
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      {selectedCustomer.email}
                    </a>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-5">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Total visits
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {selectedCustomer.totalVisits}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Last appointment
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {formatDate(selectedCustomer.lastVisit)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Recent service
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {selectedCustomer.bookings[0]?.service ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Confirmed
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {selectedCustomer.confirmedCount}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Cancelled
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {selectedCustomer.cancelledCount}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
                        Upcoming appointments
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                        Future pending and confirmed bookings for this customer
                      </h3>
                    </div>
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {selectedCustomerUpcomingBookings.length} upcoming
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {selectedCustomerUpcomingBookings.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                        This customer has no pending or confirmed future appointments right now.
                      </div>
                    ) : (
                      selectedCustomerUpcomingBookings.map((booking) => (
                        <article
                          key={`customer-upcoming-${booking.id ?? `${booking.date}-${booking.slot}-${booking.email}`}`}
                          className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-lg font-semibold text-slate-900">
                                {booking.service}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {formatDateTime(booking)}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Vehicle: {booking.vehicleType}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClasses(
                                getStatusValue(booking.status),
                              )}`}
                            >
                              {getStatusValue(booking.status)}
                            </span>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                <form action={saveCustomerNotesAction} className="mt-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
                        Internal notes
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                        Private customer notes
                      </h3>
                    </div>
                    <SubmitButton
                      idleLabel="Save notes"
                      pendingLabel="Saving..."
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-blue-700"
                    />
                  </div>
                  <input type="hidden" name="search" value={search} />
                  <input type="hidden" name="customerKey" value={selectedCustomer.key} />
                  <input type="hidden" name="customer" value={selectedCustomer.key} />
                  <input type="hidden" name="page" value={String(currentPage)} />
                  <input type="hidden" name="name" value={selectedCustomer.name} />
                  <input type="hidden" name="phone" value={selectedCustomer.phone} />
                  <input type="hidden" name="email" value={selectedCustomer.email} />
                  <textarea
                    name="internalNotes"
                    defaultValue={selectedCustomer.internalNotes}
                    suppressHydrationWarning
                    className="mt-4 min-h-32 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-blue-500"
                    placeholder="Add private notes about the customer, vehicle preferences, deposit habits, or anything useful for future visits."
                  />
                </form>

                <div className="mt-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
                        Appointment history
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                        Every booking for this customer
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    {selectedCustomer.bookings.map((booking) => (
                      <article
                        key={booking.id ?? `${booking.date}-${booking.slot}-${booking.service}`}
                        className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-slate-900">
                              {booking.service}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {formatDateTime(booking)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Vehicle: {booking.vehicleType}
                            </p>
                          </div>

                          <form
                            action={updateBookingStatusAction}
                            className="grid gap-3 sm:grid-cols-2"
                          >
                            <input type="hidden" name="search" value={search} />
                            <input
                              type="hidden"
                              name="customer"
                              value={selectedCustomer.key}
                            />
                            <input type="hidden" name="page" value={String(currentPage)} />
                            <input type="hidden" name="id" value={booking.id ?? ""} />
                            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Status
                              <select
                                name="status"
                                defaultValue={getStatusValue(booking.status)}
                                suppressHydrationWarning
                                className={`rounded-full border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] outline-none ${statusClasses(
                                  getStatusValue(booking.status),
                                )}`}
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Paid
                              <select
                                name="depositStatus"
                                defaultValue={getDepositValue(booking.depositStatus)}
                                suppressHydrationWarning
                                className={`rounded-full border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] outline-none ${depositClasses(
                                  getDepositValue(booking.depositStatus),
                                )}`}
                              >
                                {DEPOSIT_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="sm:col-span-2 flex justify-end">
                              <SubmitButton
                                idleLabel="Update booking"
                                pendingLabel="Updating..."
                                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
                              />
                            </div>
                          </form>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div className="rounded-[1.2rem] bg-white p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                              Contact
                            </p>
                            <p className="mt-2 text-sm text-slate-700">
                              {booking.phone}
                            </p>
                            <p className="text-sm text-slate-700">{booking.email}</p>
                          </div>

                          <div className="rounded-[1.2rem] bg-white p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                              Address
                            </p>
                            <p className="mt-2 text-sm text-slate-700">
                              {booking.address}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-[1.2rem] bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Notes
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {booking.notes || "No notes were added for this appointment."}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

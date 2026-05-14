import Image from "next/image";
import { BookingWidget } from "./components/booking-widget";
import { readBookings } from "@/lib/bookings";

const logoSrc = "/comeup-logo.png";

const basicFeatures = [
  "Wipe & clean all surfaces",
  "Vacuum interior",
  "Clean windows & mirrors",
  "Clean floor mats & carpets",
  "Air freshener treatment",
  "Trunk included",
  "Professional hand wash",
  "Clean & wash wheel wells",
  "Detail rim faces & tires",
  "Tire dressing",
  "Clean door jams",
  "Clean exterior windows",
];

const vipExtras = [
  "Steam cleaning",
  "Leather conditioning",
  "Hot water extraction",
  "Exterior spray wax",
];

const services = [
  {
    title: "Basic Wash",
    description:
      "A complete inside-and-out maintenance detail for drivers who want a clean vehicle and a polished finish without moving into restorative work.",
    price: "Sedans & coupes: $125 | Trucks & SUVs: $150",
    interior: basicFeatures.slice(0, 6),
    exterior: basicFeatures.slice(6),
  },
  {
    title: "VIP Wash",
    description:
      "Everything in the Basic Wash plus deeper interior restoration and a stronger exterior finish for clients who want a more premium result.",
    price: "Sedans & coupes: $225 | Trucks & SUVs: $250",
    interior: [...basicFeatures.slice(0, 6), ...vipExtras.slice(0, 3)],
    exterior: [...basicFeatures.slice(6), vipExtras[3]],
  },
  {
    title: "Disaster Detail",
    description:
      "Built for super dirty vehicles that need serious recovery work. Best for heavy buildup, stains, trash, and major cleanups that need extra time and care.",
    price: "Get quote",
  },
];

const comparisonRows = [
  { label: "Wipe & clean all surfaces", basic: true, vip: true },
  { label: "Vacuum interior", basic: true, vip: true },
  { label: "Clean windows & mirrors", basic: true, vip: true },
  { label: "Clean floor mats & carpets", basic: true, vip: true },
  { label: "Air freshener treatment", basic: true, vip: true },
  { label: "Trunk included", basic: true, vip: true },
  { label: "Professional hand wash", basic: true, vip: true },
  { label: "Clean & wash wheel wells", basic: true, vip: true },
  { label: "Detail rim faces & tires", basic: true, vip: true },
  { label: "Tire dressing", basic: true, vip: true },
  { label: "Clean door jams", basic: true, vip: true },
  { label: "Clean exterior windows", basic: true, vip: true },
  { label: "Steam cleaning", basic: false, vip: true },
  { label: "Leather conditioning", basic: false, vip: true },
  { label: "Hot water extraction", basic: false, vip: true },
  { label: "Exterior spray wax", basic: false, vip: true },
];

const cities = [
  "Dallas",
  "Fort Worth",
  "Plano",
  "Frisco",
  "Arlington",
  "Irving",
  "Grand Prairie",
  "Richardson",
  "Garland",
  "McKinney",
  "Carrollton",
  "And nearby DFW cities",
];

const footerLinks = [
  { label: "Book Now", href: "#booking" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Location", href: "#service-area" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  {
    href: "https://www.tiktok.com/@comeupcardetailing?is_from_webapp=1&sender_device=pc",
    label: "TikTok",
    icon: "/tiktok-icon.svg",
  },
  {
    href: "https://www.instagram.com/comeupcardetailing?igsh=MWdsNnZ2bmlzaDgzZA%3D%3D&utm_source=qr",
    label: "Instagram",
    icon: "/instagram-icon.svg",
  },
  {
    href: "https://www.facebook.com/share/1CV34pNLJS/?mibextid=wwXIfr",
    label: "Facebook",
    icon: "/facebook-icon.svg",
  },
];

const dfwMapEmbedSrc =
  "https://www.google.com/maps?q=32.8998,-97.0403&z=9&output=embed";
const dfwMapLink = "https://www.google.com/maps?q=32.8998,-97.0403&z=9";

function PackageMark({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center justify-center text-emerald-600">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.5 10.5l3.5 3.5 7-8" />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center text-red-600">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 5l10 10" />
        <path d="M15 5L5 15" />
      </svg>
    </span>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ service?: string }>;
}) {
  const initialBookings = await readBookings();
  const resolvedSearchParams = await searchParams;
  const requestedService = resolvedSearchParams?.service;

  return (
    <main className="bg-[linear-gradient(180deg,#020617_0%,#071120_18%,#0a1c39_32%,#eef4fb_32%,#f8fbff_100%)] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_11%,rgba(251,146,60,0.26),transparent_12%),radial-gradient(circle_at_18%_17%,rgba(250,204,21,0.18),transparent_14%),radial-gradient(circle_at_73%_16%,rgba(37,99,235,0.2),transparent_17%),radial-gradient(circle_at_38%_36%,rgba(34,211,238,0.12),transparent_22%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(6,17,31,0.82))]" />
        <div className="absolute inset-x-0 top-20 h-72 bg-[linear-gradient(90deg,transparent,rgba(251,146,60,0.12),rgba(125,211,252,0.14),transparent)] blur-3xl" />
        <div className="absolute right-[-8rem] top-32 h-80 w-80 rounded-full border border-cyan-300/15 bg-cyan-400/10 blur-2xl pulse-ring" />
        <div className="absolute left-[-7rem] top-28 h-64 w-64 rounded-full border border-orange-300/15 bg-orange-400/10 blur-2xl pulse-ring" />

        <div className="mx-auto min-h-screen max-w-7xl px-6 pb-20 pt-6 sm:px-8 lg:px-10">
          <header className="sticky top-4 z-20 rounded-[2rem] border border-white/10 bg-slate-950/72 px-5 py-4 backdrop-blur panel-glow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <a href="#" className="flex items-center gap-4">
                <div className="relative h-22 w-22 overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                  <Image
                    src={logoSrc}
                    alt="Comeup Car Detailing logo"
                    fill
                    className="object-contain"
                    sizes="88px"
                    priority
                  />
                </div>
                <div>
                  <p className="font-display text-2xl uppercase tracking-[0.16em] text-white">
                    Comeup Car Detailing
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                    Mobile detailing across DFW
                  </p>
                </div>
              </a>

              <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                {footerLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-orange-200"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="ml-0 flex items-center gap-2 lg:ml-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="lift-card rounded-full border border-white/10 bg-white/5 p-2 hover:border-orange-300/40 hover:bg-white/10"
                    >
                      <Image src={social.icon} alt={social.label} width={28} height={28} />
                    </a>
                  ))}
                </div>
              </nav>
            </div>
          </header>

          <div className="relative z-10 grid gap-12 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pt-18">
            <div>
              <h1 className="max-w-4xl font-display text-5xl uppercase leading-[0.92] tracking-[0.08em] text-white sm:text-6xl lg:text-7xl">
                Premium shine, deep clean, and mobile convenience across DFW.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                Comeup Car Detailing brings interior cleaning, exterior shine, and
                full-service mobile detailing right to your driveway. We come to
                you across DFW so you can get a clean vehicle without leaving home,
                waiting in line, or changing your schedule.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#booking"
                  className="shine-sweep rounded-full bg-[linear-gradient(90deg,#f59e0b,#fb923c)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:brightness-110"
                >
                  Book now
                </a>
                <a
                  href="tel:4697932207"
                  className="rounded-full border border-white/15 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/5"
                >
                  Call 469-793-2207
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="lift-card inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:border-orange-300/40 hover:bg-white/10"
                  >
                    <Image src={social.icon} alt={social.label} width={24} height={24} />
                    <span className="text-sm text-white">{social.label}</span>
                  </a>
                ))}
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                <div className="lift-card rounded-[1.6rem] border border-orange-300/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-300">
                    Payment
                  </p>
                  <p className="mt-3 text-2xl font-semibold">Zelle accepted</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    A non-refundable deposit may be required to cut down on no-shows.
                  </p>
                </div>
                <div className="lift-card rounded-[1.6rem] border border-blue-300/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-300">
                    Coverage
                  </p>
                  <p className="mt-3 text-2xl font-semibold">All DFW</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Mobile service across the Dallas-Fort Worth metroplex.
                  </p>
                </div>
              </div>
            </div>

            <div className="float-slow relative">
              <div className="panel-glow relative overflow-hidden rounded-[2.6rem] border border-white/10 bg-[linear-gradient(155deg,rgba(2,6,23,0.96),rgba(10,24,44,0.88))] p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(251,146,60,0.18),transparent_16%),radial-gradient(circle_at_70%_15%,rgba(56,189,248,0.18),transparent_22%),radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.1),transparent_18%),linear-gradient(180deg,transparent,rgba(2,6,23,0.32))]" />
                <div className="absolute left-[-2rem] top-20 h-56 w-[120%] -rotate-6 rounded-[50%] border border-cyan-300/10 bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.08),rgba(251,146,60,0.08),transparent)]" />
                <div className="absolute right-10 top-12 h-4 w-32 rounded-full bg-orange-200/80 blur-sm" />
                <div className="absolute right-16 top-28 h-3 w-24 rounded-full bg-blue-300/70 blur-sm" />
                <div className="relative z-10 rounded-[2rem] border border-white/10 bg-black/20 p-4">
                  <div className="relative min-h-[30rem] overflow-hidden rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_72%_76%,rgba(37,99,235,0.18),transparent_18%),radial-gradient(circle_at_18%_18%,rgba(251,146,60,0.15),transparent_14%),linear-gradient(180deg,#06080d_0%,#090d14_45%,#030712_100%)]">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,4,9,0.82)_0%,rgba(1,4,9,0.58)_42%,rgba(1,4,9,0.18)_100%)]" />
                    <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
                    <div className="absolute right-[-4rem] top-8 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
                    <div className="absolute left-[-3rem] bottom-8 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.75))]" />

                    <div className="absolute right-[-6%] bottom-6 h-[58%] w-[88%] min-w-[28rem]">
                      <div className="absolute inset-0 rounded-[40%] bg-[radial-gradient(circle_at_55%_45%,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,rgba(12,20,33,0.78),rgba(4,7,12,0.96))]" />
                      <div className="absolute left-[10%] top-[26%] h-[16%] w-[58%] skew-x-[-18deg] rounded-[48%] border border-cyan-200/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.35))]" />
                      <div className="absolute left-[22%] top-[38%] h-[20%] w-[46%] skew-x-[-16deg] rounded-[50%] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(59,130,246,0.12),rgba(2,6,23,0.1))]" />
                      <div className="absolute left-[13%] top-[54%] h-[10%] w-[62%] rounded-[55%] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(10,20,34,0.4),rgba(2,6,23,0.92))]" />
                      <div className="absolute left-[6%] top-[56%] h-[9%] w-[16%] -skew-x-[26deg] rounded-[55%] bg-[linear-gradient(180deg,rgba(7,15,24,0.9),rgba(2,6,23,1))]" />
                      <div className="absolute right-[3%] top-[54%] h-[12%] w-[24%] skew-x-[-18deg] rounded-[42%] bg-[linear-gradient(180deg,rgba(7,15,24,0.9),rgba(2,6,23,1))]" />
                      <div className="absolute left-[18%] top-[58%] h-[2px] w-[42%] bg-cyan-300/30 blur-[1px]" />
                      <div className="absolute left-[14%] top-[59%] h-[7%] w-[10%] -skew-x-[24deg] rounded-[40%] bg-[linear-gradient(90deg,rgba(251,146,60,0.72),rgba(255,255,255,0.06))] blur-[1px]" />
                      <div className="absolute right-[13%] top-[58%] h-[8%] w-[12%] skew-x-[-18deg] rounded-[45%] bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(56,189,248,0.72))] blur-[1px]" />
                      <div className="absolute left-[20%] bottom-[2%] h-[18%] w-[18%] rounded-full border-4 border-slate-500/25 bg-[radial-gradient(circle_at_45%_45%,rgba(15,23,42,0.6),rgba(2,6,23,1))]" />
                      <div className="absolute right-[18%] bottom-[0%] h-[20%] w-[20%] rounded-full border-4 border-slate-500/25 bg-[radial-gradient(circle_at_45%_45%,rgba(15,23,42,0.6),rgba(2,6,23,1))]" />
                      <div className="absolute left-[21.7%] bottom-[7.6%] h-[3%] w-[3%] rounded-full bg-orange-400/80 blur-[1px]" />
                      <div className="absolute right-[24%] bottom-[8%] h-[3%] w-[3%] rounded-full bg-cyan-300/75 blur-[1px]" />
                    </div>

                    <div className="relative z-10 flex h-full max-w-[24rem] flex-col justify-between p-6 sm:p-8">
                      <div className="w-fit rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-100">
                        Mobile detailing across DFW
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-[1.4rem] border border-white/10 bg-white p-3 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                          <Image
                            src={logoSrc}
                            alt="Comeup Car Detailing logo"
                            width={460}
                            height={460}
                            className="h-auto w-full object-contain"
                          />
                        </div>
                        <div className="space-y-3 rounded-[1.2rem] border border-white/10 bg-black/22 p-4 backdrop-blur-sm">
                          <p className="font-display text-3xl uppercase tracking-[0.08em] text-white">
                            We come to you
                          </p>
                          <p className="text-sm leading-7 text-slate-200">
                            Easy driveway service, simple scheduling, and no waiting
                            around at a shop. Book your detail and let us handle the
                            rest at your home, apartment, or work.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                            Schedule
                          </p>
                          <p className="mt-2 text-lg font-semibold text-white">
                            10 AM, 2 PM, 6 PM
                          </p>
                        </div>
                        <div className="rounded-[1.3rem] border border-orange-400/20 bg-orange-500/10 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-orange-100">
                            Convenience
                          </p>
                          <p className="mt-2 text-lg font-semibold text-white">
                            We bring the detail to you
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-6 py-24 text-slate-900 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-700">
              Services
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-blue-100 drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)] sm:text-5xl">
              Compare your packages fast and book the right one
            </h2>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.title}
              className={`lift-card rounded-[2rem] border border-slate-200 bg-white/96 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] ${
                service.title === "Disaster Detail" ? "lg:col-span-2" : ""
              }`}
            >
              <div className="h-1 w-18 rounded-full bg-[linear-gradient(90deg,#2563eb,#38bdf8,#f59e0b)]" />
              <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {service.title}
                </h3>
                <a
                  href={`/?service=${encodeURIComponent(service.title)}#booking`}
                  className="w-fit rounded-full bg-[linear-gradient(90deg,#1d4ed8,#2563eb,#38bdf8)] px-5 py-3 text-base font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:brightness-110"
                >
                  {service.price}
                </a>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
                {service.description}
              </p>

              {service.interior && service.exterior ? (
                <div className="mt-5 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <p className="font-semibold uppercase tracking-[0.18em] text-blue-800">
                      Interior
                    </p>
                    <ul className="mt-3 space-y-2">
                      {service.interior.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <p className="font-semibold uppercase tracking-[0.18em] text-blue-800">
                      Exterior
                    </p>
                    <ul className="mt-3 space-y-2">
                      {service.exterior.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
              Compare packages
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              Basic Wash vs VIP Wash
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[linear-gradient(90deg,#020617,#0f172a,#1d4ed8)] text-white">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]">
                    Service item
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    Basic Wash
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    VIP Wash
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr
                    key={row.label}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PackageMark active={row.basic} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PackageMark active={row.vip} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="about" className="bg-slate-950 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div className="panel-glow rounded-[2.4rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-200">
              About
            </p>
            <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-white">
              Built for convenience, consistency, and clean results
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-300">
              Comeup Car Detailing provides mobile detailing across the DFW area
              for drivers who want professional results without leaving home. We
              handle interior cleaning, exterior washes, premium VIP details, and
              deeper recovery work for vehicles that need serious attention.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-300">
              Whether you need a maintenance wash, a more complete detail, or help
              bringing a heavily soiled vehicle back to life, our goal is to make
              the process simple, convenient, and worth booking again.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="lift-card rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Mobile service
              </p>
              <p className="mt-4 text-2xl font-semibold">We come to your home, apartment, or workplace</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Our mobile setup is built around convenience, so you can get your
                vehicle detailed without driving to a shop or rearranging your day.
              </p>
            </div>
            <div className="lift-card rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Payments
              </p>
              <p className="mt-4 text-2xl font-semibold">Simple payment through Zelle</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Payments are handled directly, and some appointments may require a
                non-refundable deposit to secure the time slot.
              </p>
            </div>
            <div className="lift-card rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Service quality
              </p>
              <p className="mt-4 text-2xl font-semibold">Interior, exterior, and deep-clean detailing</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                From regular maintenance washes to VIP details and heavy cleanup
                jobs, we focus on delivering clean results that stand out.
              </p>
            </div>
            <div className="lift-card rounded-[2rem] border border-orange-400/20 bg-orange-400/10 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-orange-100">
                Easy contact
              </p>
              <p className="mt-4 text-2xl font-semibold">Reach out fast by call, email, or social</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                If you have questions before booking, it is easy to contact us and
                get a quick response about services, pricing, or availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="service-area" className="mx-auto max-w-7xl px-6 py-24 text-slate-900 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-700">
              Location
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-slate-900 sm:text-5xl">
              Serving the full Dallas-Fort Worth area
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-600">
              This is the area we currently cover for mobile detailing. We come to
              customers across the DFW metroplex for scheduled appointments.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {cities.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-orange-400/35 bg-cyan-400/10 pulse-ring" />
            </div>
            <iframe
              title="Dallas Fort Worth service area map"
              src={dfwMapEmbedSrc}
              className="relative h-[420px] w-full rounded-[1.8rem] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section id="booking" className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-200">
              Booking
            </p>
              <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-white sm:text-5xl">
              A clean booking flow built around your schedule
            </h2>
          </div>
        </div>

          <BookingWidget
            initialBookings={initialBookings}
            initialService={requestedService}
          />
        </div>
      </section>

      <footer id="contact" className="bg-[#020617] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
          <div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white p-2">
                <Image src={logoSrc} alt="Comeup Car Detailing logo" width={150} height={150} />
              </div>
              <div>
                <p className="font-display text-3xl uppercase tracking-[0.12em] text-white">
                  Comeup Car Detailing
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Mobile detailing in DFW with a booking-first experience.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="tel:4697932207"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
              >
                469-793-2207
              </a>
              <a
                href="mailto:comeup.detailing@gmail.com"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
              >
                comeup.detailing@gmail.com
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-200">
              Quick links
            </p>
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              {footerLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-orange-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-200">
              Contact
            </p>
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              <a href="tel:4697932207" className="transition hover:text-orange-200">
                Call: 469-793-2207
              </a>
              <a
                href="mailto:comeup.detailing@gmail.com"
                className="transition hover:text-orange-200"
              >
                Email: comeup.detailing@gmail.com
              </a>
              <a
                href={dfwMapLink}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-orange-200"
              >
                Location: Dallas-Fort Worth, TX
              </a>
              <div className="mt-3 flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="lift-card rounded-full border border-white/10 bg-white/5 p-2 hover:border-orange-300/40 hover:bg-white/10"
                  >
                    <Image src={social.icon} alt={social.label} width={28} height={28} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

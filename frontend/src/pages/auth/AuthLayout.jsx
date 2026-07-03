import { Boxes, ShieldCheck, TrendingUp, Zap } from "lucide-react";

const highlights = [
  { icon: Boxes, text: "Track every SKU across warehouses in real time" },
  { icon: TrendingUp, text: "Spot trends with built-in analytics & charts" },
  { icon: ShieldCheck, text: "Low-stock alerts before you run out" },
  { icon: Zap, text: "Export reports to Excel in one click" },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Left brand panel - hidden on small screens */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800">
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">StockPilot</span>
          </div>

          <div className="space-y-8 max-w-md">
            <h1 className="font-display text-4xl font-bold leading-tight">
              Inventory management,
              <br /> finally under control.
            </h1>
            <p className="text-brand-100/90 text-base leading-relaxed">
              One dashboard for stock levels, transactions, and analytics -
              built for teams that move fast.
            </p>
            <ul className="space-y-4 pt-2">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-brand-50/95 leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-brand-100/70">
            (c) {new Date().getFullYear()} StockPilot. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[420px] animate-fade-in">
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">
              StockPilot
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

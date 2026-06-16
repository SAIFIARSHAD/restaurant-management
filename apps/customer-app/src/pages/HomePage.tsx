import { ArrowRight, QrCode, ScanLine, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-700">
              ZaikaFlow Customer App
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Premium QR ordering for dine-in restaurant guests
              </h1>

              <p className="text-base leading-8 text-slate-600 sm:text-lg">
                This customer-facing app powers restaurant discovery, table QR
                ordering, menu browsing, cart creation, and real-time order
                tracking in a clean mobile-first experience.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/r/arshads-kitchen/69a1763fd291b2a8a8f1a9f6"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Open Demo QR Route
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
                <QrCode className="h-4 w-4 text-orange-600" />
                Built for restaurant table ordering
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-4">
              <div className="rounded-3xl bg-slate-900 p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <ScanLine className="h-5 w-5 text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Step 1</p>
                    <p className="text-lg font-semibold">Scan table QR</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <UtensilsCrossed className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Step 2</p>
                    <p className="text-lg font-semibold text-slate-900">
                      Browse menu and place order
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Step 3</p>
                    <p className="text-lg font-semibold text-slate-900">
                      Track live order status
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
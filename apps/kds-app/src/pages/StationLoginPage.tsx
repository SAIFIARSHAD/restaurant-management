import { useMemo, useState } from 'react';
import { ChefHat, MonitorSmartphone, ArrowRight, UtensilsCrossed, GlassWater, Flame, IceCream, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type StationType = 'kitchen' | 'grill' | 'drinks' | 'dessert' | 'other';

interface StationOption {
  value: StationType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const stationOptions: StationOption[] = [
  {
    value: 'kitchen',
    label: 'Kitchen',
    description: 'Main course and regular kitchen items',
    icon: <UtensilsCrossed className="h-5 w-5" />,
  },
  {
    value: 'grill',
    label: 'Grill / Tandoor',
    description: 'Tandoor, grill, and roasted items',
    icon: <Flame className="h-5 w-5" />,
  },
  {
    value: 'drinks',
    label: 'Drinks',
    description: 'Tea, coffee, shakes, and beverages',
    icon: <GlassWater className="h-5 w-5" />,
  },
  {
    value: 'dessert',
    label: 'Dessert',
    description: 'Sweets, ice cream, and dessert orders',
    icon: <IceCream className="h-5 w-5" />,
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Fallback station for special items',
    icon: <Package className="h-5 w-5" />,
  },
];

export default function StationLoginPage() {
  const navigate = useNavigate();

  const [restaurantId, setRestaurantId] = useState('');
  const [station, setStation] = useState<StationType>('kitchen');
  const [screenName, setScreenName] = useState('');

  const isValid = useMemo(() => {
    return restaurantId.trim().length > 0 && station.trim().length > 0;
  }, [restaurantId, station]);

  const handleContinue = () => {
    if (!isValid) return;

    const params = new URLSearchParams({
      restaurantId: restaurantId.trim(),
      station,
      screenName: screenName.trim(),
    });

    navigate(`/kds?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        {/* Left panel */}
        <section className="flex flex-1 items-center border-b border-zinc-800 px-6 py-10 lg:border-b-0 lg:border-r lg:px-12">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
              <ChefHat className="h-3.5 w-3.5" />
              ZaikaFlow KDS
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Kitchen Display System
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-400">
              Run a dedicated station screen for your kitchen team. Select the restaurant,
              choose the working station, and start receiving live orders in real time.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {stationOptions.map((option) => (
                <div
                  key={option.value}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-orange-400">
                    {option.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{option.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right panel */}
        <section className="flex w-full items-center justify-center px-6 py-10 lg:max-w-xl lg:px-10">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/30">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                <MonitorSmartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Connect Screen</h2>
                <p className="text-xs text-zinc-500">Set this device as a station display</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Restaurant ID
                </label>
                <input
                  type="text"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  placeholder="Enter restaurant id"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Station
                </label>
                <select
                  value={station}
                  onChange={(e) => setStation(e.target.value as StationType)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                >
                  {stationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Screen Name
                </label>
                <input
                  type="text"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  placeholder="Optional, e.g. Kitchen TV 1"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!isValid}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to KDS
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs leading-5 text-zinc-500">
                This screen will receive only the orders for the selected station. Use separate
                screens for drinks, grill, dessert, and kitchen if your restaurant works
                station-wise.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
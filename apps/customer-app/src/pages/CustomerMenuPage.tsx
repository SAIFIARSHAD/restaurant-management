import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Info,
  Leaf,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getPublicMenu,
  getPublicRestaurantInfo,
  placePublicOrder,
  validatePublicTable,
} from '../services/customerService';
import type {
  PublicMenuCategory,
  PublicMenuItem,
  PublicPlacedOrder,
  PublicRestaurantInfo,
  PublicTableInfo,
} from '../types/customer';

interface CartItem {
  item: PublicMenuItem;
  quantity: number;
}

type VegFilter = 'all' | 'veg' | 'nonveg';

export default function CustomerMenuPage() {
  const { slug = '', tableId = '' } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurant, setRestaurant] = useState<PublicRestaurantInfo | null>(null);
  const [table, setTable] = useState<PublicTableInfo | null>(null);
  const [categories, setCategories] = useState<PublicMenuCategory[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<PublicPlacedOrder | null>(null);
  const [trackOrderInput, setTrackOrderInput] = useState('');
  const [trackOrderError, setTrackOrderError] = useState('');
  const [isBillExpanded, setIsBillExpanded] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<VegFilter>('all');
  const [activeCategory, setActiveCategory] = useState('');
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCustomerPage() {
      if (!slug || !tableId) {
        setError('Restaurant slug or table ID is missing.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const [restaurantResponse, tableResponse, menuResponse] = await Promise.all([
          getPublicRestaurantInfo(slug),
          validatePublicTable(slug, tableId),
          getPublicMenu(slug),
        ]);

        if (!isMounted) return;

        setRestaurant(restaurantResponse.data);
        setTable(tableResponse.data.table);

        const cats = menuResponse.data.categories || [];
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load customer ordering page.';
        setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCustomerPage();

    return () => {
      isMounted = false;
    };
  }, [slug, tableId]);

  useEffect(() => {
    const scrollEl = mainScrollRef.current;
    if (!scrollEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { root: scrollEl, rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    Object.values(categoryRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const el = categoryRefs.current[categoryId];
    if (el && mainScrollRef.current) {
      const containerTop = mainScrollRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      mainScrollRef.current.scrollTop += elTop - containerTop - 20;
    }
  };

  const filteredCategories = useMemo(() => {
    return categories
      .map((category) => {
        const filteredItems = category.items.filter((item) => {
          const matchesSearch =
            !searchQuery ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());

          const matchesVeg =
            vegFilter === 'all' ||
            (vegFilter === 'veg' && item.isVeg === true) ||
            (vegFilter === 'nonveg' && item.isVeg === false);

          return matchesSearch && matchesVeg;
        });

        return { ...category, items: filteredItems };
      })
      .filter((category) => category.items.length > 0);
  }, [categories, searchQuery, vegFilter]);

  const addToCart = (item: PublicMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const decreaseQuantity = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((c) => c.item.id !== itemId);
      return prev.map((c) =>
        c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const getItemQuantity = (itemId: string) =>
    cart.find((c) => c.item.id === itemId)?.quantity ?? 0;

  const cartTotalQty = useMemo(
    () => cart.reduce((sum, c) => sum + c.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, c) => sum + (c.item.discountedPrice ?? c.item.price) * c.quantity,
        0
      ),
    [cart]
  );

  const taxRate = restaurant?.taxRate ?? 0;
  const serviceCharge = restaurant?.serviceCharge ?? 0;
  const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  const serviceAmount = parseFloat(((subtotal * serviceCharge) / 100).toFixed(2));
  const grandTotal = parseFloat((subtotal + taxAmount + serviceAmount).toFixed(2));
  const currency = restaurant?.currency || 'INR';

  const normalizedPhone = customerPhone.replace(/\D/g, '');
  const isCustomerFormValid =
    customerName.trim().length >= 2 && normalizedPhone.length >= 10;

  const handlePlaceOrder = async () => {
    if (!slug || !table?.id) {
      setPlaceOrderError('Restaurant or table information is missing.');
      return;
    }
    if (cart.length === 0) {
      setPlaceOrderError('Please add at least one item to place an order.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setPlaceOrderError('Customer name and phone number are required.');
      return;
    }
    if (normalizedPhone.length < 10) {
      setPlaceOrderError('Please enter a valid phone number.');
      return;
    }
    if (!termsAccepted) {
      setPlaceOrderError('Please accept the Terms and Conditions.');
      return;
    }

    try {
      setIsPlacingOrder(true);
      setPlaceOrderError('');

      const payload = {
        tableId: table.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        notes: orderNotes.trim(),
        items: cart.map((cartItem) => ({
          menuItemId: cartItem.item.id,
          quantity: cartItem.quantity,
        })),
      };

      const response = await placePublicOrder(slug, payload);
      setPlacedOrder(response.order);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      setTermsAccepted(false);
      setIsCartOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setPlaceOrderError(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleTrackOrder = () => {
    const normalizedOrderToken = trackOrderInput.trim().toUpperCase();
    if (!normalizedOrderToken) {
      setTrackOrderError('Please enter your order number.');
      return;
    }
    setTrackOrderError('');
    navigate(`/r/${slug}/${tableId}/order-status/${normalizedOrderToken}`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <div className="border-b border-gray-100 px-4 py-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="h-8 w-24 rounded-full bg-gray-200" />
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-16 sm:w-20 border-r border-gray-100 flex flex-col gap-3 p-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-gray-200" />
            ))}
          </div>
          <div className="flex-1 p-4 animate-pulse space-y-4">
            <div className="h-10 rounded-xl bg-gray-200" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 rounded-xl bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Unable to load menu</h1>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        <header className="shrink-0 bg-white border-b border-gray-200 px-3 py-2.5 flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate leading-tight">
                {restaurant?.name || 'Restaurant'}
              </h1>
              <p className="text-[10px] text-gray-400 leading-tight flex items-center gap-1">
                Table {table?.tableNumber || '—'}
                {table?.floor ? ` · ${table.floor}` : ''}
                <Info className="h-2.5 w-2.5" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
              <span>Serve At</span>
              <span className="font-semibold">Table {table?.tableNumber || '—'}</span>
              <svg
                className="h-3 w-3 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>

        {placedOrder && (
          <div className="shrink-0 border-b border-emerald-100 bg-emerald-50 px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-xs font-semibold text-emerald-900">
                Order {placedOrder.orderNumber} placed! · {currency} {placedOrder.totalAmount.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() =>
                navigate(`/r/${slug}/${tableId}/order-status/${placedOrder.orderNumber}`)
              }
              className="rounded-lg bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white"
            >
              Track →
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <aside
            className="w-[72px] sm:w-20 shrink-0 border-r border-gray-100 bg-white overflow-y-auto flex flex-col gap-0.5 py-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 text-center transition-all ${
                  activeCategory === cat.id
                    ? 'bg-green-50 border-l-[3px] border-l-green-600'
                    : 'border-l-[3px] border-l-transparent hover:bg-gray-50'
                }`}
              >
                <div
                  className={`h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center ${
                    activeCategory === cat.id ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <span
                  className={`text-[9px] font-semibold leading-tight line-clamp-2 w-full text-center ${
                    activeCategory === cat.id ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </aside>

          <div
            ref={mainScrollRef}
            className="flex-1 overflow-y-auto bg-gray-50"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-3 py-2 space-y-2">
              <div className="mx-auto w-full max-w-6xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Items"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-xs text-gray-700 outline-none focus:border-green-500 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setVegFilter('all')}
                    className={`rounded-md border px-3 py-1 text-[11px] font-semibold transition ${
                      vegFilter === 'all'
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>

                  <button
                    onClick={() => setVegFilter('veg')}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1 text-[11px] font-semibold transition ${
                      vegFilter === 'veg'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border-2 border-green-600 bg-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    </span>
                    Veg
                  </button>

                  <button
                    onClick={() => setVegFilter('nonveg')}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1 text-[11px] font-semibold transition ${
                      vegFilter === 'nonveg'
                        ? 'border-rose-600 bg-rose-50 text-rose-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border-2 border-rose-600 bg-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                    </span>
                    Non-Veg
                  </button>

                  <div className="ml-auto flex items-center gap-1">
                    <input
                      type="text"
                      value={trackOrderInput}
                      onChange={(e) => {
                        setTrackOrderInput(e.target.value);
                        setTrackOrderError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTrackOrder();
                        }
                      }}
                      placeholder="Track order..."
                      className="w-28 rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-600 outline-none focus:border-green-500"
                    />
                    <button
                      onClick={handleTrackOrder}
                      className="rounded-md bg-gray-800 px-2 py-1 text-[11px] font-semibold text-white"
                    >
                      Go
                    </button>
                  </div>
                </div>

                {trackOrderError && (
                  <p className="mt-1 text-[10px] text-red-500">{trackOrderError}</p>
                )}
              </div>
            </div>

            <div className="mx-auto w-full max-w-6xl px-3 py-3 pb-28 space-y-6">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    id={category.id}
                    ref={(el) => {
                      categoryRefs.current[category.id] = el;
                    }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900">{category.name}</h2>
                      <div className="flex-1 border-t border-gray-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {category.items.map((item) => {
                        const qty = getItemQuantity(item.id);
                        const isUnavailable = item.isAvailable === false;

                        return (
                          <article
                            key={item.id}
                            className={`group overflow-hidden rounded-2xl border bg-white transition ${
                              isUnavailable
                                ? 'border-gray-100 opacity-60'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-gray-300">
                                  <UtensilsCrossed className="h-8 w-8" />
                                </div>
                              )}

                              <span
                                className={`absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-sm border-2 bg-white ${
                                  item.isVeg ? 'border-green-600' : 'border-rose-600'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    item.isVeg ? 'bg-green-600' : 'bg-rose-600'
                                  }`}
                                />
                              </span>

                              {item.description && (
                                <span className="absolute bottom-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/45 text-white">
                                  <Info className="h-3 w-3" />
                                </span>
                              )}

                              {!isUnavailable && (
                                <div className="absolute inset-x-0 bottom-2 flex justify-center px-3">
                                  {qty === 0 ? (
                                    <button
                                      onClick={() => addToCart(item)}
                                      className="min-w-[84px] rounded-full border-2 border-green-600 bg-white px-4 py-1 text-xs font-bold text-green-700 shadow-sm transition hover:bg-green-50"
                                    >
                                      Add
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-1 rounded-full border-2 border-green-600 bg-white px-2 py-1 shadow-sm">
                                      <button
                                        onClick={() => decreaseQuantity(item.id)}
                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="w-5 text-center text-xs font-bold text-green-700">
                                        {qty}
                                      </span>
                                      <button
                                        onClick={() => addToCart(item)}
                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="p-3">
                              <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-gray-900">
                                {item.name}
                              </p>

                              <div className="mt-2 flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-bold text-gray-900">
                                    ₹{item.discountedPrice ?? item.price}
                                  </p>
                                  {item.discountedPrice != null &&
                                    item.discountedPrice < item.price && (
                                      <p className="text-[11px] text-gray-400 line-through">
                                        ₹{item.price}
                                      </p>
                                    )}
                                </div>

                                {item.preparationTime && (
                                  <span className="mt-0.5 flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-500">
                                    <Clock3 className="h-3 w-3" />
                                    {item.preparationTime}m
                                  </span>
                                )}
                              </div>

                              {item.tags && item.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {item.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600"
                                    >
                                      <Leaf className="h-2.5 w-2.5" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {isUnavailable && (
                                <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500">
                                  Unavailable
                                </span>
                              )}

                              <p className="mt-2 text-[10px] italic text-orange-500">
                                Indicative image only*
                              </p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="mt-4 rounded-xl border border-gray-100 bg-white p-8 text-center">
                  <UtensilsCrossed className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <h3 className="text-sm font-semibold text-gray-900">No items found</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Try changing your search or filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setVegFilter('all');
                    }}
                    className="mt-3 rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
          <button
            onClick={() => {
              setPlaceOrderError('');
              setIsCartOpen(true);
            }}
            className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-xl bg-green-600 px-4 py-3 shadow-xl"
          >
            <span className="text-sm font-bold text-white">
              {cartTotalQty} {cartTotalQty === 1 ? 'Item' : 'Items'} | ₹{grandTotal.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-white">Pay Now</span>
          </button>
          <p className="mt-1 text-center text-[10px] font-semibold text-red-500">
            Your food will be served on the table
          </p>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
          <div className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
              <h2 className="text-base font-bold text-gray-900">
                {restaurant?.name || 'Restaurant'}
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="divide-y divide-gray-50 px-4">
              {cart.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border-2 bg-white ${
                          item.isVeg ? 'border-green-600' : 'border-rose-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.isVeg ? 'bg-green-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>
                      <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">Base Price ₹{item.price}</p>
                  </div>

                  <div className="text-sm font-bold text-gray-800">
                    ₹{((item.discountedPrice ?? item.price) * quantity).toFixed(2)}
                  </div>

                  <div className="flex items-center gap-1 rounded-full border-2 border-green-600 px-1.5 py-0.5">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-xs font-bold text-green-700">
                      {quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-1 text-gray-300 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-4 pt-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-700">Instructions</span>
              </div>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Please Enter Instructions..."
                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-50"
              />
            </div>

            <div className="px-4 pt-2">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-green-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Table Number<span className="text-red-500">*</span>
                </span>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700">
                {table?.tableNumber || '—'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 px-4 pt-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50"
                />
              </div>
            </div>

            <div className="mx-4 mt-4 overflow-hidden rounded-xl border border-gray-200">
              <button
                onClick={() => setIsBillExpanded(!isBillExpanded)}
                className="flex w-full items-center justify-between bg-white px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-800">Bill Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">₹{grandTotal.toFixed(2)}</span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isBillExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isBillExpanded && (
                <div className="space-y-2 border-t border-gray-100 bg-gray-50 px-4 pb-3">
                  <div className="flex justify-between pt-2 text-sm text-gray-600">
                    <span>Item Total</span>
                    <span>{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Food Cost with GST</span>
                    <span>{(subtotal + taxAmount).toFixed(2)}</span>
                  </div>

                  <div className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-3">
                    <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-500">
                      <span>GST & Other Charges</span>
                      <Info className="h-3 w-3 text-gray-400" />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax</span>
                      <span>{taxAmount.toFixed(2)}</span>
                    </div>
                    {serviceCharge > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span>Convenience Fee</span>
                          <Info className="h-3 w-3 text-gray-400" />
                        </div>
                        <span>{serviceAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between border-t border-gray-200 pt-1 text-sm font-bold text-gray-900">
                    <span>To Pay</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pt-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-xs text-gray-600">
                  Please accept{' '}
                  <span className="cursor-pointer text-green-600 underline">
                    Terms and Conditions
                  </span>
                  *
                </span>
              </label>
            </div>

            {placeOrderError && (
              <div className="mx-4 mt-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
                {placeOrderError}
              </div>
            )}

            <div className="p-4">
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !isCustomerFormValid || !termsAccepted}
                className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlacingOrder
                  ? 'Placing order...'
                  : !isCustomerFormValid
                    ? 'Enter name & phone to continue'
                    : !termsAccepted
                      ? 'Accept Terms to continue'
                      : `${cartTotalQty} ${cartTotalQty === 1 ? 'Item' : 'Items'} | ₹${grandTotal.toFixed(
                          2
                        )}   Pay Now`}
              </button>
              <p className="mt-2 text-center text-[10px] font-semibold text-red-500">
                Your food will be served on the table
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
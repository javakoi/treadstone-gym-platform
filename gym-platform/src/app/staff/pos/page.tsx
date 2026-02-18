"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  product_type: string;
  price_cents: number;
  visits_included?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "other">("card");
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("staff_auth")) {
      window.location.href = "/staff";
      return;
    }
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || []));
  }, []);

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) removeFromCart(productId);
    else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + i.product.price_cents * i.quantity, 0);
  const tax = Math.round(subtotal * 0.08); // 8% example
  const total = subtotal + tax;

  const completeSale = async () => {
    if (cart.length === 0) {
      setMessage("Cart is empty");
      setStatus("error");
      return;
    }
    setStatus("processing");
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomer?.id || null,
          items: cart.map((i) => ({
            product_id: i.product.id,
            product_name: i.product.name,
            quantity: i.quantity,
            unit_price_cents: i.product.price_cents,
            total_cents: i.product.price_cents * i.quantity,
          })),
          total_cents: total,
          tax_cents: tax,
          payment_method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sale failed");
      setMessage("Sale complete!");
      setStatus("success");
      setCart([]);
      setSelectedCustomer(null);
    } catch (err: any) {
      setMessage(err.message || "Sale failed");
      setStatus("error");
    }
  };

  const dayPassProducts = products.filter((p) => p.product_type === "day_pass");
  const punchCards = products.filter((p) => p.product_type === "punch_card");
  const otherProducts = products.filter(
    (p) => !["day_pass", "punch_card"].includes(p.product_type)
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/staff" className="text-treadstone-400 hover:text-treadstone-300">
            ← Staff Portal
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-treadstone-400 mb-6">
          Point of Sale
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-stone-400 mb-2">Day Passes</h2>
              <div className="flex flex-wrap gap-2">
                {dayPassProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="px-4 py-2 rounded-lg bg-stone-800 border border-stone-600 hover:border-treadstone-500"
                  >
                    {p.name} — {formatCurrency(p.price_cents)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-stone-400 mb-2">Punch Cards</h2>
              <div className="flex flex-wrap gap-2">
                {punchCards.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="px-4 py-2 rounded-lg bg-stone-800 border border-stone-600 hover:border-treadstone-500"
                  >
                    {p.name} — {formatCurrency(p.price_cents)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-stone-400 mb-2">Retail & Rentals</h2>
              <div className="flex flex-wrap gap-2">
                {otherProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="px-4 py-2 rounded-lg bg-stone-800 border border-stone-600 hover:border-treadstone-500"
                  >
                    {p.name} — {formatCurrency(p.price_cents)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="rounded-xl bg-stone-800/50 border border-stone-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Cart</h2>

            <div className="mb-4">
              <label className="block text-sm text-stone-400 mb-1">Customer (optional)</label>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search to link sale"
                className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-600 text-sm"
              />
              {selectedCustomer && (
                <p className="text-sm text-treadstone-400 mt-1">
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </p>
              )}
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-stone-500 text-sm">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center py-2 border-b border-stone-700"
                  >
                    <div>
                      <span className="font-medium">{item.product.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-stone-500 text-sm ml-2">×{item.quantity}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-stone-700 hover:bg-stone-600"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-stone-700 hover:bg-stone-600"
                      >
                        +
                      </button>
                      <span className="w-16 text-right">
                        {formatCurrency(item.product.price_cents * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-1 text-sm mb-4">
              <p className="flex justify-between">
                <span className="text-stone-500">Subtotal</span>
                {formatCurrency(subtotal)}
              </p>
              <p className="flex justify-between">
                <span className="text-stone-500">Tax</span>
                {formatCurrency(tax)}
              </p>
              <p className="flex justify-between font-semibold text-lg pt-2">
                <span>Total</span>
                {formatCurrency(total)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-stone-400 mb-2">Payment</label>
              <div className="flex gap-2">
                {(["card", "cash", "other"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`px-3 py-2 rounded-lg text-sm capitalize ${
                      paymentMethod === m
                        ? "bg-treadstone-600 text-white"
                        : "bg-stone-700 hover:bg-stone-600"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={completeSale}
              disabled={cart.length === 0 || status === "processing"}
              className="w-full py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 disabled:opacity-50 font-semibold"
            >
              {status === "processing" ? "Processing..." : "Complete Sale"}
            </button>

            {message && (
              <p
                className={`mt-4 text-sm ${
                  status === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

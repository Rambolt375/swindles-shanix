"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import SkeletonBlock from "../../components/SkeletonBlock";

export default function WishlistIndex() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [safeThreshold, setSafeThreshold] = useState(1500000);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleForm, setToggleForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push("/");
      }
    });
  }, [router]);

  const showForm = () => {
    setToggleForm(!toggleForm);
    if (!toggleForm) {
      setCategory("");
      setName("");
      setPrice("");
    }
  };

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", user.id)
          .single();
        if (data) setCurrentBalance(data.balance);
      };
      fetchBalance();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchWishlistItems = async () => {
        const { data, error } = await supabase
          .from("wishlist")
          .select("*")
          .eq("user_id", user.id)
          .order("status", { ascending: true })
          .order("created_at", { ascending: false });
        setWishlistItems(data ?? []);
        if (error) {
          console.error("Error fetching wishlist items:", error);
        }
        setLoading(false);
      };
      fetchWishlistItems();
    }
  }, [user]);

  const handlePurchase = async () => {
    if (!selectedItem || isPurchasing) return;
    setIsPurchasing(true);

    const price = Number(selectedItem.price);

    const { data: transaction, error: insertError } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: user.id,
          type: selectedItem.name,
          category: selectedItem.category,
          amount: -price,
        },
      ])
      .select()
      .single();

    if (insertError) {
      setIsPurchasing(false);
      return alert("Failed to log transaction");
    }

    const { error: updateError } = await supabase
      .from("wishlist")
      .update({ status: "purchased" })
      .eq("id", selectedItem.id)
      .eq("user_id", user.id)
      .eq("status", "dreaming");

    if (updateError) {
      await supabase.from("transactions").delete().eq("id", transaction.id);
      setIsPurchasing(false);
      return alert("Failed to update wishlist. Transaction rolled back.");
    }

    // C. Deduct the money from the Profiles table!
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();
    const newBalance = (profile?.balance || 0) - price;
    await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    setWishlistItems((prev) =>
      sortWishlistItems(
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, status: "purchased" } : item,
        ),
      ),
    );
    setCurrentBalance(newBalance);
    setIsPurchasing(false);
    setSelectedItem(null);
  };

  const openItemPopup = (item) => {
    if (item.status !== "purchased") {
      setSelectedItem(item);
    }
  };

  const sortWishlistItems = (items) =>
    [...items].sort((a, b) => {
      const statusA = (a.status || "").toString();
      const statusB = (b.status || "").toString();
      if (statusA !== statusB) return statusA.localeCompare(statusB);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !name ||
      !category ||
      !price ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    )
      return alert("Please fill in all fields.");
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("wishlist")
      .insert([
        {
          user_id: user.id,
          name: name,
          category: category,
          price: Number(price),
        },
      ])
      .select()
      .single();
    setIsSubmitting(false);
    if (error || !data) {
      console.error("Error adding wishlist item:", error);
      alert("Failed to add wishlist item. Please try again.");
    } else {
      const newItem = {
        ...data,
        status: data.status ?? "dreaming",
      };

      setName("");
      setPrice("");
      setCategory("");
      setToggleForm(false);
      setWishlistItems((prev) => sortWishlistItems([newItem, ...prev]));
    }
  };

  const projectedBalance = selectedItem
    ? currentBalance - selectedItem.price
    : 0;
  const projectedSafe = selectedItem
    ? projectedBalance >= safeThreshold
    : false;
  const projectedDeficit = selectedItem
    ? Math.max(0, safeThreshold - projectedBalance)
    : 0;

  return (
    <main className="min-h-screen bg-slate-200 flex justify-center">
      <div className="w-full max-w-md bg-blue-50 min-h-screen shadow-xl flex flex-col relative text-slate-900">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2 mb-4">
            <h3 className="text-xl font-bold">Wishlist</h3>
            <button
              className="text-xs bg-blue-600 hover:bg-blue-500 transition-colors px-3 py-1.5 rounded text-white font-bold"
              onClick={showForm}
            >
              {`${toggleForm ? "Cancel" : "Add Item"}`}
            </button>
          </div>

          {loading ? (
            <div className="space-y-6">
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-48" />
              <SkeletonBlock className="h-48" />
            </div>
          ) : (
            <>
              <div className="bg-slate-900 text-white p-5 rounded-xl mb-6 shadow-md border border-slate-800">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                      Safe Threshold
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {`Minimum balance to maintain`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 focus-within:border-blue-500 transition-colors">
                    <span className="text-sm font-bold text-blue-400">Rp</span>
                    <input
                      type="number"
                      value={safeThreshold}
                      onChange={(e) => setSafeThreshold(Number(e.target.value))}
                      className="bg-transparent text-blue-400 font-bold text-lg text-right w-28 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {wishlistItems.map((item) => {
                  const balanceAfterPurchase = currentBalance - item.price;
                  const isSafeToBuy = balanceAfterPurchase >= safeThreshold;
                  const deficit = safeThreshold - balanceAfterPurchase;

                  return item.status === "purchased" ? (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-xl border-2 transition group cursor-not-allowed opacity-90 border-slate-100"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="truncate pr-4">
                          <p className="text-sm font-bold text-slate-400 truncate group-hover:text-slate-400 group-hover:line-through transition">
                            {item.name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-slate-400 line-through">
                            Rp {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="w-full p-2.5 rounded-lg flex justify-between items-center text-xs font-bold mt-3 bg-slate-50 text-slate-400 border border-slate-300">
                        <span>Purchased</span>
                        <span>{`You already purchased this item`}</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={item.id}
                      onClick={() => openItemPopup(item)}
                      className={`bg-white p-3 rounded-xl border-2 transition cursor-pointer group ${
                        isSafeToBuy
                          ? "border-green-100 hover:border-green-400"
                          : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="truncate pr-4">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition">
                            {item.name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-800">
                            Rp {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-full p-2.5 rounded-lg flex justify-between items-center text-xs font-bold mt-3 ${
                          isSafeToBuy
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                      >
                        <span>
                          {isSafeToBuy ? "✓ Safe to Buy" : "⚠ Locked"}
                        </span>
                        <span>
                          {isSafeToBuy
                            ? `Clears threshold by Rp ${balanceAfterPurchase.toLocaleString()}`
                            : `Need Rp ${deficit.toLocaleString()} more`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <Navbar />
      </div>

      {toggleForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl relative">
            {/* Modal Header & Close Button */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h3 className="text-xl font-bold text-black">
                New Wishlist Item
              </h3>
              <button
                onClick={() => setToggleForm(false)}
                className="text-slate-400 hover:text-red-500 font-bold text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., AOTP Aerialbots Skydive"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-600"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hobbies"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-600"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">
                  Target Price (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-200 rounded-lg font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Saving..." : "Save to Wishlist"}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition"
            >
              &times;
            </button>

            <div className="bg-slate-900 p-6 text-white pt-10">
              <p className="text-slate-400 text-sm font-medium mb-1">
                {selectedItem.category}
              </p>
              <h2 className="text-2xl font-bold leading-tight">
                {selectedItem.name}
              </h2>
            </div>

            <div className="p-6 border-b border-slate-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                    Price
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    Rp {selectedItem.price.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                    Available Balance
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    Rp {currentBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                    After Purchase
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    Rp {projectedBalance.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`rounded-2xl p-4 ${projectedSafe ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                >
                  <p className="text-xs uppercase tracking-wide font-semibold">
                    Threshold Status
                  </p>
                  <p className="text-lg font-bold">
                    {projectedSafe ? "Safe" : "Risky"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                  Insight
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {projectedSafe
                    ? `You can still keep your safe threshold after purchasing this item.`
                    : `Your balance will be below the threshold by Rp ${projectedDeficit.toLocaleString()}.`}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex gap-2">
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className={`flex-1 py-3 rounded-lg font-bold transition ${
                  projectedSafe
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                } disabled:opacity-50`}
              >
                {isPurchasing
                  ? "Processing..."
                  : projectedSafe
                    ? "Purchase Item"
                    : "Purchase Anyway (Warning)"}
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-lg font-bold hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import SkeletonBlock from "../../components/SkeletonBlock";

export default function Transactions() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [toggleForm, setToggleForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpense, setIsExpense] = useState(true);
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push("/");
      }
    });
  }, [router]);

  useEffect(() => {
    if (user) {
      const fetchAllTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setAllTransactions(data ?? []);
        if (error) {
          console.error("Error fetching transactions:", error);
        }
        setLoading(false);
      };
      fetchAllTransactions();
    }
  }, [user]);

  const showForm = () => {
    setToggleForm(!toggleForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !category || !amount)
      return alert("Please fill in all fields.");
    setIsSubmitting(true);

    let finalAmount = Number(amount);
    if (isExpense) {
      finalAmount = -Math.abs(finalAmount);
    } else {
      finalAmount = Math.abs(finalAmount);
    }

    const { error: txError } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        type: type,
        category: category,
        amount: finalAmount,
      },
    ]);

    if (txError) {
      console.error("Error adding transaction:", txError);
      alert("Failed to add transaction to database.");
      setIsSubmitting(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    const currentBalance = profile?.balance || 0;
    const newBalance = currentBalance + finalAmount;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating balance:", updateError);
      alert(
        "Transaction saved, but the balance update was blocked by the database!",
      );
      setIsSubmitting(false);
      return;
    }

    setAllTransactions([
      { id: Date.now(), type, category, amount: finalAmount },
      ...allTransactions,
    ]);
    setType("");
    setCategory("");
    setAmount("");
    setToggleForm(false);
    setIsSubmitting(false);
  };

  const delPurchase = async (id, amount, type) => {
    await supabase
      .from("wishlist")
      .update({ status: "dreaming" })
      .eq("name", type)
      .eq("status", "purchased")
      .eq("user_id", user.id);

    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      alert("Failed to delete transaction.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    const currentBalance = profile?.balance || 0;
    const newBalance = currentBalance - amount;

    await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    setAllTransactions(allTransactions.filter((tx) => tx.id !== id));
  };

  const confirmDeleteTransaction = async (tx) => {
    const confirmed = window.confirm(`Delete this transaction?`);
    if (confirmed) {
      await delPurchase(tx.id, tx.amount, tx.type);
    }
  };

  if (!user || loading)
    return (
      <main className="min-h-screen bg-slate-100 flex justify-center">
        <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative text-slate-900 p-6">
          <div className="space-y-4 mt-6">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-slate-200 flex justify-center">
      <div className="w-full max-w-md bg-blue-50 min-h-screen shadow-xl flex flex-col relative text-slate-900">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2 mb-4">
              <h3 className="text-xl font-bold">Transaction History</h3>
              <button
                className="text-xs bg-blue-600 hover:bg-blue-500 transition-colors px-3 py-1.5 rounded text-white font-bold"
                onClick={showForm}
              >
                {`${toggleForm ? "Cancel" : "Add Transaction"}`}
              </button>
            </div>

            {toggleForm && (
              <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
                <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
                  <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h3 className="text-xl font-bold">New Transaction</h3>
                    <button
                      onClick={showForm}
                      className="text-slate-400 hover:text-red-500 font-bold text-2xl leading-none"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setIsExpense(true)}
                      className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                        isExpense
                          ? "bg-red-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsExpense(false)}
                      className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                        !isExpense
                          ? "bg-green-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      Income
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Type (e.g., Groceries)"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />

                  <input
                    type="text"
                    placeholder="Category (e.g., Food & Drink)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />

                  <div className="relative mb-6">
                    <span className="absolute left-3 top-3 font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-3 pl-10 border rounded-lg font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Submit Transaction"}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {allTransactions.length === 0 ? (
                <div className="space-y-3">
                  <SkeletonBlock className="h-20" />
                  <SkeletonBlock className="h-20" />
                </div>
              ) : (
                allTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded-lg cursor-pointer hover:bg-slate-100 transition"
                    onContextMenu={() => confirmDeleteTransaction(tx)}
                  >
                    <div>
                      <p className="font-semibold">{tx.type}</p>
                      <p className="text-xs text-slate-500">{tx.category}</p>
                    </div>
                    <div>
                      <p
                        className={`font-bold ${
                          tx.amount < 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {tx.amount < 0 ? "-" : "+"} Rp{" "}
                        {Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 text-right">
                        {new Date(tx.created_at).getDate()}/
                        {new Date(tx.created_at).getMonth() + 1}/
                        {new Date(tx.created_at).getFullYear()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <Navbar />
      </div>
    </main>
  );
}

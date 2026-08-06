"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import SkeletonBlock from "../components/SkeletonBlock";

export default function Home() {
  const [latestTransactions, setLatestTransactions] = useState([]);
  const [latestWishlist, setLatestWishlist] = useState([]);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
      }
    });

    // Cleanup listener
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: "https://swindles-shanix.vercel.app" },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const { data, error } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", user.id);

        if (data) {
          const totalBalance = data.reduce((sum, tx) => sum + tx.amount, 0);
          setBalance(totalBalance);
        }
      };
      fetchBalance();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchLatestTransactions = async () => {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (data) {
          setLatestTransactions(data);
        }

        if (error) {
          console.error("Error fetching transactions:", error);
        }
      };
      fetchLatestTransactions();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchLatestWishlist = async () => {
        const { data, error } = await supabase
          .from("wishlist")
          .select("*")
          .eq("user_id", user.id)
          .order("status", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(3);

        setLatestWishlist(data ?? []);
        if (error) {
          console.error("Error fetching wishlist:", error);
        }
        setLoading(false);
      };
      fetchLatestWishlist();
    }
  }, [user]);

  return (
    <main className="min-h-screen bg-slate-200 flex justify-center">
      <div className="w-full max-w-md bg-blue-50 min-h-screen shadow-xl flex flex-col relative text-slate-900">
        <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="space-y-6">
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-44" />
            </div>
          ) : (
            <>
              <section className="text-center pt-2">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Total Balance
                </h2>
                <p className="text-5xl font-bold mt-2">
                  Rp {balance.toLocaleString()}
                </p>
              </section>

              <section>
                <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2 mb-4">
                  <h3 className="text-xl font-bold">Latest Transaction</h3>
                  <button
                    className="text-sm text-blue-600 font-medium"
                    onClick={() => {
                      window.location.href = "/transactions";
                    }}
                  >
                    See detail
                  </button>
                </div>

                <div className="space-y-4">
                  {latestTransactions.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No transactions yet.
                    </p>
                  ) : (
                    latestTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{tx.type}</p>
                          <p className="text-xs text-slate-500">
                            {tx.category}
                          </p>
                        </div>
                        <p
                          className={`font-bold ${
                            tx.amount < 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {tx.amount < 0 ? "-" : "+"} Rp{" "}
                          {Math.abs(tx.amount).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2 mb-4">
                  <h3 className="text-xl font-bold">Wishlist</h3>
                  <button
                    className="text-sm text-blue-600 font-medium"
                    onClick={() => {
                      window.location.href = "/wishlist";
                    }}
                  >
                    See detail
                  </button>
                </div>

                <div className="space-y-4">
                  {latestWishlist.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No wishlist items yet.
                    </p>
                  ) : (
                    latestWishlist.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"
                      >
                        <div>
                          <p
                            className={`${item.status === "purchased" ? "font-extralight text-slate-300 line-through" : "font-semibold"}`}
                          >
                            {item.name}
                          </p>
                          <p
                            className={`text-xs ${item.status === "purchased" ? "text-slate-300 line-through" : "text-slate-500"}`}
                          >
                            Rp {item.price.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`flex flex-col items-end ${item.status === "purchased" ? "bg-slate-300" : "bg-blue-500"} p-1 px-2 rounded`}
                        >
                          <span className="text-xs text-slate-100">
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        <Navbar />
      </div>
    </main>
  );
}

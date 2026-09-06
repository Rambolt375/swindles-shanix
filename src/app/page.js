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
  const [avgExpense, setAvgExpense] = useState(0);
  const [prevMonthExpense, setPrevMonthExpense] = useState(0);
  const [predictedExpense, setPredictedExpense] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      // options: { redirectTo: "https://swindles-shanix.vercel.app" },
      // options: { redirectTo: "http://localhost:3000" },
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (!user) return;

    const fetchAllUserData = async () => {
      try {
        const [profileResponse, txResponse, wishlistResponse] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("balance")
              .eq("id", user.id)
              .single(),
            supabase
              .from("transactions")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("wishlist")
              .select("*")
              .eq("user_id", user.id)
              .order("status", { ascending: true })
              .order("created_at", { ascending: false })
              .limit(3),
          ]);

        if (profileResponse.data) {
          setBalance(profileResponse.data.balance);
        }

        if (txResponse.data) {
          setLatestTransactions(txResponse.data);
          const expense = txResponse.data.filter((tx) => tx.amount < 0);

          const monthly = {};
          expense.forEach((tx) => {
            const date = new Date(tx.created_at);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            monthly[monthYear] =
              (monthly[monthYear] || 0) + Math.abs(tx.amount);
          });

          const monthlyTotal = Object.keys(monthly).length;
          const totalExpense = Object.values(monthly).reduce(
            (sum, amount) => sum + amount,
            0,
          );
          const currentAvg = monthlyTotal > 0 ? totalExpense / monthlyTotal : 0;
          setAvgExpense(currentAvg);

          const today = new Date();
          const lastMonthDate = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1,
          );
          const lastMonthKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`;
          setPrevMonthExpense(monthly[lastMonthKey] || 0);

          if (monthlyTotal > 1) {
            const sortedMonths = Object.keys(monthly).sort((a, b) => {
              const [yearA, monthA] = a.split("-").map(Number);
              const [yearB, monthB] = b.split("-").map(Number);
              return new Date(yearA, monthA) - new Date(yearB, monthB);
            });

            let sumX = 0,
              sumY = 0,
              sumXY = 0,
              sumXX = 0;
            const n = monthlyTotal;

            sortedMonths.forEach((key, index) => {
              const x = index + 1;
              const y = monthly[key];
              sumX += x;
              sumY += y;
              sumXY += x * y;
              sumXX += x * x;
            });

            const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const b = (sumY - m * sumX) / n;

            const nextMonthPrediction = m * (n + 1) + b;

            setPredictedExpense(Math.max(0, nextMonthPrediction));
          } else {
            setPredictedExpense(currentAvg);
          }
        }

        if (wishlistResponse.data) setLatestWishlist(wishlistResponse.data);
      } catch (err) {
        console.error("Unexpected error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUserData();
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
                  Rp {(balance ?? 0).toLocaleString()}
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
                    latestTransactions.slice(0, 5).map((tx) => (
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
                            className={`${
                              item.status === "purchased"
                                ? "font-extralight text-slate-300 line-through"
                                : "font-semibold"
                            }`}
                          >
                            {item.name}
                          </p>
                          <p
                            className={`text-xs ${
                              item.status === "purchased"
                                ? "text-slate-300 line-through"
                                : "text-slate-500"
                            }`}
                          >
                            Rp {item.price.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`flex flex-col items-end ${
                            item.status === "purchased"
                              ? "bg-slate-300"
                              : "bg-blue-500"
                          } p-1 px-2 rounded`}
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

              <section>
                <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2 mb-4">
                  <h3 className="text-xl font-bold">
                    Average Expense Per Month
                  </h3>
                </div>

                {!user ? (
                  <p className="text-sm text-slate-500">
                    Log in to see your average expense per month.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <h1>  
                      Umm, technically 🤓, you spent about{" "}
                      <strong
                        style={{ color: avgExpense > 500000 ? "red" : "green" }}
                      >
                        Rp {Math.round(avgExpense).toLocaleString()}
                      </strong>{" "}
                      per month on average. Projected next month is{" "}
                      <strong>
                        Rp {Math.round(predictedExpense).toLocaleString()}.
                      </strong>{" "}
                      last month you spent{" "}
                      <strong>
                        Rp {Math.round(prevMonthExpense).toLocaleString()}.
                      </strong>{" "}
                      Let&apos;s be highly honest here, your average spending this
                      month is quite{" "}
                      {avgExpense > 500000
                        ? "high. You technically waste money here, budget better idiot."
                        : "low. Brokie."}
                    </h1>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <Navbar />
      </div>
    </main>
  );
}


"use client";

import { useEffect, useState } from "react";
import {
  BookOpen, Users, Layers3, ArrowLeftRight,
  Clock, BookCheck,
} from "lucide-react";
import AdminCharts from "@/app/components/dashboard/AdminCharts";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin-stats");
        const result = await response.json();

        if (!response.ok) throw new Error(result.message);
        setStats(result.data);
      } catch (error) {
        console.error("Dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const overview = stats?.overview;

  const cards = [
    { label: "Total Books", value: overview?.totalBooks, icon: BookOpen },
    { label: "Total Members", value: overview?.totalMembers, icon: Users },
    { label: "Categories", value: overview?.totalCategories, icon: Layers3 },
    { label: "Transactions", value: overview?.totalTransactions, icon: ArrowLeftRight },
    { label: "Active Loans", value: overview?.borrowedTransactions, icon: Clock },
    { label: "Returned", value: overview?.returnedTransactions, icon: BookCheck },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-[#1d3028]">
          Library Overview
        </h2>
        <p className="mt-1 text-sm text-[#89948b]">
          Here's what's happening in your library today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#e5e7df] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#89948b]">{card.label}</p>
              <card.icon size={19} className="text-[#78977f]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#1d3028]">
              {loading ? "—" : (card.value ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e5e7df] bg-white p-5">
          <p className="text-sm text-[#89948b]">Available Copies</p>
          <p className="mt-2 text-2xl font-semibold text-[#214c3a]">
            {loading ? "—" : overview?.totalAvailable ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5e7df] bg-white p-5">
          <p className="text-sm text-[#89948b]">Overdue Transactions</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {loading ? "—" : overview?.overdueTransactions ?? 0}
          </p>
        </div>
      </div>

      {stats && (
        <AdminCharts
          monthlyTransactions={stats.monthlyTransactions}
          categoryDistribution={stats.categoryDistribution}
        />
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e5e7df] bg-white">
        <div className="border-b border-[#edf0e9] p-5">
          <h3 className="font-semibold text-[#1d3028]">Recent Transactions</h3>
          <p className="mt-1 text-sm text-[#89948b]">
            Latest borrowing activity in your library.
          </p>
        </div>

        <div className="divide-y divide-[#edf0e9]">
          {stats?.recentTransactions?.length ? (
            stats.recentTransactions.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[#1d3028]">{item.member}</p>
                  <p className="mt-1 text-sm text-[#89948b]">
                    {item.book} · {item.studentId}
                  </p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                  item.status === "Returned"
                    ? "bg-[#eaf0e9] text-[#214c3a]"
                    : item.status === "Overdue"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                }`}>
                  {item.status}
                </span>
              </div>
            ))
          ) : (
            <p className="p-8 text-center text-sm text-[#89948b]">
              No recent transactions.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

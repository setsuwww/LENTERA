
"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  ArrowDownToLine,
  AlertTriangle,
  CalendarCheck,
  RotateCcw,
  RefreshCw,
  Clock3,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export default function StaffDashboardPage() {
  const [overview, setOverview] = useState({});
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/staff-stats");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setOverview(result.overview || {});
      setActivities(result.recentActivity || []);
    } catch (err) {
      setError(err.message || "Failed to load staff dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = [
    {
      label: "Total Books",
      value: overview.totalBooks ?? 0,
      icon: BookOpen,
      note: `${overview.availableCopies ?? 0} available copies`,
    },
    {
      label: "Active Members",
      value: overview.activeMembers ?? 0,
      icon: Users,
      note: `${overview.totalMembers ?? 0} registered members`,
    },
    {
      label: "Active Loans",
      value: overview.activeLoans ?? 0,
      icon: ArrowDownToLine,
      note: `${overview.borrowedCopies ?? 0} copies borrowed`,
    },
    {
      label: "Overdue Loans",
      value: overview.overdueLoans ?? 0,
      icon: AlertTriangle,
      note: "Require attention",
    },
  ];

  return (
    <div className="space-y-8">
      {/* WELCOME */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[2px] text-[#8b958b]">
            LIBRARY OPERATIONS
          </span>

          <h1 className="font-serif text-3xl text-[#1d3028] mt-3">
            Staff Overview
          </h1>

          <p className="text-sm text-[#858c83] mt-2">
            Monitor daily library activities and member services.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-[#214c3a] hover:opacity-70"
        >
          <RefreshCw size={14} />
          Refresh Overview
        </button>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* STATS */}
      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white border border-[#e9eae2] rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858c83]">
                  {stat.label}
                </span>

                <Icon size={18} className="text-[#78917c]" />
              </div>

              <p className="text-3xl font-semibold text-[#1d3028] mt-4">
                {loading ? "—" : stat.value}
              </p>

              <p className="text-[11px] text-[#929a91] mt-2">
                {stat.note}
              </p>
            </div>
          );
        })}
      </section>

      {/* DAILY ACTIVITY */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#214c3a] text-white rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center">
              <CalendarCheck size={20} />
            </div>

            <div>
              <p className="text-xs text-[#c8d5c9]">
                Today's Borrowings
              </p>

              <p className="text-2xl font-semibold mt-1">
                {loading ? "—" : overview.borrowedToday ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e9eae2] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e5ece3] grid place-items-center">
              <RotateCcw size={20} className="text-[#214c3a]" />
            </div>

            <div>
              <p className="text-xs text-[#858c83]">
                Today's Returns
              </p>

              <p className="text-2xl font-semibold text-[#1d3028] mt-1">
                {loading ? "—" : overview.returnedToday ?? 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INVENTORY */}
      <section className="bg-white border border-[#e9eae2] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-serif text-xl text-[#1d3028]">
              Inventory Overview
            </h2>

            <p className="text-xs text-[#858c83] mt-1">
              Current physical book availability.
            </p>
          </div>

          <BookOpen size={19} className="text-[#78917c]" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-xs mb-3">
              <span className="text-[#858c83]">
                Available Copies
              </span>

              <strong className="text-[#214c3a]">
                {loading ? "—" : overview.availableCopies ?? 0}
              </strong>
            </div>

            <div className="h-2 bg-[#edf0e9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#527d5b] rounded-full"
                style={{
                  width: `${
                    !loading &&
                    (overview.availableCopies ?? 0) +
                    (overview.borrowedCopies ?? 0) > 0
                      ? (overview.availableCopies /
                          (overview.availableCopies +
                            overview.borrowedCopies)) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-3">
              <span className="text-[#858c83]">
                Borrowed Copies
              </span>

              <strong className="text-[#b58d49]">
                {loading ? "—" : overview.borrowedCopies ?? 0}
              </strong>
            </div>

            <div className="h-2 bg-[#edf0e9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d9b878] rounded-full"
                style={{
                  width: `${
                    !loading &&
                    (overview.availableCopies ?? 0) +
                    (overview.borrowedCopies ?? 0) > 0
                      ? (overview.borrowedCopies /
                          (overview.availableCopies +
                            overview.borrowedCopies)) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section className="bg-white border border-[#e9eae2] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#eef0e9]">
          <h2 className="font-serif text-xl text-[#1d3028]">
            Recent Transactions
          </h2>

          <p className="text-xs text-[#858c83] mt-1">
            Latest borrowing and return records.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-[#858c83]">
            Loading transactions...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-10 text-center">
            <Clock3
              size={30}
              className="mx-auto text-[#aab5a8]"
            />

            <p className="text-sm text-[#858c83] mt-3">
              No recent transactions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#eef0e9]">
            {activities.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <h3 className="text-sm font-semibold text-[#1d3028]">
                    {item.bookTitle}
                  </h3>

                  <p className="text-xs text-[#858c83] mt-1">
                    {item.memberName} · {item.studentId}
                  </p>

                  <p className="text-[11px] text-[#929a91] mt-1">
                    {item.quantity}{" "}
                    {item.quantity === 1 ? "copy" : "copies"}
                    {" · "}
                    {formatDate(item.borrowDate)}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-3 py-2 rounded-full w-fit ${
                    item.status === "Returned"
                      ? "bg-[#e6f0e5] text-[#416b48]"
                      : item.status === "Overdue"
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  History,
  Library,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const statusStyles = {
  Borrowed: "bg-blue-50 text-blue-700",
  Overdue: "bg-red-50 text-red-600",
  Returned: "bg-[#e6f0e5] text-[#416b48]",
};

export default function StudentLoansPage() {
  const [loans, setLoans] = useState([]);
  const [overview, setOverview] = useState({
    total: 0,
    active: 0,
    overdue: 0,
    returned: 0,
  });

  const [member, setMember] = useState(null);
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLoans = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/student/loans");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setLoans(result.data || []);
      setOverview(result.overview || {
        total: 0,
        active: 0,
        overdue: 0,
        returned: 0,
      });

      setMember(result.member || null);

    } catch (err) {
      setError(err.message || "Gagal mengambil data peminjaman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const filteredLoans = loans.filter((loan) => {
    if (filter === "all") return true;

    if (filter === "active") {
      return loan.status === "Borrowed";
    }

    if (filter === "overdue") {
      return loan.status === "Overdue";
    }

    if (filter === "returned") {
      return loan.status === "Returned";
    }

    return true;
  });

  const stats = [
    {
      label: "Total Loans",
      value: overview.total,
      icon: Library,
    },
    {
      label: "Currently Borrowed",
      value: overview.active,
      icon: BookOpen,
    },
    {
      label: "Overdue",
      value: overview.overdue,
      icon: AlertCircle,
    },
    {
      label: "Returned",
      value: overview.returned,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-8">
      {/* INTRO */}
      <section>
        <span className="text-[10px] font-bold tracking-[2px] text-[#8b958b]">
          PERSONAL LIBRARY
        </span>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-3">
          <div>
            <h1 className="font-serif text-3xl text-[#1d3028]">
              My Loans
            </h1>

            <p className="text-sm text-[#858c83] mt-2">
              Track your borrowed books and return deadlines.
            </p>

            {member && (
              <p className="text-xs text-[#81917f] mt-3">
                {member.name} · {member.studentId}
              </p>
            )}
          </div>

          <button
            onClick={fetchLoans}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-semibold text-[#214c3a] hover:opacity-70"
          >
            <RefreshCw size={14} />
            Refresh Loans
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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

                <Icon size={17} className="text-[#78917c]" />
              </div>

              <p className="text-2xl font-semibold text-[#1d3028] mt-4">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* FILTER */}
      <section className="bg-white border border-[#e9eae2] rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[#1d3028]">
              Borrowing History
            </h2>

            <p className="text-xs text-[#858c83] mt-1">
              Review all your library transactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Loans" },
              { id: "active", label: "Borrowed" },
              { id: "overdue", label: "Overdue" },
              { id: "returned", label: "Returned" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  filter === item.id
                    ? "bg-[#214c3a] text-white"
                    : "bg-[#f4f5ef] text-[#758174] hover:bg-[#e8eee5]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LOANS LIST */}
      <section className="space-y-4">
        {loading ? (
          [1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-44 bg-white border border-[#e9eae2] rounded-xl animate-pulse"
            />
          ))
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchLoans}
              className="mt-3 text-xs font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="bg-white border border-[#e9eae2] rounded-xl py-16 text-center">
            <History
              size={36}
              className="mx-auto text-[#aab5a8]"
            />

            <h3 className="font-serif text-lg text-[#1d3028] mt-4">
              No borrowing records
            </h3>

            <p className="text-sm text-[#858c83] mt-2">
              {filter === "all"
                ? "You haven't borrowed any books yet."
                : "No transactions found in this category."}
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <article
              key={loan.id}
              className="bg-white border border-[#e9eae2] rounded-xl p-5 md:p-6"
            >
              <div className="flex flex-col md:flex-row gap-5">
                {/* BOOK ICON */}
                <div className="w-16 h-20 shrink-0 rounded-lg bg-[#e5ece3] grid place-items-center">
                  <BookOpen
                    size={28}
                    className="text-[#214c3a]"
                  />
                </div>

                {/* BOOK INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
                        statusStyles[loan.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {loan.status}
                    </span>

                    <span className="text-[10px] text-[#929a91]">
                      {loan.quantity}{" "}
                      {loan.quantity === 1 ? "copy" : "copies"}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-[#1d3028] mt-3">
                    {loan.book.title}
                  </h3>

                  <p className="text-sm text-[#858c83] mt-1">
                    by {loan.book.author}
                  </p>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-[#81917f]">
                    <span>{loan.book.category}</span>
                    <span>{loan.book.publisher}</span>
                    <span>{loan.book.year}</span>
                  </div>
                </div>
              </div>

              {/* DATES */}
              <div className="grid sm:grid-cols-3 gap-4 border-t border-[#eef0e9] mt-5 pt-5">
                <div>
                  <div className="flex items-center gap-2 text-[#929a91]">
                    <CalendarDays size={14} />
                    <span className="text-[10px] font-bold tracking-wider">
                      BORROW DATE
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#1d3028] mt-2">
                    {formatDate(loan.borrowDate)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#929a91]">
                    <Clock3 size={14} />
                    <span className="text-[10px] font-bold tracking-wider">
                      DUE DATE
                    </span>
                  </div>

                  <p
                    className={`text-sm font-semibold mt-2 ${
                      loan.status === "Overdue"
                        ? "text-red-600"
                        : "text-[#1d3028]"
                    }`}
                  >
                    {formatDate(loan.dueDate)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#929a91]">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold tracking-wider">
                      RETURN DATE
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#1d3028] mt-2">
                    {formatDate(loan.returnDate)}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

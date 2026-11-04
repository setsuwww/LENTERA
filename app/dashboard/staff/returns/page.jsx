
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RotateCcw,
  BookOpen,
  UserRound,
  CalendarDays,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export default function StaffReturnsPage() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/transactions");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setTransactions(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to retrieve transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const activeTransactions = useMemo(() => {
    return transactions.filter(
      (item) =>
        item.status === "Borrowed" ||
        item.status === "Overdue"
    );
  }, [transactions]);

  const filteredTransactions = activeTransactions.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.book?.title?.toLowerCase().includes(keyword) ||
      item.member?.name?.toLowerCase().includes(keyword) ||
      item.member?.studentId?.toLowerCase().includes(keyword)
    );
  });

  const overdueCount = activeTransactions.filter(
    (item) => item.status === "Overdue"
  ).length;

  const handleReturn = async (transaction) => {
    const confirmed = window.confirm(
      `Process return for "${transaction.book.title}" borrowed by ${transaction.member.name}?`
    );

    if (!confirmed) return;

    setProcessingId(transaction.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/transactions/${transaction.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setSuccess(
        `${transaction.book.title} has been successfully returned.`
      );

      await fetchTransactions();

    } catch (err) {
      setError(err.message || "Failed to process book return.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[2px] text-[#8b958b]">
            LIBRARY OPERATIONS
          </span>

          <h1 className="font-serif text-3xl text-[#1d3028] mt-3">
            Book Returns
          </h1>

          <p className="text-sm text-[#858c83] mt-2">
            Manage returned books and update library inventory.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-[#214c3a] hover:opacity-70"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </section>

      {/* FEEDBACK */}
      {success && (
        <div className="flex items-center gap-3 bg-[#e6f0e5] border border-[#d4e4d2] text-[#416b48] rounded-lg p-4 text-sm">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-lg p-4 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* STATS */}
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e9eae2] rounded-xl p-5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#858c83]">
              Active Loans
            </span>

            <BookOpen size={18} className="text-[#78917c]" />
          </div>

          <p className="text-3xl font-semibold text-[#1d3028] mt-4">
            {loading ? "—" : activeTransactions.length}
          </p>
        </div>

        <div className="bg-white border border-[#e9eae2] rounded-xl p-5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#858c83]">
              Overdue Returns
            </span>

            <AlertTriangle size={18} className="text-red-500" />
          </div>

          <p className="text-3xl font-semibold text-red-600 mt-4">
            {loading ? "—" : overdueCount}
          </p>
        </div>

        <div className="bg-white border border-[#e9eae2] rounded-xl p-5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#858c83]">
              Pending Returns
            </span>

            <RotateCcw size={18} className="text-[#78917c]" />
          </div>

          <p className="text-3xl font-semibold text-[#1d3028] mt-4">
            {loading ? "—" : activeTransactions.length}
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="bg-white border border-[#e9eae2] rounded-xl p-5">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929a91]"
          />

          <input
            type="text"
            placeholder="Search book title, student name, or NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-lg bg-[#f7f7f2] border border-[#e9eae2] text-sm outline-none focus:border-[#214c3a]"
          />
        </div>
      </section>

      {/* TRANSACTION LIST */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-serif text-xl text-[#1d3028]">
              Pending Book Returns
            </h2>

            <p className="text-xs text-[#858c83] mt-1">
              {filteredTransactions.length} active transactions
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 bg-white border border-[#e9eae2] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white border border-[#e9eae2] rounded-xl py-16 text-center">
            <CheckCircle2
              size={36}
              className="mx-auto text-[#78917c]"
            />

            <h3 className="font-serif text-lg text-[#1d3028] mt-4">
              No Pending Returns
            </h3>

            <p className="text-sm text-[#858c83] mt-2">
              All matching borrowing transactions have been completed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-[#e9eae2] rounded-xl p-5 md:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-14 h-16 shrink-0 rounded-lg bg-[#e5ece3] grid place-items-center">
                      <BookOpen
                        size={25}
                        className="text-[#214c3a]"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
                            item.status === "Overdue"
                              ? "bg-red-50 text-red-600"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {item.status}
                        </span>

                        <span className="text-[10px] text-[#929a91]">
                          {item.quantity}{" "}
                          {item.quantity === 1 ? "copy" : "copies"}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl text-[#1d3028] mt-3">
                        {item.book.title}
                      </h3>

                      <p className="text-sm text-[#858c83] mt-1">
                        by {item.book.author}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReturn(item)}
                    disabled={processingId === item.id}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-[#214c3a] text-white rounded-lg text-xs font-semibold hover:bg-[#163b2b] disabled:opacity-50 transition shrink-0"
                  >
                    <RotateCcw size={14} />

                    {processingId === item.id
                      ? "Processing..."
                      : "Process Return"}
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 border-t border-[#eef0e9] mt-5 pt-5">
                  <div>
                    <div className="flex items-center gap-2 text-[#929a91]">
                      <UserRound size={14} />

                      <span className="text-[10px] font-bold tracking-wider">
                        MEMBER
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#1d3028] mt-2">
                      {item.member.name}
                    </p>

                    <p className="text-xs text-[#858c83] mt-1">
                      {item.member.studentId}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-[#929a91]">
                      <CalendarDays size={14} />

                      <span className="text-[10px] font-bold tracking-wider">
                        BORROW DATE
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#1d3028] mt-2">
                      {formatDate(item.borrowDate)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-[#929a91]">
                      {item.status === "Overdue" ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <Clock3 size={14} />
                      )}

                      <span className="text-[10px] font-bold tracking-wider">
                        DUE DATE
                      </span>
                    </div>

                    <p
                      className={`text-sm font-semibold mt-2 ${
                        item.status === "Overdue"
                          ? "text-red-600"
                          : "text-[#1d3028]"
                      }`}
                    >
                      {formatDate(item.dueDate)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

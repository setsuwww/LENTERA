
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  History,
  BookOpen,
  CheckCircle2,
  CalendarDays,
  RefreshCw,
  Archive,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export default function StudentHistoryPage() {
  const [history, setHistory] = useState([]);
  const [years, setYears] = useState([]);
  const [overview, setOverview] = useState({
    totalReturned: 0,
    totalCopies: 0,
  });

  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search,
        year,
      });

      const response = await fetch(
        `/api/student/history?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setHistory(result.data || []);
      setYears(result.years || []);
      setOverview(result.overview || {
        totalReturned: 0,
        totalCopies: 0,
      });

    } catch (err) {
      setError(err.message || "Gagal mengambil riwayat peminjaman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchHistory, 300);

    return () => clearTimeout(timeout);
  }, [search, year]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section>
        <span className="text-[10px] font-bold tracking-[2px] text-[#8b958b]">
          PERSONAL ARCHIVE
        </span>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-3">
          <div>
            <h1 className="font-serif text-3xl text-[#1d3028]">
              Borrowing History
            </h1>

            <p className="text-sm text-[#858c83] mt-2">
              Your completed borrowing transactions, all in one place.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-semibold text-[#214c3a] hover:opacity-70"
          >
            <RefreshCw size={14} />
            Refresh History
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e9eae2] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#858c83]">
              Completed Transactions
            </span>

            <CheckCircle2 size={18} className="text-[#78917c]" />
          </div>

          <p className="text-3xl font-semibold text-[#1d3028] mt-4">
            {overview.totalReturned}
          </p>

          <p className="text-[11px] text-[#929a91] mt-1">
            Successfully returned transactions
          </p>
        </div>

        <div className="bg-white border border-[#e9eae2] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#858c83]">
              Total Copies Returned
            </span>

            <BookOpen size={18} className="text-[#78917c]" />
          </div>

          <p className="text-3xl font-semibold text-[#1d3028] mt-4">
            {overview.totalCopies}
          </p>

          <p className="text-[11px] text-[#929a91] mt-1">
            Total book copies returned
          </p>
        </div>
      </section>

      {/* SEARCH & FILTER */}
      <section className="bg-white border border-[#e9eae2] rounded-xl p-5">
        <div className="grid md:grid-cols-[1fr_220px] gap-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929a91]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search book title..."
              className="w-full h-12 pl-11 pr-4 rounded-lg bg-[#f7f7f2] border border-[#e9eae2] text-sm outline-none focus:border-[#214c3a]"
            />
          </div>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-12 px-4 rounded-lg bg-[#f7f7f2] border border-[#e9eae2] text-sm outline-none focus:border-[#214c3a]"
          >
            <option value="all">All Years</option>

            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* HISTORY LIST */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Archive size={17} className="text-[#214c3a]" />

          <h2 className="font-serif text-xl text-[#1d3028]">
            Transaction Archive
          </h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 bg-white border border-[#e9eae2] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchHistory}
              className="mt-3 text-xs font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-[#e9eae2] rounded-xl py-16 text-center">
            <History
              size={36}
              className="mx-auto text-[#aab5a8]"
            />

            <h3 className="font-serif text-lg text-[#1d3028] mt-4">
              No history yet
            </h3>

            <p className="text-sm text-[#858c83] mt-2">
              Completed book returns will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-[#e9eae2] rounded-xl p-5 md:p-6"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-14 h-16 rounded-lg bg-[#e5ece3] grid place-items-center shrink-0">
                    <BookOpen
                      size={25}
                      className="text-[#214c3a]"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#e6f0e5] text-[#416b48]">
                        Returned
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

                    <div className="flex flex-wrap gap-4 text-xs text-[#81917f] mt-3">
                      <span>{item.book.category}</span>
                      <span>{item.book.publisher}</span>
                      <span>{item.book.year}</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 border-t border-[#eef0e9] mt-5 pt-5">
                  <div>
                    <div className="flex items-center gap-2 text-[#929a91]">
                      <CalendarDays size={14} />
                      <span className="text-[10px] font-bold tracking-wider">
                        BORROWED
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#1d3028] mt-2">
                      {formatDate(item.borrowDate)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-[#929a91]">
                      <CalendarDays size={14} />
                      <span className="text-[10px] font-bold tracking-wider">
                        DUE DATE
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#1d3028] mt-2">
                      {formatDate(item.dueDate)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-[#78917c]">
                      <CheckCircle2 size={14} />
                      <span className="text-[10px] font-bold tracking-wider">
                        RETURNED ON
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#416b48] mt-2">
                      {formatDate(item.returnDate)}
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

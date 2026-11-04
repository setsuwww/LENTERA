
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  Search,
  CalendarDays,
  GraduationCap,
  LibraryBig,
  Sparkles,
} from "lucide-react";

function formatDate(date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudentDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/student-stats");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message);
        }

        setDashboard(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 rounded-2xl bg-[#e8ebe3]" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-[#e8ebe3]" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-[#e8ebe3]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Unable to load dashboard
        </h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!dashboard?.linked) {
    return (
      <div className="rounded-2xl border border-[#e5e7df] bg-white p-8 text-center">
        <GraduationCap
          size={36}
          className="mx-auto text-[#78977f]"
        />
        <h2 className="mt-4 text-lg font-semibold text-[#1d3028]">
          Student Profile Not Linked
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#89948b]">
          Akun login kamu belum terhubung dengan data mahasiswa di
          perpustakaan. Silakan hubungi administrator untuk menghubungkan
          akun dengan data Member.
        </p>
      </div>
    );
  }

  const { member, overview, recentLoans, latestBooks } = dashboard.data;

  const cards = [
    {
      label: "Active Loans",
      value: overview.activeLoans,
      icon: BookOpen,
      color: "text-[#214c3a]",
      bg: "bg-[#eaf0e9]",
    },
    {
      label: "Overdue Books",
      value: overview.overdueLoans,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Returned Books",
      value: overview.returnedTransactions,
      icon: BookCheck,
      color: "text-[#9a7941]",
      bg: "bg-[#f6f0e3]",
    },
    {
      label: "Total Transactions",
      value: overview.totalTransactions,
      icon: LibraryBig,
      color: "text-[#58728a]",
      bg: "bg-[#edf2f6]",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-2xl bg-[#214c3a] p-6 text-white md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-sm text-[#d9e3d8]">
            <Sparkles size={16} />
            <span>Student Portal</span>
          </div>

          <h2 className="text-2xl font-semibold md:text-3xl">
            Welcome back, {member.name.split(" ")[0]}!
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-[#d9e3d8]">
            Your next great discovery might be waiting on a bookshelf.
            Explore knowledge, track your loans, and keep learning.
          </p>

          <Link
            href="/dashboard/student/books"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#d9b878] px-5 py-3 text-sm font-semibold text-[#1d3028] transition hover:bg-[#e6c98f]"
          >
            Explore Books <ArrowRight size={17} />
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-16 opacity-10">
          <BookOpen size={260} strokeWidth={1} />
        </div>
      </section>

      {/* Student Information */}
      <section className="flex flex-col gap-3 rounded-2xl border border-[#e5e7df] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#eaf0e9] p-3 text-[#214c3a]">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="font-semibold text-[#1d3028]">
              {member.name}
            </p>
            <p className="mt-1 text-xs text-[#89948b]">
              {member.studentId} · {member.studyProgram}
            </p>
          </div>
        </div>

        <div className="text-sm text-[#89948b]">
          {member.department}
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#e5e7df] bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#89948b]">{card.label}</p>
              <div className={`rounded-xl p-2 ${card.bg} ${card.color}`}>
                <card.icon size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-[#1d3028]">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      {/* Loans */}
      <section className="overflow-hidden rounded-2xl border border-[#e5e7df] bg-white">
        <div className="flex items-center justify-between border-b border-[#edf0e9] p-5">
          <div>
            <h3 className="font-semibold text-[#1d3028]">
              My Active Loans
            </h3>
            <p className="mt-1 text-sm text-[#89948b]">
              Keep track of your borrowed books.
            </p>
          </div>

          <Link
            href="/dashboard/student/loans"
            className="flex items-center gap-1 text-sm font-medium text-[#214c3a] hover:underline"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {recentLoans.length > 0 ? (
          <div className="divide-y divide-[#edf0e9]">
            {recentLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#eaf0e9] p-3 text-[#214c3a]">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <p className="font-medium text-[#1d3028]">
                      {loan.book.title}
                    </p>
                    <p className="mt-1 text-sm text-[#89948b]">
                      {loan.book.author} · {loan.quantity}{" "}
                      {loan.quantity === 1 ? "copy" : "copies"}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-[#89948b]">
                      <CalendarDays size={13} />
                      Borrowed {formatDate(loan.borrowDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="text-sm">
                    <p className="text-[#89948b]">Due date</p>
                    <p className={`mt-1 font-medium ${
                      loan.status === "Overdue"
                        ? "text-red-600"
                        : "text-[#1d3028]"
                    }`}>
                      {formatDate(loan.dueDate)}
                    </p>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    loan.status === "Overdue"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {loan.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <BookOpen size={30} className="mx-auto text-[#a9b8a9]" />
            <p className="mt-3 font-medium text-[#1d3028]">
              No active loans
            </p>
            <p className="mt-1 text-sm text-[#89948b]">
              You haven't borrowed any books yet.
            </p>
          </div>
        )}
      </section>

      {/* Latest Books */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1d3028]">
              Discover Available Books
            </h3>
            <p className="mt-1 text-sm text-[#89948b]">
              Recently added books in our collection.
            </p>
          </div>

          <Link
            href="/dashboard/student/books"
            className="text-sm font-medium text-[#214c3a] hover:underline"
          >
            Explore All
          </Link>
        </div>

        {latestBooks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {latestBooks.map((book) => (
              <div
                key={book.id}
                className="rounded-2xl border border-[#e5e7df] bg-white p-5"
              >
                <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-[#eaf0e9] text-[#78977f]">
                  <BookOpen size={42} strokeWidth={1.3} />
                </div>

                <span className="text-xs font-medium text-[#9a7941]">
                  {book.category}
                </span>

                <h4 className="mt-2 line-clamp-2 font-semibold text-[#1d3028]">
                  {book.title}
                </h4>

                <p className="mt-1 text-sm text-[#89948b]">
                  {book.author}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-[#edf0e9] pt-3 text-xs">
                  <span className="text-[#89948b]">Available</span>
                  <span className="font-semibold text-[#214c3a]">
                    {book.stock} copies
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e5e7df] bg-white p-8 text-center text-sm text-[#89948b]">
            No available books at the moment.
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/student/books"
          className="flex items-center justify-between rounded-2xl border border-[#e5e7df] bg-white p-5 transition hover:border-[#78977f]"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#eaf0e9] p-3 text-[#214c3a]">
              <Search size={20} />
            </div>
            <div>
              <p className="font-semibold text-[#1d3028]">Find a Book</p>
              <p className="mt-1 text-xs text-[#89948b]">
                Search the library collection.
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#78977f]" />
        </Link>

        <Link
          href="/dashboard/student/history"
          className="flex items-center justify-between rounded-2xl border border-[#e5e7df] bg-white p-5 transition hover:border-[#78977f]"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#f6f0e3] p-3 text-[#9a7941]">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-semibold text-[#1d3028]">Borrowing History</p>
              <p className="mt-1 text-xs text-[#89948b]">
                Review your previous transactions.
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#78977f]" />
        </Link>
      </section>
    </div>
  );
}

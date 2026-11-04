
"use client";

import { useEffect, useState } from "react";
import {
  FileBarChart, Download, RefreshCw, BookOpen,
  Users, ArrowLeftRight, AlertTriangle,
} from "lucide-react";

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports?period=${period}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);
      setReport(result);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [period]);

  function exportCSV() {
    if (!report?.data?.length) return;

    const headers = [
      "Transaction ID", "Member", "Student ID", "Department",
      "Book", "Author", "Category", "Quantity",
      "Borrow Date", "Due Date", "Return Date", "Status",
    ];

    const rows = report.data.map((item) => [
      item.id,
      item.member,
      item.studentId,
      item.department,
      item.book,
      item.author,
      item.category,
      item.quantity,
      new Date(item.borrowDate).toLocaleDateString("id-ID"),
      new Date(item.dueDate).toLocaleDateString("id-ID"),
      item.returnDate ? new Date(item.returnDate).toLocaleDateString("id-ID") : "-",
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lentera-report-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const summary = report?.summary;

  const cards = [
    { label: "Transactions", value: summary?.totalTransactions || 0, icon: ArrowLeftRight },
    { label: "Borrowed", value: summary?.borrowed || 0, icon: BookOpen },
    { label: "Returned", value: summary?.returned || 0, icon: RefreshCw },
    { label: "Overdue", value: summary?.overdue || 0, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1d3028]">Library Reports</h2>
          <p className="mt-1 text-sm text-[#89948b]">
            Monitor library activity and transaction performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-[#e5e7df] bg-white px-4 py-2.5 text-sm outline-none"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={loadReport}
            className="rounded-xl border border-[#e5e7df] bg-white p-2.5 text-[#214c3a]"
            title="Refresh report"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={exportCSV}
            disabled={!report?.data?.length}
            className="flex items-center gap-2 rounded-xl bg-[#214c3a] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Download size={17} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#e5e7df] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#89948b]">{card.label}</p>
              <card.icon size={19} className="text-[#78977f]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#1d3028]">
              {loading ? "—" : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Books", value: summary?.totalBooks || 0, icon: BookOpen },
          { label: "Total Members", value: summary?.totalMembers || 0, icon: Users },
          { label: "Copies Borrowed", value: summary?.totalCopiesBorrowed || 0, icon: FileBarChart },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-[#e5e7df] bg-white p-5">
            <div className="rounded-xl bg-[#eaf0e9] p-3 text-[#214c3a]">
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-sm text-[#89948b]">{item.label}</p>
              <p className="text-xl font-semibold text-[#1d3028]">{loading ? "—" : item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e5e7df] bg-white">
        <div className="border-b border-[#edf0e9] p-5">
          <h3 className="font-semibold text-[#1d3028]">Transaction Details</h3>
          <p className="mt-1 text-sm text-[#89948b]">
            {report?.total || 0} records found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-[#fafbf8] text-xs uppercase tracking-wide text-[#89948b]">
              <tr>
                <th className="px-5 py-4">Member</th>
                <th className="px-5 py-4">Book</th>
                <th className="px-5 py-4">Borrow Date</th>
                <th className="px-5 py-4">Due Date</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0e9]">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center text-[#89948b]">Generating report...</td></tr>
              ) : !report?.data?.length ? (
                <tr><td colSpan="6" className="p-10 text-center text-[#89948b]">No transactions found for this period.</td></tr>
              ) : report.data.map((item) => (
                <tr key={item.id} className="hover:bg-[#fafbf8]">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#1d3028]">{item.member}</p>
                    <p className="text-xs text-[#89948b]">{item.studentId}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#1d3028]">{item.book}</p>
                    <p className="text-xs text-[#89948b]">{item.author}</p>
                  </td>
                  <td className="px-5 py-4 text-[#65736a]">
                    {new Date(item.borrowDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-5 py-4 text-[#65736a]">
                    {new Date(item.dueDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-5 py-4 text-[#65736a]">{item.quantity} {item.quantity === 1 ? "copy" : "copies"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.status === "Returned"
                        ? "bg-[#eaf0e9] text-[#214c3a]"
                        : item.status === "Overdue"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-700"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

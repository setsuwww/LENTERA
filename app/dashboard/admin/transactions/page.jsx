
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  ArrowRightLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
  ChevronDown,
  Eye,
  RotateCcw,
  User,
  CalendarDays,
  Hash,
} from "lucide-react";

const getLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return getLocalDate(date);
};

const emptyForm = {
  memberId: "",
  bookId: "",
  quantity: "1",
  dueDate: getDefaultDueDate(),
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Fetch all required data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionResponse, memberResponse, bookResponse] =
        await Promise.all([
          fetch("/api/transactions", { cache: "no-store" }),
          fetch("/api/members", { cache: "no-store" }),
          fetch("/api/books", { cache: "no-store" }),
        ]);

      const [transactionResult, memberResult, bookResult] =
        await Promise.all([
          transactionResponse.json(),
          memberResponse.json(),
          bookResponse.json(),
        ]);

      if (!transactionResponse.ok) {
        throw new Error(
          transactionResult.message || "Failed to load transactions."
        );
      }

      if (!memberResponse.ok) {
        throw new Error(
          memberResult.message || "Failed to load members."
        );
      }

      if (!bookResponse.ok) {
        throw new Error(
          bookResult.message || "Failed to load books."
        );
      }

      setTransactions(transactionResult.data || []);
      setMembers(memberResult.data || []);
      setBooks(bookResult.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Search and status filter
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        (transaction.member?.name || "")
          .toLowerCase()
          .includes(keyword) ||
        (transaction.member?.studentId || "")
          .toLowerCase()
          .includes(keyword) ||
        (transaction.book?.title || "")
          .toLowerCase()
          .includes(keyword) ||
        transaction.id.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All Status" ||
        transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  // Statistics
  const totalTransactions = transactions.length;

  const activeLoans = transactions.filter(
    (item) =>
      item.status === "Borrowed" || item.status === "Overdue"
  ).length;

  const returnedBooks = transactions.filter(
    (item) => item.status === "Returned"
  ).length;

  const overdueBooks = transactions.filter(
    (item) => item.status === "Overdue"
  ).length;

  // Open borrowing modal
  const openAddModal = () => {
    setForm({
      ...emptyForm,
      dueDate: getDefaultDueDate(),
    });

    setModalOpen(true);
  };

  // Create borrowing transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          dueDate: `${form.dueDate}T23:59:59`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create transaction."
        );
      }

      setModalOpen(false);
      setForm(emptyForm);

      await fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Return borrowed books
  const handleReturn = async (transaction) => {
    const confirmed = window.confirm(
      `Confirm return of "${transaction.book?.title}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/transactions/${transaction.id}`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to return book."
        );
      }

      setSelectedTransaction(null);
      await fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  // Format dates
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Borrowed":
        return "bg-blue-50 text-blue-700";

      case "Returned":
        return "bg-emerald-50 text-emerald-700";

      case "Overdue":
        return "bg-red-50 text-red-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const selectedBook = books.find(
    (book) => book.id === form.bookId
  );

  const selectedMember = members.find(
    (member) => member.id === form.memberId
  );

  const availableMembers = members.filter(
    (member) => member.status === "Active"
  );

  const availableBooks = books.filter(
    (book) => book.stock > 0
  );

  return (
    <div className="space-y-7">

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[2px] font-bold text-[#858c83]">
            LIBRARY OPERATIONS
          </p>

          <h2 className="text-2xl font-serif text-[#1d3028] mt-2">
            Transactions
          </h2>

          <p className="text-xs text-[#858c83] mt-2">
            Manage book borrowing, returns, and overdue records.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#214c3a] text-white px-5 py-3 rounded-md text-xs hover:bg-[#183c2d] transition"
        >
          <Plus size={16} />
          New Borrowing
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 text-xs">
          {error}

          <button
            onClick={fetchData}
            className="ml-3 underline font-semibold"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Transactions",
            value: totalTransactions,
            icon: ArrowRightLeft,
          },
          {
            label: "Active Loans",
            value: activeLoans,
            icon: BookOpen,
          },
          {
            label: "Returned Books",
            value: returnedBooks,
            icon: CheckCircle2,
          },
          {
            label: "Overdue Books",
            value: overdueBooks,
            icon: AlertTriangle,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white border border-[#e9e9e1] rounded-lg p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#858c83]">
                  {item.label}
                </p>

                <Icon size={18} className="text-[#557663]" />
              </div>

              <h3 className="text-2xl font-semibold text-[#1d3028] mt-4">
                {loading ? "—" : item.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Transactions Table */}
      <section className="bg-white border border-[#e9e9e1] rounded-lg">

        {/* Table Header */}
        <div className="p-5 md:p-6 border-b border-[#eeeeea]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm text-[#1d3028]">
                Transaction Records
              </h3>

              <p className="text-[11px] text-[#858c83] mt-1">
                Monitor all borrowing and return activities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              {/* Search */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92998f]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full sm:w-60 pl-9 pr-3 py-2.5 text-xs border border-[#e6e8df] rounded-md outline-none focus:border-[#557663]"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92998f]"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-44 appearance-none pl-9 pr-8 py-2.5 text-xs border border-[#e6e8df] rounded-md outline-none bg-white"
                >
                  <option>All Status</option>
                  <option>Borrowed</option>
                  <option>Overdue</option>
                  <option>Returned</option>
                </select>

                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#92998f]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1050px]">
            <thead className="bg-[#fafaf7]">
              <tr className="text-[10px] uppercase tracking-wider text-[#858c83]">
                <th className="px-6 py-4 font-semibold">
                  Transaction
                </th>

                <th className="px-5 py-4 font-semibold">
                  Member
                </th>

                <th className="px-5 py-4 font-semibold">
                  Book
                </th>

                <th className="px-5 py-4 font-semibold">
                  Borrow Date
                </th>

                <th className="px-5 py-4 font-semibold">
                  Due Date
                </th>

                <th className="px-5 py-4 font-semibold">
                  Status
                </th>

                <th className="px-5 py-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eeeeea]">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-xs text-[#858c83]"
                  >
                    Loading transactions from database...
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-[#fafaf7] transition"
                  >
                    {/* Transaction ID */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-[#1d3028]">
                        #{transaction.id.slice(-8).toUpperCase()}
                      </p>

                      <p className="text-[10px] text-[#858c83] mt-1">
                        {transaction.quantity} copy
                        {transaction.quantity > 1 ? "ies" : ""}
                      </p>
                    </td>

                    {/* Member */}
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-[#34483b]">
                        {transaction.member?.name || "Unknown"}
                      </p>

                      <p className="text-[10px] text-[#858c83] mt-1">
                        {transaction.member?.studentId || "-"}
                      </p>
                    </td>

                    {/* Book */}
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-[#34483b]">
                        {transaction.book?.title || "Unknown"}
                      </p>

                      <p className="text-[10px] text-[#858c83] mt-1">
                        {transaction.book?.author || "-"}
                      </p>
                    </td>

                    {/* Borrow Date */}
                    <td className="px-5 py-4 text-[11px] text-[#69756b]">
                      {formatDate(transaction.borrowDate)}
                    </td>

                    {/* Due Date */}
                    <td className="px-5 py-4 text-[11px] text-[#69756b]">
                      {formatDate(transaction.dueDate)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] px-2.5 py-1.5 rounded-full ${getStatusStyle(transaction.status)}`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setSelectedTransaction(transaction)
                          }
                          title="View details"
                          className="p-2 text-[#758277] hover:bg-[#edf1eb] rounded"
                        >
                          <Eye size={15} />
                        </button>

                        {(transaction.status === "Borrowed" ||
                          transaction.status === "Overdue") && (
                          <button
                            onClick={() => handleReturn(transaction)}
                            title="Return book"
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Empty State */}
          {!loading && filteredTransactions.length === 0 && (
            <div className="py-16 text-center">
              <ArrowRightLeft
                size={28}
                className="mx-auto text-[#aab4a9]"
              />

              <p className="text-sm font-semibold text-[#1d3028] mt-3">
                No transactions found
              </p>

              <p className="text-xs text-[#858c83] mt-1">
                Try another keyword or filter.
              </p>
            </div>
          )}
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-[#eeeeea] text-[10px] text-[#858c83]">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </section>

      {/* New Borrowing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between p-6 border-b border-[#eeeeea]">
              <div>
                <h3 className="font-serif text-xl text-[#1d3028]">
                  New Borrowing
                </h3>

                <p className="text-[11px] text-[#858c83] mt-1">
                  Register a new book borrowing transaction.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-[#f1f2ec] rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Member */}
              <div>
                <label className="block text-xs font-semibold text-[#34483b] mb-2">
                  Select Member
                </label>

                <select
                  required
                  value={form.memberId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      memberId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-3 text-xs border border-[#e6e8df] rounded-md outline-none bg-white focus:border-[#557663]"
                >
                  <option value="">Choose a member</option>

                  {availableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} — {member.studentId}
                    </option>
                  ))}
                </select>

                {availableMembers.length === 0 && (
                  <p className="text-[10px] text-red-500 mt-2">
                    No active members available.
                  </p>
                )}
              </div>

              {/* Book */}
              <div>
                <label className="block text-xs font-semibold text-[#34483b] mb-2">
                  Select Book
                </label>

                <select
                  required
                  value={form.bookId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bookId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-3 text-xs border border-[#e6e8df] rounded-md outline-none bg-white focus:border-[#557663]"
                >
                  <option value="">Choose a book</option>

                  {availableBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} — {book.stock} available
                    </option>
                  ))}
                </select>

                {availableBooks.length === 0 && (
                  <p className="text-[10px] text-red-500 mt-2">
                    No books are currently available.
                  </p>
                )}
              </div>

              {/* Selected Information */}
              {(selectedMember || selectedBook) && (
                <div className="bg-[#f7f7f2] rounded-md p-4 space-y-2">
                  {selectedMember && (
                    <p className="text-[11px] text-[#557663]">
                      Member:{" "}
                      <span className="font-semibold text-[#1d3028]">
                        {selectedMember.name}
                      </span>
                    </p>
                  )}

                  {selectedBook && (
                    <p className="text-[11px] text-[#557663]">
                      Available copies:{" "}
                      <span className="font-semibold text-[#1d3028]">
                        {selectedBook.stock}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-[#34483b] mb-2">
                  Borrowing Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  max={selectedBook?.stock || undefined}
                  required
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full px-3 py-3 text-xs border border-[#e6e8df] rounded-md outline-none focus:border-[#557663]"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-[#34483b] mb-2">
                  Return Due Date
                </label>

                <input
                  type="date"
                  required
                  min={getLocalDate(new Date())}
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-3 text-xs border border-[#e6e8df] rounded-md outline-none focus:border-[#557663]"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#eeeeea]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs border border-[#e6e8df] rounded-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !availableMembers.length ||
                    !availableBooks.length
                  }
                  className="px-5 py-2.5 text-xs bg-[#214c3a] text-white rounded-md hover:bg-[#183c2d] disabled:opacity-50"
                >
                  {saving ? "Processing..." : "Confirm Borrowing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl text-[#1d3028]">
                  Transaction Details
                </h3>

                <p className="text-[10px] text-[#858c83] mt-1">
                  #{selectedTransaction.id.toUpperCase()}
                </p>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-[#f1f2ec] rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">

              {/* Member Information */}
              <div className="bg-[#f7f7f2] rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User size={15} className="text-[#557663]" />

                  <p className="text-xs font-semibold text-[#1d3028]">
                    Member Information
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#1d3028]">
                  {selectedTransaction.member?.name || "Unknown"}
                </p>

                <p className="text-[11px] text-[#858c83] mt-1">
                  {selectedTransaction.member?.studentId || "-"}
                </p>

                <p className="text-[11px] text-[#858c83] mt-1">
                  {selectedTransaction.member?.email || "-"}
                </p>
              </div>

              {/* Book Information */}
              <div className="bg-[#f7f7f2] rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={15} className="text-[#557663]" />

                  <p className="text-xs font-semibold text-[#1d3028]">
                    Book Information
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#1d3028]">
                  {selectedTransaction.book?.title || "Unknown"}
                </p>

                <p className="text-[11px] text-[#858c83] mt-1">
                  {selectedTransaction.book?.author || "-"}
                </p>

                <p className="text-[11px] text-[#858c83] mt-1">
                  Quantity: {selectedTransaction.quantity} copies
                </p>
              </div>

              {/* Transaction Dates */}
              {[
                {
                  label: "Borrow Date",
                  value: formatDate(selectedTransaction.borrowDate),
                  icon: CalendarDays,
                },
                {
                  label: "Due Date",
                  value: formatDate(selectedTransaction.dueDate),
                  icon: Clock,
                },
                {
                  label: "Return Date",
                  value: formatDate(selectedTransaction.returnDate),
                  icon: RotateCcw,
                },
                {
                  label: "Transaction ID",
                  value: selectedTransaction.id,
                  icon: Hash,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 border-b border-[#eeeeea] pb-3"
                  >
                    <div className="flex items-center gap-2 text-[#858c83]">
                      <Icon size={14} />
                      <span className="text-[11px]">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-[#1d3028] text-right break-all">
                      {item.value}
                    </span>
                  </div>
                );
              })}

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858c83]">
                  Current Status
                </span>

                <span
                  className={`text-[10px] px-3 py-1.5 rounded-full ${getStatusStyle(selectedTransaction.status)}`}
                >
                  {selectedTransaction.status}
                </span>
              </div>
            </div>

            {/* Return Action */}
            {(selectedTransaction.status === "Borrowed" ||
              selectedTransaction.status === "Overdue") && (
              <button
                onClick={() => handleReturn(selectedTransaction)}
                className="w-full mt-6 py-3 bg-[#214c3a] text-white rounded-md text-xs hover:bg-[#183c2d] transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                Confirm Book Return
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

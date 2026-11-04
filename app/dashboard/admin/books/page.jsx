
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  BookOpen,
  Library,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  Filter,
  ChevronDown,
  Eye,
} from "lucide-react";

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  category: "Technology",
  publisher: "",
  year: "",
  stock: "",
};

const categories = [
  "Technology",
  "Fiction",
  "Finance",
  "Self Development",
  "Philosophy",
  "Education",
  "History",
];

export default function BooksPage() {
const [books, setBooks] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

const [search, setSearch] = useState("");
const [categoryFilter, setCategoryFilter] = useState("All Categories");
const [statusFilter, setStatusFilter] = useState("All Status");
const [modalOpen, setModalOpen] = useState(false);
const [editingBook, setEditingBook] = useState(null);
const [selectedBook, setSelectedBook] = useState(null);
const [form, setForm] = useState(emptyForm);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword) ||
        book.isbn.includes(keyword);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        book.category === categoryFilter;

      const status =
        book.stock === 0
          ? "Unavailable"
          : book.stock <= 5
            ? "Low Stock"
            : "Available";

      const matchesStatus =
        statusFilter === "All Status" || status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [books, search, categoryFilter, statusFilter]);

  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, book) => sum + book.stock, 0);
  const borrowedCopies = books.reduce(
    (sum, book) => sum + book.borrowed,
    0
  );
  const lowStock = books.filter(
    (book) => book.stock > 0 && book.stock <= 5
  ).length;

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/books", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data buku.");
      }

      setBooks(result.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const openAddModal = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher,
      year: String(book.year),
      stock: String(book.stock),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const bookData = {
        ...form,
        year: Number(form.year),
        stock: Number(form.stock),
      };

      const url = editingBook
        ? `/api/books/${editingBook.id}`
        : "/api/books";

      const response = await fetch(url, {
        method: editingBook ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan buku.");
      }

      await fetchBooks();

      setModalOpen(false);
      setForm(emptyForm);
      setEditingBook(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus buku ini?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus buku.");
      }

      await fetchBooks();
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatus = (stock) => {
    if (stock === 0) {
      return {
        label: "Unavailable",
        style: "bg-red-50 text-red-600",
      };
    }

    if (stock <= 5) {
      return {
        label: "Low Stock",
        style: "bg-amber-50 text-amber-700",
      };
    }

    return {
      label: "Available",
      style: "bg-emerald-50 text-emerald-700",
    };
  };

  return (
    <div className="space-y-7">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[2px] font-bold text-[#858c83]">
            LIBRARY MANAGEMENT
          </p>
          <h2 className="text-2xl font-serif text-[#1d3028] mt-2">
            Book Collection
          </h2>
          <p className="text-xs text-[#858c83] mt-2">
            Manage and organize your library book collection.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#214c3a] text-white px-5 py-3 rounded-md text-xs hover:bg-[#183c2d] transition"
        >
          <Plus size={16} />
          Add New Book
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Book Titles",
            value: totalBooks,
            icon: BookOpen,
          },
          {
            label: "Total Copies",
            value: totalCopies,
            icon: Library,
          },
          {
            label: "Currently Borrowed",
            value: borrowedCopies,
            icon: Eye,
          },
          {
            label: "Low Stock",
            value: lowStock,
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
                <p className="text-xs text-[#858c83]">{item.label}</p>
                <Icon size={18} className="text-[#557663]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1d3028] mt-4">
                {item.value}
              </h3>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 text-xs">
          {error}
          <button
            onClick={fetchBooks}
            className="ml-3 underline font-semibold"
          >
            Try again
          </button>
        </div>
      )}

      {/* Collection Table */}
      <section className="bg-white border border-[#e9e9e1] rounded-lg">
        <div className="p-5 md:p-6 border-b border-[#eeeeea]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm text-[#1d3028]">
                All Books
              </h3>
              <p className="text-[11px] text-[#858c83] mt-1">
                Browse and manage your library collection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92998f]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search books..."
                  className="w-full sm:w-56 pl-9 pr-3 py-2.5 text-xs border border-[#e6e8df] rounded-md outline-none focus:border-[#557663]"
                />
              </div>

              <div className="relative">
                <Filter
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92998f]"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-44 appearance-none pl-9 pr-8 py-2.5 text-xs border border-[#e6e8df] rounded-md outline-none bg-white"
                >
                  <option>All Categories</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#92998f]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 text-xs border border-[#e6e8df] rounded-md outline-none bg-white"
              >
                <option>All Status</option>
                <option>Available</option>
                <option>Low Stock</option>
                <option>Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[850px]">
            <thead className="bg-[#fafaf7]">
              <tr className="text-[10px] uppercase tracking-wider text-[#858c83]">
                <th className="px-6 py-4 font-semibold">Book Information</th>
                <th className="px-5 py-4 font-semibold">ISBN</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Stock</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eeeeea]">

              {loading ? filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-xs text-[#858c83]">
                    Loading books from database...
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const status = getStatus(book.stock);
                  return (
                    <tr
                      key={book.id}
                      className="hover:bg-[#fafaf7] transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-[#e7ede5] text-[#557663] rounded flex items-center justify-center shrink-0">
                            <BookOpen size={19} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#1d3028]">
                              {book.title}
                            </p>
                            <p className="text-[10px] text-[#858c83] mt-1">
                              {book.author} · {book.year}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[11px] text-[#69756b]">
                        {book.isbn}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[10px] bg-[#f1f3ed] text-[#557663] px-2.5 py-1.5 rounded">
                          {book.category}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-[#1d3028]">
                          {book.stock} copies
                        </p>
                        <p className="text-[10px] text-[#858c83] mt-1">
                          {book.borrowed} borrowed
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-[10px] px-2.5 py-1.5 rounded-full ${status.style}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedBook(book)}
                            title="View details"
                            className="p-2 text-[#758277] hover:bg-[#edf1eb] rounded"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(book)}
                            title="Edit book"
                            className="p-2 text-[#758277] hover:bg-[#edf1eb] rounded"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            title="Delete book"
                            className="p-2 text-red-400 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {filteredBooks.length === 0 && (
            <div className="py-16 text-center">
              <BookOpen
                size={28}
                className="mx-auto text-[#aab4a9]"
              />
              <p className="text-sm font-semibold text-[#1d3028] mt-3">
                No books found
              </p>
              <p className="text-xs text-[#858c83] mt-1">
                Try another keyword or filter.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#eeeeea] text-[10px] text-[#858c83]">
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </section>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#eeeeea]">
              <div>
                <h3 className="font-serif text-xl text-[#1d3028]">
                  {editingBook ? "Edit Book" : "Add New Book"}
                </h3>
                <p className="text-[11px] text-[#858c83] mt-1">
                  Fill in the book information below.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-[#f1f2ec] rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { name: "title", label: "Book Title", placeholder: "Enter book title" },
                { name: "author", label: "Author", placeholder: "Enter author name" },
                { name: "isbn", label: "ISBN", placeholder: "Enter ISBN number" },
                { name: "publisher", label: "Publisher", placeholder: "Enter publisher" },
                { name: "year", label: "Publication Year", placeholder: "e.g. 2024", type: "number" },
                { name: "stock", label: "Total Stock", placeholder: "e.g. 10", type: "number" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-[#34483b] mb-2">
                    {field.label}
                  </label>
                  <input
                    required
                    type={field.type || "text"}
                    min={field.type === "number" ? 0 : undefined}
                    value={form[field.name]}
                    onChange={(e) =>
                      setForm({ ...form, [field.name]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className="w-full px-3 py-3 text-xs border border-[#e6e8df] rounded-md outline-none focus:border-[#557663]"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-[#34483b] mb-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-3 py-3 text-xs border border-[#e6e8df] rounded-md outline-none bg-white"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>

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
                  disabled={saving}
                  className="px-5 py-2.5 text-xs bg-[#214c3a] text-white rounded-md hover:bg-[#183c2d] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingBook
                      ? "Save Changes"
                      : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-[#1d3028]">
                Book Details
              </h3>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 hover:bg-[#f1f2ec] rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-20 bg-[#e7ede5] text-[#557663] rounded grid place-items-center">
                <BookOpen size={28} />
              </div>
              <div>
                <h4 className="font-semibold text-[#1d3028]">
                  {selectedBook.title}
                </h4>
                <p className="text-xs text-[#858c83] mt-1">
                  {selectedBook.author}
                </p>
                <p className="text-[10px] text-[#858c83] mt-2">
                  {selectedBook.id}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                ["ISBN", selectedBook.isbn],
                ["Publisher", selectedBook.publisher],
                ["Publication Year", selectedBook.year],
                ["Category", selectedBook.category],
                ["Available Stock", selectedBook.stock],
                ["Borrowed Copies", selectedBook.borrowed],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-[#eeeeea] pb-3"
                >
                  <span className="text-[#858c83]">{label}</span>
                  <span className="font-semibold text-[#1d3028] text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

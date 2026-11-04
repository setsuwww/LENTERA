
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  BookOpen,
  Library,
  Bookmark,
  SlidersHorizontal,
  RefreshCw,
  BookMarked,
  X,
} from "lucide-react";

export default function StudentBooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search,
        category,
        availability,
      });

      const response = await fetch(
        `/api/student/books?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setBooks(result.data || []);
      setCategories(result.categories || []);
    } catch (err) {
      setError(err.message || "Gagal mengambil data buku.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, category, availability]);

  const availableBooks = books.filter((book) => book.stock > 0);
  const unavailableBooks = books.filter((book) => book.stock === 0);

  const totalCopies = books.reduce(
    (total, book) => total + book.stock + book.borrowed,
    0
  );

  const stats = [
    {
      label: "Books Found",
      value: books.length,
      icon: BookOpen,
    },
    {
      label: "Available Books",
      value: availableBooks.length,
      icon: BookMarked,
    },
    {
      label: "Unavailable",
      value: unavailableBooks.length,
      icon: Bookmark,
    },
    {
      label: "Total Copies",
      value: totalCopies,
      icon: Library,
    },
  ];

  return (
    <div className="space-y-8">
      {/* INTRO */}
      <section>
        <span className="text-[10px] font-bold tracking-[2px] text-[#8b958b]">
          LIBRARY COLLECTION
        </span>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-3">
          <div>
            <h1 className="font-serif text-3xl text-[#1d3028]">
              Explore Books
            </h1>

            <p className="text-sm text-[#858c83] mt-2">
              Discover books and explore your next learning journey.
            </p>
          </div>

          <button
            onClick={fetchBooks}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-semibold text-[#214c3a] hover:opacity-70"
          >
            <RefreshCw size={14} />
            Refresh Catalog
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
              <div className="flex justify-between items-center">
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

      {/* FILTERS */}
      <section className="bg-white border border-[#e9eae2] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={16} className="text-[#214c3a]" />

          <h2 className="text-sm font-semibold text-[#1d3028]">
            Find Your Book
          </h2>
        </div>

        <div className="grid md:grid-cols-[1fr_220px_200px] gap-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929a91]"
            />

            <input
              type="text"
              placeholder="Search title, author, ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-lg bg-[#f7f7f2] border border-[#e9eae2] text-sm outline-none focus:border-[#214c3a]"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-12 px-4 rounded-lg bg-[#f7f7f2] border border-[#e9eae2] text-sm outline-none focus:border-[#214c3a]"
          >
            <option value="all">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="h-12 px-4 rounded-lg bg-[#f7f7f2] border border-[#e9eae2] text-sm outline-none focus:border-[#214c3a]"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {(search || category !== "all" || availability !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setCategory("all");
              setAvailability("all");
            }}
            className="flex items-center gap-1 text-xs text-[#858c83] hover:text-[#214c3a] mt-4"
          >
            <X size={13} />
            Clear filters
          </button>
        )}
      </section>

      {/* BOOK COLLECTION */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-serif text-xl text-[#1d3028]">
              Library Collection
            </h2>

            <p className="text-xs text-[#858c83] mt-1">
              {books.length} books found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 rounded-xl bg-white border border-[#e9eae2] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchBooks}
              className="mt-3 text-xs font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white border border-[#e9eae2] rounded-xl py-16 text-center">
            <BookOpen
              size={36}
              className="mx-auto text-[#aab5a8]"
            />

            <h3 className="font-serif text-lg text-[#1d3028] mt-4">
              No books found
            </h3>

            <p className="text-sm text-[#858c83] mt-2">
              Try another keyword or adjust your filters.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {books.map((book) => (
              <article
                key={book.id}
                className="bg-white border border-[#e9eae2] rounded-xl p-5 hover:border-[#b9c9b9] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-14 rounded-lg bg-[#e5ece3] grid place-items-center">
                    <BookOpen
                      size={22}
                      className="text-[#214c3a]"
                    />
                  </div>

                  <span
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
                      book.stock > 0
                        ? "bg-[#e6f0e5] text-[#416b48]"
                        : "bg-[#fce9e6] text-[#b65b4e]"
                    }`}
                  >
                    {book.stock > 0 ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="mt-5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#81917f]">
                    {book.category}
                  </span>

                  <h3 className="font-serif text-xl leading-snug text-[#1d3028] mt-2">
                    {book.title}
                  </h3>

                  <p className="text-sm text-[#858c83] mt-2">
                    by {book.author}
                  </p>
                </div>

                <div className="border-t border-[#eef0e9] mt-5 pt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#858c83]">Publisher</span>
                    <span className="text-[#1d3028] font-medium text-right">
                      {book.publisher}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#858c83]">Published</span>
                    <span className="text-[#1d3028] font-medium">
                      {book.year}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#858c83]">ISBN</span>
                    <span className="text-[#1d3028] font-medium">
                      {book.isbn}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs pt-2">
                    <span className="text-[#858c83]">
                      Available copies
                    </span>

                    <span className="font-bold text-[#214c3a]">
                      {book.stock} copies
                    </span>
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


"use client";

import { useEffect, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X, Layers3, BookOpen, Hash,
} from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);
      setCategories(result.data || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openModal(category = null) {
    setEditing(category);
    setForm({
      name: category?.name || "",
      description: category?.description || "",
    });
    setModal(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(
        editing ? `/api/categories/${editing.id}` : "/api/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setModal(false);
      await loadCategories();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      await loadCategories();
    } catch (error) {
      alert(error.message);
    }
  }

  const filtered = categories.filter((category) =>
    `${category.name} ${category.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalBooks = categories.reduce(
    (sum, category) => sum + category.bookCount,
    0
  );

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Categories", value: categories.length, icon: Layers3 },
          { label: "Books Classified", value: totalBooks, icon: BookOpen },
          { label: "Empty Categories", value: categories.filter((c) => !c.bookCount).length, icon: Hash },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#e5e7df] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#89948b]">{item.label}</p>
              <item.icon size={19} className="text-[#78977f]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#1d3028]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e5e7df] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#edf0e9] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-[#1d3028]">Category Management</h2>
            <p className="mt-1 text-sm text-[#89948b]">
              Organize and manage your library collections.
            </p>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#214c3a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#183b2c]"
          >
            <Plus size={17} /> Add Category
          </button>
        </div>

        <div className="border-b border-[#edf0e9] p-5">
          <div className="relative max-w-md">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89948b]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-xl border border-[#e5e7df] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#78977f]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafbf8] text-xs uppercase tracking-wide text-[#89948b]">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Books</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0e9]">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-[#89948b]">Loading categories...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-[#89948b]">No categories found.</td></tr>
              ) : filtered.map((category) => (
                <tr key={category.id} className="hover:bg-[#fafbf8]">
                  <td className="px-6 py-4 font-medium text-[#1d3028]">{category.name}</td>
                  <td className="max-w-xs px-6 py-4 text-[#89948b]">
                    {category.description || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-[#eaf0e9] px-3 py-1 text-xs font-medium text-[#214c3a]">
                      {category.bookCount} books
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(category)} className="rounded-lg p-2 text-[#78977f] hover:bg-[#edf3ed]" aria-label="Edit category">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(category)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete category">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1d3028]">
                {editing ? "Edit Category" : "Add Category"}
              </h2>
              <button type="button" onClick={() => setModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Category Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Technology"
                className="w-full rounded-xl border border-[#e5e7df] px-4 py-3 text-sm outline-none focus:border-[#78977f]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Description</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe this category..."
                className="w-full resize-none rounded-xl border border-[#e5e7df] px-4 py-3 text-sm outline-none focus:border-[#78977f]"
              />
            </div>

            <button
              disabled={saving}
              className="w-full rounded-xl bg-[#214c3a] py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Category"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

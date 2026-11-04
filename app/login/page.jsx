
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      router.replace(`/dashboard/${data.user.role}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid md:grid-cols-2 bg-[#f7f7f2]">
      {/* BRAND SECTION */}
      <section className="hidden md:flex relative overflow-hidden bg-[#214c3a] text-white p-16 lg:p-24 items-center">
        <div className="absolute w-[550px] h-[550px] rounded-full border border-white/10 -bottom-64 -right-48" />
        <div className="absolute w-[350px] h-[350px] rounded-full border border-white/10 -bottom-40 -right-28" />

        <div className="relative z-10 max-w-lg">
          <div className="w-14 h-14 border border-white/40 grid place-items-center text-3xl font-serif mb-24">
            L.
          </div>

          <span className="text-[10px] tracking-[3px] text-[#c8d5c9] font-bold">
            CAMPUS LIBRARY SYSTEM
          </span>

          <h1 className="font-serif text-6xl lg:text-7xl leading-tight mt-6 mb-7">
            Knowledge
            <br />
            begins <span className="text-[#d9b878] italic">here.</span>
          </h1>

          <p className="text-sm text-[#c8d5c9] leading-8 max-w-sm">
            A smarter way to explore, discover, and manage
            your academic resources.
          </p>

          <div className="flex gap-7 mt-24 text-[10px] tracking-widest text-[#c8d5c9]">
            <span>01 — Discover</span>
            <span>02 — Learn</span>
            <span>03 — Grow</span>
          </div>
        </div>
      </section>

      {/* LOGIN SECTION */}
      <section className="flex items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-[410px]">
          <div className="md:hidden w-12 h-12 bg-[#214c3a] text-white grid place-items-center font-serif text-2xl mb-12">
            L.
          </div>

          <span className="text-[10px] font-bold tracking-[2.5px] text-[#858c83]">
            WELCOME BACK
          </span>

          <h2 className="font-serif text-3xl md:text-4xl text-[#1d3028] mt-4 mb-3">
            Sign in to Lentera
          </h2>

          <p className="text-sm text-[#858c83] leading-7 mb-10">
            Access your library account and continue your
            learning journey.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold mb-3">
                Account Type
              </label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full h-13 px-4 bg-white border border-[#e6e8df] rounded-md text-sm outline-none focus:border-[#214c3a]"
              >
                <option value="student">Student</option>
                <option value="staff">Library Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-3">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="name@university.ac.id"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full h-13 px-4 bg-white border border-[#e6e8df] rounded-md text-sm outline-none focus:border-[#214c3a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-3">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full h-13 px-4 bg-white border border-[#e6e8df] rounded-md text-sm outline-none focus:border-[#214c3a]"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#214c3a] hover:bg-[#163b2b] text-white rounded-md px-5 flex items-center justify-between text-sm font-bold transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
              <span className="text-xl">→</span>
            </button>
          </form>

          <div className="flex justify-between border-t border-[#e6e8df] mt-16 pt-5 text-[9px] tracking-widest text-[#858c83]">
            <span>LENTERA LIBRARY SYSTEM</span>
            <span>© 2026</span>
          </div>
        </div>
      </section>
    </main>
  );
}

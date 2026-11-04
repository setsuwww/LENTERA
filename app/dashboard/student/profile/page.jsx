
"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Hash,
  CalendarDays,
  ShieldCheck,
  Pencil,
  Save,
  X,
  RefreshCw,
  BookOpen,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/student/profile");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setProfile(result.data);
      setPhone(result.data.phone || "");

    } catch (err) {
      setError(err.message || "Gagal mengambil profil mahasiswa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setProfile(result.data);
      setPhone(result.data.phone || "");
      setEditing(false);
      setSuccess("Your profile has been updated successfully.");

    } catch (err) {
      setError(err.message || "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setPhone(profile?.phone || "");
    setEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-10 w-64 bg-[#e7e9e1] rounded" />
        <div className="h-48 bg-white border border-[#e9eae2] rounded-xl" />
        <div className="h-64 bg-white border border-[#e9eae2] rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6">
        <p className="text-sm text-red-600">
          {error || "Student profile not found."}
        </p>

        <button
          onClick={fetchProfile}
          className="mt-3 text-xs font-semibold text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section>
        <span className="text-[10px] font-bold tracking-[2px] text-[#8b958b]">
          ACCOUNT SETTINGS
        </span>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3">
          <div>
            <h1 className="font-serif text-3xl text-[#1d3028]">
              My Profile
            </h1>

            <p className="text-sm text-[#858c83] mt-2">
              Manage your personal and academic information.
            </p>
          </div>

          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setSuccess("");
                setError("");
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#214c3a] text-white text-xs font-semibold hover:bg-[#163b2b] transition"
            >
              <Pencil size={14} />
              Edit Profile
            </button>
          )}
        </div>
      </section>

      {/* FEEDBACK */}
      {success && (
        <div className="bg-[#e6f0e5] border border-[#d4e4d2] text-[#416b48] text-sm rounded-lg p-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {/* PROFILE BANNER */}
      <section className="bg-[#214c3a] rounded-xl p-7 md:p-9 text-white relative overflow-hidden">
        <div className="absolute w-64 h-64 border border-white/10 rounded-full -right-20 -top-28" />
        <div className="absolute w-44 h-44 border border-white/10 rounded-full -right-5 -top-16" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-xl bg-white/10 border border-white/20 grid place-items-center">
            <UserRound size={38} />
          </div>

          <div>
            <span className="text-[10px] tracking-[2px] text-[#c8d5c9] font-bold">
              STUDENT ACCOUNT
            </span>

            <h2 className="font-serif text-2xl md:text-3xl mt-2">
              {profile.name}
            </h2>

            <p className="text-sm text-[#c8d5c9] mt-1">
              {profile.studentId}
            </p>
          </div>

          <div className="sm:ml-auto">
            <span
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-[10px] font-bold ${
                profile.status === "Active"
                  ? "bg-white/15 text-white"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <ShieldCheck size={13} />
              {profile.status}
            </span>
          </div>
        </div>
      </section>

      {/* PERSONAL INFORMATION */}
      <section className="bg-white border border-[#e9eae2] rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-3 border-b border-[#eef0e9] pb-5 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#e5ece3] grid place-items-center">
            <UserRound size={19} className="text-[#214c3a]" />
          </div>

          <div>
            <h2 className="font-serif text-xl text-[#1d3028]">
              Personal Information
            </h2>

            <p className="text-xs text-[#858c83] mt-1">
              Your registered personal details.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-7">
            {/* NAME */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#68776b] mb-3">
                <UserRound size={14} />
                Full Name
              </label>

              <input
                value={profile.name}
                readOnly
                className="w-full h-12 px-4 bg-[#f7f7f2] border border-[#e9eae2] rounded-lg text-sm text-[#526052] outline-none"
              />
            </div>

            {/* STUDENT ID */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#68776b] mb-3">
                <Hash size={14} />
                Student ID
              </label>

              <input
                value={profile.studentId}
                readOnly
                className="w-full h-12 px-4 bg-[#f7f7f2] border border-[#e9eae2] rounded-lg text-sm text-[#526052] outline-none"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#68776b] mb-3">
                <Mail size={14} />
                Email Address
              </label>

              <input
                value={profile.email}
                readOnly
                className="w-full h-12 px-4 bg-[#f7f7f2] border border-[#e9eae2] rounded-lg text-sm text-[#526052] outline-none"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#68776b] mb-3">
                <Phone size={14} />
                Phone Number
              </label>

              <input
                type="tel"
                value={editing ? phone : profile.phone || ""}
                onChange={(e) => setPhone(e.target.value)}
                readOnly={!editing}
                placeholder="Enter your phone number"
                className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition ${
                  editing
                    ? "bg-white border-[#214c3a] focus:ring-2 focus:ring-[#214c3a]/10"
                    : "bg-[#f7f7f2] border-[#e9eae2] text-[#526052]"
                }`}
              />
            </div>
          </div>

          {editing && (
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#eef0e9] mt-8 pt-6">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 rounded-lg border border-[#e9eae2] text-[#68776b] text-xs font-semibold hover:bg-[#f7f7f2]"
              >
                <X size={14} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#214c3a] text-white text-xs font-semibold hover:bg-[#163b2b] disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </section>

      {/* ACADEMIC INFORMATION */}
      <section className="bg-white border border-[#e9eae2] rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-3 border-b border-[#eef0e9] pb-5 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#e5ece3] grid place-items-center">
            <GraduationCap size={20} className="text-[#214c3a]" />
          </div>

          <div>
            <h2 className="font-serif text-xl text-[#1d3028]">
              Academic Information
            </h2>

            <p className="text-xs text-[#858c83] mt-1">
              Your university registration details.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-7">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#68776b] mb-3">
              <Building2 size={14} />
              Department
            </label>

            <p className="text-sm text-[#1d3028] font-medium">
              {profile.department}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#68776b] mb-3">
              <GraduationCap size={14} />
              Study Program
            </label>

            <p className="text-sm text-[#1d3028] font-medium">
              {profile.studyProgram}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#68776b] mb-3">
              <CalendarDays size={14} />
              Registration Date
            </label>

            <p className="text-sm text-[#1d3028] font-medium">
              {formatDate(profile.createdAt)}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#68776b] mb-3">
              <ShieldCheck size={14} />
              Membership Status
            </label>

            <p
              className={`text-sm font-semibold ${
                profile.status === "Active"
                  ? "text-[#416b48]"
                  : "text-red-600"
              }`}
            >
              {profile.status}
            </p>
          </div>
        </div>
      </section>

      {/* ACCOUNT NOTE */}
      <section className="flex gap-4 bg-[#edf1e9] border border-[#dfe7dc] rounded-xl p-5">
        <BookOpen
          size={20}
          className="text-[#416b48] shrink-0 mt-0.5"
        />

        <div>
          <h3 className="text-sm font-semibold text-[#214c3a]">
            Keep Your Information Updated
          </h3>

          <p className="text-xs text-[#68776b] leading-6 mt-1">
            Make sure your contact number is up to date.
            For changes to your student ID, email, department,
            or study program, please contact the library administrator.
          </p>
        </div>
      </section>
    </div>
  );
}

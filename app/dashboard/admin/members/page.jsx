
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Pencil,
  Trash2,
  X,
  Filter,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  CalendarDays,
  Lock,
} from "lucide-react";

const emptyForm = {
  studentId: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  department: "",
  studyProgram: "",
  status: "Active",
};

const departments = [
  "Faculty of Engineering",
  "Faculty of Economics",
  "Faculty of Computer Science",
  "Faculty of Education",
  "Faculty of Social Sciences",
  "Faculty of Law",
  "Faculty of Medicine",
];

export default function StudentsPage() {
  const [members, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All Departments");
  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Fetch members from database
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/members", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to retrieve members."
        );
      }

      setStudents(result.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter members
  const filteredStudents = useMemo(() => {
    return members.filter((member) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        member.name.toLowerCase().includes(keyword) ||
        member.studentId.toLowerCase().includes(keyword) ||
        member.email.toLowerCase().includes(keyword);

      const matchesDepartment =
        departmentFilter === "All Departments" ||
        member.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        member.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [members, search, departmentFilter, statusFilter]);

  // Statistics
  const totalStudents = members.length;

  const activeStudents = members.filter(
    (member) => member.status === "Active"
  ).length;

  const inactiveStudents = members.filter(
    (member) => member.status === "Inactive"
  ).length;

  const newRegistrations = members.filter((member) => {
    const registeredDate = new Date(member.createdAt);
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return registeredDate >= thirtyDaysAgo;
  }).length;

  // Add member
  const openAddModal = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Edit member
  const openEditModal = (member) => {
    setEditingMember(member);

    setForm({
      studentId: member.studentId,
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      password: member.password,
      department: member.department,
      studyProgram: member.studyProgram,
      status: member.status,
    });

    setModalOpen(true);
  };

  // Submit member
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const url = editingMember
        ? `/api/members/${editingMember.id}`
        : "/api/members";

      const response = await fetch(url, {
        method: editingMember ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save member."
        );
      }

      await fetchStudents();

      setModalOpen(false);
      setEditingMember(null);
      setForm(emptyForm);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete member
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete member."
        );
      }

      if (selectedMember?.id === id) {
        setSelectedMember(null);
      }

      await fetchStudents();
    } catch (error) {
      alert(error.message);
    }
  };

  // Status badge
  const getStatus = (status) => {
    if (status === "Active") {
      return "bg-emerald-50 text-emerald-700";
    }

    return "bg-red-50 text-red-600";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const availableDepartments = [
    ...new Set([
      ...departments,
      ...members.map((member) => member.department),
    ]),
  ];

  return (
    <div className="space-y-7">

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[2px] font-bold text-[#858c83]">
            LIBRARY MANAGEMENT
          </p>

          <h2 className="text-2xl font-serif text-[#1d3028] mt-2">
            Students
          </h2>

          <p className="text-xs text-[#858c83] mt-2">
            Manage registered students and library memberships.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#214c3a] text-white px-5 py-3 rounded-md text-xs hover:bg-[#183c2d] transition"
        >
          <Plus size={16} />
          Add New Member
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 text-xs">
          {error}

          <button
            onClick={fetchStudents}
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
            label: "Total Students",
            value: totalStudents,
            icon: Users,
          },
          {
            label: "Active Students",
            value: activeStudents,
            icon: UserCheck,
          },
          {
            label: "Inactive Students",
            value: inactiveStudents,
            icon: UserX,
          },
          {
            label: "New Registrations",
            value: newRegistrations,
            icon: UserPlus,
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

      {/* Students Table */}
      <section className="bg-white border border-[#e9e9e1] rounded-lg">

        {/* Table Header */}
        <div className="p-5 md:p-6 border-b border-[#eeeeea]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm text-[#1d3028]">
                Registered Students
              </h3>

              <p className="text-[11px] text-[#858c83] mt-1">
                Browse and manage registered library members.
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
                  placeholder="Search members..."
                  className="w-full sm:w-56 pl-9 pr-3 py-2.5 text-xs border border-[#e6e8df] rounded-md outline-none focus:border-[#557663]"
                />
              </div>

              {/* Department Filter */}
              <div className="relative">
                <Filter
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92998f]"
                />

                <select
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(e.target.value)
                  }
                  className="w-full sm:w-48 appearance-none pl-9 pr-8 py-2.5 text-xs border border-[#e6e8df] rounded-md outline-none bg-white"
                >
                  <option>All Departments</option>

                  {availableDepartments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#92998f]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 text-xs border border-[#e6e8df] rounded-md outline-none bg-white"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[950px]">
            <thead className="bg-[#fafaf7]">
              <tr className="text-[10px] uppercase tracking-wider text-[#858c83]">
                <th className="px-6 py-4 font-semibold">
                  Member Information
                </th>

                <th className="px-5 py-4 font-semibold">
                  Student ID
                </th>

                <th className="px-5 py-4 font-semibold">
                  Department
                </th>

                <th className="px-5 py-4 font-semibold">
                  Registered
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
                    colSpan={6}
                    className="text-center py-12 text-xs text-[#858c83]"
                  >
                    Loading members from database...
                  </td>
                </tr>
              ) : (
                filteredStudents.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-[#fafaf7] transition"
                  >
                    {/* Member Information */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#e7ede5] text-[#557663] flex items-center justify-center shrink-0">
                          <Users size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-[#1d3028]">
                            {member.name}
                          </p>

                          <p className="text-[10px] text-[#858c83] mt-1">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="px-5 py-4 text-[11px] font-medium text-[#69756b]">
                      {member.studentId}
                    </td>

                    {/* Department */}
                    <td className="px-5 py-4">
                      <p className="text-[11px] text-[#34483b]">
                        {member.department}
                      </p>

                      <p className="text-[10px] text-[#858c83] mt-1">
                        {member.studyProgram}
                      </p>
                    </td>

                    {/* Registration Date */}
                    <td className="px-5 py-4 text-[11px] text-[#69756b]">
                      {formatDate(member.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] px-2.5 py-1.5 rounded-full ${getStatus(member.status)}`}
                      >
                        {member.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          title="View details"
                          className="p-2 text-[#758277] hover:bg-[#edf1eb] rounded"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          onClick={() => openEditModal(member)}
                          title="Edit member"
                          className="p-2 text-[#758277] hover:bg-[#edf1eb] rounded"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(member.id)}
                          title="Delete member"
                          className="p-2 text-red-400 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Empty State */}
          {!loading && filteredStudents.length === 0 && (
            <div className="py-16 text-center">
              <Users
                size={28}
                className="mx-auto text-[#aab4a9]"
              />

              <p className="text-sm font-semibold text-[#1d3028] mt-3">
                No members found
              </p>

              <p className="text-xs text-[#858c83] mt-1">
                Try another keyword or filter.
              </p>
            </div>
          )}
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-[#eeeeea] text-[10px] text-[#858c83]">
          Showing {filteredStudents.length} of {members.length} members
        </div>
      </section>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between p-6 border-b border-[#eeeeea]">
              <div>
                <h3 className="font-serif text-xl text-[#1d3028]">
                  {editingMember ? "Edit Member" : "Add New Member"}
                </h3>

                <p className="text-[11px] text-[#858c83] mt-1">
                  Fill in the member information below.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {[
                  {
                    name: "studentId",
                    label: "Student ID / NIM",
                    placeholder: "Enter student ID",
                  },
                  {
                    name: "name",
                    label: "Full Name",
                    placeholder: "Enter full name",
                  },
                  {
                    name: "email",
                    label: "Email Address",
                    placeholder: "student@university.ac.id",
                    type: "email",
                  },
                  {
                    name: "phone",
                    label: "Phone Number",
                    placeholder: "Enter phone number",
                  },
                  {
                    name: "password",
                    label: "Password",
                    placeholder: "Enter password",
                    type: "password",
                  },
                  {
                    name: "studyProgram",
                    label: "Study Program",
                    placeholder: "e.g. Informatics Engineering",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold text-[#34483b] mb-2">
                      {field.label}
                    </label>

                    <input
                      required={field.name !== "phone"}
                      type={field.type || "text"}
                      value={form[field.name]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.name]: e.target.value,
                        })
                      }
                      placeholder={field.placeholder}
                      className="w-full px-3 py-3 text-xs border border-[#e6e8df] rounded-md outline-none focus:border-[#557663]"
                    />
                  </div>
                ))}

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-[#34483b] mb-2">
                    Department / Faculty
                  </label>

                  <select
                    required
                    value={form.department}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        department: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 text-xs border border-[#e6e8df] rounded-md outline-none bg-white"
                  >
                    <option value="">Select Department</option>

                    {availableDepartments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-[#34483b] mb-2">
                    Studentship Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 text-xs border border-[#e6e8df] rounded-md outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
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
                    : editingMember
                      ? "Save Changes"
                      : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg p-6">

            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-[#1d3028]">
                Member Details
              </h3>

              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 hover:bg-[#f1f2ec] rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#e7ede5] text-[#557663] rounded-full grid place-items-center">
                <Users size={28} />
              </div>

              <div>
                <h4 className="font-semibold text-[#1d3028]">
                  {selectedMember.name}
                </h4>

                <p className="text-xs text-[#858c83] mt-1">
                  {selectedMember.studentId}
                </p>

                <span
                  className={`inline-block mt-2 text-[10px] px-2.5 py-1 rounded-full ${getStatus(selectedMember.status)}`}
                >
                  {selectedMember.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">

              {[
                {
                  label: "Email Address",
                  value: selectedMember.email,
                  icon: Mail,
                },
                {
                  label: "Phone Number",
                  value: selectedMember.phone || "-",
                  icon: Phone,
                },
                {
                  label: "Password",
                  value: selectedMember.password || "-",
                  icon: Lock,
                },
                {
                  label: "Department",
                  value: selectedMember.department,
                  icon: Building2,
                },
                {
                  label: "Study Program",
                  value: selectedMember.studyProgram,
                  icon: GraduationCap,
                },
                {
                  label: "Registration Date",
                  value: formatDate(selectedMember.createdAt),
                  icon: CalendarDays,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 border-b border-[#eeeeea] pb-3"
                  >
                    <Icon
                      size={15}
                      className="text-[#758277] mt-0.5 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-[#858c83]">
                        {item.label}
                      </p>

                      <p className="font-semibold text-[#1d3028] mt-1 break-words">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                const member = selectedMember;
                setSelectedMember(null);
                openEditModal(member);
              }}
              className="w-full mt-6 py-3 bg-[#214c3a] text-white rounded-md text-xs hover:bg-[#183c2d] transition"
            >
              Edit Member Information
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";

// GET: Mengambil detail anggota
export async function GET(request, { params }) {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Member retrieved successfully.",
      data: member,
    });
  } catch (error) {
    console.error("GET member error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve member." },
      { status: 500 }
    );
  }
}

// PATCH: Memperbarui anggota
export async function PATCH(request, { params }) {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();

    const existingMember = await prisma.member.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { message: "Member not found." },
        { status: 404 }
      );
    }

    const allowedFields = [
      "studentId",
      "name",
      "email",
      "phone",
      "password",
      "department",
      "studyProgram",
      "status",
    ];

    const data = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const requiredFields = [
      "studentId",
      "name",
      "email",
      "department",
      "studyProgram",
    ];

    for (const field of requiredFields) {
      if (
        data[field] !== undefined &&
        (typeof data[field] !== "string" || !data[field].trim())
      ) {
        return NextResponse.json(
          { message: `${field} is required.` },
          { status: 400 }
        );
      }

      if (typeof data[field] === "string") {
        data[field] = data[field].trim();
      }
    }

    if (data.email !== undefined) {
      data.email = data.email.toLowerCase();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(data.email)) {
        return NextResponse.json(
          { message: "Invalid email address." },
          { status: 400 }
        );
      }
    }

    if (data.phone !== undefined) {
      data.phone = data.phone?.trim() || null;
    }

    if (data.password !== undefined) {
      data.password = data.password?.trim() || null;
    }

    if (
      data.status !== undefined &&
      !["Active", "Inactive"].includes(data.status)
    ) {
      return NextResponse.json(
        { message: "Invalid member status." },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      message: "Member updated successfully.",
      data: updatedMember,
    });
  } catch (error) {
    console.error("PATCH member error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Student ID or email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update member." },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus anggota

export async function DELETE(request, { params }) {
  try {
    const { response } = await authorizeLibraryStaff();
    if (response) return response;

    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!member) {
      return Response.json(
        { message: "Member not found." },
        { status: 404 }
      );
    }

    // Jika punya riwayat transaksi, jangan hapus.
    if (member._count.transactions > 0) {
      return Response.json(
        {
          message:
            "Member has transaction history. Change member status to Inactive instead.",
          code: "MEMBER_HAS_HISTORY",
        },
        { status: 409 }
      );
    }

    await prisma.member.delete({
      where: { id },
    });

    return Response.json({
      message: "Member deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE MEMBER ERROR:", error);

    return Response.json(
      { message: "Failed to delete member." },
      { status: 500 }
    );
  }
}

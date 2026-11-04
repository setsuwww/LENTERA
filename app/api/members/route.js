
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

// GET: Mengambil seluruh anggota
export async function GET() {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const members = await prisma.member.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      message: "Members retrieved successfully.",
      total: members.length,
      data: members,
    });
  } catch (error) {
    console.error("GET members error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve members." },
      { status: 500 }
    );
  }
}

// POST: Menambahkan anggota baru
export async function POST(request) {
  try {
    const { response } = await authorizeLibraryStaff();

    if (response) return response;

    const body = await request.json();

    const {
      studentId,
      name,
      email,
      password,
      phone,
      department,
      studyProgram,
      status,
    } = body;

    if (
      !studentId ||
      !name ||
      !email ||
      !password ||
      !department ||
      !studyProgram
    ) {
      return NextResponse.json(
        { message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const member = await prisma.member.create({
      data: {
        studentId,
        name,
        email: email.trim().toLowerCase(),
        passwordHash,
        phone,
        department,
        studyProgram,
        status: status || "Active",
      },
      select: {
        id: true,
        studentId: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        studyProgram: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Mahasiswa berhasil ditambahkan.",
        data: member,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create member error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "NIM atau email sudah terdaftar." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Gagal menambahkan mahasiswa." },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const demoUsers = {
  admin: {
    id: "USR001",
    name: "Administrator",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
  },

  staff: {
    id: "USR002",
    name: "Petugas Perpustakaan",
    email: process.env.STAFF_EMAIL,
    password: process.env.STAFF_PASSWORD,
    role: "staff",
  },
};

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = null;

    // ADMIN & STAFF
    if (role === "admin" || role === "staff") {
      const account = demoUsers[role];

      if (
        !account.email ||
        !account.password ||
        account.email.toLowerCase() !== normalizedEmail ||
        account.password !== password
      ) {
        return NextResponse.json(
          { message: "Email atau password tidak valid." },
          { status: 401 }
        );
      }

      user = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
      };
    }

    // STUDENT
    else if (role === "student") {
      const member = await prisma.member.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (!member || !member.passwordHash) {
        return NextResponse.json(
          { message: "Email atau password tidak valid." },
          { status: 401 }
        );
      }

      if (member.status !== "Active") {
        return NextResponse.json(
          { message: "Akun mahasiswa tidak aktif." },
          { status: 403 }
        );
      }

      const passwordValid = await bcrypt.compare(
        password,
        member.passwordHash
      );

      if (!passwordValid) {
        return NextResponse.json(
          { message: "Email atau password tidak valid." },
          { status: 401 }
        );
      }

      user = {
        id: member.id,
        name: member.name,
        email: member.email,
        role: "student",
      };
    }

    else {
      return NextResponse.json(
        { message: "Role tidak valid." },
        { status: 400 }
      );
    }

    const token = await createSession(user);

    const response = NextResponse.json({
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("lentera_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

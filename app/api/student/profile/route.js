
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const user = await getApiUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const member = await prisma.member.findUnique({
      where: {
        id: user.id,
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

    if (!member) {
      return NextResponse.json(
        { message: "Student profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Student profile retrieved successfully.",
      data: member,
    });

  } catch (error) {
    console.error("Student profile error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve student profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const user = await getApiUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const phone = body.phone?.trim() || null;

    if (phone && phone.length > 20) {
      return NextResponse.json(
        { message: "Phone number cannot exceed 20 characters." },
        { status: 400 }
      );
    }

    const member = await prisma.member.update({
      where: {
        id: user.id,
      },
      data: {
        phone,
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

    return NextResponse.json({
      message: "Profile updated successfully.",
      data: member,
    });

  } catch (error) {
    console.error("Update student profile error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Student profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update student profile." },
      { status: 500 }
    );
  }
}

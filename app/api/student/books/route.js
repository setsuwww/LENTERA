
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/api-auth";

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "all";
    const availability = searchParams.get("availability") || "all";

    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { author: { contains: search } },
              { isbn: { contains: search } },
              { publisher: { contains: search } },
            ],
          }
        : {}),

      ...(category !== "all" ? { category } : {}),

      ...(availability === "available"
        ? { stock: { gt: 0 } }
        : availability === "unavailable"
          ? { stock: 0 }
          : {}),
    };

    const [books, total, categories] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
          category: true,
          publisher: true,
          year: true,
          stock: true,
          borrowed: true,
        },
      }),

      prisma.book.count({ where }),

      prisma.book.findMany({
        distinct: ["category"],
        select: {
          category: true,
        },
        orderBy: {
          category: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      message: "Book catalog retrieved successfully.",
      total,
      categories: categories.map((item) => item.category),
      data: books,
    });

  } catch (error) {
    console.error("Student catalog error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve book catalog." },
      { status: 500 }
    );
  }
}

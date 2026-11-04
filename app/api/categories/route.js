
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";

export async function GET() {
  const { response } = await authorizeLibraryStaff();
  if (response) return response;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    const bookCounts = await prisma.book.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    const countMap = Object.fromEntries(
      bookCounts.map((item) => [item.category, item._count._all])
    );

    return NextResponse.json({
      message: "Categories retrieved successfully.",
      total: categories.length,
      data: categories.map((category) => ({
        ...category,
        bookCount: countMap[category.name] || 0,
      })),
    });
  } catch (error) {
    console.error("GET categories:", error);
    return NextResponse.json(
      { message: "Failed to retrieve categories." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { response } = await authorizeLibraryStaff();
  if (response) return response;

  try {
    const body = await request.json();
    const name = body.name?.trim();
    const description = body.description?.trim() || null;

    if (!name) {
      return NextResponse.json(
        { message: "Category name is required." },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name, description },
    });

    return NextResponse.json(
      {
        message: "Category created successfully.",
        data: { ...category, bookCount: 0 },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "This category already exists." },
        { status: 409 }
      );
    }

    console.error("POST categories:", error);
    return NextResponse.json(
      { message: "Failed to create category." },
      { status: 500 }
    );
  }
}

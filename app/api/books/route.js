
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";

// GET /api/books
export async function GET(request) {
  const { response } = await authorizeLibraryStaff();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const where = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search } },
                { author: { contains: search } },
                { isbn: { contains: search } },
              ],
            }
          : {},
        category && category !== "All Categories"
          ? { category }
          : {},
        status === "Available"
          ? { stock: { gt: 5 } }
          : status === "Low Stock"
            ? { stock: { gt: 0, lte: 5 } }
            : status === "Unavailable"
              ? { stock: 0 }
              : {},
      ],
    };

    const books = await prisma.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      message: "Books retrieved successfully.",
      total: books.length,
      data: books,
    });
  } catch (error) {
    console.error("GET books error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve books." },
      { status: 500 }
    );
  }
}

// POST /api/books
export async function POST(request) {
  const { response } = await authorizeLibraryStaff();
  if (response) return response;

  try {
    const body = await request.json();

    const {
      title,
      author,
      isbn,
      category,
      publisher,
      year,
      stock,
    } = body;

    if (
      !title?.trim() ||
      !author?.trim() ||
      !isbn?.trim() ||
      !category?.trim() ||
      !publisher?.trim() ||
      year === undefined ||
      stock === undefined
    ) {
      return NextResponse.json(
        { message: "All book fields are required." },
        { status: 400 }
      );
    }

    const parsedYear = Number(year);
    const parsedStock = Number(stock);

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 0 ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      return NextResponse.json(
        { message: "Year and stock must be valid non-negative integers." },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category: category.trim(),
        publisher: publisher.trim(),
        year: parsedYear,
        stock: parsedStock,
      },
    });

    return NextResponse.json(
      {
        message: "Book created successfully.",
        data: book,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "ISBN already exists." },
        { status: 409 }
      );
    }

    console.error("POST books error:", error);

    return NextResponse.json(
      { message: "Failed to create book." },
      { status: 500 }
    );
  }
}

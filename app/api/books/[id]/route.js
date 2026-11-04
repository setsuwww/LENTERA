
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";

// GET: Detail buku
export async function GET(request, { params }) {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return NextResponse.json(
        { message: "Book not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Book retrieved successfully.",
      data: book,
    });
  } catch (error) {
    console.error("GET book error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve book." },
      { status: 500 }
    );
  }
}

// PATCH: Update buku
export async function PATCH(request, { params }) {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();

    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json(
        { message: "Book not found." },
        { status: 404 }
      );
    }

    const allowedFields = [
      "title",
      "author",
      "isbn",
      "category",
      "publisher",
      "year",
      "stock",
    ];

    const data = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    for (const field of [
      "title",
      "author",
      "isbn",
      "category",
      "publisher",
    ]) {
      if (
        data[field] !== undefined &&
        (typeof data[field] !== "string" || !data[field].trim())
      ) {
        return NextResponse.json(
          { message: `${field} must be a valid string.` },
          { status: 400 }
        );
      }

      if (typeof data[field] === "string") {
        data[field] = data[field].trim();
      }
    }

    if (
      data.year !== undefined &&
      (!Number.isInteger(data.year) || data.year < 0)
    ) {
      return NextResponse.json(
        { message: "Publication year is invalid." },
        { status: 400 }
      );
    }

    if (
      data.stock !== undefined &&
      (!Number.isInteger(data.stock) || data.stock < 0)
    ) {
      return NextResponse.json(
        { message: "Stock must be a non-negative integer." },
        { status: 400 }
      );
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      message: "Book updated successfully.",
      data: updatedBook,
    });
  } catch (error) {
    console.error("PATCH book error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "ISBN already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update book." },
      { status: 500 }
    );
  }
}

// DELETE: Hapus buku
export async function DELETE(request, { params }) {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const { id } = await params;

    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json(
        { message: "Book not found." },
        { status: 404 }
      );
    }

    if (existingBook.borrowed > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete this book because copies are currently borrowed.",
        },
        { status: 409 }
      );
    }

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE book error:", error);

    return NextResponse.json(
      { message: "Failed to delete book." },
      { status: 500 }
    );
  }
}

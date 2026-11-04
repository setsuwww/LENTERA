
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";

export async function PATCH(request, { params }) {
  const { response } = await authorizeLibraryStaff();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();

    const name = body.name?.trim();
    const description = body.description?.trim() || null;

    if (!name) {
      return NextResponse.json(
        { message: "Category name is required." },
        { status: 400 }
      );
    }

    const category = await prisma.$transaction(async (tx) => {
      const existing = await tx.category.findUnique({ where: { id } });

      if (!existing) {
        throw new Error("CATEGORY_NOT_FOUND");
      }

      // Rename kategori sekaligus memperbarui buku yang menggunakannya.
      if (existing.name !== name) {
        await tx.book.updateMany({
          where: { category: existing.name },
          data: { category: name },
        });
      }

      return tx.category.update({
        where: { id },
        data: { name, description },
      });
    });

    return NextResponse.json({
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    if (error.message === "CATEGORY_NOT_FOUND") {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "This category name already exists." },
        { status: 409 }
      );
    }

    console.error("PATCH category:", error);
    return NextResponse.json(
      { message: "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { response } = await authorizeLibraryStaff();
  if (response) return response;

  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    const bookCount = await prisma.book.count({
      where: { category: category.name },
    });

    if (bookCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete this category. ${bookCount} book(s) still use it.`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE category:", error);
    return NextResponse.json(
      { message: "Failed to delete category." },
      { status: 500 }
    );
  }
}

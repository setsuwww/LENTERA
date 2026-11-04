
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";

// GET: Retrieve transaction detail
export async function GET(request, { params }) {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        member: true,
        book: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found." },
        { status: 404 }
      );
    }

    const data = {
      ...transaction,
      status:
        transaction.status === "Borrowed" &&
        new Date(transaction.dueDate) < new Date()
          ? "Overdue"
          : transaction.status,
    };

    return NextResponse.json({
      message: "Transaction retrieved successfully.",
      data,
    });
  } catch (error) {
    console.error("GET transaction error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve transaction." },
      { status: 500 }
    );
  }
}

// PATCH: Return borrowed books
export async function PATCH(request, { params }) {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new Error("TRANSACTION_NOT_FOUND");
      }

      if (transaction.status !== "Borrowed") {
        throw new Error("ALREADY_RETURNED");
      }

      // Atomically mark transaction as returned.
      const update = await tx.transaction.updateMany({
        where: {
          id,
          status: "Borrowed",
        },
        data: {
          status: "Returned",
          returnDate: new Date(),
        },
      });

      if (update.count === 0) {
        throw new Error("ALREADY_RETURNED");
      }

      // Restore available stock and reduce borrowed copies.
      await tx.book.update({
        where: {
          id: transaction.bookId,
        },
        data: {
          stock: {
            increment: transaction.quantity,
          },
          borrowed: {
            decrement: transaction.quantity,
          },
        },
      });

      return await tx.transaction.findUnique({
        where: { id },
        include: {
          member: true,
          book: true,
        },
      });
    });

    return NextResponse.json({
      message: "Book returned successfully.",
      data: result,
    });
  } catch (error) {
    console.error("PATCH transaction error:", error);

    if (error.message === "TRANSACTION_NOT_FOUND") {
      return NextResponse.json(
        { message: "Transaction not found." },
        { status: 404 }
      );
    }

    if (error.message === "ALREADY_RETURNED") {
      return NextResponse.json(
        { message: "This transaction has already been returned." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to return book." },
      { status: 500 }
    );
  }
}

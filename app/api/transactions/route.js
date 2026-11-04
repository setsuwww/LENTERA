
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";

// GET: Retrieve all transactions
export async function GET() {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        member: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            department: true,
            studyProgram: true,
            status: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            category: true,
            stock: true,
            borrowed: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = transactions.map((transaction) => ({
      ...transaction,
      status:
        transaction.status === "Borrowed" &&
        new Date(transaction.dueDate) < new Date()
          ? "Overdue"
          : transaction.status,
    }));

    return NextResponse.json({
      message: "Transactions retrieved successfully.",
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("GET transactions error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve transactions." },
      { status: 500 }
    );
  }
}

// POST: Create a borrowing transaction
export async function POST(request) {
  const { response } = await authorizeLibraryStaff();

  if (response) return response;

  try {
    const body = await request.json();

    const { memberId, bookId, quantity, dueDate } = body;

    if (!memberId || !bookId || !dueDate) {
      return NextResponse.json(
        { message: "Member, book, and due date are required." },
        { status: 400 }
      );
    }

    const parsedQuantity = Number(quantity ?? 1);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return NextResponse.json(
        { message: "Quantity must be a positive integer." },
        { status: 400 }
      );
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid due date." },
        { status: 400 }
      );
    }

    if (parsedDueDate <= new Date()) {
      return NextResponse.json(
        { message: "Due date must be in the future." },
        { status: 400 }
      );
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new Error("MEMBER_NOT_FOUND");
      }

      if (member.status !== "Active") {
        throw new Error("MEMBER_INACTIVE");
      }

      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new Error("BOOK_NOT_FOUND");
      }

      // Atomic stock update to prevent borrowing unavailable copies.
      const stockUpdate = await tx.book.updateMany({
        where: {
          id: bookId,
          stock: {
            gte: parsedQuantity,
          },
        },
        data: {
          stock: {
            decrement: parsedQuantity,
          },
          borrowed: {
            increment: parsedQuantity,
          },
        },
      });

      if (stockUpdate.count === 0) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      return await tx.transaction.create({
        data: {
          memberId,
          bookId,
          quantity: parsedQuantity,
          dueDate: parsedDueDate,
          status: "Borrowed",
        },
        include: {
          member: true,
          book: true,
        },
      });
    });

    return NextResponse.json(
      {
        message: "Borrowing transaction created successfully.",
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST transaction error:", error);

    const errors = {
      MEMBER_NOT_FOUND: {
        message: "Member not found.",
        status: 404,
      },
      MEMBER_INACTIVE: {
        message: "Inactive members cannot borrow books.",
        status: 403,
      },
      BOOK_NOT_FOUND: {
        message: "Book not found.",
        status: 404,
      },
      INSUFFICIENT_STOCK: {
        message: "Not enough available book stock.",
        status: 409,
      },
    };

    const knownError = errors[error.message];

    if (knownError) {
      return NextResponse.json(
        { message: knownError.message },
        { status: knownError.status }
      );
    }

    return NextResponse.json(
      { message: "Failed to create transaction." },
      { status: 500 }
    );
  }
}

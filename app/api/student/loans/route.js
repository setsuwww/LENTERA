
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
        name: true,
        studentId: true,
        status: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Student profile not found." },
        { status: 404 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        memberId: member.id,
        status: "Borrowed",
      },

      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            category: true,
            publisher: true,
            year: true,
            isbn: true,
          },
        },
      },

      orderBy: {
        borrowDate: "desc",
      },
    });

    const now = new Date();

    const data = transactions.map((transaction) => {
      const isOverdue =
        transaction.status === "Borrowed" &&
        new Date(transaction.dueDate) < now;

      return {
        id: transaction.id,
        quantity: transaction.quantity,
        borrowDate: transaction.borrowDate,
        dueDate: transaction.dueDate,
        returnDate: transaction.returnDate,
        status: isOverdue ? "Overdue" : transaction.status,
        book: transaction.book,
      };
    });

    const activeLoans = data.filter(
      (item) =>
        item.status === "Borrowed" ||
        item.status === "Overdue"
    );

    const returnedLoans = data.filter(
      (item) => item.status === "Returned"
    );

    const overdueLoans = data.filter(
      (item) => item.status === "Overdue"
    );

    return NextResponse.json({
      message: "Student loans retrieved successfully.",

      member,

      overview: {
        total: data.length,
        active: activeLoans.length,
        overdue: overdueLoans.length,
        returned: returnedLoans.length,
      },

      data,
    });

  } catch (error) {
    console.error("Student loans error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve student loans." },
      { status: 500 }
    );
  }
}

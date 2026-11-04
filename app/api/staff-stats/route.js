
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

    if (!["admin", "staff"].includes(user.role)) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfDay);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const [
      totalBooks,
      totalMembers,
      activeMembers,
      activeLoans,
      overdueLoans,
      borrowedToday,
      returnedToday,
      recentTransactions,
      stockSummary,
    ] = await Promise.all([
      prisma.book.count(),

      prisma.member.count(),

      prisma.member.count({
        where: { status: "Active" },
      }),

      prisma.transaction.count({
        where: { status: "Borrowed" },
      }),

      prisma.transaction.count({
        where: {
          status: "Borrowed",
          dueDate: { lt: now },
        },
      }),

      prisma.transaction.count({
        where: {
          borrowDate: {
            gte: startOfDay,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.transaction.count({
        where: {
          status: "Returned",
          returnDate: {
            gte: startOfDay,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.transaction.findMany({
        take: 6,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          member: {
            select: {
              name: true,
              studentId: true,
            },
          },
          book: {
            select: {
              title: true,
              author: true,
            },
          },
        },
      }),

      prisma.book.aggregate({
        _sum: {
          stock: true,
          borrowed: true,
        },
      }),
    ]);

    const recentActivity = recentTransactions.map((item) => {
      const isOverdue =
        item.status === "Borrowed" &&
        item.dueDate < now;

      return {
        id: item.id,
        memberName: item.member.name,
        studentId: item.member.studentId,
        bookTitle: item.book.title,
        author: item.book.author,
        quantity: item.quantity,
        borrowDate: item.borrowDate,
        dueDate: item.dueDate,
        returnDate: item.returnDate,
        status: isOverdue ? "Overdue" : item.status,
      };
    });

    return NextResponse.json({
      message: "Staff statistics retrieved successfully.",

      overview: {
        totalBooks,
        totalMembers,
        activeMembers,
        activeLoans,
        overdueLoans,
        borrowedToday,
        returnedToday,
        availableCopies: stockSummary._sum.stock || 0,
        borrowedCopies: stockSummary._sum.borrowed || 0,
      },

      recentActivity,
    });

  } catch (error) {
    console.error("Staff stats error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve staff statistics." },
      { status: 500 }
    );
  }
}

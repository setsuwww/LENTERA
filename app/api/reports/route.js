
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";

export async function GET(request) {
  const { user, response } = await authorizeLibraryStaff();
  if (response) return response;

  if (user.role !== "admin") {
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const now = new Date();

    let dateFilter = {};

    if (period === "month") {
      dateFilter = {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    } else if (period === "year") {
      dateFilter = {
        gte: new Date(now.getFullYear(), 0, 1),
        lt: new Date(now.getFullYear() + 1, 0, 1),
      };
    } else if (period !== "all") {
      return NextResponse.json(
        { message: "Invalid report period." },
        { status: 400 }
      );
    }

    const where = period === "all"
      ? {}
      : { borrowDate: dateFilter };

    const [
      transactions,
      totalBooks,
      totalMembers,
      stock,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          member: {
            select: {
              name: true,
              studentId: true,
              department: true,
            },
          },
          book: {
            select: {
              title: true,
              author: true,
              category: true,
            },
          },
        },
        orderBy: { borrowDate: "desc" },
      }),
      prisma.book.count(),
      prisma.member.count(),
      prisma.book.aggregate({
        _sum: { stock: true, borrowed: true },
      }),
    ]);

    const reportData = transactions.map((item) => ({
      id: item.id,
      member: item.member.name,
      studentId: item.member.studentId,
      department: item.member.department,
      book: item.book.title,
      author: item.book.author,
      category: item.book.category,
      quantity: item.quantity,
      borrowDate: item.borrowDate,
      dueDate: item.dueDate,
      returnDate: item.returnDate,
      status:
        item.status === "Borrowed" && item.dueDate < now
          ? "Overdue"
          : item.status,
    }));

    const summary = {
      totalTransactions: reportData.length,
      borrowed: reportData.filter((item) => item.status === "Borrowed").length,
      returned: reportData.filter((item) => item.status === "Returned").length,
      overdue: reportData.filter((item) => item.status === "Overdue").length,
      totalCopiesBorrowed: reportData.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      totalBooks,
      totalMembers,
      availableCopies: stock._sum.stock || 0,
      borrowedCopies: stock._sum.borrowed || 0,
    };

    return NextResponse.json({
      message: "Report generated successfully.",
      period,
      summary,
      total: reportData.length,
      data: reportData,
    });
  } catch (error) {
    console.error("GET reports:", error);
    return NextResponse.json(
      { message: "Failed to generate report." },
      { status: 500 }
    );
  }
}

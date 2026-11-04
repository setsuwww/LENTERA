
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeLibraryStaff } from "@/lib/api-auth";

export async function GET() {
  const { user, response } = await authorizeLibraryStaff();
  if (response) return response;

  if (user.role !== "admin") {
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 }
    );
  }

  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const nextYear = new Date(now.getFullYear() + 1, 0, 1);

    const [
      totalBooks,
      totalMembers,
      totalCategories,
      totalTransactions,
      borrowedTransactions,
      returnedTransactions,
      overdueTransactions,
      bookStock,
      categoryGroups,
      monthlyTransactions,
      recentTransactions,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.member.count(),
      prisma.category.count(),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: "Borrowed" } }),
      prisma.transaction.count({ where: { status: "Returned" } }),
      prisma.transaction.count({
        where: {
          status: "Borrowed",
          dueDate: { lt: now },
        },
      }),
      prisma.book.aggregate({
        _sum: { stock: true, borrowed: true },
      }),
      prisma.book.groupBy({
        by: ["category"],
        _count: { _all: true },
        orderBy: { _count: { category: "desc" } },
      }),
      prisma.transaction.findMany({
        where: {
          borrowDate: {
            gte: yearStart,
            lt: nextYear,
          },
        },
        select: {
          borrowDate: true,
          status: true,
        },
      }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          member: {
            select: { name: true, studentId: true },
          },
          book: {
            select: { title: true },
          },
        },
      }),
    ]);

    const monthlyMap = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(now.getFullYear(), index, 1).toLocaleString(
        "en-US",
        { month: "short" }
      ),
      borrowed: 0,
      returned: 0,
    }));

    monthlyTransactions.forEach((transaction) => {
      const month = transaction.borrowDate.getMonth();
      monthlyMap[month].borrowed += 1;

      if (transaction.status === "Returned") {
        monthlyMap[month].returned += 1;
      }
    });

    const totalAvailable = bookStock._sum.stock || 0;
    const totalBorrowedCopies = bookStock._sum.borrowed || 0;

    return NextResponse.json({
      message: "Admin statistics retrieved successfully.",
      data: {
        overview: {
          totalBooks,
          totalMembers,
          totalCategories,
          totalTransactions,
          borrowedTransactions,
          returnedTransactions,
          overdueTransactions,
          totalAvailable,
          totalBorrowedCopies,
          totalPhysicalCopies: totalAvailable + totalBorrowedCopies,
        },
        monthlyTransactions: monthlyMap,
        categoryDistribution: categoryGroups.map((item) => ({
          name: item.category,
          total: item._count._all,
        })),
        recentTransactions: recentTransactions.map((item) => ({
          id: item.id,
          member: item.member.name,
          studentId: item.member.studentId,
          book: item.book.title,
          borrowDate: item.borrowDate,
          dueDate: item.dueDate,
          status:
            item.status === "Borrowed" && item.dueDate < now
              ? "Overdue"
              : item.status,
        })),
      },
    });
  } catch (error) {
    console.error("GET admin stats:", error);
    return NextResponse.json(
      { message: "Failed to retrieve admin statistics." },
      { status: 500 }
    );
  }
}

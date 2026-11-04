
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
        { message: "Student access required." },
        { status: 403 }
      );
    }

    // Hubungkan akun login dengan data Member melalui email.
    const member = await prisma.member.findUnique({
      where: { email: user.email },
    });

    if (!member) {
      return NextResponse.json({
        message: "Student profile is not linked to a member record.",
        linked: false,
        data: null,
      });
    }

    const now = new Date();

    const [
      totalTransactions,
      activeLoans,
      overdueLoans,
      returnedTransactions,
      recentLoans,
      availableBooks,
      latestBooks,
    ] = await Promise.all([
      prisma.transaction.count({
        where: { memberId: member.id },
      }),

      prisma.transaction.count({
        where: {
          memberId: member.id,
          status: "Borrowed",
        },
      }),

      prisma.transaction.count({
        where: {
          memberId: member.id,
          status: "Borrowed",
          dueDate: { lt: now },
        },
      }),

      prisma.transaction.count({
        where: {
          memberId: member.id,
          status: "Returned",
        },
      }),

      prisma.transaction.findMany({
        where: {
          memberId: member.id,
          status: "Borrowed",
        },
        include: {
          book: {
            select: {
              title: true,
              author: true,
              category: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),

      prisma.book.count({
        where: { stock: { gt: 0 } },
      }),

      prisma.book.findMany({
        where: { stock: { gt: 0 } },
        select: {
          id: true,
          title: true,
          author: true,
          category: true,
          stock: true,
          year: true,
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

    return NextResponse.json({
      message: "Student dashboard retrieved successfully.",
      linked: true,
      data: {
        member: {
          name: member.name,
          studentId: member.studentId,
          email: member.email,
          department: member.department,
          studyProgram: member.studyProgram,
        },
        overview: {
          totalTransactions,
          activeLoans,
          overdueLoans,
          returnedTransactions,
          availableBooks,
        },
        recentLoans: recentLoans.map((loan) => ({
          id: loan.id,
          book: loan.book,
          quantity: loan.quantity,
          borrowDate: loan.borrowDate,
          dueDate: loan.dueDate,
          status:
            loan.dueDate < now ? "Overdue" : loan.status,
        })),
        latestBooks,
      },
    });
  } catch (error) {
    console.error("GET student stats:", error);

    return NextResponse.json(
      { message: "Failed to retrieve student dashboard." },
      { status: 500 }
    );
  }
}

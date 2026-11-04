
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/api-auth";

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const year = searchParams.get("year") || "all";

    const member = await prisma.member.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        studentId: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Student profile not found." },
        { status: 404 }
      );
    }

    const where = {
      memberId: member.id,
      status: "Returned",

      ...(search
        ? {
            book: {
              title: {
                contains: search,
              },
            },
          }
        : {}),

      ...(year !== "all"
        ? {
            returnDate: {
              gte: new Date(`${year}-01-01T00:00:00.000Z`),
              lt: new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`),
            },
          }
        : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
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
          returnDate: "desc",
        },
      }),

      prisma.transaction.count({ where }),
    ]);

    const data = transactions.map((transaction) => ({
      id: transaction.id,
      quantity: transaction.quantity,
      borrowDate: transaction.borrowDate,
      dueDate: transaction.dueDate,
      returnDate: transaction.returnDate,
      status: transaction.status,
      book: transaction.book,
    }));

    const availableYears = await prisma.transaction.findMany({
      where: {
        memberId: member.id,
        status: "Returned",
        returnDate: {
          not: null,
        },
      },
      select: {
        returnDate: true,
      },
      distinct: ["returnDate"],
      orderBy: {
        returnDate: "desc",
      },
    });

    const years = [
      ...new Set(
        availableYears
          .map((item) => item.returnDate?.getFullYear())
          .filter(Boolean)
      ),
    ];

    return NextResponse.json({
      message: "Borrowing history retrieved successfully.",
      member,
      total,
      years,
      overview: {
        totalReturned: total,
        totalCopies: transactions.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      },
      data,
    });

  } catch (error) {
    console.error("Student history error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve borrowing history." },
      { status: 500 }
    );
  }
}

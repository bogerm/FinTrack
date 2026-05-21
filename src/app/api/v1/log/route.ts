import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }
  const key = authHeader.slice(7).trim();

  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKey || !apiKey.active) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { amount, description, category, type, date, isRecurring } = body;

  const errors: Record<string, string> = {};
  if (typeof amount !== "number" || amount <= 0)
    errors.amount = "amount must be a positive number";
  if (!description || typeof description !== "string" || !description.trim())
    errors.description = "description is required";
  if (!category || typeof category !== "string" || !category.trim())
    errors.category = "category is required";
  if (type !== "INCOME" && type !== "EXPENSE")
    errors.type = 'type must be "INCOME" or "EXPENSE"';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  const txDate = date && typeof date === "string" ? new Date(date) : new Date();
  if (isNaN(txDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: apiKey.userId,
      amount: amount as number,
      description: (description as string).trim(),
      category: (category as string).trim(),
      type: type as string,
      isRecurring: isRecurring === true,
      date: txDate,
    },
  });

  return NextResponse.json({ success: true, id: transaction.id }, { status: 201 });
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export type HoldingFormState =
  | { errors?: { ticker?: string[]; shares?: string[]; avgCost?: string[] }; message?: string; success?: boolean }
  | undefined;

export async function addHolding(
  state: HoldingFormState,
  formData: FormData
): Promise<HoldingFormState> {
  const session = await verifySession();

  const ticker = (formData.get("ticker") as string)?.trim().toUpperCase();
  const sharesStr = formData.get("shares") as string;
  const avgCostStr = formData.get("avgCost") as string;

  const errors: { ticker?: string[]; shares?: string[]; avgCost?: string[] } = {};
  if (!ticker || !/^[A-Z]{1,10}$/.test(ticker)) {
    errors.ticker = ["Enter a valid ticker symbol (e.g. AAPL)."];
  }
  const shares = parseFloat(sharesStr);
  if (isNaN(shares) || shares <= 0) errors.shares = ["Shares must be a positive number."];
  const avgCost = parseFloat(avgCostStr);
  if (isNaN(avgCost) || avgCost <= 0) errors.avgCost = ["Avg cost must be a positive number."];

  if (Object.keys(errors).length > 0) return { errors };

  const existing = await prisma.stockHolding.findUnique({
    where: { userId_ticker: { userId: session.userId, ticker } },
  });

  if (existing) {
    const totalShares = existing.shares + shares;
    const newAvgCost = (existing.shares * existing.avgCost + shares * avgCost) / totalShares;
    await prisma.stockHolding.update({
      where: { id: existing.id },
      data: { shares: totalShares, avgCost: newAvgCost },
    });
  } else {
    await prisma.stockHolding.create({
      data: { userId: session.userId, ticker, shares, avgCost },
    });
  }

  revalidatePath("/dashboard/portfolio");
  return { success: true };
}

export async function deleteHolding(id: string) {
  const session = await verifySession();
  await prisma.stockHolding.deleteMany({
    where: { id, userId: session.userId },
  });
  revalidatePath("/dashboard/portfolio");
}

const MOCK_BASE_PRICES: Record<string, number> = {
  AAPL: 213.32, MSFT: 415.50, GOOGL: 178.25, AMZN: 197.12,
  TSLA: 245.80, NVDA: 135.72, META: 612.45, NFLX: 692.30,
  SPY: 582.10, QQQ: 498.75, BRK: 423.80, JPM: 246.40,
  V: 312.60, MA: 518.20, DIS: 98.45, BABA: 87.30,
  INTC: 21.80, AMD: 168.40, PLTR: 28.90, COIN: 245.10,
};

function mockPrice(ticker: string): number {
  const base =
    MOCK_BASE_PRICES[ticker] ??
    (ticker.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 491) + 10;
  return parseFloat((base * (1 + (Math.random() - 0.5) * 0.06)).toFixed(2));
}

export async function syncPrices() {
  const session = await verifySession();

  const holdings = await prisma.stockHolding.findMany({
    where: { userId: session.userId },
    select: { ticker: true },
  });

  if (holdings.length === 0) return;

  await Promise.all(
    holdings.map((h) =>
      prisma.stockPrice.upsert({
        where: { ticker: h.ticker },
        update: { price: mockPrice(h.ticker), lastUpdated: new Date() },
        create: { ticker: h.ticker, price: mockPrice(h.ticker) },
      })
    )
  );

  revalidatePath("/dashboard/portfolio");
}

import { getToken } from "next-auth/jwt";
import prisma from "../../../../lib/prisma";

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function number(value, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(/[$,@,]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function multiplier(symbol) {
  const s = String(symbol || "").toUpperCase();

  if (s.startsWith("MES")) return 5;   // Micro S&P 500
  if (s.startsWith("MNQ")) return 2;   // Micro Nasdaq
  if (s.startsWith("M2K")) return 5;   // Micro Russell
  if (s.startsWith("MYM")) return 0.5; // Micro Dow

  return 1;
}

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.sub) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { accountId, rows = [] } = req.body || {};

  if (!accountId) {
    return res.status(400).json({ error: "accountId required" });
  }

  if (!Array.isArray(rows)) {
    return res.status(400).json({ error: "rows must be an array" });
  }

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId: token.sub,
    },
  });

  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }

  // Clear old imported trades for this account so you don't keep duplicate zero-PnL rows
  await prisma.trade.deleteMany({
    where: { accountId },
  });

  const openPositions = {};
  const created = [];

  const filledRows = rows
    .filter((row) => clean(row.Status).toLowerCase() === "filled")
    .sort((a, b) => new Date(clean(a["Filled Time"])) - new Date(clean(b["Filled Time"])));

  for (const row of filledRows) {
    const ticker = clean(row.Symbol || row.Ticker || row.Name).toUpperCase();
    const side = clean(row.Side).toUpperCase();
    const qty = number(row.Filled || row["Total Qty"], 0);
    const price = number(row["Avg Price"] || row.Price, 0);

    if (!ticker || !side || qty <= 0 || price <= 0) continue;

    if (!openPositions[ticker]) openPositions[ticker] = [];

    let remainingQty = qty;
    const oppositeSide = side === "BUY" ? "SELL" : "BUY";

    while (remainingQty > 0 && openPositions[ticker].length > 0 && openPositions[ticker][0].side === oppositeSide) {
      const open = openPositions[ticker][0];
      const closeQty = Math.min(remainingQty, open.qty);
      const contractMultiplier = multiplier(ticker);

      const isLong = open.side === "BUY";
      const pnlPoints = isLong ? price - open.price : open.price - price;
      const netProfit = pnlPoints * contractMultiplier * closeQty;

      const trade = await prisma.trade.create({
        data: {
          accountId,
          ticker,
          side: isLong ? "LONG" : "SHORT",
          status: "CLOSED",
          netProfit,
          setup: null,
          mistakes: null,
          notes: `Webull Futures import: ${closeQty} contract(s) from ${open.price} to ${price}`,
        },
      });

      created.push(trade);

      open.qty -= closeQty;
      remainingQty -= closeQty;

      if (open.qty <= 0) {
        openPositions[ticker].shift();
      }
    }

    if (remainingQty > 0) {
      openPositions[ticker].push({
        side,
        qty: remainingQty,
        price,
      });
    }
  }

  res.json({
    success: true,
    count: created.length,
  });
}

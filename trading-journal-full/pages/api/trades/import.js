import { getToken } from "next-auth/jwt";
import prisma from "../../../lib/prisma";

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function number(value, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { accountId, rows } = req.body || {};
  if (!accountId) return res.status(400).json({ error: "accountId required" });
  if (!Array.isArray(rows)) return res.status(400).json({ error: "rows must be an array" });

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: token.sub }
  });

  if (!account) return res.status(404).json({ error: "Account not found" });

  const created = [];

  for (const row of rows) {
    const ticker = clean(row.ticker || row.symbol || row.Symbol || row.Ticker);
    if (!ticker) continue;

    const side = clean(row.side || row.Side || row.type || row.Type || "LONG").toUpperCase();
    const status = clean(row.status || row.Status || "CLOSED").toUpperCase();
    const netProfit = number(row.netProfit || row.pnl || row.PnL || row.profit || row.Profit, 0);
    const setup = clean(row.setup || row.Setup);
    const mistakes = clean(row.mistakes || row.Mistakes);
    const notes = clean(row.notes || row.Notes);

    const trade = await prisma.trade.create({
      data: {
        accountId,
        ticker: ticker.toUpperCase(),
        side,
        status,
        netProfit,
        setup: setup || null,
        mistakes: mistakes || null,
        notes: notes || null
      }
    });

    created.push(trade);
  }

  res.json({ success: true, count: created.length });
}

import { getToken } from "next-auth/jwt";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return res.status(401).json({ error: "Unauthorized" });

  const accountId = req.query.accountId;
  if (!accountId) return res.status(400).json({ error: "accountId required" });

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: token.sub }
  });
  if (!account) return res.status(404).json({ error: "Account not found" });

  const trades = await prisma.trade.findMany({
     where: { accountId },
    orderBy: { createdAt: "asc" }
   });

  let totalProfit = 0;
  let grossWinning = 0;
  let grossLosing = 0;
  let winningTrades = 0;
  let losingTrades = 0;

  for (const trade of trades) {
    const profit = trade.netProfit || 0;
    totalProfit += profit;

    if (profit > 0) {
      grossWinning += profit;
      winningTrades++;
    } else if (profit < 0) {
      grossLosing += Math.abs(profit);
      losingTrades++;
    }
  }

  const winRate = trades.length ? (winningTrades / trades.length) * 100 : 0;
  const profitFactor = grossLosing === 0 ? grossWinning : grossWinning / grossLosing;

  res.json({
    totalProfit,
    winRate,
    profitFactor,
    totalTrades: trades.length,
    winningTrades,
    losingTrades
  });
}

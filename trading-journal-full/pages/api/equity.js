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
  
  let balance = 0;
  const curve = trades.map((trade, index) => {
    balance += trade.netProfit || 0;
    return {
      trade: index + 1,
      equity: Number(balance.toFixed(2))
    };
  });

  res.json(curve);
}

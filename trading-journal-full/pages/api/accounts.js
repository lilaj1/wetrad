import { getToken } from "next-auth/jwt";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    let accounts = await prisma.account.findMany({
      where: { userId: token.sub },
      orderBy: { createdAt: "asc" }
    });

    if (accounts.length === 0) {
      const account = await prisma.account.create({
        data: {
          userId: token.sub,
          name: "Main Trading Account",
          balance: 0
        }
      });
      accounts = [account];
    }

    return res.json(accounts);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existing) return res.status(409).json({ error: "Email already exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashed,
      accounts: {
        create: {
          name: "Main Trading Account",
          balance: 0
        }
      }
    }
  });

  res.status(201).json({ id: user.id, email: user.email });
}

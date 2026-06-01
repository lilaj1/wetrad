import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub;
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET
});

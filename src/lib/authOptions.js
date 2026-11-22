import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
export const authOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(c) {
        await dbConnect();
        const user = await User.findOne({ email: String(c?.email || "").trim().toLowerCase() });
        if (!user || !(await bcrypt.compare(String(c?.password || ""), user.passwordHash))) return null;
        return { id: user._id.toString(), name: user.name, email: user.email, designation: user.designation, office: user.office };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) Object.assign(token, { id: user.id, designation: user.designation, office: user.office });
      return token;
    },
    async session({ session, token }) {
      Object.assign(session.user, { id: token.id, designation: token.designation, office: token.office });
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

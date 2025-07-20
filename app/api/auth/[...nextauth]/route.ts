import NextAuth from "next-auth";
import { getAuthOptions } from "./authOptions";

export async function GET(req: Request) {
  const options = await getAuthOptions();
  return NextAuth(options)(req);
}

export async function POST(req: Request) {
  const options = await getAuthOptions();
  return NextAuth(options)(req);
}
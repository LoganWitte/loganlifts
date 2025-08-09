import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

//Checks if the current user is an admin
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;
        return NextResponse.json(isAdmin, { status: 200 });
    } catch (error) {
        console.error("Error checking admin status:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
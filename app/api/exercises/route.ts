import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import { BODY_PART_OPTIONS, CATEGORY_OPTIONS } from "@/app/services/constants";

//Returns global & user-specific exercises (if logged in)
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        let whereClause;

        if (session && session.user?.id) {
            whereClause = {
                OR: [
                    { userId: null },
                    { userId: session.user.id },
                ],
            };
        } else {
            whereClause = { userId: null };
        }

        const exercises = await prisma.exercise.findMany({
            where: whereClause,
        });

        return NextResponse.json(exercises, { status: 200 });
    } catch (error) {
        console.error("Error fetching exercises:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

//Adds a new exercise to the database (can be global if admin, user-specific otherwise)
export async function POST(req: Request) {

    //Converts a string to a URL-friendly slug
    function toSlug(input: string): string {
        return input
            .toLowerCase()
            .trim()
            .replace(/[\s\_]+/g, "-")        // Replace spaces/underscores with hyphen
            .replace(/[^a-z0-9\-]+/g, "")    // Remove all non-alphanumeric except hyphen
            .replace(/\-+/g, "-")            // Collapse multiple hyphens
            .replace(/^\-+|\-+$/g, "");      // Trim hyphens from start/end
    }

    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { name, description, global, bodyParts, category, tags } = await req.json();

        if (!name || typeof name !== "string") {
            return new NextResponse("Invalid exercise name", { status: 400 });
        }

        if(bodyParts.some((part: string) => !BODY_PART_OPTIONS.splice(1).includes(part))) {
            return new NextResponse("Invalid body parts", { status: 400 });
        }

        if(!category || !CATEGORY_OPTIONS.splice(1).includes(category)) {
            return new NextResponse("Invalid or missing category", { status: 400 });
        }

        if (global && session.user.email !== process.env.ADMIN_EMAIL) {
            return new NextResponse("Forbidden: Only admin can add global exercises", { status: 403 });
        }

        const isGlobal = global === true && session.user.email === process.env.ADMIN_EMAIL;
        const newExercise = await prisma.exercise.create({
            data: { name, description, userId: isGlobal ? null : session.user.id, URLSlug: toSlug(name), bodyParts, category, tags },
        });

        return NextResponse.json(newExercise, { status: 201 });

    } catch (error) {
        console.error("Error creating exercise:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
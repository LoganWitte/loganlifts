import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

import { getOneRepMax } from "@/app/services/formulas";

// Returns all of a users lifts
export async function GET(req: Request) {

    try {
        const session = await getServerSession(authOptions);

        if(!session || !session.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const exercises = await prisma.lift.findMany({
            where: { userId: session.user.id },
        });

        return NextResponse.json(exercises, { status: 200 });
    } catch (error) {
        console.error("Error fetching lifts:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// Logs a users lift
export async function POST(req: Request) {

    const session = await getServerSession(authOptions);

    if(!session || !session.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { exerciseId, weight, reps } = await req.json();

        if (!exerciseId || typeof exerciseId !== "string") {
            return new NextResponse("Invalid or missing exerciseId", { status: 400 });
        }
        if (typeof weight !== "number" || weight <= 0) {
            return new NextResponse("Invalid or missing weight", { status: 400 });
        }
        if (typeof reps !== "number" || reps <= 0) {
            return new NextResponse("Invalid or missing reps", { status: 400 });
        }

        const newLift = await prisma.lift.create({
            data: {
                userId: session.user.id,
                exerciseId,
                weight,
                reps,
                // Fine bcs 'getOneRepMax' will never return undefined for "Recommended"
                oneRepMax: getOneRepMax(weight, reps, "Recommended")!, 
            },
        });

        return NextResponse.json(newLift, { status: 201 });
    } catch (error) {
        console.error("Error creating lift:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
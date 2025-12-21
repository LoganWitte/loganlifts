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
        const { exerciseId, weight, reps, time } = await req.json();

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
                time,
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

// Updates a user's lift (partial updates for weight, reps, or time)
export async function PATCH(req: Request) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id, weight, reps, time } = await req.json();

        if (!id || typeof id !== "string") {
            return new NextResponse("Invalid or missing id", { status: 400 });
        }

        // Check if lift exists and belongs to user
        const existingLift = await prisma.lift.findFirst({
            where: { id, userId: session.user.id }
        });

        if (!existingLift) {
            return new NextResponse("Lift not found or not authorized", { status: 404 });
        }

        // Prepare update data (partial updates)
        const updateData: any = {};
        if (weight !== undefined) {
            if (typeof weight !== "number" || weight <= 0) {
                return new NextResponse("Invalid weight", { status: 400 });
            }
            updateData.weight = weight;
        }
        if (reps !== undefined) {
            if (typeof reps !== "number" || reps <= 0) {
                return new NextResponse("Invalid reps", { status: 400 });
            }
            updateData.reps = reps;
        }
        if (time !== undefined) {
            // Assume time is a valid Date string or null; Prisma will handle conversion
            updateData.time = time;
        }

        // If weight or reps changed, recalculate oneRepMax
        if (updateData.weight !== undefined || updateData.reps !== undefined) {
            const newWeight = updateData.weight ?? existingLift.weight;
            const newReps = updateData.reps ?? existingLift.reps;
            updateData.oneRepMax = getOneRepMax(newWeight, newReps, "Recommended")!;
        }

        const updatedLift = await prisma.lift.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedLift, { status: 200 });
    } catch (error) {
        console.error("Error updating lift:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// Deletes a user's lift
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        const { id } = await req.json();
        if (!id || typeof id !== "string") {
            return new NextResponse("Invalid or missing id", { status: 400 });
        }
        // Check if lift exists and belongs to user
        const existingLift = await prisma.lift.findFirst({
            where: { id, userId: session.user.id }
        });
        if (!existingLift) {
            return new NextResponse("Lift not found or not authorized", { status: 404 });
        }
        const prismaResponse = await prisma.lift.delete({
            where: { id }
        });
        
        return NextResponse.json(prismaResponse);
    } catch (error) {
        console.error("Error deleting lift:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
"use client";

import { useExerciseContext } from "@/app/components/contextProviders/ExerciseProvider";
import Lifts from "@/app/components/Lifts";
import { addLift, updateLift, deleteLift, getLifts, Lift } from "@/app/services/api";
import { kgsToPounds } from "@/app/services/formulas";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Page() {

    const { data: session, status } = useSession();

    // Recieves & sanitizes search params
    const searchParams = useSearchParams();
    const weightParam = searchParams.get('weight');
    const isKgsParam = searchParams.get('inKgs') === "true";
    let convertedWeight: number | undefined = weightParam == null ? undefined : parseFloat(weightParam);
    if(convertedWeight !== undefined) {
        convertedWeight = isNaN(convertedWeight) ? undefined : Math.max(Math.round(convertedWeight * 100) / 100, 0);
    }
    const repsParam = searchParams.get('reps');
    let convertedReps: number | undefined = repsParam == null ? undefined : parseInt(repsParam);
    if(convertedReps !== undefined) {
        convertedReps = isNaN(convertedReps) ? undefined : Math.max(convertedReps, 0)
    }

    // Pulls exercises from context
    const { exercises, isLoading } = useExerciseContext();
    
    // Finds exercise matching URL slug param
    const params = useParams<{exercise: string}>();
    const exercise = useMemo(() => {
        return exercises.find((ex) => ex.URLSlug === params.exercise);
    }, [exercises, params.exercise]);

    // Fetches all of a users' lifts in this exercise
    const [userLifts, setUserLifts] = useState<Lift[]>([]);
    useEffect(() => {
        if(!(status === "authenticated")) return;
        async function fetchUserLifts() {
            if(!exercise) return;
            try {
                const response = await getLifts();
                const filteredLifts = response.filter((lift) => lift.exerciseId === exercise.id);
                setUserLifts(filteredLifts);
            } catch (error) {
                console.error("Error fetching user lifts:", error);
            }
        }
        fetchUserLifts();
    }, [exercise]);

    // Logs a single lift
    async function logLift(weight: number, reps: number, inKgs: boolean, time: Date): Promise<boolean> {
        if(!(status === "authenticated")) {
            window.alert("You must be logged in to log lifts");
            return false;
        };
        if(!exercise) {
            window.alert("Invalid exercise");
            return false;
        }
        if(weight <= 0) {
            window.alert("Invalid weight");
            return false;
        }
        if(reps <= 0 || !Number.isInteger(reps)) {
            window.alert("Invalid reps");
            return false;
        }
        try {
            const newLift = await addLift(exercise.id, inKgs ? kgsToPounds(weight) : weight, reps, time);
            if(!newLift) throw new Error("Failed to add lift");
            
            setUserLifts(prevLifts => [...prevLifts, newLift]);
            
            return true;
        } catch (error) {
            console.error("Error logging lift:", error);
            window.alert("Failed to log lift. Please try again.");
            return false;
        }
    }

    // Edits a single lift
    async function editLift(id: string, updates: { weight?: number; reps?: number; time?: Date }): Promise<boolean> {

        const { weight, reps } = updates;

        if(userLifts.find(lift => lift.id === id) === undefined) {
            window.alert("Unable to edit lift: lift not found.");
            return false;
        }
        if(weight !== undefined && weight <= 0) {
            window.alert("Unable to edit lift: invalid weight.");
            return false;
        }
        if(reps !== undefined && (reps <= 0 || !Number.isInteger(reps))) {
            window.alert("Unable to edit lift: invalid reps.");
            return false;
        }
        try {
            const newLift = await updateLift(id, updates);
            if(newLift === null) throw new Error("Failed to update lift");

            const newUserLifts = [...userLifts];
            const liftIndex = newUserLifts.findIndex(lift => lift.id === id);
            if(liftIndex === -1) {
                console.error("Failed to find lift to update. Please refresh page.");
                window.alert("Failed to update lift. Please refresh the page.");
                return false;
            }
            newUserLifts[liftIndex] = newLift;
            setUserLifts(newUserLifts);
            return true;

        } catch(error) {
            console.error("Error updating lift:", error);
            window.alert("Failed to update lift. Please try again.");
            return false;
        }
    }

    // Deletes a single lift
    async function removeLift(id: string): Promise<boolean> {
        const indexOf = userLifts.findIndex(lift => lift.id === id);
        if(indexOf === -1) {
            window.alert("Unable to delete lift: lift not found.");
            return false;
        }
        try {
            const deletedLift = await deleteLift(id);
            if(deletedLift !== null) {
                const newUserLifts = [...userLifts];
                newUserLifts.splice(indexOf, 1);
                setUserLifts(newUserLifts);
                return true;
            }
            else {
                throw new Error("Backend error. Please refresh page.")
            }
        } catch(error) {
            console.error("Error deleting lift:", error);
            window.alert("Failed to delete lift. Please try again.");
            return false;
        }
    }
    
    // Handle loading state
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-200">Loading exercises...</div>;
    }
    
    // Handle exercise not found
    if (!exercise) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-200">Exercise not found</div>;
    }
    
    return(
        <div className="w-full min-h-screen flex flex-col items-center bg-slate-200 sm:bg-stone-400 sm:p-4">
            <div className="w-full max-w-4xl flex flex-col items-center bg-slate-200 p-2 sm:p-6 sm:my-4 sm:rounded-lg sm:border sm:border-black">
                
                <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 px-2 text-center">{exercise.name}</h1>

                <div className="w-full max-w-2xl space-y-3 sm:space-y-4 mb-4 sm:mb-6 px-2 sm:px-4">
                    <div>
                        <h2 className="font-semibold mb-2 text-sm sm:text-base">Description:</h2>
                        <p className="text-gray-700 text-sm sm:text-base">{exercise.description}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <h2 className="font-semibold text-sm sm:text-base">Category:</h2>
                        <p className="text-gray-700 text-sm sm:text-base">{exercise.category}</p>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                        <h2 className="font-semibold text-sm sm:text-base">Affected regions:</h2>
                        <p className="text-gray-700 text-sm sm:text-base">{exercise.bodyParts.join(", ")}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <h2 className="font-semibold text-sm sm:text-base">Tags:</h2>
                        <p className="text-gray-700 text-sm sm:text-base">{exercise.tags.join(", ")}</p>
                    </div>
                </div>

                <div className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your Lifts:</div>
                {status === "authenticated" ? 
                    <Lifts 
                        lifts={userLifts} 
                        logLift={logLift} 
                        editLift={editLift} 
                        deleteLift={removeLift}
                        defaultUseKgs={isKgsParam}
                    /> : status === "loading" ? 
                    <div>Loading...</div> : 
                    <div>Please login to see your lifts</div>
                }
            </div>
        </div>
    )
}
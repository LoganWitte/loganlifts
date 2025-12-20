"use client";

import { useExerciseContext } from "@/app/components/contextProviders/ExerciseProvider";
import Lifts from "@/app/components/Lifts";
import { addLift, getLifts, Lift } from "@/app/services/api";
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

    // Creates state from converted params
    // Initial weight is (float, >= 0, rounded to 2 places) or undefined if not present
    // Initial reps is (integer, >= 0) or undefined if not present
    const [weight, setWeight] = useState<number>(convertedWeight || 135);
    const [reps, setReps] = useState<number>(convertedReps || 1);
    const [inKgs, setInKgs] = useState<boolean>(isKgsParam);

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
            // API call to add lift
            const newLift = await addLift(exercise.id, inKgs ? kgsToPounds(weight) : weight, reps, time);
            if(!newLift) throw new Error("Failed to add lift");
            
            // Update local state with the new lift (success!)
            setUserLifts(prevLifts => [...prevLifts, newLift]);
            
            return true;
        } catch (error) {
            console.error("Error logging lift:", error);
            window.alert("Failed to log lift. Please try again.");
            return false;
        }
    }
    
    // Handle loading state
    if (isLoading) {
        return <div>Loading exercises...</div>;
    }
    
    // Handle exercise not found
    if (!exercise) {
        return <div>Exercise not found</div>;
    }

    const row = "w-full flex flex-row items-center justify-center my-1 mt-2 mb-1";
    const h2 = "text font-semibold";
    const p = "flex flex-row text-center";
    
    return(

        <div className="w-full h-fit min-h-screen flex flex-col items-center bg-slate-200 sm:bg-stone-400">
            <div className="min-w-[45%] max-w-full h-fit flex flex-col items-center 
            sm:bg-slate-200 sm:p-4 sm:m-4 sm:rounded sm:border sm:border-black">
                <h1 className="text-2xl font-semibold m -2">{exercise.name}</h1>

                <div className={row}>
                    <h2 className={h2}>Description:</h2>
                </div>
                <p className={p + " sm:max-w-[65%] max-w-[90%] wrap-break-word"}>{exercise.description}</p>

                <div className={row}>
                    <h2 className={h2}>Category:</h2>
                    <p className={p + " ml-2"}>{exercise.category}</p>
                </div>
                
                <div className={row}>
                    <h2 className={h2}>Affected regions:</h2>
                    <p className={p + " ml-2"}>{exercise.bodyParts.join(", ")}</p>
                </div>

                <div className={row}>
                    <h2 className={h2}>Tags:</h2>
                    <p className={p + " ml-2"}>{exercise.tags.join(", ")}</p>
                </div>

                <div className="text-xl mt-4 mb-1 font-semibold">Your Lifts:</div>
                {status === "authenticated" ? 
                    <Lifts lifts={userLifts} logLift={logLift} /> : status === "loading" ? 
                    <div>Loading...</div> : 
                    <div>Please login to see your lifts</div>
                }
            </div>
        </div>
    )
}
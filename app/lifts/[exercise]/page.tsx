"use client";

import { useExerciseContext } from "@/app/components/contextProviders/ExerciseProvider";
import { addLift, getLifts, Lift } from "@/app/services/api";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Page() {

    // Recieves & sanitizes search params
    const searchParams = useSearchParams();
    const weightParam = searchParams.get('weight');
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
    async function handleLogClick(weight: number, reps: number): Promise<boolean> {
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
            const newLift = await addLift(exercise.id, weight, reps);
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

    // Have: id, weight, reps, exercise, userLifts, handleLogClick()
    // TODO:
    // * Display previous lifts
    // * Allow logging new lift with prefilled weight/reps if present
    
    return(
        <div>
            <h1>Exercise: {exercise.name}</h1>
            <p>ID: {exercise.id}</p>
            <p>Weight: {weight}</p>
            <p>Reps: {reps}</p>
        </div>
    )
}
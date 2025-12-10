"use client";
import { useExerciseContext } from "@/app/components/contextProviders/ExerciseProvider";
import { getLifts, Lift } from "@/app/services/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Page() {

    // Recieves & sanitizes search params
    const searchParams = useSearchParams();
    // Gets ID param (should always be present)
    const id = searchParams.get('id');
    // Gets weight, which is (float, >= 0, rounded to 2 places) or undefined if not present
    const weightParam = searchParams.get('weight');
    let weight: number | undefined = weightParam == null ? undefined : parseFloat(weightParam);
    if(weight !== undefined) {
        weight = isNaN(weight) ? undefined : Math.max(Math.round(weight * 100) / 100, 0);
    }
    // Gets reps, which is (integer, >= 0) or undefined if not present
    const repsParam = searchParams.get('reps');
    let reps: number | undefined = repsParam == null ? undefined : parseInt(repsParam);
    if(reps !== undefined) {
        reps = isNaN(reps) ? undefined : Math.max(reps, 0)
    }
    // Pulls exercises from context
    const { exercises, isLoading } = useExerciseContext();
    
    // Finds exercise matching ID param
    const exercise = useMemo(() => {
        return exercises.find((ex) => ex.id === id);
    }, [exercises, id]);
    
    // Displays URL params for testing
    /*
    useEffect(() => {
        console.log("ID:", id, "Weight:", weight, "Reps:", reps);
        console.log("Exercises array:", exercises);
        console.log("Exercise:", exercise);
        console.log("Is Loading:", isLoading);
    }, [id, weight, reps, exercise, exercises, isLoading])
    */

    // Fetches all of a users' lifts in this exercise
    const [userLifts, setUserLifts] = useState<Lift[]>([]);
    useEffect(() => {
        async function fetchUserLifts() {
            try {
                const response = await getLifts();
                const filteredLifts = response.filter((lift) => lift.exerciseId === id);
                //console.log("User lifts for exercise", id + ":", filteredLifts);
                setUserLifts(filteredLifts);
            } catch (error) {
                console.error("Error fetching user lifts:", error);
            }
        }
        fetchUserLifts();
    }, [id]);

    
    // Handle loading state
    if (isLoading) {
        return <div>Loading exercises...</div>;
    }
    
    // Handle exercise not found
    if (!exercise) {
        return <div>Exercise not found (ID: {id})</div>;
    }

    // Have: id, weight, reps, exercise, userLifts
    // TODO:
    // * Display previous lifts
    // * Allow logging new lift with prefilled weight/reps if present
    // addLift(exerciseId: string, weight: number, reps: number)
    
    return(
        <div>
            <h1>{exercise.name}</h1>
            <p>ID: {id}</p>
            {weight && <p>Weight: {weight}</p>}
            {reps && <p>Reps: {reps}</p>}
        </div>
    )
}
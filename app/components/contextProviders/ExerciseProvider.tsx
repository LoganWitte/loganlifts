"use client";

import { Exercise, getExercises } from "@/app/services/api";
import { useContext, createContext, useEffect, useState } from "react";

interface ExerciseContextType {
    exercises: Exercise[];
    isLoading: boolean;
}

const ExerciseContext = createContext<ExerciseContextType>({
    exercises: [],
    isLoading: true,
});

export function ExerciseProvider({ children }: { children: React.ReactNode }) {
    // State
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetches exercise list on mount
    useEffect(() => {
        (async () => {
            try {
                const data = await getExercises();
                setExercises(data);
            } catch (err) {
                console.error("Failed to fetch exercises:", err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return (
        <ExerciseContext.Provider value={{ exercises, isLoading }}>
            {children}
        </ExerciseContext.Provider>
    );
}

export const useExerciseContext = () => useContext(ExerciseContext);
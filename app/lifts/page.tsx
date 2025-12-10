"use client";

import { useState, useEffect, useMemo } from "react";
import { Exercise, getExercises } from "../services/api";
import { BODY_PART_OPTIONS, CATEGORY_OPTIONS } from "../services/constants";
import Dropdown from "../components/DropDown";
import { ArrowUpWideNarrow, ArrowDownWideNarrow, Plus } from "lucide-react";
import ExerciseMiniature from "../components/ExerciseMiniature";
import Link from "next/link";

export default function ExercisesPage() {

    // State
    const [bodyPart, setBodyPart] = useState(BODY_PART_OPTIONS[0]);
    const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [maxExercises, setMaxExercises] = useState(12);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch exercise data
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

    // Filter Logic
    const filteredExercises = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return exercises.filter(
            (ex) =>
                (bodyPart === "Any Body Part" || ex.bodyParts.includes(bodyPart)) &&
                (category === "Any Category" || ex.category === category) &&
                (ex.name.toLowerCase().includes(query) ||
                    ex.description?.toLowerCase().includes(query) ||
                    ex.tags.some((tag) => tag.toLowerCase().includes(query)))
        );
    }, [exercises, bodyPart, category, searchQuery]);

    return (
        <div className="w-full grow bg-stone-400 flex flex-col items-center py-4 overflow-auto">
            {/* Search + Filters */}
            <section className="min-w-fit w-[60vw] max-w-full flex flex-col gap-4">
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search Exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 rounded border border-black bg-slate-200
                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />

                {/* Filters */}
                <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 justify-center items-center">
                    <div className="w-48">
                        <Dropdown
                            options={BODY_PART_OPTIONS}
                            selected={bodyPart}
                            setSelected={setBodyPart}
                        />
                    </div>
                    <div className="w-48">
                        <Dropdown
                            options={CATEGORY_OPTIONS}
                            selected={category}
                            setSelected={setCategory}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between border border-black rounded bg-slate-200 px-2">
                        <div className="select-none">
                            Results: {Math.min(maxExercises, filteredExercises.length)} / {filteredExercises.length}
                        </div>
                        <ArrowUpWideNarrow
                            size={32}
                            className="ml-2 p-1 hover:cursor-pointer hover:bg-gray-300 rounded-full transition-colors"
                            onClick={() => { 
                                if (maxExercises < filteredExercises.length) {
                                    setMaxExercises(maxExercises + 4);
                                }
                            }} 
                        />
                        <ArrowDownWideNarrow 
                            size={32}
                            className="ml-2 p-1 hover:cursor-pointer hover:bg-gray-300 rounded-full transition-colors"
                            onClick={() => {
                                if (maxExercises > filteredExercises.length) {
                                    setMaxExercises(Math.max(4, filteredExercises.length % 4 === 0 ? filteredExercises.length - 4: filteredExercises.length - filteredExercises.length % 4));
                                } else {
                                    setMaxExercises(Math.max(4, maxExercises - 4));
                                }
                            }} 
                        />
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="min-w-fit w-[60vw] max-w-full py-2 px-8 sm:px-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    <p className="col-span-full text-center text-black font-bold text-xl">
                        Loading exercises...
                    </p>
                ) : filteredExercises.length === 0 ? (
                    <p className="col-span-full text-center text-black font-bold text-xl">
                        No exercises found.
                    </p>
                ) : (
                    filteredExercises.slice(0, maxExercises).map((exercise) => (
                        <ExerciseMiniature key={exercise.id} exercise={exercise} />
                    ))
                )}
            </section>

            {/* Add Exercise Link */}
            <section className="min-w-fit w-[60vw] max-w-full mt-6 mb-4 flex justify-center">
                <Link href="/lifts/add">
                    <button className="bg-orange-500 px-6 py-3 rounded-xl text-lg text-white font-bold 
                        flex items-center gap-2 border border-black 
                        hover:scale-105 transition duration-300 hover:cursor-pointer shadow-md">
                        <Plus size={24} />
                        Create Custom Exercise
                    </button>
                </Link>
            </section>
        </div>
    );
}
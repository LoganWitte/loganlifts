'use client';

import { useState, useEffect, useMemo } from "react";
import { Exercise, getExercises, addExercise, checkAdmin } from "../services/api";
import Dropdown from "../components/DropDown";
import { Category, acceptedBodyPart } from "../services/api";
import DropdownMultiSelect from "../components/DropDownMultiSelect";
import { BicepsFlexed, Globe, ArrowUpWideNarrow, ArrowDownWideNarrow} from "lucide-react";
import ExerciseMiniature from "../components/ExerciseMiniature";

// Exercise form options
const CATEGORY_OPTIONS = [
    "Any Category",
    "Barbell",
    "Bodyweight",
    "Dumbbell",
    "Machine",
    "Cable",
];
const BODY_PART_OPTIONS = [
    "Any Body Part",
    "Whole Body",
    "Core",
    "Legs",
    "Back",
    "Chest",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Forearms",
];

export default function ExercisesPage() {
    const [isAdmin, setIsAdmin] = useState(false);

    // State
    const [bodyPart, setBodyPart] = useState(BODY_PART_OPTIONS[0]);
    const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [maxExercises, setmaxExercises] = useState(12);

    //Add Exercise Form State
    const [nameInput, setNameInput] = useState("");
    const [descriptionInput, setDescriptionInput] = useState("");
    const [categoryInput, setCategoryInput] = useState<Category | "Category">(
        "Category"
    );
    const [bodyPartsInput, setBodyPartsInput] = useState<acceptedBodyPart[]>([]);
    const [tagsInput, setTagsInput] = useState<string>("");

    // Fetch exercise data
    useEffect(() => {
        (async () => {
            try {
                const data = await getExercises();
                setExercises(data);
            } catch (err) {
                console.error("Failed to fetch exercises:", err);
            }
        })();
    }, []);

    // Fetch isAdmin
    useEffect(() => {
        (async () => {
            try {
                const adminStatus = await checkAdmin();
                setIsAdmin(adminStatus);
            } catch (err) {
                console.error("Failed to check admin status:", err);
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

    function handleAddExerciseClick(global: boolean) {
        // Basic validation
        if (
            nameInput.trim() === "" ||
            categoryInput === "Category" ||
            bodyPartsInput.length === 0
        ) {
            alert(
                "Please fill in all required fields: Name, Category, and at least one Body Part."
            );
            return;
        }
        const tagsArray = tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "");
        addExercise(
            nameInput.trim(),
            bodyPartsInput,
            categoryInput,
            tagsArray,
            descriptionInput.trim() || undefined,
            global
        )
            .then((newExercise) => {
                if (newExercise) {
                    setExercises((prev) => [...prev, newExercise]);
                    // Clear form
                    setNameInput("");
                    setDescriptionInput("");
                    setCategoryInput("Category");
                    setBodyPartsInput([]);
                    setTagsInput("");
                }
            })
            .catch((err) => {
                console.error("Failed to add exercise:", err);
                alert("Failed to add exercise. Please try again.");
            });
    }

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
                <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 justify-center">
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
                    <button className="border border-black rounded bg-slate-200 px-2 flex flex-row hover:cursor-pointer hover:bg-slate-300"
                        onClick={() => {
                            if(maxExercises < filteredExercises.length) {
                                setmaxExercises(maxExercises + 4);
                            }
                        }}>
                        More exercises <ArrowUpWideNarrow className="ml-2" />
                    </button>
                    <button className="border border-black rounded bg-slate-200 px-2 flex flex-row hover:cursor-pointer hover:bg-slate-300"
                        onClick={() => {
                            if(maxExercises > filteredExercises.length) {
                                setmaxExercises(Math.max(4, filteredExercises.length % 4 === 0 ? filteredExercises.length - 4: filteredExercises.length - filteredExercises.length % 4));
                            }
                            else {
                                setmaxExercises(Math.max(4, maxExercises - 4));
                            }
                            }}>
                        Fewer exercises <ArrowDownWideNarrow className="ml-2" />
                    </button>
                    <div>
                        <p className="border border-black rounded bg-slate-200 px-2">Results: {maxExercises > filteredExercises.length ? filteredExercises.length : maxExercises} / {filteredExercises.length}</p>
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="min-w-fit w-[60vw] max-w-full py-2 px-8 sm:px-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredExercises.length === 0 ? (
                    <p className="col-span-full text-center text-black font-bold text-xl">
                        No exercises found.
                    </p>
                ) : (
                    filteredExercises.slice(0, maxExercises).map((exercise) => (
                        <ExerciseMiniature key={exercise.id} exercise={exercise} />
                    ))
                )}
            </section>

            {/* Add Exercise Form */}
            <section className="min-w-fit w-[40vw] max-w-full p-2 flex flex-col items-center bg-slate-200 rounded border border-black">
                <h3 className="text-xl sm:text-3xl text-orange-500 font-bold mb-4">
                    Add an exercise
                </h3>
                <input
                    id="name"
                    type="text"
                    value={nameInput}
                    placeholder="Exercise Name"
                    className="p-2 border border-black bg-slate-200 min-w-fit w-[50%]
                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    onChange={(e) => {
                        setNameInput(e.target.value);
                    }}
                />
                <textarea
                    id="description"
                    value={descriptionInput}
                    placeholder="Exercise Description (optional)"
                    className="mt-2 p-2 border border-black bg-slate-200 min-w-fit w-[50%]
                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize"
                    onChange={(e) => {
                        setDescriptionInput(e.target.value);
                    }}
                />
                <div className="flex gap-x-4 my-2">
                    <div className="w-40">
                        <Dropdown
                            options={["Category", ...CATEGORY_OPTIONS.slice(1)]}
                            selected={categoryInput}
                            setSelected={(value) => setCategoryInput(value as Category)}
                        />
                    </div>
                    <div className="w-40">
                        <DropdownMultiSelect
                            label={"Body Part(s)"}
                            options={BODY_PART_OPTIONS.slice(1)}
                            selected={bodyPartsInput}
                            setSelected={(value) =>
                                setBodyPartsInput(value as acceptedBodyPart[])
                            }
                        />
                    </div>
                </div>
                <textarea
                    id="tags"
                    value={tagsInput}
                    placeholder="Other Tags (optional, seperate with commas. ex: powerlifting, olympic)"
                    className="mb-2 p-2 border border-black bg-slate-200 min-w-fit w-[50%]
                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize"
                    onChange={(e) => {
                        setTagsInput(e.target.value);
                    }}
                />
                {/* Submit button area */}
                <div className="flex gap-4 mb-2">
                    <button
                        className="bg-orange-500 p-2 rounded-xl sm:text-lg text-white font-bold flex border border-black hover:scale-105 transition duration-300 hover:cursor-pointer items-center"
                        onClick={() => handleAddExerciseClick(false)}
                    >
                        Add Exercise
                        <BicepsFlexed className="ml-2" />
                    </button>
                    {isAdmin && <>
                        <button
                            className="bg-orange-500 p-2 rounded-xl sm:text-lg text-white font-bold flex border border-black hover:scale-105 transition duration-300 hover:cursor-pointer items-center"
                            onClick={() => handleAddExerciseClick(true)}
                        >
                            Add Exercise (Global)
                            <Globe className="ml-2" />
                        </button>
                    </>}
                </div>
            </section>
        </div>
    );
}

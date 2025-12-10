"use client";

import Dropdown from "@/app/components/DropDown";
import DropdownMultiSelect from "@/app/components/DropDownMultiSelect";
import { Category, acceptedBodyPart, addExercise, checkAdmin } from "@/app/services/api";
import { useState, useEffect } from "react";
import { BODY_PART_OPTIONS, CATEGORY_OPTIONS } from "@/app/services/constants";
import { Dumbbell, Globe, Loader2, CheckCircle2 } from "lucide-react";

export default function AddExercisePage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
    
    // Add Exercise Form State
    const [nameInput, setNameInput] = useState("");
    const [descriptionInput, setDescriptionInput] = useState("");
    const [categoryInput, setCategoryInput] = useState<Category | "Category" | "Category *">("Category");
    const [bodyPartsInput, setBodyPartsInput] = useState<acceptedBodyPart[]>([]);
    const [tagsInput, setTagsInput] = useState("");
    
    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Fetch isAdmin
    useEffect(() => {
        (async () => {
            try {
                const adminStatus = await checkAdmin();
                setIsAdmin(adminStatus);
            } catch (err) {
                console.error("Failed to check admin status:", err);
            } finally {
                setIsCheckingAdmin(false);
            }
        })();
    }, []);

    // Validation function
    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (nameInput.trim() === "") {
            newErrors.name = "Exercise name is required";
        }
        
        if (categoryInput === "Category" || categoryInput === "Category *") {
            newErrors.category = "Please select a category";
        }
        
        if (bodyPartsInput.length === 0) {
            newErrors.bodyParts = "Please select at least one body part";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Clear form function
    const clearForm = () => {
        setNameInput("");
        setDescriptionInput("");
        setCategoryInput("Category");
        setBodyPartsInput([]);
        setTagsInput("");
        setErrors({});
    };

    // Handle form submission
    async function handleAddExerciseClick(global: boolean) {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitSuccess(false);

        try {
            const tagsArray = tagsInput
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag !== "");
            
            const newExercise = await addExercise(
                nameInput.trim(),
                bodyPartsInput,
                categoryInput as Category, // Type assertion safe here due to validation
                tagsArray,
                descriptionInput.trim() || undefined,
                global
            );

            if (newExercise) {
                setSubmitSuccess(true);
                clearForm();
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSubmitSuccess(false);
                }, 3000);
            }
        } catch (err) {
            console.error("Failed to add exercise:", err);
            setErrors({ submit: "Failed to add exercise. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="min-w-fit w-[40vw] max-w-full p-6 flex flex-col items-center bg-slate-200 rounded border border-black mt-8">
            <h3 className="text-xl sm:text-3xl text-orange-500 font-bold mb-6">
                Add Custom Exercise
            </h3>

            {/* Success Message */}
            {submitSuccess && (
                <div className="w-full mb-4 p-3 bg-green-100 border border-green-500 rounded flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Exercise added successfully!</span>
                </div>
            )}

            {/* Error Message */}
            {errors.submit && (
                <div className="w-full mb-4 p-3 bg-red-100 border border-red-500 rounded text-red-700">
                    {errors.submit}
                </div>
            )}

            {/* Name Input */}
            <div className="w-full flex flex-col items-center mb-4">
                <input
                    id="name"
                    type="text"
                    value={nameInput}
                    placeholder="Exercise Name *"
                    className={`p-2 border ${errors.name ? 'border-red-500' : 'border-black'} bg-slate-200 min-w-fit w-[50%]
                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                    onChange={(e) => {
                        setNameInput(e.target.value);
                        if (errors.name) {
                            setErrors(prev => ({ ...prev, name: "" }));
                        }
                    }}
                />
                {errors.name && (
                    <span className="text-red-500 text-sm mt-1">{errors.name}</span>
                )}
            </div>

            {/* Description Input */}
            <textarea
                id="description"
                value={descriptionInput}
                placeholder="Exercise Description (optional)"
                className="mb-4 p-2 border border-black bg-slate-200 min-w-fit w-[50%] h-24
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y"
                onChange={(e) => {
                    setDescriptionInput(e.target.value);
                }}
            />

            {/* Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full justify-center items-center">
                <div className="w-40">
                    <Dropdown
                        options={["Category *", ...CATEGORY_OPTIONS.slice(1)]}
                        selected={categoryInput === "Category" ? "Category *" : categoryInput}
                        setSelected={(value) => {
                            const cleanValue = value === "Category *" ? "Category" : value;
                            setCategoryInput(cleanValue as Category);
                            if (errors.category) {
                                setErrors(prev => ({ ...prev, category: "" }));
                            }
                        }}
                    />
                    {errors.category && (
                        <span className="text-red-500 text-sm block mt-1">{errors.category}</span>
                    )}
                </div>
                <div className="w-40">
                    <DropdownMultiSelect
                        label={"Body Part(s) *"}
                        options={BODY_PART_OPTIONS.slice(1)}
                        selected={bodyPartsInput}
                        setSelected={(value) => {
                            setBodyPartsInput(value as acceptedBodyPart[]);
                            if (errors.bodyParts) {
                                setErrors(prev => ({ ...prev, bodyParts: "" }));
                            }
                        }}
                    />
                    {errors.bodyParts && (
                        <span className="text-red-500 text-sm block mt-1">{errors.bodyParts}</span>
                    )}
                </div>
            </div>

            {/* Tags Input */}
            <textarea
                id="tags"
                value={tagsInput}
                placeholder="Other Tags (optional, separate with commas. ex: powerlifting, olympic)"
                className="mb-4 p-2 border border-black bg-slate-200 min-w-fit w-[50%] h-16
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y"
                onChange={(e) => {
                    setTagsInput(e.target.value);
                }}
            />

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
                <button
                    className="bg-orange-500 p-3 rounded-xl sm:text-lg text-white font-bold flex border border-black 
                        hover:scale-105 transition duration-300 hover:cursor-pointer items-center justify-center
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={() => handleAddExerciseClick(false)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        <>
                            Add Exercise (Just You)
                            <Dumbbell className="ml-2" />
                        </>
                    )}
                </button>
                
                {!isCheckingAdmin && isAdmin && (
                    <button
                        className="bg-orange-500 p-3 rounded-xl sm:text-lg text-white font-bold flex border border-black 
                            hover:scale-105 transition duration-300 hover:cursor-pointer items-center justify-center
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        onClick={() => handleAddExerciseClick(true)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                Suggest Exercise (All Users)
                                <Globe className="ml-2" />
                            </>
                        )}
                    </button>
                )}
            </div>
            
            <p className="text-sm text-gray-600 mt-2">* Required fields</p>
        </section>
    );
}
"use client";

import { useMemo, useState, useEffect } from "react";
import { Lift } from "../services/api";
import ToggleSwitch from "./ToggleSwitch";
import { BicepsFlexed, Trash2 } from "lucide-react";
import { getOneRepMax, poundsToKgs, kgsToPounds } from "../services/formulas";
import LiftsChart from "./LiftsChart";
import { useSearchParams } from "next/navigation";

type LiftsProps = {
    lifts: Lift[];
    logLift: (weight: number, reps: number, inKgs: boolean, time: Date) => Promise<boolean>;
    editLift: (id: string, updates: { weight?: number; reps?: number; time?: Date }) => Promise<boolean>;
    deleteLift: (id: string) => Promise<boolean>;
    defaultUseKgs?: boolean;
};

export default function Lifts(props: LiftsProps) {

    const { lifts, logLift, editLift, deleteLift, defaultUseKgs = false } = props;

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
        convertedReps = isNaN(convertedReps) ? undefined : Math.max(convertedReps, 0);
    }

    // Slider states
    const [useKgs, setUseKgs] = useState<boolean>(defaultUseKgs);
    const [editEnabled, setEditEnabled] = useState<boolean>(false);

    // Clears selectedLift when selecting 'add lift'
    useEffect(() => {
        if(!editEnabled) setSelectedLift(undefined);
    }, [editEnabled]);

    // Add lift form state
    const [weightInput, setWeightInput] = useState<number>(convertedWeight || 135);
    const [repsInput, setRepsInput] = useState<number>(convertedReps || 1);
    const [newLiftTime, setNewLiftTime] = useState<string>(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });

    // Edit lift form state
    const [editWeightInput, setEditWeightInput] = useState<number>(0);
    const [editRepsInput, setEditRepsInput] = useState<number>(0);
    const [editLiftTime, setEditLiftTime] = useState<string>("");

    // Used for success / error display in add lift form
    const [addMessage, setAddMessage] = useState<string>("");
    const tempSetAddMessage = (s: string) => {
        setAddMessage(s);
        setTimeout(() => setAddMessage(""), 5000);
    }

    // Used for success / error display in edit lift form
    const [editMessage, setEditMessage] = useState<string>("");
    const tempSetEditMessage = (s: string) => {
        setEditMessage(s);
        setTimeout(() => setEditMessage(""), 5000);
    }

    // Selected lift state
    const [selectedLift, setSelectedLift] = useState<Lift | undefined>(undefined);

    // Update edit form when selectedLift changes
    useEffect(() => {
        if(selectedLift) {
            const displayWeight = useKgs ? poundsToKgs(selectedLift.weight) : selectedLift.weight;
            setEditWeightInput(Math.round(displayWeight * 100) / 100);
            setEditRepsInput(selectedLift.reps);
            const liftDate = new Date(selectedLift.time);
            liftDate.setMinutes(liftDate.getMinutes() - liftDate.getTimezoneOffset());
            setEditLiftTime(liftDate.toISOString().slice(0, 16));
        }
    }, [selectedLift, useKgs]);

    // Enables edit mode when selecting a lift
    useEffect(() => {
        if(selectedLift !== undefined && !editEnabled) setEditEnabled(true);
    }, [selectedLift, editEnabled]);

    // Calculate 1RM from weight & reps (add form)
    const oneRepMax = useMemo<number>(() => {
        return Math.round(getOneRepMax(weightInput, repsInput, "Recommended")! * 100) / 100;
    }, [weightInput, repsInput]);

    // Calculate 1RM from weight & reps (edit form)
    const editOneRepMax = useMemo<number>(() => {
        return Math.round(getOneRepMax(editWeightInput, editRepsInput, "Recommended")! * 100) / 100;
    }, [editWeightInput, editRepsInput]);

    // Input handlers with proper validation
    const handleWeightChange = (value: string) => {
        if (value === "") {
            setWeightInput(0);
            return;
        }
        const num = parseFloat(value);
        if (!isNaN(num) && num >= 0) {
            setWeightInput(num);
        }
    };

    const handleRepsChange = (value: string) => {
        if (value === "") {
            setRepsInput(0);
            return;
        }
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0) {
            setRepsInput(num);
        }
    };

    const handleEditWeightChange = (value: string) => {
        if (value === "") {
            setEditWeightInput(0);
            return;
        }
        const num = parseFloat(value);
        if (!isNaN(num) && num >= 0) {
            setEditWeightInput(num);
        }
    };

    const handleEditRepsChange = (value: string) => {
        if (value === "") {
            setEditRepsInput(0);
            return;
        }
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0) {
            setEditRepsInput(num);
        }
    };

    // Log lift button click handler
    async function handleLogClick() {
        setAddMessage("");
        const result = await logLift(weightInput, repsInput, useKgs, new Date(newLiftTime));
        if(result) {
            setWeightInput(135);
            setRepsInput(1);
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setNewLiftTime(now.toISOString().slice(0, 16));
            tempSetAddMessage("Lift logged successfully!");
        }
        else {
            tempSetAddMessage("Error logging lift.");
        }
    }

    async function handleEditClick() {
        setEditMessage("");
        if(!selectedLift) {
            tempSetEditMessage("No lift selected.");
            return;
        }

        const weightInPounds = useKgs ? kgsToPounds(editWeightInput) : editWeightInput;

        const result = await editLift(selectedLift.id, {
            weight: weightInPounds,
            reps: editRepsInput,
            time: new Date(editLiftTime)
        });

        if(result) {
            tempSetEditMessage("Lift updated successfully!");
        }
        else {
            tempSetEditMessage("Error updating lift.");
        }
    }

    async function handleDeleteClick() {
        if(!selectedLift) {
            tempSetEditMessage("No lift selected.");
            return;
        }

        const confirmed = window.confirm("Are you sure you want to delete this lift?");
        if(!confirmed) return;

        setEditMessage("");
        const result = await deleteLift(selectedLift.id);

        if(result) {
            setSelectedLift(undefined);
            setEditWeightInput(0);
            setEditRepsInput(0);
            setEditLiftTime("");
            tempSetEditMessage("Lift deleted successfully!");
        }
        else {
            tempSetEditMessage("Error deleting lift.");
        }
    }

    function handleCancelClick() {
        setSelectedLift(undefined);
        setEditWeightInput(0);
        setEditRepsInput(0);
        setEditLiftTime("");
        setEditMessage("");
    }

    return (
        <div className="w-full flex flex-col items-center px-2 sm:px-4">
            
            <div className="mb-4">
                <ToggleSwitch falseString="Pounds" trueString="Kilograms" value={useKgs} setValue={setUseKgs} />
            </div>
            
            <div className="w-full mb-4">
                <LiftsChart 
                    lifts={lifts} useKgs={useKgs} 
                    selectedLift={selectedLift} setSelectedLift={setSelectedLift} 
                />
            </div>
            
            <div className="w-full max-w-md border border-gray-300 rounded-lg">
                <div className="border-b border-gray-300 p-3">
                    <ToggleSwitch falseString="Add new" trueString="Edit existing" value={editEnabled} setValue={setEditEnabled} />
                </div>
                {!editEnabled ? (
                    <div className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3">
                            <label htmlFor="weightInput" className="font-bold text-sm sm:text-base">Weight ({useKgs ? "kg" : "lb"}):</label>
                            <input 
                                type="number" 
                                id="weightInput" 
                                className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full sm:w-24 text-sm sm:text-base" 
                                value={weightInput === 0 ? "" : weightInput} 
                                onChange={(e) => handleWeightChange(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3">
                            <label htmlFor="repsInput" className="font-bold text-sm sm:text-base">Reps:</label>
                            <input 
                                type="number" 
                                id="repsInput" 
                                className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full sm:w-24 text-sm sm:text-base" 
                                value={repsInput === 0 ? "" : repsInput} 
                                onChange={(e) => handleRepsChange(e.target.value)}
                                min="0"
                                step="1"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3">
                            <label htmlFor="1RMOutput" className="font-bold text-sm sm:text-base">1RM ({useKgs ? "kg" : "lb"}):</label>
                            <output id="1RMOutput" className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full sm:w-24 text-center text-sm sm:text-base">{oneRepMax}</output>
                        </div>
                        <div className="flex flex-col gap-2 mb-3">
                            <label htmlFor="timeInput" className="font-bold text-sm sm:text-base">Date & Time:</label>
                            <input id="timeInput" type="datetime-local" className="border border-gray-300 bg-gray-100 rounded px-3 py-2 text-sm sm:text-base"
                                value={newLiftTime} onChange={(e) => setNewLiftTime(e.target.value)}
                            />
                        </div>
                        {addMessage !== "" && (
                            <div className="mb-3">
                                <p className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-center text-sm sm:text-base">{addMessage}</p>
                            </div>
                        )}
                        <div className="pt-2">
                            <button className="w-full bg-orange-500 px-4 py-3 rounded-lg text-white font-bold flex justify-center items-center gap-2
                                border border-orange-600 hover:bg-orange-600 hover:cursor-pointer transition duration-300 text-sm sm:text-base"
                                onClick={handleLogClick}
                            >
                                Log lift
                                <BicepsFlexed size={18} className="sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 sm:p-4">
                        {!selectedLift ? (
                            <p className="text-center text-gray-600 text-sm sm:text-base">Please select a lift to edit.</p>
                        ) : (
                            <>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3">
                                    <label htmlFor="editWeightInput" className="font-bold text-sm sm:text-base">Weight ({useKgs ? "kg" : "lb"}):</label>
                                    <input 
                                        type="number" 
                                        id="editWeightInput" 
                                        className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full sm:w-24 text-sm sm:text-base" 
                                        value={editWeightInput === 0 ? "" : editWeightInput} 
                                        onChange={(e) => handleEditWeightChange(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3">
                                    <label htmlFor="editRepsInput" className="font-bold text-sm sm:text-base">Reps:</label>
                                    <input 
                                        type="number" 
                                        id="editRepsInput" 
                                        className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full sm:w-24 text-sm sm:text-base" 
                                        value={editRepsInput === 0 ? "" : editRepsInput} 
                                        onChange={(e) => handleEditRepsChange(e.target.value)}
                                        min="0"
                                        step="1"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3">
                                    <label htmlFor="edit1RMOutput" className="font-bold text-sm sm:text-base">1RM ({useKgs ? "kg" : "lb"}):</label>
                                    <output id="edit1RMOutput" className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full sm:w-24 text-center text-sm sm:text-base">{editOneRepMax}</output>
                                </div>
                                <div className="flex flex-col gap-2 mb-3">
                                    <label htmlFor="editTimeInput" className="font-bold text-sm sm:text-base">Date & Time:</label>
                                    <input id="editTimeInput" type="datetime-local" className="border border-gray-300 bg-gray-100 rounded px-3 py-2 text-sm sm:text-base"
                                        value={editLiftTime} onChange={(e) => setEditLiftTime(e.target.value)}
                                    />
                                </div>
                                {editMessage !== "" && (
                                    <div className="mb-3">
                                        <p className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-center text-sm sm:text-base">{editMessage}</p>
                                    </div>
                                )}
                                <div className="pt-2 space-y-2">
                                    <button className="w-full bg-orange-500 px-4 py-3 rounded-lg text-white font-bold flex justify-center items-center gap-2
                                        border border-orange-600 hover:bg-orange-600 hover:cursor-pointer transition duration-300 text-sm sm:text-base"
                                        onClick={handleEditClick}
                                    >
                                        Save changes
                                        <BicepsFlexed size={18} className="sm:w-6 sm:h-6" />
                                    </button>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-gray-500 px-4 py-2 rounded-lg text-white font-bold
                                            border border-gray-600 hover:bg-gray-600 hover:cursor-pointer transition duration-300 text-sm sm:text-base"
                                            onClick={handleCancelClick}
                                        >
                                            Cancel
                                        </button>
                                        <button className="flex-1 bg-red-500 px-4 py-2 rounded-lg text-white font-bold flex justify-center items-center gap-2
                                            border border-red-600 hover:bg-red-600 hover:cursor-pointer transition duration-300 text-sm sm:text-base"
                                            onClick={handleDeleteClick}
                                        >
                                            Delete
                                            <Trash2 size={16} className="sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
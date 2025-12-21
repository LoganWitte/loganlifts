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
};

export default function Lifts(props: LiftsProps) {

    const { lifts, logLift, editLift, deleteLift } = props;

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
    const [useKgs, setUseKgs] = useState<boolean>(false);
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
    }, [selectedLift])

    // Calculate 1RM from weight & reps (add form)
    const oneRepMax = useMemo<number>(() => {
        // ! is fine bcs recommended formula is always defined.
        return Math.round(getOneRepMax(weightInput, repsInput, "Recommended")! * 100) / 100;
    }, [weightInput, repsInput]);

    // Calculate 1RM from weight & reps (edit form)
    const editOneRepMax = useMemo<number>(() => {
        // ! is fine bcs recommended formula is always defined.
        return Math.round(getOneRepMax(editWeightInput, editRepsInput, "Recommended")! * 100) / 100;
    }, [editWeightInput, editRepsInput]);

    // Log lift button click handler
    async function handleLogClick() {
        setAddMessage("");
        const result = await logLift(weightInput, repsInput, useKgs, new Date(newLiftTime));
        if(result) {
            // Reset form after successful log
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

        // Convert weight back to pounds if necessary
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
        <div className="w-[80%] flex flex-col items-center p-4">
            
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
                    <div className="p-4">
                        <div className="flex justify-between items-center gap-4 mb-3">
                            <label htmlFor="weightInput" className="font-bold min-w-fit">Weight ({useKgs ? "kg" : "lb"}):</label>
                            <input type="number" id="weightInput" className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-24" value={weightInput} onChange={(e) => setWeightInput(parseFloat(e.target.value) || 0)}></input>
                        </div>
                        <div className="flex justify-between items-center gap-4 mb-3">
                            <label htmlFor="repsInput" className="font-bold min-w-fit">Reps:</label>
                            <input type="number" id="repsInput" className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-24" value={repsInput} onChange={(e) => setRepsInput(parseInt(e.target.value) || 0)}></input>
                        </div>
                        <div className="flex justify-between items-center gap-4 mb-3">
                            <label htmlFor="1RMOutput" className="font-bold min-w-fit">1RM ({useKgs ? "kg" : "lb"}):</label>
                            <output id="1RMOutput" className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-24 text-center">{oneRepMax}</output>
                        </div>
                        <div className="flex flex-col gap-2 mb-3">
                            <label htmlFor="timeInput" className="font-bold">Date & Time:</label>
                            <input id="timeInput" type="datetime-local" className="border border-gray-300 bg-gray-100 rounded px-3 py-2"
                                value={newLiftTime} onChange={(e) => setNewLiftTime(e.target.value)}
                            />
                        </div>
                        {addMessage !== "" && (
                            <div className="mb-3">
                                <p className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-center">{addMessage}</p>
                            </div>
                        )}
                        <div className="pt-2">
                            <button className="w-full bg-orange-500 px-4 py-3 rounded-lg text-white font-bold flex justify-center items-center gap-2
                                border border-orange-600 hover:bg-orange-600 transition duration-300"
                                onClick={handleLogClick}
                            >
                                Log lift
                                <BicepsFlexed />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        {!selectedLift ? (
                            <p className="text-center text-gray-600">Please select a lift to edit.</p>
                        ) : (
                            <>
                                <div className="flex justify-between items-center gap-4 mb-3">
                                    <label htmlFor="editWeightInput" className="font-bold min-w-fit">Weight ({useKgs ? "kg" : "lb"}):</label>
                                    <input type="number" id="editWeightInput" className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-24" value={editWeightInput} onChange={(e) => setEditWeightInput(parseFloat(e.target.value) || 0)}></input>
                                </div>
                                <div className="flex justify-between items-center gap-4 mb-3">
                                    <label htmlFor="editRepsInput" className="font-bold min-w-fit">Reps:</label>
                                    <input type="number" id="editRepsInput" className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-24" value={editRepsInput} onChange={(e) => setEditRepsInput(parseInt(e.target.value) || 0)}></input>
                                </div>
                                <div className="flex justify-between items-center gap-4 mb-3">
                                    <label htmlFor="edit1RMOutput" className="font-bold min-w-fit">1RM ({useKgs ? "kg" : "lb"}):</label>
                                    <output id="edit1RMOutput" className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-24 text-center">{editOneRepMax}</output>
                                </div>
                                <div className="flex flex-col gap-2 mb-3">
                                    <label htmlFor="editTimeInput" className="font-bold">Date & Time:</label>
                                    <input id="editTimeInput" type="datetime-local" className="border border-gray-300 bg-gray-100 rounded px-3 py-2"
                                        value={editLiftTime} onChange={(e) => setEditLiftTime(e.target.value)}
                                    />
                                </div>
                                {editMessage !== "" && (
                                    <div className="mb-3">
                                        <p className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-center">{editMessage}</p>
                                    </div>
                                )}
                                <div className="pt-2 space-y-2">
                                    <button className="w-full bg-orange-500 px-4 py-3 rounded-lg text-white font-bold flex justify-center items-center gap-2
                                        border border-orange-600 hover:bg-orange-600 hover:cursor-pointer transition duration-300"
                                        onClick={handleEditClick}
                                    >
                                        Save changes
                                        <BicepsFlexed />
                                    </button>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-gray-500 px-4 py-2 rounded-lg text-white font-bold
                                            border border-gray-600 hover:bg-gray-600 hover:cursor-pointer transition duration-300"
                                            onClick={handleCancelClick}
                                        >
                                            Cancel
                                        </button>
                                        <button className="flex-1 bg-red-500 px-4 py-2 rounded-lg text-white font-bold flex justify-center items-center gap-2
                                            border border-red-600 hover:bg-red-600 hover:cursor-pointer transition duration-300"
                                            onClick={handleDeleteClick}
                                        >
                                            Delete
                                            <Trash2 size={18} />
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
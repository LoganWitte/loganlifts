"use client";

import { useMemo, useState } from "react";
import { Lift } from "../services/api";
import ToggleSwitch from "./ToggleSwitch";
import { BicepsFlexed } from "lucide-react";
import { getOneRepMax } from "../services/formulas";
import LiftChart from "./LiftChart";
import { useSearchParams } from "next/navigation";

type LiftsProps = {
    lifts: Lift[];
    logLift: (weight: number, reps: number, inKgs: boolean, time: Date) => Promise<boolean>;
};

export default function Lifts(props: LiftsProps) {

    const { lifts, logLift } = props;

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

    // Add lift form state
    const [weightInput, setWeightInput] = useState<number>(convertedWeight || 135);
    const [repsInput, setRepsInput] = useState<number>(convertedReps || 1);
    const [newLiftTime, setNewLiftTime] = useState<string>(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });
    const [userMessage, setUserMessage] = useState<string>("");

    // Calculate 1RM from weight & reps
    const oneRepMax = useMemo<number>(() => {
        // ! is fine bcs recommended formula is always defined.
        return Math.round(getOneRepMax(weightInput, repsInput, "Recommended")! * 100) / 100;
    }, [weightInput, repsInput]);

    const showTemporaryUserMessage = (s: string) => {
        setUserMessage(s);
        setTimeout(() => setUserMessage(""), 5000);
    }

    // Log lift button click handler
    async function handleLogClick() {
        setUserMessage("");
        const result = await logLift(weightInput, repsInput, useKgs, new Date(newLiftTime));
        if(result) {
            // Reset form after successful log
            setWeightInput(135);
            setRepsInput(1);
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setNewLiftTime(now.toISOString().slice(0, 16));
            showTemporaryUserMessage("Lift logged successfully!");
        }
        else {
            showTemporaryUserMessage("Error logging lift.");
        }
    }

    return (
        <div className="flex flex-col items-center p-2">
            <ToggleSwitch falseString="Pounds" trueString="Kilograms" value={useKgs} setValue={setUseKgs} />
            {/*TODO: Replace below div w/ graph element, likely using library.*/}
            <LiftChart lifts={lifts} useKgs={useKgs} />
            <div className="w-full flex flex-col justify-center border border-t-0">
                <ToggleSwitch falseString="Add new" trueString="Edit existing" value={editEnabled} setValue={setEditEnabled} />
                {!editEnabled ? (
                    <div className="w-full flex flex-col items-center">
                        <div className="w-full flex justify-center items-center p-1">
                            <label htmlFor="weightInput" className="font-bold w-32">Weight ({useKgs ? "kg" : "lb"}):</label>
                            <input type="number" id="weightInput" className="bg-gray-300 border w-20 flex items-center p-1" value={weightInput} onChange={(e) => setWeightInput(parseFloat(e.target.value) || 0)}></input>
                        </div>
                        <div className="w-full flex justify-center items-center p-1">
                            <label htmlFor="repsInput" className="font-bold w-32">Reps:</label>
                            <input type="number" id="repsInput" className="bg-gray-300 border w-20 flex items-center p-1" value={repsInput} onChange={(e) => setRepsInput(parseInt(e.target.value) || 0)}></input>
                        </div>
                        <div className="w-full flex justify-center items-center p-1">
                            <label htmlFor="1RMOutput" className="font-bold w-32">1RM ({useKgs ? "kg" : "lb"}):</label>
                            <output id="1RMOutput" className="bg-gray-300 border h-6 w-20 flex items-center justify-center p-1">{oneRepMax}</output>
                        </div>
                        <div className="w-full flex flex-col items-center p-1">
                            <label htmlFor="timeInput" className="font-bold">Date & Time:</label>
                            <input id="timeInput" type="datetime-local" className="border bg-gray-300"
                                value={newLiftTime} onChange={(e) => setNewLiftTime(e.target.value)}
                            />
                        </div>
                        {userMessage !== "" && (
                            <div className="w-full flex justify-center items-center p-1">
                                <p className="bg-gray-300 border w-64 flex items-center justify-center p-1">{userMessage}</p>
                            </div>
                        )}
                        <div className="w-full flex justify-center items-center p-1">
                            <button className="bg-orange-500 p-2 rounded-xl items-center sm:text-lg text-white font-bold flex 
                                border border-black my-2 hover:scale-105 transition duration-300 hover:cursor-pointer"
                                onClick={handleLogClick}
                            >
                                Log lift
                                <BicepsFlexed className="ml-2" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center">
                        <p className="p-2 text-center">
                            TODO: after clicking a lift, display a form with the selected lift's data, allowing the user to edit it.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
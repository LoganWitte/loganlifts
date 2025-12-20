"use client";

import { useMemo, useState } from "react";
import ToggleSwitch from "../components/ToggleSwitch";
import { CircleQuestionMark, BicepsFlexed, LogIn } from 'lucide-react'
import Link from "next/link";
import EquivalentLifts from "../components/EquivalentLifts";
import { allowedFormula, getOneRepMax } from "../services/formulas";
import { useSession } from "next-auth/react";

export default function page() {

    // Must mirror 'allowedFormula' from 'formulas.ts':
    // "Recommended" | "Brzycki" | "Epley" | "Lombardi" | "OConnor";
    const FORMULA_OPTIONS = ["Recommended", "Brzycki", "Epley", "Lombardi", "OConnor"];

    {/* Default values */ }
    const defaultWeight = 135;
    const defaultReps = 1;
    const defaultFormula = "Recommended";

    const [useKgs, setUseKgs] = useState(false);
    const [weight, setWeight] = useState(defaultWeight);
    const [reps, setReps] = useState(defaultReps);
    const [formula, setFormula] = useState<allowedFormula>(defaultFormula);

    const oneRepMax = useMemo(() => {
        return getOneRepMax(weight, reps, formula);
    }, [weight, reps, formula]);

    function roundWeight(weight: number) {
        return Math.round(weight * 100) / 100;
    }

    // Checks logged in status
    const { data: session, status } = useSession();

    return (
        <div className="w-full h-fit min-h-screen flex flex-col items-center bg-stone-400">
            <div className="w-fit h-fit flex flex-col items-center bg-slate-200 p-4 m-4 rounded border border-black">
                <div className="text-lg sm:text-3xl my-4">1RM Calculator</div>
                <ToggleSwitch trueString="Kilograms" falseString="Pounds" value={useKgs} setValue={setUseKgs} />
                <div className="w-full flex flex-row items-center justify-between p-2">
                    <label htmlFor="weight" className="font-bold">Weight {useKgs ? "(kg)" : "(lb)"}:</label>
                    <input
                        type="number" id="weight" name="weight" min="1" step="1" defaultValue={defaultWeight}
                        className="bg-gray-300 border border-black p-1 ml-1 w-20"
                        onChange={(e) => setWeight(isNaN(parseFloat(e.target.value)) ? 0 : roundWeight(parseFloat(e.target.value)))}
                    />
                </div>
                <div className="w-full flex flex-row items-center justify-between p-2">
                    <label htmlFor="reps" className="font-bold">Reps:</label>
                    <input
                        type="number" id="reps" name="reps" min="1" step="1" defaultValue={defaultReps}
                        className="bg-gray-300 border border-black p-1 ml-1 w-20"
                        onChange={(e) => setReps(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                    />
                </div>
                <div className="w-full flex flex-row items-center justify justify-between p-2">
                    <label htmlFor="formula" className="font-bold mr-6">Formula:</label>
                    <select value={formula} id="formula"
                        onChange={(e) => {
                            if(FORMULA_OPTIONS.includes(e.target.value)) {
                                setFormula(e.target.value as allowedFormula);
                            }
                        }}
                        className="bg-gray-300 border border-black p-1 ml-1 rounded-none"
                    >
                        <option value="Recommended">Recommended</option>
                        <option value="Brzycki">Brzycki</option>
                        <option value="Epley">Epley</option>
                        <option value="Lombardi">Lombardi</option>
                        <option value="OConnor">O'Connor</option>
                    </select>
                    <Link href="/calculationinfo" ><CircleQuestionMark className="ml-1 opacity-75 hover:opacity-100 hover:cursor-pointer" /></Link>

                </div>
                <div className="w-full flex flex-col items-center my-2">
                    <div className="text-2xl">Your 1RM: {oneRepMax !== undefined && oneRepMax.toFixed(2)}{oneRepMax === undefined ? "N/A" : useKgs ? "kg" : "lb"}</div>
                    
                    {
                        status === "loading" ? 
                            <div className="bg-orange-500 p-2 rounded-xl items-center sm:text-lg text-white font-bold flex border border-black mt-4 hover:scale-105 transition duration-300 hover:cursor-pointer">Loading...</div>
                            :
                            <Link
                                className="bg-orange-500 p-2 rounded-xl items-center sm:text-lg text-white font-bold flex border border-black mt-4 hover:scale-105 transition duration-300 hover:cursor-pointer"
                                href={status === "authenticated" ? `/exercises?weight=${weight}&reps=${reps}&inKgs=${useKgs}` : `/auth`}>
                                {status === "authenticated" ? "Log this lift" : "Login to log this lift"}
                                {status === "authenticated" ? <BicepsFlexed className="ml-2" /> : <LogIn className="ml-2" />}
                            </Link>
                    }
                    <EquivalentLifts oneRepMax={oneRepMax} formula={formula} useKgs={useKgs} />
                </div>
            </div>

        </div>
    );
}
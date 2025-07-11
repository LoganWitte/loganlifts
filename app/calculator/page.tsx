'use client';

import { useEffect, useState } from "react";
import ToggleSwitch from "../components/ToggleSwitch";
import { CircleQuestionMark, BicepsFlexed } from 'lucide-react'
import Link from "next/link";

export default function page() {

    {/* Default values */}
    const defaultWeight = 100;
    const defaultReps = 1;

    const [useKgs, setUseKgs] = useState(false);
    const [weight, setWeight] = useState(defaultWeight);
    const [reps, setReps] = useState(defaultReps);
    const [formula, setFormula] = useState("Recommended");
    const [oneRepMax, setOneRepMax] = useState<number | undefined>()

    function handleFormulaInfoClick() {

    }

    function handleLogClick() {

    }

    useEffect(() => {
        function oneRepMaxBrzycki(weight: number, reps: number) {
            return weight*(1+(reps === 1 ? 0 : reps)/30);
        }
        function oneRepMaxEpley(weight: number, reps: number) {
            return weight/(1.0278-(0.0278*reps));
        }
        function oneRepMaxLombardi(weight: number, reps: number) {
            return weight*(Math.pow(reps, 0.1));
        }
        function oneRepMaxOConnor(weight: number, reps: number) {
            return weight*(1+0.025*(reps === 1 ? 0 : reps));
        }
        setOneRepMax(
            formula === "Recommended" ? ((oneRepMaxBrzycki(weight, reps) + oneRepMaxEpley(weight, reps))/2) :
            formula === "Brzycki" ? (oneRepMaxBrzycki(weight, reps)) :
            formula === "Epley" ? (oneRepMaxEpley(weight, reps)) :
            formula === "Lombardi" ? (oneRepMaxLombardi(weight, reps)) :
            formula === "OConnor" ? (oneRepMaxOConnor(weight, reps)) : 0
        )
    }, [weight, reps, formula, oneRepMax])
    

    return(
        <div className="w-full h-fit flex flex-col items-center">
            <div className="w-fit h-fit flex flex-col items-center bg-gray-200 p-4 m-4 rounded border border-black">
                <div className="text-lg sm:text-3xl my-4">1RM Calculator</div>
                <ToggleSwitch useKgs={useKgs} setUseKgs={setUseKgs}/>
                <div className="w-full flex flex-row items-center justify-between p-2">
                    <label htmlFor="weight" className="font-bold">Weight {useKgs ? "(kg)" : "(lb)"}:</label>
                    <input 
                        type="number" id="weight" name="weight" min="1" max="10000" step="1" defaultValue={defaultWeight} 
                        className="bg-gray-300 border border-black p-1 ml-1 w-20"
                        onChange={(e) => setWeight(parseInt(e.target.value))}
                    />
                </div>
                <div className="w-full flex flex-row items-center justify-between p-2">
                    <label htmlFor="reps" className="font-bold">Reps:</label>
                    <input 
                        type="number" id="reps" name="reps" min="1" max="100" step="1" defaultValue={defaultReps} 
                        className="bg-gray-300 border border-black p-1 ml-1 w-20"
                        onChange={(e) => setReps(parseInt(e.target.value))}
                    />
                </div>
                <div className="w-full flex flex-row items-center justify justify-between p-2">
                    <label htmlFor="formula" className="font-bold mr-6">Formula:</label>
                    <select value={formula} id="formula" 
                        onChange={(e) => setFormula(e.target.value)}
                        className="bg-gray-300 border border-black p-1 ml-1 rounded-none"
                    >
                        <option value="Recommended">Recommended</option>
                        <option value="Brzycki">Brzycki</option>
                        <option value="Epley">Epley</option>
                        <option value="Lombardi">Lombardi</option>
                        <option value="OConnor">O'Connor</option>
                    </select>
                    <Link href="/calculationinfo" ><CircleQuestionMark className="ml-1 opacity-75 hover:opacity-100 hover:cursor-pointer" onClick={handleFormulaInfoClick}/></Link>
                    
                </div>
                <div className="w-full flex flex-col items-center p-2">
                    <div className="text-2xl">Your 1RM: {oneRepMax?.toFixed(2)}{useKgs ? "kgs" : "lbs"}</div>
                    <button 
                        className="bg-orange-500 p-2 rounded-xl sm:text-lg text-white font-bold flex hover:cursor-pointer border border-black mt-4 hover:bg-orange-500 hover:scale-105 transition duration-300"
                        onClick={handleLogClick}
                    >
                        
                        Log this lift
                        <BicepsFlexed className="ml-2"/>
                    </button>
                </div>
            </div>
            
        </div>
    );
}
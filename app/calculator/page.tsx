'use client';

import { useEffect, useState } from "react";

export default function page() {

    {/* Default values */}
    const defaultWeight = 100;
    const defaultReps = 1;

    const [useKgs, setUseKgs] = useState(false);
    const [weight, setWeight] = useState(defaultWeight);
    const [reps, setReps] = useState(defaultReps);
    const [oneRepMaxEpley, setOneRepMaxEpley] = useState<number | undefined>(undefined);
    const [oneRepMaxBrzycki, setOneRepMaxBrzycki] = useState<number | undefined>(undefined);
    const [oneRepMaxLombardi, setOneRepMaxLombardi] = useState<number | undefined>(undefined);
    const [oneRepMaxOConner, setOneRepMaxOConner] = useState<number | undefined>(undefined);

    function calculate() {
        setOneRepMaxEpley(weight*(1+(reps === 1 ? 0 : reps)/30));
        setOneRepMaxBrzycki(weight/(1.0278-(0.0278*reps)));
        setOneRepMaxLombardi(weight*(Math.pow(reps, 0.1)));
        setOneRepMaxOConner(weight*(1+0.025*(reps === 1 ? 0 : reps)));
    }

    useEffect(() => {
        calculate();
    }, [weight, reps])
    

    return(
        <div className="w-full h-fit flex flex-col items-center">
            <div className="w-fit h-fit flex flex-col items-center bg-gray-200 p-4 m-4 rounded border border-black">
                <div className="text-lg sm:text-3xl my-4">1RM Calculator</div>
                <div className="w-full flex flex-row items-center justify-between p-2">
                    <label htmlFor="weight" className="font-bold">Weight {useKgs ? "(kgs)" : "(lbs)"}:</label>
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
                <div className="w-full p-2">
                    <div className="flex flex-row items-center justify-between w-full border-b border-black font-bold">
                        <div className="">Formula</div> 
                        <div>Weight {useKgs ? "(kgs)" : "(lbs)"}</div>
                    </div>
                    <div className="flex flex-row items-center justify-between w-full border-b border-black">
                        <div className="">Brzycki:</div> 
                        <div>{oneRepMaxBrzycki?.toFixed(2)}</div>
                    </div>
                    <div className="flex flex-row items-center justify-between w-full border-b border-black">
                        <div className="">Epley:</div> 
                        <div>{oneRepMaxEpley?.toFixed(2)}</div>
                    </div>
                    <div className="flex flex-row items-center justify-between w-full border-b border-black">
                        <div className="">Lombardi:</div> 
                        <div>{oneRepMaxLombardi?.toFixed(2)}</div>
                    </div>
                    <div className="flex flex-row items-center justify-between w-full">
                        <div className="">O'Connor:</div> 
                        <div>{oneRepMaxOConner?.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}
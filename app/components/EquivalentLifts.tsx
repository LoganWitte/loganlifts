"use client";

import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { ArrowDown, MoveHorizontal } from "lucide-react";
import { allowedFormula, getWeight } from "../services/formulas";

type props = {
    oneRepMax: number | undefined;
    formula: allowedFormula;
    useKgs: boolean;
}

export default function EquivalentLifts(props: props) {
    const { oneRepMax, formula, useKgs } = props;
    const [expanded, setExpanded] = useState(true);
    const [lowerLimit, setLowerLimit] = useState<number | undefined>(1);
    const [upperLimit, setUpperLimit] = useState<number | undefined>(20);

    const equivalents = useMemo(() => {
        if (oneRepMax === undefined || oneRepMax <= 0 || lowerLimit === undefined || upperLimit === undefined) return [];
        return Array.from({ length: upperLimit - lowerLimit + 1 }, (_, i) => {
            const reps = i + lowerLimit;
            return getWeight(oneRepMax, reps, formula);
        });
    }, [lowerLimit, upperLimit, oneRepMax, formula]);

    function handleLowerLimitChange(e: any) {
        const value = parseInt(e.target.value);
        console.log("Lower: ", value);
        if(isNaN(value) || (upperLimit !== undefined && value >= upperLimit)) setLowerLimit(undefined);
        setLowerLimit(value);
    }
    function handleUpperLimitChange(e: any) {
        const value = parseInt(e.target.value);
        console.log("Upper: ", value);
        if(isNaN(value) || (lowerLimit !== undefined && value <= lowerLimit)) setUpperLimit(undefined);
        setUpperLimit(value);
    }

    return (
        <div className="w-full h-fit flex flex-col items-center my-2">
            <button
                className="text-xl sm:text-2xl my-1 flex items-center hover:scale-105 transition duration-300 hover:bg-[#999999] p-1 rounded-xl hover:cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                Equivalent Lifts
                <ArrowDown className={`ml-1 transition-[rotate] duration-300 ease-in-out ${expanded && "-rotate-180"}`} />
            </button>
            <div className={`flex flex-row sm:text-lg justify-center items-center w-full transition-all ease-in-out duration-300 overflow-hidden ${!expanded ? "max-h-0" : "max-h-64"}`}>
                    <div className="font-semibold p-1 text-lg sm:text-xl">Rep range:</div>
                    <div className="flex">
                        <input
                            type="number" id="weight" name="weight" min="1" max={(upperLimit === undefined || isNaN(upperLimit)) ? 10000 : upperLimit} step="1" defaultValue={1}
                            className="bg-gray-300 border border-gray-500 p-0.5 w-12 h-fit text-sm"
                            onChange={(e) => handleLowerLimitChange(e)}
                        />
                        <MoveHorizontal className="mx-1"/>
                        <input
                            type="number" id="weight" name="weight" min={(lowerLimit === undefined || isNaN(lowerLimit) ? 1 : lowerLimit)} max="10000" step="1" defaultValue={20}
                            className="bg-gray-300 border border-gray-500 p-0.5 w-12 h-fit text-sm"
                            onChange={(e) => handleUpperLimitChange(e)}
                        />

                    </div>
                </div>
            <div className={`w-full ${expanded ? "max-h-60 border border-gray-500" : "max-h-0 border-none"} transition-all duration-300 ease-in-out overflow-y-auto flex flex-col sm:text-lg`}>
                
                <div className="flex flex-row justify-between text-lg border-gray-500 sm:text-xl font-semibold">
                    <div className="w-[50%] text-center border-r border-gray-500">Reps</div>
                    <div className="w-[50%] text-center">Weight</div>
                </div>
                {(equivalents !== undefined) &&
                    equivalents.filter(equivalent => equivalent !== undefined).map((equivalent, index) =>
                        <div key={index} className={`flex flex-row justify-between border-t border-gray-500`}>
                            <div className="w-[50%] text-center  border-r border-gray-500">{index + lowerLimit!}</div>
                            <div className="w-[50%] text-center">{`${equivalent.toFixed(2)}${useKgs ? "kg" : "lb"}`}</div>
                        </div>)
                }
            </div>
        </div>
    );
}
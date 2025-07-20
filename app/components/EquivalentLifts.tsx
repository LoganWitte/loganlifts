'use client';

import { useEffect, useState } from "react";
import { ArrowDown, MoveHorizontal } from "lucide-react";

type props = {
    oneRepMax: number | undefined;
    formula: string;
    useKgs: boolean;
}

export default function EquivalentLifts(props: props) {
    const { oneRepMax, formula, useKgs } = props;
    const [expanded, setExpanded] = useState(true);
    const [lowerLimit, setLowerLimit] = useState<number>(1);
    const [upperLimit, setUpperLimit] = useState<number>(20);
    const [equivalents, setEquivalents] = useState<number[] | undefined>([]);

    useEffect(() => {

        function weightFromBrzycki(oneRepMax: number, reps: number) {
            if (reps >= 37) return 0;
            return oneRepMax * (37 - reps) / 36;
        }
        function weightFromEpley(oneRepMax: number, reps: number) {
            return oneRepMax / (1 + reps / 30);
        }
        function weightFromLombardi(oneRepMax: number, reps: number) {
            return oneRepMax / Math.pow(reps, 0.1);
        }
        function weightFromOConnor(oneRepMax: number, reps: number) {
            return oneRepMax / (1 + 0.025 * (reps === 1 ? 0 : reps));
        }

        function generateEquivalents(oneRepMax: number | undefined, lowerLimit: number, upperLimit: number, formula: string): number[] | undefined {
            if (!oneRepMax || oneRepMax <= 0) return [];
            if (formula === "Recommended") {
                return Array.from({ length: upperLimit - lowerLimit + 1 }, (_, i) => {
                    const reps = i + lowerLimit;
                    if (reps <= 8) {
                        return weightFromBrzycki(oneRepMax, reps);
                    }
                    else if (reps <= 10) {
                        return (weightFromBrzycki(oneRepMax, reps) + weightFromEpley(oneRepMax, reps)) / 2;
                    }
                    else {
                        return weightFromEpley(oneRepMax, reps);
                    }
                });
            }
            else if (formula === "Brzycki") {
                return Array.from({ length: upperLimit - lowerLimit + 1 }, (_, i) => {
                    const reps = i + lowerLimit;
                    return weightFromBrzycki(oneRepMax, reps);
                });
            }
            else if (formula === "Epley") {
                return Array.from({ length: upperLimit - lowerLimit + 1 }, (_, i) => {
                    const reps = i + lowerLimit;
                    return weightFromEpley(oneRepMax, reps);
                });
            }
            else if (formula === "Lombardi") {
                return Array.from({ length: upperLimit - lowerLimit + 1 }, (_, i) => {
                    const reps = i + lowerLimit;
                    return weightFromLombardi(oneRepMax, reps);
                });
            }
            else if (formula === "OConnor") {
                return Array.from({ length: upperLimit - lowerLimit + 1 }, (_, i) => {
                    const reps = i + lowerLimit;
                    return weightFromOConnor(oneRepMax, reps);
                });
            }
        }
        setEquivalents(generateEquivalents(oneRepMax, lowerLimit, upperLimit, formula));
    }, [lowerLimit, upperLimit, oneRepMax, formula]);


    return (
        <div className="w-full h-fit flex flex-col items-center my-2">
            <button
                className="text-xl sm:text-2xl my-1 flex items-center hover:scale-105 transition duration-300 hover:bg-[#999999] p-1 rounded-xl hover:cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                Equivalent Lifts
                <ArrowDown className={`ml-1 transition-[rotate] duration-300 ease-in-out ${expanded && "-rotate-180"}`} />
            </button>
            <div className={`w-full ${expanded ? "max-h-60 border border-gray-500" : "max-h-0 border-none"} transition-all duration-300 ease-in-out overflow-y-auto flex flex-col sm:text-lg`}>
                <div className="flex flex-row sm:text-lg justify-center items-center w-full">
                    <div className="font-semibold p-1 text-lg sm:text-xl">Rep range:</div>
                    <div className="flex">
                        <input
                            type="number" id="weight" name="weight" min="1" max="10000" step="1" defaultValue={1}
                            className="bg-gray-300 border border-gray-500 p-0.5 w-12 h-fit text-sm"
                            onChange={(e) => setLowerLimit(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                        />
                        <MoveHorizontal className="mx-1"/>
                        <input
                            type="number" id="weight" name="weight" min="1" max="10000" step="1" defaultValue={20}
                            className="bg-gray-300 border border-gray-500 p-0.5 w-12 h-fit text-sm"
                            onChange={(e) => setUpperLimit(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                        />

                    </div>
                </div>
                <div className="flex flex-row justify-between text-lg border-t border-gray-500 sm:text-xl font-semibold">
                    <div className="w-[50%] text-center border-r border-gray-500">Reps</div>
                    <div className="w-[50%] text-center">Weight</div>
                </div>
                {equivalents && equivalents.length > 0 &&
                    equivalents.map((equivalent, index) =>
                        <div key={index} className={`flex flex-row justify-between border-t border-gray-500`}>
                            <div className="w-[50%] text-center  border-r border-gray-500">{index + lowerLimit}</div>
                            <div className="w-[50%] text-center">{`${equivalent.toFixed(2)}${useKgs ? "kg" : "lb"}`}</div>
                        </div>)
                }
            </div>
        </div>
    );
}
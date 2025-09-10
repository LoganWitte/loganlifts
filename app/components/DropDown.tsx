'use client';
import { ArrowDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type DropdownProps = {
    options: string[];
    selected: string;
    setSelected: (value: string) => void;
};

export default function Dropdown(props: DropdownProps) {
    const { options, selected, setSelected } = props;
    const [expanded, setExpanded] = useState(false);

    // Attach ref to entire dropdown wrapper
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            className={`relative w-full`}
            ref={dropdownRef}
        >
            <button
                className={`flex flex-col items-start w-full rounded outline-none ${expanded ? "border-2 border-b-0 border-orange-500" : "border border-black"}
                            focus-visible:border-2 focus-visible:border-orange-500`}
                onClick={() => setExpanded(!expanded)}
                type="button"
            >
                <div className={`relative w-full flex pl-2 bg-slate-200 hover:bg-slate-300 ${expanded ? "rounded-t" : "rounded hover:cursor-pointer"}`}>
                    {selected}
                    <ArrowDown className={`absolute top-0 right-0 transition-transform duration-300 ease-in-out ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>
            {expanded && (
                <div
                    className="absolute left-0 top-full w-full z-50 bg-white border-x-2 border-b-2 border-orange-500 rounded-b shadow-lg"
                >
                    {options.map((option, idx) => (
                        <div
                            key={option}
                            className={`w-full flex pl-2 bg-slate-200 hover:bg-slate-300 hover:cursor-pointer
                                ${option === selected ? "font-bold bg-slate-300" : ""}
                                ${idx === options.length - 1 ? "rounded-b" : ""}
                            `}
                            onClick={() => {
                                setSelected(option);
                                setExpanded(false);
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import { useState } from 'react';

type props = {
    useKgs: boolean;
    setUseKgs: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ToggleSwitch(props: props) {

    const { useKgs, setUseKgs } = props;

    return (
        <div className="flex items-center text-center">
            <div className={`w-[30%] mx-2 ${!useKgs ? "text-lg underline" : "opacity-85"} hover:cursor-pointer`} onClick={() => setUseKgs(false)}>Pounds</div>
            <button 
                onClick={() => setUseKgs(!useKgs)} 
                className={`relative inline-flex h-6 w-11 items-center rounded-full bg-orange-500 hover:cursor-pointer`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useKgs ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
            <div className={`w-[30%] mx-2 ${useKgs ? "text-lg underline" : "opacity-85"} hover:cursor-pointer`} onClick={() => setUseKgs(true)}>Kilograms</div>
        </div>
    );
}

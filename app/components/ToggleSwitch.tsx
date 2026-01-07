"use client";

type props = {
    falseString: string; // Left value (false)
    trueString: string; // Right value (true)
    value: boolean;
    setValue: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ToggleSwitch(props: props) {
    const { falseString, trueString, value, setValue } = props;
    return (
        <div className="flex items-center justify-center text-center gap-2 sm:gap-3">
            <div 
                className={`flex-shrink-0 text-sm sm:text-base lg:text-lg transition-all ${
                    !value 
                        ? "font-semibold underline underline-offset-2" 
                        : "opacity-60"
                } hover:cursor-pointer hover:opacity-100`} 
                onClick={() => setValue(false)}
            >
                {falseString}
            </div>
            
            <button 
                onClick={() => setValue(!value)} 
                className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-orange-500 hover:cursor-pointer transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label={`Toggle between ${falseString} and ${trueString}`}
                role="switch"
                aria-checked={value}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                        value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
            
            <div 
                className={`flex-shrink-0 text-sm sm:text-base lg:text-lg transition-all ${
                    value 
                        ? "font-semibold underline underline-offset-2" 
                        : "opacity-60"
                } hover:cursor-pointer hover:opacity-100`} 
                onClick={() => setValue(true)}
            >
                {trueString}
            </div>
        </div>
    );
}

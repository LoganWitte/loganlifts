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
        <div className="flex items-center justify-center text-center">
            <div className={`mx-2 ${!value ? "text-lg underline" : "opacity-85"} hover:cursor-pointer`} onClick={() => setValue(false)}>{falseString}</div>
            <button 
                onClick={() => setValue(!value)} 
                className={`relative inline-flex h-6 w-11 items-center rounded-full bg-orange-500 hover:cursor-pointer`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
            <div className={`mx-2 ${value ? "text-lg underline" : "opacity-85"} hover:cursor-pointer`} onClick={() => setValue(true)}>{trueString}</div>
        </div>
    );
}

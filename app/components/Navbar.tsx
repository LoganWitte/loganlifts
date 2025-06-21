import Link from "next/link";

import { Calculator, Dumbbell, Apple, LogIn } from 'lucide-react'
import Image from "next/image";

export default function navbar() {
    return(
        <div className="w-full max-w-screen h-fit bg-orange-500 border-b-1 border-black text-white flex items-center justify-between">
            <Link href="/" className="p-2 text-black text-lg sm:text-2xl md:text-4xl">
                Logan Lifts™
            </Link>
            <div className="flex text-sm sm:text-md md:text-xl text-center overflow-x-auto">
                <Link href="/calculator" className="p-2 my-2 mx-2 md:mx-4 hover:scale-115 hover:shadow-2xl transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                    1RM Calculator
                    <Calculator className="ml-1" />
                </Link>
                <Link href="/calculator" className="p-2 my-2 mx-2 md:mx-4 hover:scale-115 hover:shadow-2xl transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                    Workout Tracker 
                    <Dumbbell className="ml-1" />
                </Link>
                <Link href="" className="p-2 my-2 mx-2 md:mx-4 hover:scale-115 hover:shadow-2xl transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                    Nutrition Tracker
                    <Apple className="ml-1" />
                </Link>
                <Link href="" className="p-2 my-2 mx-2 md:mx-4 hover:scale-115 hover:shadow-2xl transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                    Login
                    <LogIn className="ml-1" /> 
                </Link>
            </div>
        </div>
    );
}
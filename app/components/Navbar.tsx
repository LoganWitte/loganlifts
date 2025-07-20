'use client';

import Link from "next/link";
import { Calculator, Dumbbell, Apple, LogIn, LogOut } from 'lucide-react'
import { signOut, useSession } from "next-auth/react";
import default_avatar from "../images/default_avatar.png"
import Image from "next/image";

export default function navbar() {

    const { data: session, status } = useSession();
    
    return(
        <div className="w-full h-fit bg-orange-500 border-b-1 border-black text-white flex items-center justify-between">
            <Link href="/" className="p-2 text-black text-lg sm:text-2xl md:text-4xl">
                Logan Lifts™
            </Link>
            <div className="flex text-sm sm:text-md md:text-xl text-center overflow-x-auto items-center">
                <Link href="/calculator" className="p-2 my-2 mx-2 md:mx-4 hover:scale-105 transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                    1RM Calculator
                    <Calculator className="ml-1" />
                </Link>
                <Link href="/lifts" className="p-2 my-2 mx-2 md:mx-4 hover:scale-105 transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                    Lifts 
                    <Dumbbell className="ml-1" />
                </Link>
                <Link href="nutrition" className="p-2 my-2 mx-2 md:mx-4 hover:scale-105 transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                    Nutrition
                    <Apple className="ml-1" />
                </Link>
                {
                    status === "unauthenticated" ?
                    <Link href="/auth" className="p-2 my-2 mx-2 md:mx-4 hover:scale-105 transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                        Login
                        <LogIn className="ml-1" />
                    </Link>
                    :
                    <Link href="/auth" className="w-[50px] h-[50px] m-2 shrink-0" title="Account">
                                <Image src={session?.user?.image || default_avatar} alt="Account" width={50} height={50} 
                                className="rounded-full hover:scale-105 transition duration-300 hover:cursor-pointer" />
                    </Link>
                }
                
                
            </div>
        </div>
    );
}
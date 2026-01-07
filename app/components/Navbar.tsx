"use client";

import Link from "next/link";
import { Calculator, Dumbbell, Apple, LogIn, BicepsFlexed } from 'lucide-react'
import { signOut, useSession } from "next-auth/react";
import default_avatar from "../images/default_avatar.png"
import Image from "next/image";

export default function Navbar() {

    const { data: session, status } = useSession();
    
    return(
        <nav className="fixed top-0 left-0 w-full h-17 bg-orange-500 border-b border-black text-white flex items-center justify-between z-100">
            <Link href="/" className="p-2 text-black text-lg sm:text-2xl md:text-4xl">
                Logan Lifts™
            </Link>
            <div className="flex text-sm sm:text-md md:text-xl text-center overflow-x-auto items-center">
                <Link href="/calculator" className="p-2 my-2 mx-2 md:mx-4 hover:scale-105 transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                    1RM Calculator
                    <Calculator className="ml-1" />
                </Link>
                <Link href="/exercises" className="p-2 my-2 mx-2 md:mx-4 hover:scale-105 transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                    Exercises 
                    <Dumbbell className="ml-1" />
                </Link>
                {
                    status === "unauthenticated" ?
                    <Link href="/auth" className="p-2 my-2 mx-2 md:mx-4 hover:scale-105 transition duration-300 rounded-md bg-[#00000080] flex flex-nowrap items-center">
                        Login
                        <LogIn className="ml-1" />
                    </Link>
                    :
                    <Link href="/auth" className="w-12.5 h-12.5 m-2 shrink-0" title="Account">
                                <Image src={session?.user?.image || default_avatar} alt="Account" width={50} height={50} 
                                className="rounded-full hover:scale-105 transition duration-300 hover:cursor-pointer" />
                    </Link>
                }
                
                
            </div>
        </nav>
    );
}
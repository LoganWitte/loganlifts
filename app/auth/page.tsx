'use client';

import Link from "next/link";
import { signIn } from "next-auth/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import default_avatar from "../images/default_avatar.png"

export default function page() {

    const { data: session, status } = useSession();

    return (
        <div className="w-full h-fit flex flex-col items-center">
            <div className="w-fit h-fit flex flex-col items-center bg-gray-200 p-4 m-4 rounded border border-black">
                <div className="text-2xl mt-2 flex flex-col items-center">
                    {`Hello, ${status === "authenticated" ? session.user?.name : status === "loading" ? "user (loading)" : "user (not logged in)"}`}
                    <Image src={session?.user?.image || default_avatar} alt="User's profile photo" width={100} height={100} className="rounded-full m-2" />
                </div>
                {
                    status === "unauthenticated" ?
                    <>
                        <button onClick={() => signIn('google')} className="bg-orange-500 p-2 rounded-xl sm:text-lg text-white font-bold flex hover:cursor-pointer border border-black mt-4 hover:bg-orange-500 hover:scale-105 transition duration-300">Continue with Google</button>
                    </>
                    :
                    <>
                        <Link href="/" className="bg-orange-500 p-2 rounded-xl sm:text-lg text-white font-bold flex hover:cursor-pointer border border-black mt-4 hover:bg-orange-500 hover:scale-105 transition duration-300">Home</Link>
                        <button onClick={() => signOut()} className="bg-orange-500 p-2 rounded-xl sm:text-lg text-white font-bold flex hover:cursor-pointer border border-black mt-4 hover:bg-orange-500 hover:scale-105 transition duration-300">Sign out</button>
                    </>
                }
            </div>

        </div>
    );
}
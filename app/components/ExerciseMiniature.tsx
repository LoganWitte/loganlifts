"use client";

import { Exercise } from "../services/api";
import Link from "next/link";

type ExerciseMiniatureProps = {
    exercise: Exercise;
}

export default function ExerciseMiniature(props: ExerciseMiniatureProps) {

    const { exercise } = props;

    type TagProps = {
        tag: String;
    }
    function Tag(props: TagProps) {
        const { tag } = props;
        return (
            <div className="w-fit h-fit p-[0.2em] m-[0.2em] inline-block font-semibold bg-slate-300 rounded-md">{tag}</div>
        );
    }

    return (
        <Link 
            href={`/lifts/${exercise.URLSlug}`}
            className="bg-white rounded shadow p-4 hover:scale-105 transition duration-300 hover:cursor-pointer"
        >

            <div className="text-xl font-bold">{exercise.name}</div>

            {/*Displays category, body parts, and tags in that order below name*/}
            <div className="mt-2 gap-1 whitespace-break-spaces">
                <div className="text-sm text-black">
                    <Tag tag={exercise.category} />
                    {exercise.bodyParts.map((part) => (
                        <Tag key={part} tag={part} />
                    ))}
                    {exercise.tags.map((tag) => (
                        <Tag key={tag as string} tag={tag} />
                    ))}
                </div>
            </div>
        </Link>
    );
}
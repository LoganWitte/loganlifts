"use client";

import { Lift } from "../services/api";

type props = {
    lifts: Lift[];
    useKgs: boolean;
}

export default function LiftsChart({ lifts, useKgs }: props) {

    // Sort lifts by time and format data for chart
    const chartData = lifts
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        .map(lift => ({
            date: new Date(lift.time).toLocaleDateString(),
            dateTime: new Date(lift.time).toLocaleString(),
            oneRepMax: lift.oneRepMax,
            weight: lift.weight,
            reps: lift.reps
        }));

    return (
        <div className="min-w-2xl w-full h-64 border border-b-gray-500 flex items-center justify-center">
            TODO: Display previous lifts here in a graph
        </div>
    );
}
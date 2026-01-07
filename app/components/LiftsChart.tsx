"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Label, ResponsiveContainer, Tooltip } from 'recharts';
import { Lift } from '../services/api';
import { poundsToKgs } from '../services/formulas';

type LiftsChartProps = {
    lifts: Lift[];
    useKgs: boolean;
    selectedLift: Lift | undefined;
    setSelectedLift: (lift: Lift | undefined) => void;
};

export default function LiftsChart({ lifts, useKgs, selectedLift, setSelectedLift }: LiftsChartProps) {
    
    const chartData = lifts
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        .map(lift => ({
            id: lift.id,
            date: new Date(lift.time).toLocaleDateString(),
            dateTime: new Date(lift.time).toLocaleString(),
            oneRepMax: useKgs ? poundsToKgs(lift.oneRepMax) : lift.oneRepMax,
            weight: useKgs ? poundsToKgs(lift.weight) : lift.weight,
            reps: lift.reps
        }));

    // Handle click on a lift in the chart
    function handleLiftClick(liftId: string) {
        if(selectedLift?.id === liftId) {
            setSelectedLift(undefined);
        }
        else {
            const lift = lifts.find(lift => lift.id === liftId);
            if(lift === undefined) {
                console.error(`Lift with id ${liftId} not found`);
            }
            setSelectedLift(lift);
        }
    }

    // Custom dot component for clickable points
    const CustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        const isSelected = selectedLift?.id === payload.id;
        
        return (
            <g>
                <circle
                    cx={cx}
                    cy={cy}
                    r={12}
                    fill="transparent"
                    onClick={() => handleLiftClick(payload.id)}
                    style={{ cursor: 'pointer' }}
                />
                <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 8 : 6}
                    fill="#f97316"
                    stroke="#000"
                    strokeWidth={2}
                    onClick={() => handleLiftClick(payload.id)}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                />
            </g>
        );
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white bg-opacity-90 border border-gray-300 rounded-lg p-2 sm:p-3 shadow-lg text-xs sm:text-sm">
                    <p className="font-semibold mb-1 sm:mb-2">{data.dateTime}</p>
                    <p>Weight: {data.weight.toFixed(1)} {useKgs ? 'kg' : 'lb'}</p>
                    <p>Reps: {data.reps}</p>
                    <p className="font-semibold text-orange-600">1RM: {data.oneRepMax.toFixed(2)} {useKgs ? 'kg' : 'lb'}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300} className="border border-gray-300 rounded-lg sm:h-96">
            <LineChart 
                data={chartData} 
                margin={{ 
                    top: 30, 
                    right: 10, 
                    bottom: 40, 
                    left: 10 
                }}
            >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300" />
                <XAxis 
                    dataKey="date" 
                    stroke="#000"
                    tick={{ fill: '#000', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                >
                    <Label 
                        value="Date" 
                        offset={0} 
                        position="insideBottom" 
                        style={{ fill: '#000', fontWeight: 'bold', fontSize: 12 }} 
                    />
                </XAxis>
                <YAxis 
                    stroke="#000"
                    tick={{ fill: '#000', fontSize: 11 }}
                    width={45}
                >
                    <Label 
                        value={`1RM (${useKgs ? 'kg' : 'lb'})`} 
                        angle={-90} 
                        position="insideLeft" 
                        style={{ fill: '#000', fontWeight: 'bold', textAnchor: 'middle', fontSize: 12 }} 
                    />
                </YAxis>
                <Tooltip content={<CustomTooltip />} cursor={true} isAnimationActive={"auto"} animationDuration={1} />
                <Line 
                    type="monotone" 
                    dataKey="oneRepMax" 
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={<CustomDot />}
                    activeDot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
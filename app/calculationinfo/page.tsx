'use client';

import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

export default function page() {
    return (
        <div className="w-full h-fit min-h-screen flex flex-col items-center bg-gray-200 sm:bg-white">
            <div className="min-w-[45%] h-fit flex flex-col items-center sm:bg-gray-200 sm:p-4 sm:m-4 sm:rounded sm:border border-black">
                <div className="text-lg sm:text-2xl mt-2 font-semibold">Calculation Info & Formulae:</div>
                <div className="mt-1 text-center">
                    Your <span className="font-semibold mx-1">1RM</span> (one-rep-maximum) is a common way to measure strength in a given movement.<br />
                    Rather than perform this 1RM, it's possible to estimate it using a longer set (e.g., 8 repetitions).<br />
                    This can be done using several formulas which are showcased below.<br />
                    <div className="my-4 ">Our "Recommended" formula uses the following method:</div>
                    <div className="flex flex-col items-center">
                        <div className="grid grid-cols-[1fr_2fr_3fr] w-fit p-2 font-sans">
                            {/* Header */}
                            <div className="font-semibold text-center border-b border-black pb-1 flex items-center justify-center px-2 sm:px-4"># Reps</div>
                            <div className="font-semibold text-center border-b border-black pb-1 flex items-center justify-center px-2 sm:px-4">Method</div>
                            <div className="font-semibold text-center border-b border-black pb-1 flex items-center justify-center px-2 sm:px-4">Math</div>
                            {/* Row 1 */}
                            <div className="text-center pb-1 my-1 border-b border-black flex items-center justify-center px-2 sm:px-4">1-8</div>
                            <div className="text-center pb-1 my-1 border-b border-black flex items-center justify-center px-2 sm:px-4">Brzycki formula</div>
                            <div className="text-xs pb-1 my-1 border-b border-black flex items-center justify-center px-2 sm:px-4">
                                <BlockMath math={String.raw`weight \times (1 + reps) / 30`} />
                            </div>
                            {/* Row 2 */}
                            <div className="text-center pb-1 mb-1 border-b border-black flex items-center justify-center px-2 sm:px-4">9-10</div>
                            <div className="text-center pb-1 mb-1 border-b border-black flex items-center justify-center px-2 sm:px-4">Brzycki & Epley average</div>
                            <div className="text-xs  pb-1 mb-1 border-b border-black flex items-center justify-center px-2 sm:px-4">
                                <BlockMath math={String.raw`\frac{Brzycki+Epley}{2}`} />
                            </div>
                            {/* Row 3 */}
                            <div className="text-center flex items-center justify-center px-2 sm:px-4">11+</div>
                            <div className="text-center flex items-center justify-center px-2 sm:px-4">Epley formula</div>
                            <div className="text-xs flex items-center justify-center px-2 sm:px-4">
                                <BlockMath math={String.raw`\frac{weight}{1.0278 - 0.0278 \times reps}`} />
                            </div>
                        </div>
                    </div>
                    <div className="my-4 ">Other included formulas:</div>
                    <div className="flex flex-col items-center">
                        <div className="grid grid-cols-[1fr_1fr] w-fit p-2 font-sans">
                            {/*Header*/}
                            <div className="font-semibold text-center border-b border-black pb-1 flex items-center justify-center px-4">
                                Method
                            </div>
                            <div className="font-semibold text-center border-b border-black pb-1 flex items-center justify-center px-4">
                                Math
                            </div>
                            {/*Row 1*/}
                            <div className="text-center border-b border-black py-1 flex items-center justify-center px-4">
                                Lombardi formula
                            </div>
                            <div className="text-center border-b border-black py-1 flex items-center justify-center px-4">
                                <div className="text-xs flex items-center justify-center px-4">
                                    <BlockMath math={String.raw`weight \times reps^{0.1}`} />
                                </div>
                            </div>
                            {/*Row 1*/}
                            <div className="text-center pt-1 flex items-center justify-center px-4">
                                O'Connor formula
                            </div>
                            <div className="text-center pt-1 flex items-center justify-center px-4">
                                <div className="text-xs flex items-center justify-center px-4">
                                    <BlockMath math={String.raw`1 + 0.025 \times reps`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
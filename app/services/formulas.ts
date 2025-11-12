export type allowedFormula = "Recommended" | "Brzycki" | "Epley" | "Lombardi" | "OConnor";

// undefined only in case of (brzycki && reps >= 37)
export function getOneRepMax(weight: number, reps: number, formula: allowedFormula): number | undefined {
    if(weight <= 0 || reps <= 0) return 0;
    if(reps === 1) return weight;
    switch(formula) {
        case "Recommended":
            if (reps <= 8) {
                // Full Brzychi
                return weight * (36 / (37 - reps));
            } 
            else if (reps <= 10) {
                // 50/50 Brzychi/Epley
                return (weight * (36 / (37 - reps)) + weight * (1 + reps / 30)) / 2
            } 
            else {
                // Full Epley
                return (weight * (1 + reps / 30));
            }
        case "Brzycki":
            if(reps >= 37) return undefined;
            return weight * (36 / (37 - reps));
        case "Epley":
            return weight * (1 + reps / 30);
        case "Lombardi":
            return weight * (Math.pow(reps, 0.1));
        case "OConnor":
            return weight * (1 + 0.025 * reps);
    }
}

// undefined only in case of (brzycki && reps >= 37)
export function getWeight(oneRepMax: number, reps: number, formula: allowedFormula): number | undefined {
    if(oneRepMax <= 0 || reps <= 0) return 0;
    if(reps === 1) return oneRepMax;
    switch(formula) {
        case "Recommended":
            if (reps <= 8) {
                // Full Brzychi
                return oneRepMax / (36 / (37 - reps));
            } 
            else if (reps <= 10) {
                // 50/50 Brzychi/Epley
                return (oneRepMax / (36 / (37 - reps)) + oneRepMax / (1 + reps / 30)) / 2
            } 
            else {
                // Full Epley
                return (oneRepMax / (1 + reps / 30));
            }
        case "Brzycki":
            if(reps >= 37) return undefined;
            return oneRepMax / (36 / (37 - reps)); // TODO
        case "Epley":
            return oneRepMax / (1 + reps / 30);
        case "Lombardi":
            return oneRepMax / (Math.pow(reps, 0.1));
        case "OConnor":
            return oneRepMax / (1 + 0.025 * reps);
    }
}
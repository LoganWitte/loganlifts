// Note:
// Following type declerations should be standard throughout app.
// This includes frontend sanitization as well as schema.

export type Category = "Barbell" | "Bodyweight" | "Dumbbell" | "Machine" | "Cable";

export type acceptedBodyPart = "Whole Body" | "Core" | "Legs" | "Back" | "Chest" | "Shoulders" | "Biceps" | "Triceps" | "Forearms";

export type Exercise = {
    id: string;                 //String @id @default(cuid())
    userId: string | null;      //String?
    name: string;               //String
    description: string | null; //String?
    URLSlug: string             //URLSLug     String   @unique
    bodyParts: string[]         //bodyParts   String[]
    category: Category          //Category    String
    tags: String[]              //tags        String[]
    createdAt: string;          //DateTime @default(now())
    updatedAt: string;          //DateTime @updatedAt
};

export type Lift = {
    id: string;                 //String @id @default(cuid())
    userId: string;             //String
    exerciseId: string;         //String
    weight: number;             //Float
    reps: number;               //Int
    oneRepMax: number;          //Float
    time: string;               //DateTime
    createdAt: string;          //DateTime @default(now())
    updatedAt: string;          //DateTime @updatedAt
};

// Checks if the user is an admin based on their email
export async function checkAdmin(): Promise<boolean> {
    try {
        const response: Response = await fetch('/api/checkadmin');
        if (!response.ok) {
            throw new Error(`Failed to check admin status: ${response.status} ${response.statusText}`);
        }
        const data: boolean = await response.json();
        return data;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

// Fetches all exercises (global and user-specific if logged in)
export async function getExercises(): Promise<Exercise[]> {
    try {
        const response: Response = await fetch('/api/exercises');
        if (!response.ok) {
            throw new Error(`Failed to get exercises: ${response.status} ${response.statusText}`);
        }
        const data: Exercise[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting exercises:", error);
        return [];
    }
}

// Adds a new exercise (can be global if admin, user-specific otherwise)
export async function addExercise(name: string, bodyParts: acceptedBodyPart[], category: Category, tags: string[], description?: string, global?: boolean): Promise<Exercise | null> {
    try {
        const response: Response = await fetch('/api/exercises', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, global, bodyParts, category, tags }),
        });
        if (!response.ok) {
            throw new Error(`Failed to add exercise: ${response.status} ${response.statusText}`);
        }
        const data: Exercise = await response.json();
        return data;
    } catch (error) {
        console.error("Error adding exercise:", error);
        return null;
    }
}

// Fetches all lifts for the logged-in user
export async function getLifts(): Promise<Lift[]> {
    try {
        const response: Response = await fetch('/api/lifts');
        if (!response.ok) {
            throw new Error(`Failed to get lifts: ${response.status} ${response.statusText}`);
        }
        const data: Lift[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting lifts:", error);
        return [];
    }
}

// Logs a new lift for the user
export async function addLift(exerciseId: string, weight: number, reps: number, time: Date): Promise<Lift | null> {
    try {
        const response: Response = await fetch('/api/lifts', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exerciseId, weight, reps, time }),
        });
        if (!response.ok) {
            throw new Error(`Failed to add lift: ${response.status} ${response.statusText}`);
        }
        const data: Lift = await response.json();
        return data;
    } catch (error) {
        console.error("Error adding lift:", error);
        return null;
    }
}

// Updates an existing lift (partial updates for weight, reps, or time)
export async function updateLift(id: string, updates: { weight?: number; reps?: number; time?: Date }): Promise<Lift | null> {
    try {
        const response: Response = await fetch('/api/lifts', {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...updates }),
        });
        if (!response.ok) {
            throw new Error(`Failed to update lift: ${response.status} ${response.statusText}`);
        }
        const data: Lift = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating lift:", error);
        return null;
    }
}
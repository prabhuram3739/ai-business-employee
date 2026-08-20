import type {
    Activity,
    HomestayBooking,
    WorkItem
} from "./types";

export type BusinessState = {
    bookings: HomestayBooking[];
    workItems: WorkItem[];
    activities: Activity[];
};

export type StoreListener = () => void;

const STORAGE_KEY =
    "ai-business-employee-state";

const isBrowser =
    typeof window !== "undefined";

const loadState = (
    fallback: BusinessState
): BusinessState => {
    if (!isBrowser) {
        return fallback;
    }

    try {
        const stored =
            window.localStorage.getItem(
                STORAGE_KEY
            );

        if (!stored) {
            return fallback;
        }

        const parsed: unknown =
            JSON.parse(stored);

        if (
            !parsed ||
            typeof parsed !== "object"
        ) {
            return fallback;
        }

        return {
            ...fallback,
            ...(parsed as Partial<BusinessState>)
        };
    } catch {
        return fallback;
    }
};

class BusinessStore {
    private state: BusinessState = {
        bookings: [],
        workItems: [],
        activities: []
    };

    private listeners =
        new Set<StoreListener>();

    constructor() {
        this.state = loadState(
            this.state
        );
    }

    getState = (): BusinessState => {
        return this.state;
    };

    setState = (
        nextState: Partial<BusinessState>
    ): void => {
        this.state = {
            ...this.state,
            ...nextState
        };

        this.persist();
        this.notify();
    };

    updateBookings = (
        updater: (
            bookings: HomestayBooking[]
        ) => HomestayBooking[]
    ): void => {
        this.state = {
            ...this.state,
            bookings: updater(
                this.state.bookings
            )
        };

        this.persist();
        this.notify();
    };

    addBooking = (
        booking: HomestayBooking
    ): void => {
        this.updateBookings(
            bookings => [
                ...bookings,
                booking
            ]
        );
    };

    updateBooking = (
        id: string,
        updater: (
            booking: HomestayBooking
        ) => HomestayBooking
    ): void => {
        this.updateBookings(
            bookings =>
                bookings.map(
                    booking =>
                        booking.id === id
                            ? updater(booking)
                            : booking
                )
        );
    };

    updateWorkItems = (
        updater: (
            items: WorkItem[]
        ) => WorkItem[]
    ): void => {
        this.state = {
            ...this.state,
            workItems: updater(
                this.state.workItems
            )
        };

        this.persist();
        this.notify();
    };

    updateOccupancyDecision(
        id: string,
        decision: HomestayBooking["occupancyDecision"],
        additionalCharge = 0
    ): void {
        this.updateBookings(bookings =>
            bookings.map(booking =>
                booking.id === id
                    ? {
                        ...booking,
                        occupancyDecision:
                            decision,
                        additionalOccupancyCharge:
                            additionalCharge,
                        occupancyDecisionAt:
                            new Date().toISOString()
                    }
                    : booking
            )
        );
    }

    resolveWorkItem = (
        id: string
    ): void => {
        this.updateWorkItems(
            items =>
                items.filter(
                    item => item.id !== id
                )
        );
    };

    addActivity = (
        activity: Activity
    ): void => {
        this.state = {
            ...this.state,
            activities: [
                activity,
                ...this.state.activities
            ]
        };

        this.persist();
        this.notify();
    };

    subscribe = (
        listener: StoreListener
    ): (() => void) => {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(
                listener
            );
        };
    };

    reset = (): void => {
        this.state = {
            bookings: [],
            workItems: [],
            activities: []
        };

        this.persist();
        this.notify();
    };

    private persist = (): void => {
        if (!isBrowser) {
            return;
        }

        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(this.state)
            );
        } catch {
            // Persistence failure should not
            // break the application.
        }
    };

    private notify = (): void => {
        this.listeners.forEach(
            listener => listener()
        );
    };
}

export const businessStore =
    new BusinessStore();
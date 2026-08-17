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

class BusinessStore {
    private state: BusinessState = {
        bookings: [],
        workItems: [],
        activities: []
    };

    private listeners = new Set<StoreListener>();

    getState(): BusinessState {
        return this.state;
    }

    setState(nextState: Partial<BusinessState>) {
        this.state = {
            ...this.state,
            ...nextState
        };

        this.notify();
    }

    updateBookings(
        updater: (
            bookings: HomestayBooking[]
        ) => HomestayBooking[]
    ) {
        this.state = {
            ...this.state,
            bookings: updater(this.state.bookings)
        };

        this.notify();
    }

    addBooking(booking: HomestayBooking) {
        this.updateBookings(bookings => [
            ...bookings,
            booking
        ]);
    }

    updateBooking(
        id: string,
        updater: (
            booking: HomestayBooking
        ) => HomestayBooking
    ) {
        this.updateBookings(bookings =>
            bookings.map(booking =>
                booking.id === id
                    ? updater(booking)
                    : booking
            )
        );
    }

    subscribe(listener: StoreListener) {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify() {
        this.listeners.forEach(listener => listener());
    }
}

export const businessStore = new BusinessStore();
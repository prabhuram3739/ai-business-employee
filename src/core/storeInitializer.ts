import { businessStore } from "./store";

import { homestayBookings } from "../data/mockData";

import {
    workItems,
    activities
} from "./registry";

export const initializeBusinessStore = (): void => {
    const currentState =
        businessStore.getState();

    const hasExistingState =
        currentState.bookings.length > 0 ||
        currentState.workItems.length > 0 ||
        currentState.activities.length > 0;

    if (hasExistingState) {
        return;
    }

    businessStore.setState({
        bookings: [...homestayBookings],
        workItems: [...workItems],
        activities: [...activities]
    });
};
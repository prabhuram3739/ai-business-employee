import { businessStore } from "./store";

import { homestayBookings } from "../data/mockData";

import {
    workItems,
    activities
} from "./registry";

export const initializeBusinessStore = (): void => {
    businessStore.setState({
        bookings: [...homestayBookings],
        workItems: [...workItems],
        activities: [...activities]
    });
};
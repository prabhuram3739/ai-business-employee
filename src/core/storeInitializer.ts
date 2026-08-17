import { businessStore } from "./store";
import {
    homestayBookings
} from "../data/mockData";
import {
    workItems,
    activities
} from "./registry";

export function initializeBusinessStore() {
    businessStore.setState({
        bookings: [...homestayBookings],
        workItems: [...workItems],
        activities: [...activities]
    });
}
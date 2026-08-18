import { Adapter, SourceKind } from "../core/types";

const passThrough = (payload: unknown) => payload;

export const adapters: Adapter[] = [
    { id: "loyverse", source: "loyverse", label: "Loyverse POS", status: "planned", normalize: passThrough },
    { id: "swiggy", source: "swiggy", label: "Swiggy", status: "planned", normalize: passThrough },
    { id: "zomato", source: "zomato", label: "Zomato", status: "planned", normalize: passThrough },
    { id: "food-expenses", source: "google-sheets", label: "MMVK Food Expense Sheet", status: "planned", normalize: passThrough },
    { id: "instagram", source: "instagram", label: "@mmvkfoodspollachi", status: "planned", normalize: passThrough },
    { id: "food-gbp", source: "google-business", label: "MMVK Food Google Business Profile", status: "planned", normalize: passThrough },
    { id: "homestay-gbp", source: "google-business", label: "MMVK Homestay Google Business Profile", status: "planned", normalize: passThrough },
    { id: "airbnb", source: "airbnb", label: "Airbnb", status: "planned", normalize: passThrough },
    { id: "booking", source: "booking", label: "Booking.com", status: "planned", normalize: passThrough },
    { id: "agoda", source: "agoda", label: "Agoda", status: "planned", normalize: passThrough },
    { id: "makemytrip", source: "makemytrip", label: "MakeMyTrip", status: "planned", normalize: passThrough },
    { id: "asana", source: "asana", label: "Asana", status: "planned", normalize: passThrough },
    { id: "zoomcar", source: "zoomcar", label: "Zoomcar Host", status: "planned", normalize: passThrough }
];

export function adaptersFor(source: SourceKind) { return adapters.filter(a => a.source === source) }

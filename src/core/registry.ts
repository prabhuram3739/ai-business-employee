import { BusinessModule, Activity, WorkItem } from "./types";
import { homestayModule } from "../modules/homestay";
import { restaurantModule } from "../modules/restaurant";
import { ertigaModule } from "../modules/ertiga";
import { auditModule } from "../modules/audit";

export const businessModules: BusinessModule[] = [homestayModule, restaurantModule, ertigaModule, auditModule];

export const workItems: WorkItem[] = [
    { id: "HS-001", moduleId: "homestay", title: "Guest-count mismatch check", stageId: "confirmed", priority: "medium", ownerAction: "Review booking", detail: "Recent booking needs an owner-approved decision if actual occupants exceed the booked count." },
    { id: "HS-002", moduleId: "homestay", title: "OTA availability sync", stageId: "quoted", priority: "low", ownerAction: "Review channel status", detail: "Prototype will normalize Airbnb, Booking.com, Agoda and MakeMyTrip reservations into one reservation model." },
    { id: "FOOD-001", moduleId: "restaurant", title: "Daily P&L needs review", stageId: "monitoring", priority: "high", ownerAction: "Open P&L", detail: "Combine Loyverse, Swiggy, Zomato sales with daily Google Sheets expenses." },
    { id: "FOOD-002", moduleId: "restaurant", title: "Opening checklist pending", stageId: "opening", priority: "medium", ownerAction: "Send checklist", detail: "Chef/helper and kitchen readiness need confirmation." },
    { id: "FOOD-003", moduleId: "restaurant", title: "Marketing activity", stageId: "marketing", priority: "low", ownerAction: "Review drafts", detail: "Instagram and Google Business content can be drafted by AI for approval." },
    { id: "CAR-001", moduleId: "ertiga", title: "August incentive is at risk", stageId: "performance", priority: "high", ownerAction: "Review incentive", detail: "Zoomcar Host screen currently shows August 2026 incentives as At Risk; exact criteria must be captured from the Host app before automation." },
    { id: "CAR-002", moduleId: "ertiga", title: "Protect 4.97 rating", stageId: "performance", priority: "medium", ownerAction: "Review review workflow", detail: "Post-trip review classification and issue escalation are configured." },
    { id: "AUD-001", moduleId: "audit", title: "Fees pending", stageId: "fees-pending", priority: "high", ownerAction: "Review collections", detail: "Outstanding client fees are tracked from the common payment model; reminder drafting is configured." },
    { id: "AUD-002", moduleId: "audit", title: "Audit job inactivity", stageId: "in-progress", priority: "medium", ownerAction: "Review stuck job", detail: "AI flags work items with no update for the configured inactivity period." }
];

export const activities: Activity[] = [
    { time: "08:20", moduleId: "restaurant", action: "Expense source mapped", result: "Google Sheets → Expense model" },
    { time: "08:15", moduleId: "homestay", action: "Reservation channels mapped", result: "4 OTA adapters configured" },
    { time: "08:10", moduleId: "audit", action: "Workflow validated", result: "Asana → 5-stage workflow" },
    { time: "07:55", moduleId: "ertiga", action: "Performance monitor", result: "Rating 4.97 / incentive At Risk" },
    { time: "07:40", moduleId: "restaurant", action: "Sales model ready", result: "Loyverse + Swiggy + Zomato" },
    { time: "07:30", moduleId: "restaurant", action: "Marketing sources mapped", result: "Instagram + Google Business" }
];
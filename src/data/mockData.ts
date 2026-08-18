import type { HomestayBooking } from "../core/types";

export const mmvkFoodExpenses = [
 {date:"2026-08-08",category:"Chicken",amount:1140},
 {date:"2026-08-08",category:"Groceries",amount:465},
 {date:"2026-08-08",category:"Gas cylinder",amount:2880},
 {date:"2026-08-08",category:"Helper salary",amount:300},
 {date:"2026-08-08",category:"Chef salary",amount:900},
 {date:"2026-08-08",category:"Vessel washer salary",amount:100}
];

export const mmvkFoodExpenseCategories = [
 "Chicken","Vegetables","Groceries","Parcel covers","Gas cylinder",
 "Helper salary","Chef salary","Vessel washer salary"
];

export const mmvkFoodSources = ["Loyverse POS","Swiggy","Zomato","Google Sheets Expenses","Instagram","Google Business Profile"];
export const homestaySources = ["Airbnb","Booking.com","Agoda","MakeMyTrip","Google Business Profile"];
export const auditStages = ["Todo","In Progress","Fees Pending","Fees Paid","Done"];
export const vehicle = {registration:"TN41AY7489",platform:"Zoomcar",rating:"4.97",incentive:"At Risk",professionalHostEvaluation:"1 Sep 2026"};

export const homestayBookings: HomestayBooking[] = [
  {
    id: "HS-2026-001",
    guestName: "Arun Kumar",
    source: "Airbnb",
    checkIn: "2026-08-14",
    checkOut: "2026-08-16",
    bookedGuests: 4,
    actualGuests: 4,
    amount: 7800,
    paymentStatus: "Paid",
    amountReceived: 7800,
    status: "Confirmed",
    otaCommission: 936,
    netAmount: 6864
  },
  {
    id: "HS-2026-002",
    guestName: "Priya",
    source: "Booking.com",
    checkIn: "2026-08-16",
    checkOut: "2026-08-18",
    bookedGuests: 4,
    amount: 7800,
    paymentStatus: "Part paid",
    status: "Confirmed",
    otaCommission: 936,
    netAmount: 6864
  },
  {
    id: "HS-2026-003",
    guestName: "Rajesh Family",
    source: "Agoda",
    checkIn: "2026-08-20",
    checkOut: "2026-08-22",
    bookedGuests: 5,
    amount: 8800,
    paymentStatus: "Paid",
    amountReceived: 8800,
    status: "Confirmed",
    otaCommission: 1056,
    netAmount: 7744
  },
  {
    id: "HS-2026-004",
    guestName: "Suresh",
    source: "Direct",
    checkIn: "2026-08-23",
    checkOut: "2026-08-24",
    bookedGuests: 4,
    actualGuests: 6,
    amount: 4900,
    paymentStatus: "Paid",
    amountReceived: 4900,
    status: "Confirmed",
    otaCommission: 0,
    netAmount: 4900
  },
  {
    id: "HS-2026-005",
    guestName: "Meena",
    source: "MakeMyTrip",
    checkIn: "2026-08-25",
    checkOut: "2026-08-27",
    bookedGuests: 4,
    amount: 7800,
    paymentStatus: "Pending",
    amountReceived: 0,
    status: "Quoted",
    otaCommission: 1404,
    netAmount: 6396
  }
];

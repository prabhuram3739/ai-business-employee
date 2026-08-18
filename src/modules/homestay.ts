import type { BusinessModule } from "../core/types";

export const homestayModule: BusinessModule = {
    id: "homestay",
    name: "MMVK Homestay",
    shortName: "Homestay",
    icon: "home",

    description:
        "AI Guest Manager combining OTA reservations, Google Business, guest communication, pricing and stay operations.",

    fields: [
        {
            id: "guestName",
            label: "Guest name",
            type: "text",
            required: true
        },
        {
            id: "source",
            label: "Booking source",
            type: "select",
            options: [
                "Airbnb",
                "Booking.com",
                "Agoda",
                "MakeMyTrip",
                "Direct"
            ]
        },
        {
            id: "checkIn",
            label: "Check-in",
            type: "date",
            required: true
        },
        {
            id: "checkOut",
            label: "Check-out",
            type: "date",
            required: true
        },
        {
            id: "guestCount",
            label: "Guest count",
            type: "number",
            required: true
        },
        {
            id: "amount",
            label: "Booking amount",
            type: "currency"
        },
        {
            id: "paymentStatus",
            label: "Payment status",
            type: "select",
            options: [
                "Pending",
                "Part paid",
                "Paid"
            ]
        }
    ],

    stages: [
        {
            id: "enquiry",
            label: "Enquiry",
            description:
                "Guest asks about property"
        },
        {
            id: "quoted",
            label: "Quoted",
            description:
                "Availability and price provided"
        },
        {
            id: "confirmed",
            label: "Confirmed",
            description:
                "Reservation confirmed"
        },
        {
            id: "check-in",
            label: "Check-in",
            description:
                "Arrival workflow"
        },
        {
            id: "in-stay",
            label: "In stay",
            description:
                "Guest support"
        },
        {
            id: "checkout",
            label: "Checkout",
            description:
                "Departure workflow"
        },
        {
            id: "completed",
            label: "Completed",
            description:
                "Review and repeat booking",
            terminal: true
        }
    ],

    rules: [
        {
            id: "hs-mismatch",
            name: "Guest count mismatch",
            trigger: "confirmed",
            condition:
                "actual_guest_count > booked_guest_count",
            actions: [
                {
                    type: "request_approval",
                    target: "owner",
                    template:
                        "Review additional occupancy charge."
                }
            ],
            priority: "high"
        },
        {
            id: "hs-checkin",
            name: "Check-in automation",
            trigger: "confirmed",
            condition:
                "checkin_within_24_hours",
            actions: [
                {
                    type: "send_message",
                    target: "guest",
                    template:
                        "Send directions, house rules and check-in details."
                }
            ],
            priority: "medium"
        },
        {
            id: "hs-review",
            name: "Review and repeat booking",
            trigger: "checkout",
            condition:
                "checkout_completed",
            actions: [
                {
                    type: "send_message",
                    target: "guest",
                    template:
                        "Request review and invite repeat booking."
                }
            ],
            priority: "low"
        }
    ],

    metrics: [
        {
            id: "otas",
            label: "OTA channels",
            value: "4",
            note:
                "Airbnb + Booking + Agoda + MMT",
            status: "Mapped"
        },
        {
            id: "gbp",
            label: "Google Business",
            value: "Connected target",
            note:
                "Profile/reviews/visibility",
            status: "Mapped"
        },
        {
            id: "guest",
            label: "Guest automation",
            value: "7 stages",
            note:
                "Enquiry → completed",
            status: "Ready"
        },
        {
            id: "pricing",
            label: "Pricing",
            value: "Rules",
            note:
                "Base occupancy + extras",
            status: "Ready"
        }
    ],

    integrations: [
        {
            id: "airbnb",
            label: "Airbnb",
            source: "airbnb",
            status: "planned",
            capabilities: [
                "reservations",
                "availability"
            ]
        },
        {
            id: "booking",
            label: "Booking.com",
            source: "booking",
            status: "planned",
            capabilities: [
                "reservations",
                "availability"
            ]
        },
        {
            id: "agoda",
            label: "Agoda",
            source: "agoda",
            status: "planned",
            capabilities: [
                "reservations",
                "availability"
            ]
        },
        {
            id: "mmt",
            label: "MakeMyTrip",
            source: "makemytrip",
            status: "planned",
            capabilities: [
                "reservations",
                "availability"
            ]
        },
        {
            id: "gbp",
            label: "Google Business Profile",
            source: "google-business",
            status: "planned",
            capabilities: [
                "profile",
                "reviews",
                "posts"
            ]
        }
    ]
};
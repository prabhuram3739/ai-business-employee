import React, { useMemo } from "react";
import {
    CalendarCheck,
    CalendarClock,
    LogIn,
    LogOut,
    BedDouble,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

import type { HomestayBooking } from "../core/types";

type Props = {
    bookings: HomestayBooking[];
    onReviewBooking: (bookingId: string) => void;
};

type Operation = {
    booking: HomestayBooking;
    title: string;
    detail: string;
};

type OperationGroup = {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    items: Operation[];
};

const dateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatDate = (value: string): string => {
    if (!value) return "Date not set";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const currency = (amount: number): string =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

const HomestayDailyOperations = ({
    bookings,
    onReviewBooking,
}: Props): React.JSX.Element => {
    const today = dateKey(new Date());

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const tomorrow = dateKey(tomorrowDate);

    const groups = useMemo<OperationGroup[]>(() => {
        const activeBookings = bookings.filter(
            booking =>
                booking.status !== "Cancelled" &&
                booking.status !== "Completed" &&
                booking.status !== "Enquiry" &&
                booking.status !== "Quoted"
        );

        const arrivalsToday: Operation[] = activeBookings
            .filter(
                booking =>
                    booking.checkIn === today &&
                    booking.status === "Confirmed"
            )
            .map(booking => ({
                booking,
                title: booking.guestName,
                detail:
                    `${booking.bookedGuests} guest(s) · ` +
                    `${booking.source} · Check-in today`,
            }));

        const inHouse: Operation[] = activeBookings
            .filter(
                booking =>
                    ["Check-in", "In stay"].includes(booking.status) &&
                    booking.checkIn <= today &&
                    booking.checkOut > today
            )
            .map(booking => ({
                booking,
                title: booking.guestName,
                detail:
                    `${booking.bookedGuests} guest(s) · ` +
                    `Checkout ${formatDate(booking.checkOut)}`,
            }));

        const departuresToday: Operation[] = activeBookings
            .filter(
                booking =>
                    booking.checkOut === today &&
                    ["Check-in", "In stay"].includes(booking.status)
            )
            .map(booking => ({
                booking,
                title: booking.guestName,
                detail:
                    `${booking.bookedGuests} guest(s) · ` +
                    "Checkout today",
            }));

        const preparations: Operation[] = activeBookings
            .filter(
                booking =>
                    booking.checkIn === tomorrow &&
                    booking.status === "Confirmed"
            )
            .map(booking => ({
                booking,
                title: booking.guestName,
                detail:
                    `${booking.bookedGuests} guest(s) · ` +
                    `${booking.source} · Prepare for tomorrow`,
            }));

        return [
            {
                id: "arrivals",
                title: "Arrivals today",
                description: "Confirmed bookings checking in today.",
                icon: <LogIn size={18} />,
                items: arrivalsToday,
            },
            {
                id: "in-house",
                title: "Currently staying",
                description: "Guests whose stay includes today.",
                icon: <BedDouble size={18} />,
                items: inHouse,
            },
            {
                id: "departures",
                title: "Departures today",
                description: "Guests expected to check out today.",
                icon: <LogOut size={18} />,
                items: departuresToday,
            },
            {
                id: "preparation",
                title: "Prepare for tomorrow",
                description: "Confirmed arrivals to prepare for.",
                icon: <CalendarClock size={18} />,
                items: preparations,
            },
        ];
    }, [bookings, today, tomorrow]);

    const totalOperations = groups.reduce(
        (total, group) => total + group.items.length,
        0
    );

    return (
        <section className="homestay-daily-operations">
            <div className="section-head">
                <div>
                    <h2>Homestay Daily Operations</h2>
                    <p>
                        Operational view for {formatDate(today)}.
                        Based on saved booking dates and statuses.
                    </p>
                </div>

                <span className="exception-count">
                    {totalOperations} booking
                    {totalOperations === 1 ? "" : "s"}
                </span>
            </div>

            <div className="cards four">
                {groups.map(group => (
                    <article className="card" key={group.id}>
                        <div className="metric-top">
                            <span className="metric-icon">
                                {group.icon}
                            </span>

                            <span className="status">
                                {group.items.length}
                            </span>
                        </div>

                        <h3>{group.title}</h3>

                        <p>{group.description}</p>

                        {group.items.length === 0 ? (
                            <div className="daily-empty">
                                <CheckCircle2 size={15} />
                                No bookings
                            </div>
                        ) : (
                            <div className="daily-operation-list">
                                {group.items.map(operation => (
                                    <div
                                        className="daily-operation-item"
                                        key={operation.booking.id}
                                    >
                                        <div>
                                            <strong>{operation.title}</strong>
                                            <p>{operation.detail}</p>
                                        </div>

                                        <button
                                            type="button"
                                            className="secondary"
                                            onClick={() =>
                                                onReviewBooking(operation.booking.id)
                                            }
                                            aria-label={`Review ${operation.booking.guestName}`}
                                        >
                                            Review
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                ))}
            </div>

            <p className="daily-operations-note">
                These are booking-based operational indicators.
                Housekeeping completion, room readiness and actual
                guest arrival must be recorded separately when those
                features are introduced.
            </p>
        </section>
    );
};

export default HomestayDailyOperations;
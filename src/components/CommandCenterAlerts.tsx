import React, { useMemo } from "react";
import {
    CalendarClock,
    CheckCircle2,
    CreditCard,
    UsersRound,
    ArrowRight,
} from "lucide-react";

import type { HomestayBooking } from "../core/types";

type Props = {
    bookings: HomestayBooking[];
    onReviewBooking: (bookingId: string) => void;
};

type AlertItem = {
    id: string;
    bookingId: string;
    title: string;
    detail: string;
    priority: "critical" | "high" | "medium";
    category: string;
};

const getDateKey = (date: Date): string => {
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
    });
};

const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

const CommandCenterAlerts = ({
    bookings,
    onReviewBooking,
}: Props): React.JSX.Element => {
    const today = getDateKey(new Date());

    const alerts = useMemo<AlertItem[]>(() => {
        const result: AlertItem[] = [];

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const threeDaysLater = new Date(todayDate);
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);

        const threeDaysLaterKey = getDateKey(threeDaysLater);

        bookings.forEach((booking) => {
            const isClosed =
                booking.status === "Cancelled" ||
                booking.status === "Completed";

            if (isClosed) return;

            const received =
                booking.amountReceived ??
                (booking.paymentStatus === "Paid"
                    ? booking.amount
                    : 0);

            const extraCharge =
                booking.occupancyDecision === "Approved extra charge"
                    ? booking.additionalOccupancyCharge ?? 0
                    : 0;

            const balance = Math.max(
                booking.amount + extraCharge - received,
                0
            );

            // Check-in today
            if (
                booking.checkIn === today &&
                booking.status === "Confirmed"
            ) {
                result.push({
                    id: `${booking.id}-checkin`,
                    bookingId: booking.id,
                    title: `Check-in today: ${booking.guestName}`,
                    detail:
                        `${booking.bookedGuests} guest(s) booked. ` +
                        "Confirm arrival and property readiness.",
                    priority: "high",
                    category: "Check-in today",
                });
            }

            // Checkout today
            if (
                booking.checkOut === today &&
                ["Check-in", "In stay"].includes(booking.status)
            ) {
                result.push({
                    id: `${booking.id}-checkout`,
                    bookingId: booking.id,
                    title: `Checkout today: ${booking.guestName}`,
                    detail:
                        "Confirm departure, inspect the property " +
                        "and settle any outstanding balance.",
                    priority: "high",
                    category: "Checkout today",
                });
            }

            // Confirmed arrivals in the next three days
            if (
                booking.checkIn > today &&
                booking.checkIn <= threeDaysLaterKey &&
                booking.status === "Confirmed"
            ) {
                result.push({
                    id: `${booking.id}-arrival`,
                    bookingId: booking.id,
                    title: `Upcoming arrival: ${booking.guestName}`,
                    detail:
                        `Check-in ${formatDate(booking.checkIn)}. ` +
                        "Verify preparation, guest details and payment.",
                    priority: "medium",
                    category: "Upcoming arrival",
                });
            }

            // Outstanding balance for current or future stays
            if (
                balance > 0 &&
                booking.checkOut >= today
            ) {
                result.push({
                    id: `${booking.id}-payment`,
                    bookingId: booking.id,
                    title: `Payment due: ${booking.guestName}`,
                    detail:
                        `${formatCurrency(balance)} outstanding. ` +
                        `Payment status: ${booking.paymentStatus}.`,
                    priority: "medium",
                    category: "Payment due",
                });
            }

            // Guest-count mismatch requiring an owner decision
            if (
                booking.actualGuests !== undefined &&
                booking.actualGuests > booking.bookedGuests &&
                (
                    !booking.occupancyDecision ||
                    booking.occupancyDecision === "Pending" ||
                    booking.occupancyDecision === "Keep under review"
                )
            ) {
                result.push({
                    id: `${booking.id}-occupancy`,
                    bookingId: booking.id,
                    title: `Guest-count mismatch: ${booking.guestName}`,
                    detail:
                        `${booking.bookedGuests} booked, ` +
                        `${booking.actualGuests} recorded. ` +
                        "An owner decision is required.",
                    priority: "critical",
                    category: "Owner decision",
                });
            }
        });

        const priorityRank = {
            critical: 0,
            high: 1,
            medium: 2,
        };

        return result.sort(
            (a, b) =>
                priorityRank[a.priority] -
                priorityRank[b.priority]
        );
    }, [bookings, today]);

    const getIcon = (category: string) => {
        if (
            category.includes("Check-in") ||
            category.includes("Checkout") ||
            category.includes("arrival")
        ) {
            return <CalendarClock size={18} />;
        }

        if (category.includes("Payment")) {
            return <CreditCard size={18} />;
        }

        return <UsersRound size={18} />;
    };

    return (
        <section className="exception-center command-alerts">
            <div className="section-head">
                <div>
                    <h2>Today's Operations</h2>
                    <p>
                        Actionable Homestay alerts generated from
                        your saved booking records.
                    </p>
                </div>

                <span className="exception-count">
                    {alerts.length} action
                    {alerts.length === 1 ? "" : "s"}
                </span>
            </div>

            {alerts.length === 0 ? (
                <div className="exception-empty">
                    <CheckCircle2 size={22} />

                    <div>
                        <strong>No operational alerts</strong>
                        <p>
                            No check-ins, checkouts, upcoming arrivals,
                            outstanding balances or unresolved occupancy
                            decisions were found in the current records.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="exception-list">
                    {alerts.map((alert) => (
                        <article
                            className="exception-card"
                            key={alert.id}
                        >
                            <div
                                className={`exception-icon ${alert.priority}`}
                            >
                                {getIcon(alert.category)}
                            </div>

                            <div className="exception-content">
                                <div className="exception-header">
                                    <strong>{alert.title}</strong>

                                    <span
                                        className={`exception-priority ${alert.priority}`}
                                    >
                                        {alert.category}
                                    </span>
                                </div>

                                <p>{alert.detail}</p>

                                <div className="exception-actions">
                                    <button
                                        type="button"
                                        className="secondary"
                                        onClick={() =>
                                            onReviewBooking(alert.bookingId)
                                        }
                                    >
                                        Review booking
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default CommandCenterAlerts;
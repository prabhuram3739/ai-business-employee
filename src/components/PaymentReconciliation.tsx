import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import type { HomestayBooking, PaymentStatus } from "../core/types";

type Props = {
    bookings: HomestayBooking[];
    onReviewBooking: (bookingId: string) => void;
};

type Finding = {
    key: string;
    bookingId: string;
    guestName: string;
    issue: string;
    detail: string;
};

const money = (amount: number): string =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);

const expectedPaymentStatus = (
    total: number,
    received: number
): PaymentStatus => {
    if (received >= total) return "Paid";
    if (received > 0) return "Part paid";
    return "Pending";
};

const PaymentReconciliation = ({
    bookings,
    onReviewBooking,
}: Props): React.JSX.Element => {
    const findings = useMemo<Finding[]>(() => {
        const result: Finding[] = [];

        bookings.forEach((booking) => {
            if (
                booking.status === "Cancelled" ||
                booking.status === "Completed"
            ) {
                // Completed bookings can still have financial issues,
                // so only cancelled bookings are excluded from this audit.
                if (booking.status === "Cancelled") return;
            }

            const originalAmount = Number(booking.amount) || 0;
            const approvedExtra =
                booking.occupancyDecision === "Approved extra charge"
                    ? Number(booking.additionalOccupancyCharge) || 0
                    : 0;

            const total = Math.max(0, originalAmount + approvedExtra);

            const hasRecordedAmount =
                typeof booking.amountReceived === "number" &&
                Number.isFinite(booking.amountReceived);

            const received = hasRecordedAmount
                ? booking.amountReceived!
                : booking.paymentStatus === "Paid"
                    ? originalAmount
                    : 0;

            const balance = Math.max(0, total - received);
            const expectedStatus = expectedPaymentStatus(total, received);
            if (
                booking.paymentStatus === "Part paid" &&
                !hasRecordedAmount
            ) {
                result.push({
                    key: `${booking.id}-incomplete`,
                    bookingId: booking.id,
                    guestName: booking.guestName,
                    issue: "Payment amount needs verification",
                    detail:
                        "This booking is marked Part paid, but the amount received " +
                        "is not recorded. Verify the actual payment before reconciling.",
                });
            }
            if (
                hasRecordedAmount &&
                booking.paymentStatus !== expectedStatus
            ) {
                result.push({
                    key: `${booking.id}-status`,
                    bookingId: booking.id,
                    guestName: booking.guestName,
                    issue: "Payment status does not match the balance",
                    detail:
                        `Recorded: ${booking.paymentStatus}; expected: ${expectedStatus}. ` +
                        `Calculated balance: ${money(balance)}.`,
                });
            }

            const history = booking.paymentHistory;

            // Older records may have no transaction-level history.
            // Do not call those records inconsistent solely for that reason.
            if (Array.isArray(history) && history.length > 0) {
                const historyTotal = history.reduce(
                    (sum, payment) => sum + (Number(payment.amount) || 0),
                    0
                );

                if (Math.abs(historyTotal - received) > 0.01) {
                    result.push({
                        key: `${booking.id}-history`,
                        bookingId: booking.id,
                        guestName: booking.guestName,
                        issue: "Payment history total differs from amount received",
                        detail:
                            `Payment history: ${money(historyTotal)}; ` +
                            `amount received: ${money(received)}; ` +
                            `difference: ${money(Math.abs(historyTotal - received))}.`,
                    });
                }
            }

            if (
                booking.occupancyDecision === "Approved extra charge" &&
                (booking.additionalOccupancyCharge ?? 0) <= 0 &&
                booking.actualGuests !== undefined &&
                booking.actualGuests > booking.bookedGuests
            ) {
                result.push({
                    key: `${booking.id}-charge`,
                    bookingId: booking.id,
                    guestName: booking.guestName,
                    issue: "Approved occupancy charge is zero",
                    detail:
                        "An extra charge is approved, but the stored charge is zero. " +
                        "Review the booking before changing any amount.",
                });
            }
        });

        return result;
    }, [bookings]);

    return (
        <section className="payment-reconciliation">
            <div className="section-head">
                <div>
                    <h2>Payment Reconciliation</h2>
                    <p>
                        Read-only checks across booking totals, recorded payments
                        and payment history.
                    </p>
                </div>

                <span className="exception-count">
                    {findings.length} issue{findings.length === 1 ? "" : "s"}
                </span>
            </div>

            {findings.length === 0 ? (
                <div className="exception-empty">
                    <CheckCircle2 size={22} />
                    <div>
                        <strong>No payment discrepancies detected</strong>
                        <p>
                            No inconsistencies were found in the available payment
                            records. Older bookings without individual payment
                            history are not automatically flagged.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="exception-list">
                    {findings.map((finding) => (
                        <article className="exception-card" key={finding.key}>
                            <div className="exception-icon high">
                                <AlertTriangle size={18} />
                            </div>

                            <div className="exception-content">
                                <div className="exception-header">
                                    <strong>{finding.issue}</strong>
                                    <span className="exception-priority high">
                                        Review required
                                    </span>
                                </div>

                                <p>
                                    <strong>{finding.guestName}</strong>
                                    {" · "}
                                    {finding.detail}
                                </p>

                                <div className="exception-actions">
                                    <button
                                        type="button"
                                        className="secondary"
                                        onClick={() => onReviewBooking(finding.bookingId)}
                                    >
                                        Review booking <ArrowRight size={14} />
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

export default PaymentReconciliation;
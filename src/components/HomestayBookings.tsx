import React from "react";
import type { HomestayBooking } from "../core/types";

type Props = {
  bookings: HomestayBooking[];
};

function statusClass(status: HomestayBooking["status"]) {
  switch (status) {
    case "Confirmed":
      return "status confirmed";
    case "Quoted":
      return "status quoted";
    case "Check-in":
      return "status checkin";
    case "In stay":
      return "status instay";
    case "Completed":
      return "status completed";
    case "Cancelled":
      return "status cancelled";
    default:
      return "status";
  }
}

function paymentClass(status: HomestayBooking["paymentStatus"]) {
  switch (status) {
    case "Paid":
      return "payment paid";
    case "Part paid":
      return "payment part-paid";
    default:
      return "payment pending";
  }
}

function sourceClass(source: HomestayBooking["source"]) {
  switch (source) {
    case "Airbnb":
      return "source airbnb";
    case "Booking.com":
      return "source booking";
    case "Agoda":
      return "source agoda";
    case "MakeMyTrip":
      return "source mmt";
    default:
      return "source direct";
  }
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export default function HomestayBookings({ bookings }: Props) {
  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "Confirmed"
  ).length;

  const pendingPayments = bookings.filter(
    (booking) => booking.paymentStatus !== "Paid"
  ).length;

  const guestMismatches = bookings.filter(
    (booking) =>
      booking.actualGuests !== undefined &&
      booking.actualGuests > booking.bookedGuests
  ).length;

  return (
    <section className="homestay-bookings">
      <div className="module-heading">
        <div>
          <p className="eyebrow">MMVK HOMESTAY</p>
          <h2>Bookings</h2>
          <p className="module-description">
            Manage OTA and direct reservations from one place.
          </p>
        </div>

        <button className="primary-button">
          + New booking
        </button>
      </div>

      <div className="booking-summary">
        <div className="booking-summary-card">
          <span>Total bookings</span>
          <strong>{totalBookings}</strong>
        </div>

        <div className="booking-summary-card">
          <span>Confirmed</span>
          <strong>{confirmedBookings}</strong>
        </div>

        <div className="booking-summary-card warning-card">
          <span>Payment attention</span>
          <strong>{pendingPayments}</strong>
        </div>

        <div className="booking-summary-card danger-card">
          <span>Guest mismatches</span>
          <strong>{guestMismatches}</strong>
        </div>
      </div>

      <div className="booking-table-card">
        <div className="table-heading">
          <div>
            <h3>Reservations</h3>
            <span>{totalBookings} reservations</span>
          </div>
        </div>

        <div className="booking-table-wrapper">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Source</th>
                <th>Stay</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => {
                const hasGuestMismatch =
                  booking.actualGuests !== undefined &&
                  booking.actualGuests > booking.bookedGuests;

                return (
                  <tr key={booking.id}>
                    <td>
                      <div className="guest-cell">
                        <strong>{booking.guestName}</strong>
                        <span>{booking.id}</span>
                      </div>
                    </td>

                    <td>
                      <span className={sourceClass(booking.source)}>
                        {booking.source}
                      </span>
                    </td>

                    <td>
                      <div className="stay-cell">
                        <strong>{formatDate(booking.checkIn)}</strong>
                        <span>to {formatDate(booking.checkOut)}</span>
                      </div>
                    </td>

                    <td>
                      <div className={hasGuestMismatch ? "guest-count mismatch" : "guest-count"}>
                        <strong>
                          {booking.bookedGuests}
                        </strong>

                        {booking.actualGuests !== undefined && (
                          <span>
                            actual {booking.actualGuests}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="amount-cell">
                        <strong>{formatCurrency(booking.amount)}</strong>

                        {booking.netAmount !== undefined && (
                          <span>
                            net {formatCurrency(booking.netAmount)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={paymentClass(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span className={statusClass(booking.status)}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
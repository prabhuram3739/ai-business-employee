import React, { useEffect, useState } from "react";
import type {
  BookingSource,
  BookingStatus,
  HomestayBooking,
  PaymentStatus
} from "../core/types";
import { businessStore } from "../core/store";

type Props = {
  bookings: HomestayBooking[];
};

type BookingForm = {
  guestName: string;
  source: BookingSource;
  checkIn: string;
  checkOut: string;
  bookedGuests: number;
  actualGuests: string;
  amount: number;
  paymentStatus: PaymentStatus;
  amountReceived: string;
  status: BookingStatus;
  guestPhone: string;
  notes: string;
};

const initialForm: BookingForm = {
  guestName: "",
  source: "Direct",
  checkIn: "",
  checkOut: "",
  bookedGuests: 4,
  actualGuests: "",
  amount: 0,
  paymentStatus: "Pending",
  amountReceived: "",
  status: "Quoted",
  guestPhone: "",
  notes: ""
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
  if (!date) return "-";

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

function generateBookingId(source: BookingSource) {
  const prefix =
    source === "Direct"
      ? "HS"
      : source === "Booking.com"
        ? "HS-BOOK"
        : source === "MakeMyTrip"
          ? "HS-MMT"
          : source === "Airbnb"
            ? "HS-AIR"
            : "HS-AGO";

  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function getOtaCommission(source: BookingSource) {
  switch (source) {
    case "Airbnb":
      return 0.03;

    case "Booking.com":
      return 0.15;

    case "Agoda":
      return 0.15;

    case "MakeMyTrip":
      return 0.18;

    default:
      return 0;
  }
}

export default function HomestayBookings({ bookings: initialBookings }: Props) {
  const [bookings, setBookings] =
  useState<HomestayBooking[]>(initialBookings);

  const [selectedBooking, setSelectedBooking] =
  useState<HomestayBooking | null>(null);

    const [showForm, setShowForm] = useState(false);

    const [editingBookingId, setEditingBookingId] =
  useState<string | null>(null);

  const [form, setForm] =
    useState<BookingForm>(initialForm);

useEffect(() => {
  businessStore.setState({
    bookings: initialBookings
  });

  return businessStore.subscribe(() => {
    setBookings(businessStore.getState().bookings);
  });
}, [initialBookings]);



  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    booking => booking.status === "Confirmed"
  ).length;

const pendingPayments = bookings.filter(
  booking =>
    booking.amountReceived === undefined ||
    booking.amountReceived < booking.amount
).length;

  const guestMismatches = bookings.filter(
    booking =>
      booking.actualGuests !== undefined &&
      booking.actualGuests > booking.bookedGuests
  ).length;

  function updateForm<K extends keyof BookingForm>(
    field: K,
    value: BookingForm[K]
  ) {
    setForm(current => ({
      ...current,
      [field]: value
    }));
  }

  function resetForm() {
    setForm(initialForm);
  }

  function handleNewBooking() {
  resetForm();
  setEditingBookingId(null);
  setShowForm(true);
}

function handleEditBooking(booking: HomestayBooking) {
  setEditingBookingId(booking.id);

  setForm({
    guestName: booking.guestName,
    source: booking.source,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    bookedGuests: booking.bookedGuests,
    actualGuests:
      booking.actualGuests !== undefined
        ? String(booking.actualGuests)
        : "",
   amount: booking.amount,
amountReceived:
  booking.amountReceived !== undefined
    ? String(booking.amountReceived)
    : "",
paymentStatus: booking.paymentStatus,
    status: booking.status,
    guestPhone: booking.guestPhone ?? "",
    notes: booking.notes ?? ""
  });

  setShowForm(true);
}

function handleCancel() {
  resetForm();
  setEditingBookingId(null);
  setShowForm(false);
}

  function handleSaveBooking(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.guestName.trim()) {
      alert("Please enter guest name.");
      return;
    }

    if (!form.checkIn || !form.checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    if (form.checkOut <= form.checkIn) {
      alert("Check-out must be after check-in.");
      return;
    }

    if (form.bookedGuests < 1) {
      alert("Guest count must be at least 1.");
      return;
    }

    if (form.amount < 0) {
      alert("Booking amount cannot be negative.");
      return;
    }

    const commissionRate = getOtaCommission(form.source);
    const otaCommission =
      form.source === "Direct"
        ? 0
        : Math.round(form.amount * commissionRate);

    const netAmount = form.amount - otaCommission;

    const actualGuests =
      form.actualGuests.trim() === ""
        ? undefined
        : Number(form.actualGuests);

        const amountReceived =
  form.amountReceived.trim() === ""
    ? undefined
    : Number(form.amountReceived);

if (
  amountReceived !== undefined &&
  amountReceived < 0
) {
  alert("Amount received cannot be negative.");
  return;
}

if (
  amountReceived !== undefined &&
  amountReceived > form.amount
) {
  alert("Amount received cannot exceed booking amount.");
  return;
}

const calculatedPaymentStatus: PaymentStatus =
  amountReceived === undefined || amountReceived === 0
    ? "Pending"
    : amountReceived >= form.amount
      ? "Paid"
      : "Part paid";

    const booking: HomestayBooking = {
      id: generateBookingId(form.source),
      guestName: form.guestName.trim(),
      source: form.source,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      bookedGuests: Number(form.bookedGuests),
      actualGuests,
      amount: Number(form.amount),
      paymentStatus: calculatedPaymentStatus,
      amountReceived,
      status: form.status,
      otaCommission,
      netAmount,
      guestPhone: form.guestPhone.trim() || undefined,
      notes: form.notes.trim() || undefined
    };

    if (editingBookingId) {
  businessStore.updateBooking(
    editingBookingId,
    currentBooking => ({
      ...currentBooking,
      ...booking,
      id: editingBookingId
    })
  );
} else {
  businessStore.addBooking(booking);
}

resetForm();
setEditingBookingId(null);
setShowForm(false);
  }

  return (
    <section className="homestay-bookings">

      {/* HEADER */}
      <div className="module-heading">
        <div>
          <p className="eyebrow">MMVK HOMESTAY</p>

          <h2>Bookings</h2>

          <p className="module-description">
            Manage OTA and direct reservations from one place.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={handleNewBooking}
        >
          <h3>
  {editingBookingId ? "Edit booking" : "New booking"}
</h3>
        </button>
      </div>

      {/* NEW BOOKING FORM */}
      {showForm && (
        <div className="booking-form-card">

          <div className="table-heading">
            <div>
              <h3>
  {editingBookingId ? "Edit booking" : "New booking"}
</h3>
              <span>
  {editingBookingId
    ? "Update this MMVK Homestay reservation"
    : "Create a reservation for MMVK Homestay"}
</span>
            </div>
          </div>

          <form onSubmit={handleSaveBooking}>

            <div className="booking-form-grid">

              <label>
                <span>Guest name *</span>

                <input
                  type="text"
                  value={form.guestName}
                  onChange={event =>
                    updateForm(
                      "guestName",
                      event.target.value
                    )
                  }
                  placeholder="Guest name"
                />
              </label>

              <label>
                <span>Booking source</span>

                <select
                  value={form.source}
                  onChange={event =>
                    updateForm(
                      "source",
                      event.target.value as BookingSource
                    )
                  }
                >
                  <option value="Direct">Direct</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">
                    Booking.com
                  </option>
                  <option value="Agoda">Agoda</option>
                  <option value="MakeMyTrip">
                    MakeMyTrip
                  </option>
                </select>
              </label>

              <label>
                <span>Check-in *</span>

                <input
                  type="date"
                  value={form.checkIn}
                  onChange={event =>
                    updateForm(
                      "checkIn",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Check-out *</span>

                <input
                  type="date"
                  value={form.checkOut}
                  onChange={event =>
                    updateForm(
                      "checkOut",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Booked guests *</span>

                <input
                  type="number"
                  min="1"
                  value={form.bookedGuests}
                  onChange={event =>
                    updateForm(
                      "bookedGuests",
                      Number(event.target.value)
                    )
                  }
                />
              </label>

              <label>
                <span>Actual guests</span>

                <input
                  type="number"
                  min="1"
                  value={form.actualGuests}
                  onChange={event =>
                    updateForm(
                      "actualGuests",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                <span>Booking amount</span>

                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={event =>
                    updateForm(
                      "amount",
                      Number(event.target.value)
                    )
                  }
                  placeholder="₹"
                />
              </label>

              <label>
  <span>Amount received</span>

  <input
    type="number"
    min="0"
    value={form.amountReceived}
    onChange={event =>
      updateForm(
        "amountReceived",
        event.target.value
      )
    }
    placeholder="₹0"
  />
</label>

              <label>
                <span>Payment status</span>

                <select
                  value={form.paymentStatus}
                  onChange={event =>
                    updateForm(
                      "paymentStatus",
                      event.target.value as PaymentStatus
                    )
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Part paid">
                    Part paid
                  </option>
                  <option value="Paid">Paid</option>
                </select>
              </label>

              <label>
                <span>Booking status</span>

                <select
                  value={form.status}
                  onChange={event =>
                    updateForm(
                      "status",
                      event.target.value as BookingStatus
                    )
                  }
                >
                  <option value="Enquiry">Enquiry</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Confirmed">
                    Confirmed
                  </option>
                  <option value="Check-in">
                    Check-in
                  </option>
                  <option value="In stay">
                    In stay
                  </option>
                  <option value="Checkout">
                    Checkout
                  </option>
                  <option value="Completed">
                    Completed
                  </option>
                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </label>

              <label>
                <span>Guest phone</span>

                <input
                  type="tel"
                  value={form.guestPhone}
                  onChange={event =>
                    updateForm(
                      "guestPhone",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </label>

              <label className="booking-form-full">
                <span>Notes</span>

                <textarea
                  value={form.notes}
                  onChange={event =>
                    updateForm(
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Booking notes..."
                  rows={3}
                />
              </label>

            </div>

            <div className="booking-form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
               {editingBookingId ? "Save changes" : "Save booking"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* SUMMARY */}
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

      {/* TABLE */}
      <div className="booking-table-card">

        <div className="table-heading">
          <div>
            <h3>Reservations</h3>
            <span>
              {totalBookings} reservations
            </span>
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

              {bookings.map(booking => {

                const hasGuestMismatch =
                  booking.actualGuests !== undefined &&
                  booking.actualGuests >
                    booking.bookedGuests;

                return (
                 <tr
  key={booking.id}
  className="booking-row"
  onClick={() => setSelectedBooking(booking)}
>

                   <td>
  <button
    type="button"
    className="booking-guest-button"
    onClick={() => handleEditBooking(booking)}
  >
    <span className="guest-cell">
      <strong>{booking.guestName}</strong>
      <span>{booking.id}</span>
    </span>
  </button>
</td>

                    <td>
                      <span
                        className={sourceClass(
                          booking.source
                        )}
                      >
                        {booking.source}
                      </span>
                    </td>

                    <td>
                      <div className="stay-cell">
                        <strong>
                          {formatDate(
                            booking.checkIn
                          )}
                        </strong>

                        <span>
                          to{" "}
                          {formatDate(
                            booking.checkOut
                          )}
                        </span>
                      </div>
                    </td>

                    <td>

                      <div
                        className={
                          hasGuestMismatch
                            ? "guest-count mismatch"
                            : "guest-count"
                        }
                      >

                        <strong>
                          {booking.bookedGuests}
                        </strong>

                        {booking.actualGuests !==
                          undefined && (
                          <span>
                            actual{" "}
                            {booking.actualGuests}
                          </span>
                        )}

                      </div>

                    </td>

                    <td>

                     <div className="amount-cell">
  <strong>
    {formatCurrency(booking.amount)}
  </strong>

  {booking.amountReceived !== undefined && (
    <span>
      received{" "}
      {formatCurrency(booking.amountReceived)}
    </span>
  )}

  {booking.amountReceived !== undefined && (
    <span
      className={
        booking.amountReceived < booking.amount
          ? "balance-due"
          : "balance-paid"
      }
    >
      balance{" "}
      {formatCurrency(
        Math.max(
          booking.amount - booking.amountReceived,
          0
        )
      )}
    </span>
  )}

  {booking.netAmount !== undefined && (
    <span>
      net{" "}
      {formatCurrency(booking.netAmount)}
    </span>
  )}
</div>

                    </td>

                    <td>

                      <span
                        className={paymentClass(
                          booking.paymentStatus
                        )}
                      >
                        {booking.paymentStatus}
                      </span>

                    </td>

                    <td>

                      <span
                        className={statusClass(
                          booking.status
                        )}
                      >
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
{selectedBooking && (
  <div className="booking-detail-overlay">
    <div className="booking-detail-panel">

      <div className="booking-detail-header">
        <div>
          <p className="eyebrow">BOOKING DETAILS</p>
          <h2>{selectedBooking.guestName}</h2>
          <span>{selectedBooking.id}</span>
        </div>

        <button
          className="detail-close"
          onClick={() => setSelectedBooking(null)}
        >
          ×
        </button>
      </div>

      <div className="booking-detail-grid">

        <div className="detail-card">
          <span>Booking source</span>
          <strong>{selectedBooking.source}</strong>
        </div>

        <div className="detail-card">
          <span>Status</span>
          <strong>{selectedBooking.status}</strong>
        </div>

        <div className="detail-card">
          <span>Check-in</span>
          <strong>{formatDate(selectedBooking.checkIn)}</strong>
        </div>

        <div className="detail-card">
          <span>Check-out</span>
          <strong>{formatDate(selectedBooking.checkOut)}</strong>
        </div>

        <div className="detail-card">
          <span>Booked guests</span>
          <strong>{selectedBooking.bookedGuests}</strong>
        </div>

        <div className="detail-card">
          <span>Actual guests</span>
          <strong>
            {selectedBooking.actualGuests ??
              "Not recorded"}
          </strong>
        </div>

        <div className="detail-card">
          <span>Booking amount</span>
          <strong>
            {formatCurrency(selectedBooking.amount)}
          </strong>
        </div>

        <div className="detail-card">
          <span>Amount received</span>
          <strong>
            {formatCurrency(
              selectedBooking.amountReceived ?? 0
            )}
          </strong>
        </div>

        <div className="detail-card">
          <span>Balance due</span>
          <strong>
            {formatCurrency(
              Math.max(
                selectedBooking.amount -
                  (selectedBooking.amountReceived ?? 0),
                0
              )
            )}
          </strong>
        </div>

        {selectedBooking.guestPhone && (
          <div className="detail-card">
            <span>Guest phone</span>
            <strong>{selectedBooking.guestPhone}</strong>
          </div>
        )}

      </div>

      {selectedBooking.actualGuests !== undefined &&
        selectedBooking.actualGuests >
          selectedBooking.bookedGuests && (
          <div className="booking-exception">
            <strong>Guest count mismatch</strong>
            <p>
              Booked for {selectedBooking.bookedGuests}
              {" "}guests, but {selectedBooking.actualGuests}
              {" "}actual guests are recorded.
            </p>
          </div>
        )}

      {selectedBooking.notes && (
        <div className="booking-notes">
          <h3>Booking notes</h3>
          <p>{selectedBooking.notes}</p>
        </div>
      )}

      <div className="booking-actions">
        <button className="secondary-button">
          Check-in
        </button>

        <button className="secondary-button">
          Mark in stay
        </button>

        <button className="primary-button">
          Checkout
        </button>
      </div>

    </div>
  </div>
)}
    </section>
  );
}
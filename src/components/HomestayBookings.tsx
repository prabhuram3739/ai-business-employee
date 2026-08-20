import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import type {
  BookingSource,
  BookingStatus,
  HomestayBooking,
  PaymentStatus
} from "../core/types";

import { businessStore } from "../core/store";

type Props = {
  bookings: HomestayBooking[];
  initialSelectedBookingId?: string | null;
};

type BookingFormState = {
  guestName: string;
  source: BookingSource;
  checkIn: string;
  checkOut: string;
  bookedGuests: string;
  actualGuests: string;
  amount: string;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  guestPhone: string;
  notes: string;
};

const createEmptyForm = (): BookingFormState => ({
  guestName: "",
  source: "Direct",
  checkIn: "",
  checkOut: "",
  bookedGuests: "4",
  actualGuests: "",
  amount: "0",
  paymentStatus: "Pending",
  status: "Quoted",
  guestPhone: "",
  notes: ""
});

const statusClass = (
  status: HomestayBooking["status"]
): string => {
  switch (status) {
    case "Confirmed":
      return "status confirmed";

    case "Quoted":
      return "status quoted";

    case "Check-in":
      return "status checkin";

    case "In stay":
      return "status instay";

    case "Checkout":
      return "status checkout";

    case "Completed":
      return "status completed";

    case "Cancelled":
      return "status cancelled";

    case "Enquiry":
      return "status enquiry";

    default:
      return "status";
  }
};

const paymentClass = (
  status: HomestayBooking["paymentStatus"]
): string => {
  switch (status) {
    case "Paid":
      return "payment paid";

    case "Part paid":
      return "payment part-paid";

    default:
      return "payment pending";
  }
};

const sourceClass = (
  source: HomestayBooking["source"]
): string => {
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
};

const formatDate = (
  date: string
): string => {
  if (!date) {
    return "-";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
};

const formatCurrency = (
  amount: number
): string => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }
  ).format(amount);
};

const getNextStatus = (
  status: BookingStatus
): BookingStatus | null => {
  switch (status) {
    case "Confirmed":
      return "Check-in";

    case "Check-in":
      return "In stay";

    case "In stay":
      return "Checkout";

    case "Checkout":
      return "Completed";

    default:
      return null;
  }
};

const getNextStatusLabel = (
  status: BookingStatus
): string | null => {
  switch (status) {
    case "Confirmed":
      return "Check-in";

    case "Check-in":
      return "Mark in stay";

    case "In stay":
      return "Checkout";

    case "Checkout":
      return "Complete stay";

    default:
      return null;
  }
};

const HomestayBookings = ({
  bookings,
  initialSelectedBookingId = null
}: Props): React.JSX.Element => {
  const [showNewBooking, setShowNewBooking] =
    useState(false);

  const [selectedBooking, setSelectedBooking] =
    useState<HomestayBooking | null>(null);

  const [form, setForm] =
    useState<BookingFormState>(
      createEmptyForm()
    );

  /*
   * When Exception Center sends us a booking ID,
   * automatically open that booking.
   */
  useEffect(() => {
    if (!initialSelectedBookingId) {
      return;
    }

    const booking = bookings.find(
      item =>
        item.id ===
        initialSelectedBookingId
    );

    if (booking) {
      setSelectedBooking(booking);
    }
  }, [
    initialSelectedBookingId,
    bookings
  ]);

  const totalBookings =
    bookings.length;

  const confirmedBookings =
    bookings.filter(
      booking =>
        booking.status ===
        "Confirmed"
    ).length;

  const pendingPayments =
    bookings.filter(
      booking =>
        booking.paymentStatus !==
        "Paid"
    ).length;

  const guestMismatches =
    bookings.filter(
      booking =>
        booking.actualGuests !==
        undefined &&
        booking.actualGuests >
        booking.bookedGuests
    ).length;

  const sortedBookings =
    useMemo(
      () =>
        [...bookings].sort(
          (a, b) =>
            a.checkIn.localeCompare(
              b.checkIn
            )
        ),
      [bookings]
    );

  const updateForm = <
    K extends keyof BookingFormState
  >(
    field: K,
    value: BookingFormState[K]
  ): void => {
    setForm(previous => ({
      ...previous,
      [field]: value
    }));
  };

  const handleCreateBooking = (): void => {
    if (
      !form.guestName.trim() ||
      !form.checkIn ||
      !form.checkOut ||
      !form.bookedGuests
    ) {
      return;
    }

    const bookingNumber =
      String(
        bookings.length + 1
      ).padStart(3, "0");

    const booking: HomestayBooking = {
      id: `HS-${new Date()
        .getFullYear()}-${bookingNumber}`,

      guestName:
        form.guestName.trim(),

      source:
        form.source,

      checkIn:
        form.checkIn,

      checkOut:
        form.checkOut,

      bookedGuests:
        Number(form.bookedGuests),

      ...(form.actualGuests
        ? {
          actualGuests:
            Number(
              form.actualGuests
            )
        }
        : {}),

      amount:
        Number(form.amount) || 0,

      paymentStatus:
        form.paymentStatus,

      status:
        form.status,

      ...(form.guestPhone.trim()
        ? {
          guestPhone:
            form.guestPhone.trim()
        }
        : {}),

      ...(form.notes.trim()
        ? {
          notes:
            form.notes.trim()
        }
        : {})
    };

    businessStore.addBooking(
      booking
    );

    setForm(
      createEmptyForm()
    );

    setShowNewBooking(
      false
    );
  };

  const updateBookingStatus = (
    status: BookingStatus
  ): void => {
    if (!selectedBooking) {
      return;
    }

    businessStore.updateBooking(
      selectedBooking.id,
      booking => ({
        ...booking,
        status
      })
    );

    setSelectedBooking(
      previous =>
        previous
          ? {
            ...previous,
            status
          }
          : previous
    );
  };

  const handleCancelBooking = (): void => {
    updateBookingStatus(
      "Cancelled"
    );
  };

  const nextStatus =
    selectedBooking
      ? getNextStatus(
        selectedBooking.status
      )
      : null;

  const nextStatusLabel =
    selectedBooking
      ? getNextStatusLabel(
        selectedBooking.status
      )
      : null;

  return (
    <section className="homestay-bookings">
      <div className="module-heading">
        <div>
          <p className="eyebrow">
            MMVK HOMESTAY
          </p>

          <h2>
            Bookings
          </h2>

          <p className="module-description">
            Manage OTA and direct
            reservations from one
            place.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setShowNewBooking(
              previous =>
                !previous
            )
          }
        >
          + New booking
        </button>
      </div>

      {showNewBooking && (
        <div className="booking-form-card">
          <div className="section-head">
            <div>
              <h2>
                New booking
              </h2>

              <p>
                Create a reservation
                for MMVK Homestay
              </p>
            </div>
          </div>

          <div className="booking-form-grid">
            <label>
              Guest name *
              <input
                type="text"
                value={
                  form.guestName
                }
                placeholder="Guest name"
                onChange={event =>
                  updateForm(
                    "guestName",
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              Booking source
              <select
                value={
                  form.source
                }
                onChange={event =>
                  updateForm(
                    "source",
                    event.target
                      .value as BookingSource
                  )
                }
              >
                <option value="Direct">
                  Direct
                </option>

                <option value="Airbnb">
                  Airbnb
                </option>

                <option value="Booking.com">
                  Booking.com
                </option>

                <option value="Agoda">
                  Agoda
                </option>

                <option value="MakeMyTrip">
                  MakeMyTrip
                </option>
              </select>
            </label>

            <label>
              Check-in *
              <input
                type="date"
                value={
                  form.checkIn
                }
                onChange={event =>
                  updateForm(
                    "checkIn",
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              Check-out *
              <input
                type="date"
                value={
                  form.checkOut
                }
                onChange={event =>
                  updateForm(
                    "checkOut",
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              Booked guests *
              <input
                type="number"
                min="1"
                value={
                  form.bookedGuests
                }
                onChange={event =>
                  updateForm(
                    "bookedGuests",
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              Actual guests
              <input
                type="number"
                min="0"
                value={
                  form.actualGuests
                }
                placeholder="Optional"
                onChange={event =>
                  updateForm(
                    "actualGuests",
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              Booking amount
              <input
                type="number"
                min="0"
                value={
                  form.amount
                }
                onChange={event =>
                  updateForm(
                    "amount",
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              Payment status
              <select
                value={
                  form.paymentStatus
                }
                onChange={event =>
                  updateForm(
                    "paymentStatus",
                    event.target
                      .value as PaymentStatus
                  )
                }
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="Part paid">
                  Part paid
                </option>

                <option value="Paid">
                  Paid
                </option>
              </select>
            </label>

            <label>
              Booking status
              <select
                value={
                  form.status
                }
                onChange={event =>
                  updateForm(
                    "status",
                    event.target
                      .value as BookingStatus
                  )
                }
              >
                <option value="Enquiry">
                  Enquiry
                </option>

                <option value="Quoted">
                  Quoted
                </option>

                <option value="Confirmed">
                  Confirmed
                </option>
              </select>
            </label>

            <label>
              Guest phone
              <input
                type="tel"
                value={
                  form.guestPhone
                }
                placeholder="Optional"
                onChange={event =>
                  updateForm(
                    "guestPhone",
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label className="booking-form-full">
              Notes
              <textarea
                value={
                  form.notes
                }
                placeholder="Booking notes..."
                rows={3}
                onChange={event =>
                  updateForm(
                    "notes",
                    event.target
                      .value
                  )
                }
              />
            </label>
          </div>

          <div className="booking-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setShowNewBooking(
                  false
                );

                setForm(
                  createEmptyForm()
                );
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleCreateBooking
              }
            >
              Save booking
            </button>
          </div>
        </div>
      )}

      <div className="booking-summary">
        <div className="booking-summary-card">
          <span>
            Total bookings
          </span>

          <strong>
            {totalBookings}
          </strong>
        </div>

        <div className="booking-summary-card">
          <span>
            Confirmed
          </span>

          <strong>
            {confirmedBookings}
          </strong>
        </div>

        <div className="booking-summary-card warning-card">
          <span>
            Payment attention
          </span>

          <strong>
            {pendingPayments}
          </strong>
        </div>

        <div className="booking-summary-card danger-card">
          <span>
            Guest mismatches
          </span>

          <strong>
            {guestMismatches}
          </strong>
        </div>
      </div>

      <div className="booking-table-card">
        <div className="table-heading">
          <div>
            <h3>
              Reservations
            </h3>

            <span>
              {totalBookings}{" "}
              reservations
            </span>
          </div>
        </div>

        <div className="booking-table-wrapper">
          <table className="booking-table">
            <thead>
              <tr>
                <th>
                  Guest
                </th>

                <th>
                  Source
                </th>

                <th>
                  Stay
                </th>

                <th>
                  Guests
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedBookings.map(
                booking => {
                  const hasGuestMismatch =
                    booking.actualGuests !==
                    undefined &&
                    booking.actualGuests >
                    booking.bookedGuests;

                  return (
                    <tr
                      key={
                        booking.id
                      }
                      className={
                        selectedBooking?.id ===
                          booking.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() =>
                        setSelectedBooking(
                          booking
                        )
                      }
                    >
                      <td>
                        <div className="guest-cell">
                          <strong>
                            {
                              booking.guestName
                            }
                          </strong>

                          <span>
                            {
                              booking.id
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={sourceClass(
                            booking.source
                          )}
                        >
                          {
                            booking.source
                          }
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
                            {
                              booking.bookedGuests
                            }
                          </strong>

                          {booking.actualGuests !==
                            undefined && (
                              <span>
                                actual{" "}
                                {
                                  booking.actualGuests
                                }
                              </span>
                            )}
                        </div>
                      </td>

                      <td>
                        <div className="amount-cell">
                          <strong>
                            {formatCurrency(
                              booking.amount
                            )}
                          </strong>

                          {booking.netAmount !==
                            undefined && (
                              <span>
                                net{" "}
                                {formatCurrency(
                                  booking.netAmount
                                )}
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
                          {
                            booking.paymentStatus
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={statusClass(
                            booking.status
                          )}
                        >
                          {
                            booking.status
                          }
                        </span>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div className="booking-detail-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                RESERVATION
              </p>

              <h2>
                {
                  selectedBooking.guestName
                }
              </h2>

              <p>
                {
                  selectedBooking.id
                }
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setSelectedBooking(
                  null
                )
              }
            >
              Close
            </button>
          </div>

          <div className="booking-detail-grid">
            <div>
              <span>
                Source
              </span>

              <strong>
                {
                  selectedBooking.source
                }
              </strong>
            </div>

            <div>
              <span>
                Check-in
              </span>

              <strong>
                {formatDate(
                  selectedBooking.checkIn
                )}
              </strong>
            </div>

            <div>
              <span>
                Check-out
              </span>

              <strong>
                {formatDate(
                  selectedBooking.checkOut
                )}
              </strong>
            </div>

            <div>
              <span>
                Booked guests
              </span>

              <strong>
                {
                  selectedBooking.bookedGuests
                }
              </strong>
            </div>

            <div>
              <span>
                Actual guests
              </span>

              <strong
                className={
                  selectedBooking.actualGuests !==
                    undefined &&
                    selectedBooking.actualGuests >
                    selectedBooking.bookedGuests
                    ? "danger-text"
                    : ""
                }
              >
                {
                  selectedBooking.actualGuests ??
                  "Not recorded"
                }
              </strong>
            </div>

            <div>
              <span>
                Booking amount
              </span>

              <strong>
                {formatCurrency(
                  selectedBooking.amount
                )}
              </strong>
            </div>

            <div>
              <span>
                Payment
              </span>

              <strong>
                {
                  selectedBooking.paymentStatus
                }
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                {
                  selectedBooking.status
                }
              </strong>
            </div>
          </div>

          {selectedBooking.actualGuests !==
            undefined &&
            selectedBooking.actualGuests >
            selectedBooking.bookedGuests && (
              <div className="occupancy-decision">
                <div className="occupancy-decision-header">
                  <div>
                    <span className="eyebrow">
                      OWNER DECISION
                    </span>

                    <h3>
                      Guest count mismatch
                    </h3>

                    <p>
                      {
                        selectedBooking.bookedGuests
                      }{" "}
                      guests were booked, but{" "}
                      {
                        selectedBooking.actualGuests
                      }{" "}
                      guests are recorded.
                    </p>
                  </div>

                  <span
                    className={`decision-status ${selectedBooking.occupancyDecision ===
                        "Approved extra charge"
                        ? "approved"
                        : selectedBooking.occupancyDecision ===
                          "No additional charge"
                          ? "no-charge"
                          : selectedBooking.occupancyDecision ===
                            "Keep under review"
                            ? "review"
                            : "pending"
                      }`}
                  >
                    {selectedBooking.occupancyDecision ??
                      "Pending"}
                  </span>
                </div>

                {(!selectedBooking.occupancyDecision ||
                  selectedBooking.occupancyDecision ===
                  "Pending") && (
                    <div className="occupancy-decision-actions">
                      <button
                        type="button"
                        className="primary-button"
                    onClick={() => {
                      const decision =
                        "Approved extra charge";

                      businessStore.updateOccupancyDecision(
                        selectedBooking.id,
                        decision,
                        0
                      );

                      setSelectedBooking({
                        ...selectedBooking,
                        occupancyDecision: decision,
                        additionalOccupancyCharge: 0,
                        occupancyDecisionAt:
                          new Date().toISOString()
                      });
                    }}
                      >
                        Approve extra charge
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                    onClick={() => {
                      const decision =
                        "No additional charge";

                      businessStore.updateOccupancyDecision(
                        selectedBooking.id,
                        decision
                      );

                      setSelectedBooking({
                        ...selectedBooking,
                        occupancyDecision: decision,
                        additionalOccupancyCharge: 0,
                        occupancyDecisionAt:
                          new Date().toISOString()
                      });
                    }}
                      >
                        No additional charge
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                    onClick={() => {
                      const decision =
                        "Keep under review";

                      businessStore.updateOccupancyDecision(
                        selectedBooking.id,
                        decision
                      );

                      setSelectedBooking({
                        ...selectedBooking,
                        occupancyDecision: decision,
                        additionalOccupancyCharge: 0,
                        occupancyDecisionAt:
                          new Date().toISOString()
                      });
                    }}
                      >
                        Keep under review
                      </button>
                    </div>
                  )}

                {selectedBooking.occupancyDecision &&
                  selectedBooking.occupancyDecision !==
                  "Pending" && (
                    <div className="decision-completed">
                      <strong>
                        Owner decision recorded
                      </strong>

                      <span>
                        {
                          selectedBooking.occupancyDecision
                        }
                      </span>

                      {selectedBooking.occupancyDecisionAt && (
                        <small>
                          {new Date(
                            selectedBooking.occupancyDecisionAt
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </small>
                      )}
                    </div>
                  )}
              </div>
            )}

          {selectedBooking.actualGuests !==
            undefined &&
            selectedBooking.actualGuests >
            selectedBooking.bookedGuests && (
              <div className="booking-warning">
                <strong>
                  Guest count
                  mismatch
                </strong>

                <p>
                  Booked for{" "}
                  {
                    selectedBooking.bookedGuests
                  }{" "}
                  guests but{" "}
                  {
                    selectedBooking.actualGuests
                  }{" "}
                  actual guests
                  are recorded.
                  Owner review is
                  required before
                  applying an
                  additional
                  occupancy charge.
                </p>
              </div>
            )}

          {selectedBooking.notes && (
            <div className="booking-notes">
              <span>
                Notes
              </span>

              <p>
                {
                  selectedBooking.notes
                }
              </p>
            </div>
          )}

          <div className="booking-detail-actions">
            {nextStatus &&
              nextStatusLabel && (
                <button
                  type="button"
                  className={
                    nextStatus ===
                      "Completed"
                      ? "primary-button"
                      : "secondary-button"
                  }
                  onClick={() =>
                    updateBookingStatus(
                      nextStatus
                    )
                  }
                >
                  {
                    nextStatusLabel
                  }
                </button>
              )}

            {selectedBooking.status !==
              "Completed" &&
              selectedBooking.status !==
              "Cancelled" && (
                <button
                  type="button"
                  className="secondary-button danger-button"
                  onClick={
                    handleCancelBooking
                  }
                >
                  Cancel booking
                </button>
              )}
          </div>
        </div>
      )}
    </section>
  );
};

export default HomestayBookings;
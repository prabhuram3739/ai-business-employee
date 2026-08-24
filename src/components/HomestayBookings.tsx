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

import {
  calculateExtraGuestCharge
} from "../core/pricing";

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
  amountReceived: string;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  guestPhone: string;
  notes: string;
};

type PaymentMethod =
  | "GPay"
  | "UPI"
  | "Cash"
  | "Bank Transfer"
  | "Other";

type PaymentRecord = {
  id: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  receivedAt: string;
};

type BookingWithPayments =
  HomestayBooking & {
    paymentHistory?: PaymentRecord[];
  };

const createEmptyForm = (): BookingFormState => ({
  guestName: "",
  source: "Direct",
  checkIn: "",
  checkOut: "",
  bookedGuests: "4",
  actualGuests: "",
  amount: "0",
  amountReceived: "0",
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

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
};

const formatDateTime = (
  value: string
): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
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

const createPaymentId = (): string => {
  return `PAY-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
};

const HomestayBookings = ({
  bookings,
  initialSelectedBookingId = null
}: Props): React.JSX.Element => {
  const [
    showNewBooking,
    setShowNewBooking
  ] = useState(false);

  const [
    selectedBooking,
    setSelectedBooking
  ] = useState<HomestayBooking | null>(
    null
  );

  const [
    form,
    setForm
  ] = useState<BookingFormState>(
    createEmptyForm()
  );

  /*
   * Payment entry state.
   */
  const [
    paymentAmount,
    setPaymentAmount
  ] = useState("");

  const [
    paymentMethod,
    setPaymentMethod
  ] = useState<PaymentMethod>(
    "GPay"
  );

  const [
    paymentNote,
    setPaymentNote
  ] = useState("");

  /*
   * Open a booking requested by the
   * Exception Center.
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
      setSelectedBooking(
        booking
      );
    }
  }, [
    initialSelectedBookingId,
    bookings
  ]);

  /*
   * Keep the selected booking synchronized
   * with store changes.
   */
  useEffect(() => {
    if (!selectedBooking) {
      return;
    }

    const latestBooking =
      bookings.find(
        booking =>
          booking.id ===
          selectedBooking.id
      );

    if (
      latestBooking &&
      JSON.stringify(
        latestBooking
      ) !==
      JSON.stringify(
        selectedBooking
      )
    ) {
      setSelectedBooking(
        latestBooking
      );
    }
  }, [
    bookings,
    selectedBooking
  ]);

  /*
   * Reset payment entry whenever the
   * selected booking changes.
   */
  useEffect(() => {
    setPaymentAmount("");
    setPaymentMethod("GPay");
    setPaymentNote("");
  }, [
    selectedBooking?.id
  ]);

  /*
   * Repair old approved occupancy decisions
   * that were persisted with ₹0.
   *
   * Example:
   *
   * Booked: 4
   * Actual: 7
   * Extra: 3
   * Rate: ₹500
   * Correct charge: ₹1,500
   */
  useEffect(() => {
    if (!selectedBooking) {
      return;
    }

    if (
      selectedBooking.occupancyDecision !==
      "Approved extra charge" ||
      selectedBooking.additionalOccupancyCharge !==
      0
    ) {
      return;
    }

    const calculatedCharge =
      calculateExtraGuestCharge(
        selectedBooking
      );

    if (
      calculatedCharge.amount <= 0
    ) {
      return;
    }

    businessStore.updateOccupancyDecision(
      selectedBooking.id,
      "Approved extra charge",
      calculatedCharge.amount
    );

    setSelectedBooking(
      previous =>
        previous
          ? {
            ...previous,
            additionalOccupancyCharge:
              calculatedCharge.amount
          }
          : previous
    );
  }, [
    selectedBooking
  ]);

  /*
   * Summary cards.
   */
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

  /*
   * Keep reservations ordered by check-in.
   */
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

  /*
   * Pricing engine.
   */
  const extraGuestCharge =
    useMemo(
      () =>
        selectedBooking
          ? calculateExtraGuestCharge(
            selectedBooking
          )
          : null,
      [selectedBooking]
    );

  /*
   * Complete booking financial picture.
   */
  const financialSummary =
    useMemo(() => {
      if (!selectedBooking) {
        return null;
      }

      const originalAmount =
        selectedBooking.amount ??
        0;

      const calculatedExtraCharge =
        extraGuestCharge?.amount ??
        0;

      const approvedExtraCharge =
        selectedBooking
          .additionalOccupancyCharge &&
          selectedBooking
            .additionalOccupancyCharge >
          0
          ? selectedBooking
            .additionalOccupancyCharge
          : selectedBooking.occupancyDecision ===
            "Approved extra charge"
            ? calculatedExtraCharge
            : 0;

      const totalBookingValue =
        originalAmount +
        approvedExtraCharge;

      const amountReceived =
        selectedBooking.amountReceived ??
        (selectedBooking.paymentStatus ===
          "Paid"
          ? originalAmount
          : 0);

      const balanceDue =
        Math.max(
          totalBookingValue -
          amountReceived,
          0
        );

      const paymentStatus: PaymentStatus =
        balanceDue <= 0
          ? "Paid"
          : amountReceived > 0
            ? "Part paid"
            : "Pending";

      return {
        originalAmount,
        approvedExtraCharge,
        totalBookingValue,
        amountReceived,
        balanceDue,
        paymentStatus
      };
    }, [
      selectedBooking,
      extraGuestCharge
    ]);

  /*
   * Payment history.
   *
   * The existing HomestayBooking type does not
   * currently contain paymentHistory, so this is
   * intentionally handled through the extended
   * local type.
   */
  const selectedBookingWithPayments =
    selectedBooking as
    | BookingWithPayments
    | null;

  const paymentHistory =
    useMemo<PaymentRecord[]>(() => {
      if (!selectedBooking) {
        return [];
      }

      const existing =
        selectedBookingWithPayments
          ?.paymentHistory;

      if (
        Array.isArray(existing) &&
        existing.length > 0
      ) {
        return [...existing].sort(
          (a, b) =>
            new Date(
              b.receivedAt
            ).getTime() -
            new Date(
              a.receivedAt
            ).getTime()
        );
      }

      /*
       * Backward compatibility:
       *
       * Older bookings only stored amountReceived
       * and did not have individual payment records.
       *
       * Show that amount as an existing payment
       * rather than pretending the booking has no
       * payment history.
       */
      const existingAmount =
        Number(
          selectedBooking.amountReceived ??
          0
        );

      if (
        existingAmount > 0
      ) {
        return [
          {
            id: "LEGACY-PAYMENT",
            amount: existingAmount,
            method: "Other",
            note:
              "Existing payment recorded before payment history was enabled.",
            receivedAt:
              new Date().toISOString()
          }
        ];
      }

      return [];
    }, [
      selectedBooking,
      selectedBookingWithPayments
    ]);

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

  /*
   * Create booking.
   */
  const handleCreateBooking =
    (): void => {
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

      const initialAmountReceived =
        Number(
          form.amountReceived
        ) || 0;

      const booking: HomestayBooking =
        {
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
            Number(
              form.bookedGuests
            ),

          ...(form.actualGuests
            ? {
              actualGuests:
                Number(
                  form.actualGuests
                )
            }
            : {}),

          amount:
            Number(form.amount) ||
            0,

          amountReceived:
            initialAmountReceived,

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
            : {}),

          /*
           * If an initial amount was entered,
           * preserve it in payment history.
           *
           * Cast is used because the shared
           * HomestayBooking type has not yet
           * formally declared paymentHistory.
           */
          ...(initialAmountReceived > 0
            ? {
              paymentHistory: [
                {
                  id: createPaymentId(),
                  amount:
                    initialAmountReceived,
                  method:
                    "Other" as PaymentMethod,
                  note:
                    "Initial payment recorded when booking was created.",
                  receivedAt:
                    new Date().toISOString()
                }
              ]
            }
            : {})
        } as HomestayBooking;

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

  /*
   * Update booking workflow status.
   */
  const updateBookingStatus = (
    status: BookingStatus
  ): void => {
    if (!selectedBooking) {
      return;
    }

    businessStore.updateBooking(
      selectedBooking.id,
      booking =>
        ({
          ...booking,
          status
        }) as HomestayBooking
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

  const handleCancelBooking =
    (): void => {
      updateBookingStatus(
        "Cancelled"
      );
    };

  /*
   * Owner occupancy decision.
   */
  const handleOccupancyDecision = (
    decision:
      | "Approved extra charge"
      | "No additional charge"
      | "Keep under review"
  ): void => {
    if (!selectedBooking) {
      return;
    }

    const calculatedCharge =
      extraGuestCharge?.amount ??
      0;

    const additionalCharge =
      decision ===
        "Approved extra charge"
        ? calculatedCharge
        : 0;

    const decisionAt =
      new Date().toISOString();

    businessStore.updateOccupancyDecision(
      selectedBooking.id,
      decision,
      additionalCharge
    );

    setSelectedBooking(
      previous =>
        previous
          ? {
            ...previous,
            occupancyDecision:
              decision,
            additionalOccupancyCharge:
              additionalCharge,
            occupancyDecisionAt:
              decisionAt
          }
          : previous
    );
  };

  /*
   * Record a new payment.
   */
  const handleRecordPayment =
    (): void => {
      if (
        !selectedBooking ||
        !financialSummary
      ) {
        return;
      }

      const amount =
        Number(
          paymentAmount
        );

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return;
      }

      if (
        amount >
        financialSummary.balanceDue
      ) {
        return;
      }

      const now =
        new Date().toISOString();

      const newPayment:
        PaymentRecord = {
        id: createPaymentId(),
        amount,
        method:
          paymentMethod,
        note:
          paymentNote.trim() ||
          undefined,
        receivedAt: now
      };

      const currentHistory =
        Array.isArray(
          selectedBookingWithPayments
            ?.paymentHistory
        )
          ? [
            ...(selectedBookingWithPayments
              ?.paymentHistory ?? [])
          ]
          : [];

      const updatedHistory = [
        ...currentHistory,
        newPayment
      ];

      const newAmountReceived =
        financialSummary.amountReceived +
        amount;

      const newBalance =
        Math.max(
          financialSummary.totalBookingValue -
          newAmountReceived,
          0
        );

      const newPaymentStatus:
        PaymentStatus =
        newBalance <= 0
          ? "Paid"
          : newAmountReceived > 0
            ? "Part paid"
            : "Pending";

      businessStore.updateBooking(
        selectedBooking.id,
        booking =>
          ({
            ...booking,

            amountReceived:
              newAmountReceived,

            paymentStatus:
              newPaymentStatus,

            paymentHistory:
              updatedHistory
          }) as HomestayBooking
      );

      setSelectedBooking(
        previous =>
          previous
            ? ({
              ...previous,

              amountReceived:
                newAmountReceived,

              paymentStatus:
                newPaymentStatus,

              paymentHistory:
                updatedHistory
            } as HomestayBooking)
            : previous
      );

      setPaymentAmount("");
      setPaymentMethod("GPay");
      setPaymentNote("");
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

      {/* =====================================================
          HEADER
          ===================================================== */}

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


      {/* =====================================================
          NEW BOOKING FORM
          ===================================================== */}

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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
                  )
                }
              />
            </label>


            <label>
              Amount received

              <input
                type="number"
                min="0"
                value={
                  form.amountReceived
                }
                onChange={event =>
                  updateForm(
                    "amountReceived",
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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


      {/* =====================================================
          SUMMARY
          ===================================================== */}

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


      {/* =====================================================
          RESERVATIONS TABLE
          ===================================================== */}

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


                          {booking.additionalOccupancyCharge !==
                            undefined &&
                            booking.additionalOccupancyCharge >
                            0 && (
                              <span className="extra-charge-cell">
                                +{" "}
                                {formatCurrency(
                                  booking.additionalOccupancyCharge
                                )}{" "}
                                extra
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


      {/* =====================================================
          BOOKING DETAIL
          ===================================================== */}

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


          {/* =================================================
              BOOKING INFORMATION
              ================================================= */}

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
                Payment
              </span>

              <strong
                className={
                  financialSummary?.paymentStatus ===
                    "Paid"
                    ? "success-text"
                    : financialSummary?.paymentStatus ===
                      "Part paid"
                      ? "warning-text"
                      : "danger-text"
                }
              >
                {
                  financialSummary?.paymentStatus ??
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


          {/* =================================================
              FINANCIAL SUMMARY
              ================================================= */}

          {financialSummary && (

            <div className="booking-financial-summary">

              <div className="financial-summary-header">

                <div>

                  <span className="eyebrow">
                    BOOKING FINANCIALS
                  </span>

                  <h3>
                    Payment summary
                  </h3>

                </div>


                <span
                  className={`financial-status ${financialSummary.paymentStatus
                    .toLowerCase()
                    .replace(
                      " ",
                      "-"
                    )}`}
                >
                  {
                    financialSummary.paymentStatus
                  }
                </span>

              </div>


              <div className="financial-summary-grid">

                <div>

                  <span>
                    Original booking
                  </span>

                  <strong>
                    {formatCurrency(
                      financialSummary.originalAmount
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Approved extra occupancy
                  </span>

                  <strong className="success-text">
                    {formatCurrency(
                      financialSummary.approvedExtraCharge
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Total booking value
                  </span>

                  <strong className="total-value">
                    {formatCurrency(
                      financialSummary.totalBookingValue
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Amount received
                  </span>

                  <strong>
                    {formatCurrency(
                      financialSummary.amountReceived
                    )}
                  </strong>

                </div>


                <div className="balance-due">

                  <span>
                    Balance due
                  </span>

                  <strong>
                    {formatCurrency(
                      financialSummary.balanceDue
                    )}
                  </strong>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              PAYMENT COLLECTION
              ================================================= */}

          {financialSummary && (

            <div className="booking-payment-section">

              <div className="payment-section-header">

                <div>

                  <span className="eyebrow">
                    PAYMENT COLLECTION
                  </span>

                  <h3>
                    Record payment
                  </h3>

                  <p>
                    Outstanding balance
                  </p>

                </div>


                <div className="payment-outstanding">

                  {formatCurrency(
                    financialSummary.balanceDue
                  )}

                </div>

              </div>


              {financialSummary.balanceDue > 0 ? (

                <div className="payment-entry-box">

                  <div className="payment-form-grid">

                    <div className="payment-field">

                      <label htmlFor="payment-amount">
                        Amount received
                      </label>

                      <div className="payment-input-wrap">

                        <span>
                          ₹
                        </span>

                        <input
                          id="payment-amount"
                          type="number"
                          min="1"
                          max={
                            financialSummary.balanceDue
                          }
                          step="1"
                          value={
                            paymentAmount
                          }
                          placeholder="0"
                          onChange={event =>
                            setPaymentAmount(
                              event.target.value
                            )
                          }
                        />

                      </div>

                      <small>
                        Maximum{" "}
                        {formatCurrency(
                          financialSummary.balanceDue
                        )}
                      </small>

                    </div>


                    <div className="payment-field">

                      <label htmlFor="payment-method">
                        Payment method
                      </label>

                      <select
                        id="payment-method"
                        value={
                          paymentMethod
                        }
                        onChange={event =>
                          setPaymentMethod(
                            event.target
                              .value as PaymentMethod
                          )
                        }
                      >

                        <option value="GPay">
                          GPay
                        </option>

                        <option value="UPI">
                          UPI
                        </option>

                        <option value="Cash">
                          Cash
                        </option>

                        <option value="Bank Transfer">
                          Bank Transfer
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>


                    <div className="payment-field">

                      <label htmlFor="payment-note">
                        Payment note
                      </label>

                      <input
                        id="payment-note"
                        type="text"
                        value={
                          paymentNote
                        }
                        placeholder="e.g. Balance payment"
                        onChange={event =>
                          setPaymentNote(
                            event.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  <div className="payment-submit-row">

                    <div className="payment-after-info">

                      <span>
                        Balance after payment
                      </span>

                      <strong>
                        {formatCurrency(
                          Math.max(
                            financialSummary.balanceDue -
                            (Number(
                              paymentAmount
                            ) || 0),
                            0
                          )
                        )}
                      </strong>

                    </div>


                    <button
                      type="button"
                      className="primary-button payment-record-button"
                      onClick={
                        handleRecordPayment
                      }
                      disabled={
                        !paymentAmount ||
                        Number(
                          paymentAmount
                        ) <= 0 ||
                        Number(
                          paymentAmount
                        ) >
                        financialSummary.balanceDue
                      }
                    >
                      Record payment
                    </button>

                  </div>

                </div>

              ) : (

                <div className="payment-paid-message">

                  <strong>
                    ✓ Payment fully received
                  </strong>

                  <span>
                    There is no outstanding
                    balance for this
                    booking.
                  </span>

                </div>

              )}

            </div>

          )}


          {/* =================================================
              PAYMENT HISTORY
              ================================================= */}

          {financialSummary && (

            <div className="booking-payment-history">

              <div className="payment-history-header">

                <div>

                  <span className="eyebrow">
                    PAYMENT HISTORY
                  </span>

                  <h3>
                    Payments received
                  </h3>

                  <p>
                    All payments recorded
                    against this reservation.
                  </p>

                </div>


                <div className="payment-history-total">

                  <span>
                    Total received
                  </span>

                  <strong>
                    {formatCurrency(
                      financialSummary.amountReceived
                    )}
                  </strong>

                </div>

              </div>


              {paymentHistory.length > 0 ? (

                <div className="payment-history-list">

                  {paymentHistory.map(
                    payment => (

                      <div
                        key={
                          payment.id
                        }
                        className="payment-history-row"
                      >

                        <div className="payment-history-icon">
                          ₹
                        </div>


                        <div className="payment-history-details">

                          <div className="payment-history-primary">

                            <strong>
                              {formatCurrency(
                                payment.amount
                              )}
                            </strong>

                            <span className="payment-method-badge">
                              {
                                payment.method
                              }
                            </span>

                          </div>


                          {payment.note && (

                            <p>
                              {
                                payment.note
                              }
                            </p>

                          )}


                          <small>
                            Payment ID:{" "}
                            {
                              payment.id
                            }
                          </small>

                        </div>


                        <div className="payment-history-date">

                          {formatDateTime(
                            payment.receivedAt
                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="payment-history-empty">

                  <strong>
                    No payments recorded yet
                  </strong>

                  <span>
                    Payments added using
                    the Record Payment
                    button will appear
                    here.
                  </span>

                </div>

              )}

            </div>

          )}


          {/* =================================================
              OWNER DECISION
              ================================================= */}

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
                      guests were booked,
                      but{" "}
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
                    {
                      selectedBooking.occupancyDecision ??
                      "Pending"
                    }
                  </span>

                </div>


                {/* =============================================
                  PRICING CALCULATION
                  ============================================= */}

                {extraGuestCharge &&
                  extraGuestCharge.extraGuests >
                  0 && (

                    <div className="extra-charge-calculation">

                      <div>

                        <span>
                          Additional occupancy
                        </span>

                        <strong>
                          {
                            extraGuestCharge.extraGuests
                          }{" "}
                          guest
                          {extraGuestCharge.extraGuests !==
                            1
                            ? "s"
                            : ""}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Rate per extra guest
                        </span>

                        <strong>
                          {formatCurrency(
                            extraGuestCharge.ratePerGuest
                          )}
                        </strong>

                      </div>


                      <div className="extra-charge-total">

                        <span>
                          Additional charge
                        </span>

                        <strong>
                          {formatCurrency(
                            extraGuestCharge.amount
                          )}
                        </strong>

                      </div>

                    </div>

                  )}


                {/* =============================================
                  OWNER DECISION ACTIONS
                  ============================================= */}

                {(!selectedBooking.occupancyDecision ||
                  selectedBooking.occupancyDecision ===
                  "Pending") && (

                    <div className="occupancy-decision-actions">

                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          handleOccupancyDecision(
                            "Approved extra charge"
                          )
                        }
                      >
                        Approve{" "}
                        {extraGuestCharge
                          ? formatCurrency(
                            extraGuestCharge.amount
                          )
                          : "extra charge"}
                      </button>


                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleOccupancyDecision(
                            "No additional charge"
                          )
                        }
                      >
                        No additional charge
                      </button>


                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleOccupancyDecision(
                            "Keep under review"
                          )
                        }
                      >
                        Keep under review
                      </button>

                    </div>

                  )}


                {/* =============================================
                  COMPLETED DECISION
                  ============================================= */}

                {selectedBooking.occupancyDecision &&
                  selectedBooking.occupancyDecision !==
                  "Pending" && (

                    <div className="decision-completed">

                      <div className="decision-record">

                        <div>

                          <span>
                            Owner decision
                          </span>

                          <strong>
                            {
                              selectedBooking.occupancyDecision
                            }
                          </strong>

                        </div>


                        {selectedBooking.occupancyDecision ===
                          "Approved extra charge" && (

                            <div>

                              <span>
                                Approved additional charge
                              </span>

                              <strong className="success-text">

                                {formatCurrency(
                                  selectedBooking
                                    .additionalOccupancyCharge &&
                                    selectedBooking
                                      .additionalOccupancyCharge >
                                    0
                                    ? selectedBooking
                                      .additionalOccupancyCharge
                                    : extraGuestCharge?.amount ??
                                    0
                                )}

                              </strong>

                            </div>

                          )}

                      </div>


                      {selectedBooking.occupancyDecisionAt && (

                        <small>

                          Recorded{" "}
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


          {/* =================================================
              NOTES
              ================================================= */}

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


          {/* =================================================
              BOOKING ACTIONS
              ================================================= */}

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
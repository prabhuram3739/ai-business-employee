import type { HomestayBooking } from "./types";

export type HomestayPricingConfig = {
    includedGuests: number;
    extraGuestRate: number;
};

export type ExtraGuestCharge = {
    bookedGuests: number;
    actualGuests: number;
    extraGuests: number;
    ratePerGuest: number;
    amount: number;
};

export const homestayPricing: HomestayPricingConfig = {
    includedGuests: 4,
    extraGuestRate: 500
};

export const calculateExtraGuestCharge = (
    booking: HomestayBooking,
    config: HomestayPricingConfig = homestayPricing
): ExtraGuestCharge => {
    const actualGuests =
        booking.actualGuests ??
        booking.bookedGuests;

    const extraGuests = Math.max(
        0,
        actualGuests -
        booking.bookedGuests
    );

    return {
        bookedGuests:
            booking.bookedGuests,

        actualGuests,

        extraGuests,

        ratePerGuest:
            config.extraGuestRate,

        amount:
            extraGuests *
            config.extraGuestRate
    };
};
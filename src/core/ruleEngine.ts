import type {
    ActionType,
    BusinessModule,
    HomestayBooking,
    Priority,    WorkItem,
    WorkflowRule
} from "./types";

export type RuleContext = {
    module: BusinessModule;
    booking?: HomestayBooking;
    workItem?: WorkItem;
};

export type RuleResult = {
    rule: WorkflowRule;
    matched: boolean;
    reason: string;
};

const evaluateCondition = (
    condition: string,
    context: RuleContext
): boolean => {
    const { booking, workItem } = context;

    switch (condition) {
        case "actual_guest_count > booked_guest_count":
            return (
                booking?.actualGuests !== undefined &&
                booking.actualGuests >
                booking.bookedGuests
            );

        case "checkin_within_24_hours": {
            if (!booking?.checkIn) {
                return false;
            }

            const checkInTime =
                new Date(
                    `${booking.checkIn}T00:00:00`
                ).getTime();

            const now = Date.now();

            const hoursUntilCheckIn =
                (checkInTime - now) /
                (1000 * 60 * 60);

            return (
                hoursUntilCheckIn >= 0 &&
                hoursUntilCheckIn <= 24
            );
        }

        case "checkout_completed":
            return (
                booking?.status === "Checkout" ||
                booking?.status === "Completed"
            );

        case "sales_or_expenses_updated":
            return true;

        case "category_amount_above_baseline":
            return false;

        case "business_opening":
            return workItem?.stageId === "opening";

        case "daily_marketing_due":
            return workItem?.stageId === "marketing";

        case "business_closing":
            return workItem?.stageId === "closing";

        case "no_update_for_configured_days":
            return false;

        case "documents_pending_not_empty":
            return false;

        case "balance > 0":
            return (
                workItem?.stageId === "fees-pending"
            );

        case "balance <= 0":
            return (
                workItem?.stageId === "fees-paid"
            );

        case "job_completed":
            return workItem?.stageId === "done";

        case "trip_within_12_hours":
            return workItem?.stageId === "booked";

        case "possible_new_damage":
            return false;

        case "review_received":
            return false;

        case "monthly_evaluation_or_incentive":
            return (
                workItem?.stageId ===
                "performance"
            );

        default:
            return false;
    }
};

export const evaluateRule = (
    rule: WorkflowRule,
    context: RuleContext
): RuleResult => {
    const matched =
        evaluateCondition(
            rule.condition,
            context
        );

    return {
        rule,
        matched,
        reason: matched
            ? `Condition matched: ${rule.condition}`
            : `Condition not matched: ${rule.condition}`
    };
};

export const evaluateModuleRules = (
    module: BusinessModule,
    context: Omit<RuleContext, "module">
): RuleResult[] => {
    return module.rules.map(rule =>
        evaluateRule(rule, {
            ...context,
            module
        })
    );
};

export const getTriggeredRules = (
    module: BusinessModule,
    context: Omit<RuleContext, "module">
): WorkflowRule[] => {
    return evaluateModuleRules(
        module,
        context
    )
        .filter(result => result.matched)
        .map(result => result.rule);
};

export const getBookingExceptions = (
    module: BusinessModule,
    bookings: HomestayBooking[]
): RuleResult[] => {
    return bookings.flatMap(
        booking =>
            evaluateModuleRules(module, {
                booking
            }).filter(
                result => result.matched
            )
    );
};

export type BusinessException = {
    id: string;
    moduleId: string;
    entityId: string;
    title: string;
    detail: string;
    priority: Priority;
    stageId: string;
    ruleId: string;
    actionTypes: ActionType[];
};

const getBookingStageId = (
    status: HomestayBooking["status"]
): string => {
    const statusToStage: Record<
        HomestayBooking["status"],
        string
    > = {
        Enquiry: "enquiry",
        Quoted: "quoted",
        Confirmed: "confirmed",
        "Check-in": "check-in",
        "In stay": "in-stay",
        Checkout: "checkout",
        Completed: "completed",
        Cancelled: "cancelled"
    };

    return statusToStage[status];
};

export const buildBookingExceptions = (
    module: BusinessModule,
    bookings: HomestayBooking[]
): BusinessException[] => {
    return bookings.flatMap(booking => {
        const triggeredRules =
            getTriggeredRules(module, {
                booking
            });

        return triggeredRules.map(rule => ({
            id: `${rule.id}-${booking.id}`,
            moduleId: module.id,
            entityId: booking.id,
            title: rule.name,
            detail: rule.actions
                .map(action =>
                    action.template ?? action.type
                )
                .join(" → "),
            priority: rule.priority,
            stageId: getBookingStageId(booking.status),
            ruleId: rule.id,
            actionTypes: rule.actions.map(
                action => action.type
            )
        }));
    });
};
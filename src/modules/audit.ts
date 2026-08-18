import type { BusinessModule } from "../core/types";

export const auditModule: BusinessModule = {
    id: "audit",
    name: "Murugesan & Co",
    shortName: "Auditing",
    icon: "briefcase",

    description:
        "AI Audit Manager sitting above the existing Asana board for jobs, client updates, documents, fees and completion.",

    fields: [
        {
            id: "clientName",
            label: "Client",
            type: "text",
            required: true
        },
        {
            id: "service",
            label: "Audit/service",
            type: "text",
            required: true
        },
        {
            id: "dueDate",
            label: "Due date",
            type: "date"
        },
        {
            id: "feeAmount",
            label: "Agreed fee",
            type: "currency"
        },
        {
            id: "feePaid",
            label: "Fee paid",
            type: "currency"
        },
        {
            id: "balance",
            label: "Balance",
            type: "currency"
        },
        {
            id: "clientUpdate",
            label: "Client update",
            type: "text"
        },
        {
            id: "documentsPending",
            label: "Pending documents",
            type: "text"
        }
    ],

    stages: [
        {
            id: "todo",
            label: "Todo",
            description: "Work not started"
        },
        {
            id: "in-progress",
            label: "In Progress",
            description: "Audit work underway"
        },
        {
            id: "fees-pending",
            label: "Fees Pending",
            description:
                "Outstanding fees require collection"
        },
        {
            id: "fees-paid",
            label: "Fees Paid",
            description:
                "Fees settled; work may still need completion"
        },
        {
            id: "done",
            label: "Done",
            description: "Work completed",
            terminal: true
        }
    ],

    rules: [
        {
            id: "audit-stale",
            name: "Stale job",
            trigger: "in-progress",
            condition:
                "no_update_for_configured_days",
            actions: [
                {
                    type: "notify_owner",
                    target: "owner",
                    template:
                        "Show last update and days inactive."
                }
            ],
            priority: "medium"
        },

        {
            id: "audit-docs",
            name: "Document reminder",
            trigger: "in-progress",
            condition:
                "documents_pending_not_empty",
            actions: [
                {
                    type: "send_message",
                    target: "client",
                    template:
                        "Draft polite missing-document reminder."
                }
            ],
            priority: "medium"
        },

        {
            id: "audit-fee",
            name: "Fee collection",
            trigger: "fees-pending",
            condition: "balance > 0",
            actions: [
                {
                    type: "create_reminder",
                    target: "client",
                    template:
                        "Prepare fee reminder with outstanding amount."
                }
            ],
            priority: "high"
        },

        {
            id: "audit-paid",
            name: "Paid transition",
            trigger: "fees-paid",
            condition: "balance <= 0",
            actions: [
                {
                    type: "notify_owner",
                    target: "owner",
                    template:
                        "Fees settled; keep workflow at Fees Paid until work is complete."
                }
            ],
            priority: "low"
        },

        {
            id: "audit-done",
            name: "Completion update",
            trigger: "done",
            condition: "job_completed",
            actions: [
                {
                    type: "send_message",
                    target: "client",
                    template:
                        "Send completion update and archive."
                }
            ],
            priority: "low"
        }
    ],

    metrics: [
        {
            id: "workflow",
            label: "Asana workflow",
            value: "5 stages",
            note:
                "Todo → In Progress → Fees Pending → Fees Paid → Done",
            status: "Mapped"
        },
        {
            id: "updates",
            label: "Client updates",
            value: "AI",
            note:
                "Drafted from current work state",
            status: "Ready"
        },
        {
            id: "fees",
            label: "Fee tracking",
            value: "Built-in",
            note:
                "Agreed / paid / balance",
            status: "Ready"
        },
        {
            id: "stale",
            label: "Stale jobs",
            value: "AI",
            note:
                "Configurable inactivity threshold",
            status: "Ready"
        }
    ],

    integrations: [
        {
            id: "asana",
            label: "Asana",
            source: "asana",
            status: "planned",
            capabilities: [
                "board stages",
                "client updates",
                "fee fields",
                "tasks"
            ]
        }
    ]
};
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Database,
  FileText,
  RefreshCw,
  Settings2,
  Workflow as WorkflowIcon
} from "lucide-react";

import {
  businessModules,
  activities,
  workItems
} from "./core/registry";

import {
  getStage,
  getModuleItems,
  workflowSummary
} from "./core/workflow";
import {
  buildBookingExceptions
} from "./core/ruleEngine";

import { businessStore } from "./core/store";

import { adapters } from "./adapters/adapterRegistry";

import ExceptionCenter from "./components/ExceptionCenter";
import type { BusinessException } from "./core/ruleEngine";
import {
  mmvkFoodExpenseCategories,
  homestayBookings
} from "./data/mockData";

import ModuleIcon from "./components/ModuleIcon";

import { initializeBusinessStore } from "./core/storeInitializer";

import HomestayBookings from "./components/HomestayBookings";

import CommandCenterAlerts from "./components/CommandCenterAlerts";

import PaymentReconciliation from "./components/PaymentReconciliation";

import HomestayDailyOperations from "./components/HomestayDailyOperations";

import type {
  BusinessModule,
  WorkItem,
  Activity,
  WorkflowRule,
  WorkflowStage,
  FieldDefinition,
  IntegrationDefinition,
  HomestayBooking
} from "./core/types";

import "./styles.css";

type View =
  | "dashboard"
  | "architecture"
  | string;

type ModuleTab =
  | "overview"
  | "bookings"
  | "workflow"
  | "integrations";

type DashboardProps = {
  items: WorkItem[];
  bookings: HomestayBooking[];
  resolve: (id: string) => void;
  open: number;
  liveHomestayExceptions: BusinessException[];
  onExceptionReview: (entityId: string) => void;
};

type ModulePageProps = {
  module: BusinessModule;
  workItems: WorkItem[];
  reviewBookingId: string | null;
};

type IntegrationPanelProps = {
  module: BusinessModule;
};

type WorkflowSummaryItem = {
  stage: WorkflowStage;
  rules: WorkflowRule[];
};

/* -------------------------------------------------------------------------- */
/* App                                                                        */
/* -------------------------------------------------------------------------- */

const App = (): React.JSX.Element => {
  const [view, setView] =
    useState<View>("dashboard");

  const [items, setItems] =
    useState<WorkItem[]>(
      businessStore.getState().workItems
    );

  useEffect(() => {
    setItems(
      businessStore.getState().workItems
    );

    return businessStore.subscribe(() => {
      setItems(
        businessStore.getState().workItems
      );
    });
  }, []);

  const module = useMemo(
    () =>
      businessModules.find(
        businessModule =>
          businessModule.id === view
      ),
    [view]
  );

  const [bookings, setBookings] = useState(
    businessStore.getState().bookings
  );

  useEffect(() => {
    setBookings(
      businessStore.getState().bookings
    );

    return businessStore.subscribe(() => {
      setBookings(
        businessStore.getState().bookings
      );
    });
  }, []);

  const homestayModule = useMemo(
    () =>
      businessModules.find(
        businessModule =>
          businessModule.id === "homestay"
      ),
    []
  );

  const liveHomestayExceptions =
    useMemo(() => {
      if (!homestayModule) {
        return [];
      }

      return buildBookingExceptions(
        homestayModule,
        bookings
      );
    }, [
      homestayModule,
      bookings
    ]);

  const totalOpenExceptions =
    items.length +
    liveHomestayExceptions.length;

  const open = totalOpenExceptions;

  const [reviewBookingId, setReviewBookingId] =
    useState<string | null>(null);

  const resolve = (id: string): void => {
    businessStore.resolveWorkItem(id);
  };

  const handleRefresh = (): void => {
    setItems([
      ...businessStore.getState().workItems
    ]);
  };

  const handleExceptionReview = (
    entityId: string
  ): void => {
    setReviewBookingId(entityId);
    setView("homestay");
  };

  return (
    <div className="app">

      {/* ------------------------------------------------------------------ */}
      {/* Sidebar                                                            */}
      {/* ------------------------------------------------------------------ */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            <Bot size={22} />
          </div>

          <div>
            <strong>
              AI Business
            </strong>

            <span>
              Employee v0.3
            </span>
          </div>

        </div>

        <button
          type="button"
          className={
            view === "dashboard"
              ? "nav active"
              : "nav"
          }
          onClick={() =>
            setView("dashboard")
          }
        >
          <Bot />
          Command Center
        </button>

        <button
          type="button"
          className={
            view === "architecture"
              ? "nav active"
              : "nav"
          }
          onClick={() =>
            setView("architecture")
          }
        >
          <Database />
          Architecture
        </button>

        <div className="nav-label">
          BUSINESS MODULES
        </div>

        {businessModules.map(
          businessModule => (
            <button
              type="button"
              key={businessModule.id}
              className={
                view === businessModule.id
                  ? "nav active"
                  : "nav"
              }
              onClick={() =>
                setView(
                  businessModule.id
                )
              }
            >
              <ModuleIcon
                name={businessModule.icon}
              />

              {businessModule.shortName}
            </button>
          )
        )}

        <div className="sidebar-bottom">

          <div className="ai-status">

            <span className="pulse" />

            <div>
              <strong>
                AI engine online
              </strong>

              <small>
                {businessModules.length} modules · shared core
              </small>
            </div>

          </div>

          <button
            type="button"
            className="nav"
          >
            <Settings2 />
            Settings
          </button>

        </div>

      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Main                                                               */}
      {/* ------------------------------------------------------------------ */}

      <main className="main">

        <header className="topbar">

          <div>

            <p className="eyebrow">
              {module
                ? module.name.toUpperCase()
                : view === "architecture"
                  ? "SYSTEM ARCHITECTURE"
                  : "OWNER COMMAND CENTER"}
            </p>

            <h1>
              {module
                ? module.name
                : view === "architecture"
                  ? "Integration & architecture"
                  : "Good evening, Prabhuram"}
            </h1>

          </div>

          <div className="top-actions">
            <span className="date">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>

            <button
              type="button"
              className="icon-button"
              onClick={handleRefresh}
              aria-label="Refresh"
            >
              <RefreshCw size={18} />
            </button>

          </div>

        </header>

        {view === "architecture" ? (
          <Architecture />
        ) : module ? (
          <ModulePage
            module={module}
              workItems={items}
              reviewBookingId={reviewBookingId}
          />
        ) : (
              <Dashboard
                items={items}
                bookings={bookings}
                resolve={resolve}
                open={open}
                liveHomestayExceptions={liveHomestayExceptions}
                onExceptionReview={handleExceptionReview}
              />
        )}

      </main>

    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

const Dashboard = ({
  items,
  bookings,
  resolve,
  open,
  liveHomestayExceptions,
  onExceptionReview
}: DashboardProps): React.JSX.Element => {
  return (
    <>
      <section className="hero">

        <div>

          <div className="hero-label">
            <Bot size={16} />
            AI employee command center
          </div>

          <h2>
            One engine.{" "}
            <span>
              Four independent businesses.
            </span>
          </h2>

          <p>
            AI handles routine work; only
            money, customer, reputation and
            policy exceptions reach you.
          </p>

        </div>

        <div className="hero-stat">

          <span>
            Open exceptions
          </span>

          <strong>
            {open}
          </strong>

          <small>
            owner attention
          </small>

        </div>

      </section>
      <ExceptionCenter
        exceptions={liveHomestayExceptions}
        onReview={onExceptionReview}
      />
      <CommandCenterAlerts
        bookings={businessStore.getState().bookings}
        onReviewBooking={onExceptionReview}
      />
      <PaymentReconciliation
        bookings={bookings}
        onReviewBooking={onExceptionReview}
      />
      <HomestayDailyOperations
        bookings={bookings}
        onReviewBooking={onExceptionReview}
      />
      <section className="cards four">

        {businessModules.map(
          businessModule => (
            <div
              className="card metric"
              key={businessModule.id}
            >

              <div className="metric-top">

                <span className="metric-icon">
                  <ModuleIcon
                    name={
                      businessModule.icon
                    }
                  />
                </span>

                <span className="status">
                  {
                    businessModule
                      .metrics[0]
                      .status
                  }
                </span>

              </div>

              <strong>
                {
                  businessModule
                    .metrics[0]
                    .value
                }
              </strong>

              <h3>
                {businessModule.shortName}
              </h3>

              <p>
                {
                  businessModule
                    .metrics[0]
                    .note
                }
              </p>

            </div>
          )
        )}

      </section>

      <div className="section-head">

        <h2>
          Needs attention
        </h2>

        <p>
          Resolved tasks disappear from
          the prototype queue; production
          will persist all events in the
          audit log.
        </p>

      </div>

      <section className="task-list">

        {items.map(item => {

          const businessModule =
            businessModules.find(
              currentModule =>
                currentModule.id ===
                item.moduleId
            );

          if (!businessModule) {
            return null;
          }

          return (
            <div
              className="task"
              key={item.id}
            >

              <div
                className={`priority ${item.priority}`}
              >
                <AlertTriangle size={18} />
              </div>

              <div className="task-copy">

                <div className="task-title">

                  <strong>
                    {item.title}
                  </strong>

                  <span>
                    {
                      businessModule.shortName
                    }
                  </span>

                  <span>
                    {
                      getStage(
                        businessModule,
                        item.stageId
                      )?.label
                    }
                  </span>

                </div>

                <p>
                  {item.detail}
                </p>

              </div>

              <button
                type="button"
                className="secondary"
                onClick={() =>
                  resolve(item.id)
                }
              >
                Resolve
                <ChevronRight size={15} />
              </button>

            </div>
          );
        })}

      </section>

      <div className="section-head">

        <h2>
          AI activity
        </h2>

        <p>
          Cross-business activity using
          the same internal event model.
        </p>

      </div>

      <section className="activity">

        {activities.map(
          (
            activity: Activity,
            index
          ) => {

            const businessModule =
              businessModules.find(
                currentModule =>
                  currentModule.id ===
                  activity.moduleId
              );

            return (
              <div
                className="activity-row"
                key={`${activity.moduleId}-${activity.time}-${index}`}
              >

                <span className="time">
                  {activity.time}
                </span>

                <span className="agent">

                  <ModuleIcon
                    name={
                      businessModule?.icon ??
                      "business"
                    }
                    size={15}
                  />

                  {
                    businessModule?.shortName ??
                    activity.moduleId
                  }

                </span>

                <span>
                  {activity.action}
                </span>

                <span className="result">
                  {activity.result}
                </span>

              </div>
            );
          }
        )}

      </section>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Module Page                                                                */
/* -------------------------------------------------------------------------- */

const ModulePage = ({
  module,
  workItems,
  reviewBookingId
}: ModulePageProps): React.JSX.Element => {

  const [tab, setTab] = useState<
    "overview" | "bookings" | "workflow" | "integrations"
  >("overview");

  useEffect(() => {
    if (
      module.id === "homestay" &&
      reviewBookingId
    ) {
      setTab("bookings");
    }
  }, [
    module.id,
    reviewBookingId
  ]);

  const items = useMemo(
    () =>
      getModuleItems(
        workItems,
        module.id
      ),
    [module.id]
  );

  const summary =
    useMemo<WorkflowSummaryItem[]>(
      () =>
        workflowSummary(module),
      [module]
    );

  const tabs: ModuleTab[] = [
    "overview",
    ...(module.id === "homestay"
      ? ["bookings" as ModuleTab]
      : []),
    "workflow",
    "integrations"
  ];

  return (
    <>
      <section className="module-banner">

        <div>

          <span className="module-tag">
            INDEPENDENT CONFIGURATION MODULE
          </span>

          <h2>
            {module.description}
          </h2>

          <p>
            Business-specific fields,
            stages, rules and integrations
            are isolated from the shared
            application shell.
          </p>

        </div>

        <div className="module-score">

          <span>
            Workflow stages
          </span>

          <strong>
            {module.stages.length}
          </strong>

          <small>
            {module.rules.length} rules ·{" "}
            {module.integrations.length}{" "}
            integrations
          </small>

        </div>

      </section>

      {/* Tabs */}

      <div className="tabs">

        {tabs.map(
          currentTab => (
            <button
              type="button"
              key={currentTab}
              className={
                tab === currentTab
                  ? "tab active"
                  : "tab"
              }
              onClick={() =>
                setTab(currentTab)
              }
            >
              {currentTab}
            </button>
          )
        )}

      </div>

      {/* Overview */}

      {tab === "overview" && (
        <>
          <section className="cards four">

            {module.metrics.map(
              metric => (
                <div
                  className="card metric"
                  key={metric.id}
                >

                  <div className="metric-top">

                    <span className="metric-icon">
                      <CircleDollarSign
                        size={17}
                      />
                    </span>

                    <span className="status">
                      {metric.status}
                    </span>

                  </div>

                  <strong>
                    {metric.value}
                  </strong>

                  <h3>
                    {metric.label}
                  </h3>

                  <p>
                    {metric.note}
                  </p>

                </div>
              )
            )}

          </section>

          <section className="two-col">

            {/* Schema */}

            <div>

              <div className="section-head">

                <h2>
                  Data schema
                </h2>

                <p>
                  Reusable fields defined
                  by configuration.
                </p>

              </div>

              <div className="field-grid">

                {module.fields.map(
                  (
                    field: FieldDefinition
                  ) => (
                    <div
                      className="field"
                      key={field.id}
                    >

                      <FileText size={15} />

                      <div>

                        <strong>
                          {field.label}
                        </strong>

                        <span>
                          {field.type}
                          {field.required
                            ? " · required"
                            : ""}
                        </span>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* Rules */}

            <div>

              <div className="section-head">

                <h2>
                  Automation rules
                </h2>

                <p>
                  Rules are data, not UI
                  code.
                </p>

              </div>

              <div className="rules">

                {module.rules.map(
                  rule => (
                    <div
                      className="rule"
                      key={rule.id}
                    >

                      <div
                        className={`rule-priority ${rule.priority}`}
                      >
                        <WorkflowIcon
                          size={15}
                        />
                      </div>

                      <div>

                        <strong>
                          {rule.name}
                        </strong>

                        <p>
                          When:{" "}
                          {rule.trigger}
                          {" · "}
                          If:{" "}
                          {rule.condition}
                        </p>

                        <small>
                          {rule.actions
                            .map(
                              action =>
                                action.type
                            )
                            .join(" → ")}
                        </small>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </section>
        </>
      )}

      {/* Homestay Bookings */}

      {tab === "bookings" &&
        module.id === "homestay" && (
        <HomestayBookings
          bookings={businessStore.getState().bookings}
          initialSelectedBookingId={reviewBookingId}
        />
        )}

      {/* Workflow */}

      {tab === "workflow" && (
        <>
          <div className="section-head">

            <h2>
              Workflow
            </h2>

            <p>
              Shared renderer; module-specific
              stages.
            </p>

          </div>

          <div className="workflow">

            {summary.map(
              (
                summaryItem,
                index
              ) => (
                <div
                  className="workflow-row"
                  key={summaryItem.stage.id}
                >

                  <div className="step">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </div>

                  <div>

                    <strong>
                      {
                        summaryItem
                          .stage.label
                      }
                    </strong>

                    <p>
                      {
                        summaryItem
                          .stage
                          .description
                      }
                    </p>

                  </div>

                  <span className="ready">
                    {
                      summaryItem
                        .rules.length
                    }{" "}
                    rules
                  </span>

                </div>
              )
            )}

          </div>

          {items.length > 0 && (
            <>
              <div className="section-head">

                <h2>
                  Current exceptions
                </h2>

                <p>
                  Production will populate
                  these from adapters.
                </p>

              </div>

              <div className="task-list">

                {items.map(item => (
                  <div
                    className="task"
                    key={item.id}
                  >

                    <div
                      className={`priority ${item.priority}`}
                    >
                      <AlertTriangle
                        size={18}
                      />
                    </div>

                    <div className="task-copy">

                      <div className="task-title">

                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {
                            getStage(
                              module,
                              item.stageId
                            )?.label
                          }
                        </span>

                      </div>

                      <p>
                        {item.detail}
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            </>
          )}

        </>
      )}

      {/* Integrations */}

      {tab === "integrations" && (
        <IntegrationPanel
          module={module}
        />
      )}

    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Integration Panel                                                          */
/* -------------------------------------------------------------------------- */

const IntegrationPanel = ({
  module
}: IntegrationPanelProps): React.JSX.Element => {
  return (
    <>
      <div className="section-head">

        <h2>
          External systems
        </h2>

        <p>
          Adapters isolate platform-specific
          behavior from the AI and UI.
        </p>

      </div>

      <div className="integration-grid">

        {module.integrations.map(
          (
            integration: IntegrationDefinition
          ) => (
            <div
              className="integration"
              key={integration.id}
            >

              <div className="integration-top">

                <div className="integration-icon">

                  <ModuleIcon
                    name={module.icon}
                  />

                </div>

                <span
                  className={`adapter-status ${integration.status}`}
                >
                  {integration.status}
                </span>

              </div>

              <strong>
                {integration.label}
              </strong>

              <p>
                {integration.capabilities.join(
                  " · "
                )}
              </p>

            </div>
          )
        )}

      </div>

      {module.id === "restaurant" && (
        <div className="special-note">

          <strong>
            MMVK Food Google Sheets expense
            schema
          </strong>

          <p>
            Daily categories currently
            captured:
          </p>

          <div className="chips">

            {mmvkFoodExpenseCategories.map(
              category => (
                <span key={category}>
                  {category}
                </span>
              )
            )}

          </div>

        </div>
      )}

    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Architecture                                                               */
/* -------------------------------------------------------------------------- */

const Architecture = (): React.JSX.Element => {
  const architectureLayers = [
    [
      "1",
      "External platforms",
      "Loyverse · Swiggy · Zomato · Google Sheets · Instagram · Google Business · Airbnb · Booking.com · Agoda · MakeMyTrip · Asana · Zoomcar"
    ],
    [
      "2",
      "Adapters",
      "Each adapter knows only how to read/write its platform and normalize data."
    ],
    [
      "3",
      "Canonical entities",
      "Customer · Sale · Expense · Reservation · WorkItem · VehicleTrip · Review · Payment · Message"
    ],
    [
      "4",
      "Workflow + Rules",
      "Each business defines stages and rules; the same engine executes them."
    ],
    [
      "5",
      "AI + Actions",
      "AI selects only registered actions; sensitive actions require owner approval."
    ],
    [
      "6",
      "Audit log",
      "Every automated action and external write is recorded for traceability."
    ]
  ] as const;

  return (
    <>
      <section className="hero">

        <div>

          <div className="hero-label">

            <Database size={16} />

            Canonical architecture

          </div>

          <h2>
            External systems are replaceable.{" "}
            <span>
              The internal model stays stable.
            </span>
          </h2>

          <p>
            Adapters normalize external data
            into common entities; the workflow
            engine and AI operate on those
            entities.
          </p>

        </div>

      </section>

      <section className="architecture-grid">

        {architectureLayers.map(
          ([number, title, description]) => (
            <div
              className="arch-card"
              key={number}
            >

              <div className="arch-num">
                {number}
              </div>

              <div>

                <strong>
                  {title}
                </strong>

                <p>
                  {description}
                </p>

              </div>

            </div>
          )
        )}

      </section>

      <div className="section-head">

        <h2>
          Adapter inventory
        </h2>

        <p>
          Current integrations are intentionally
          marked Planned until real credentials/API
          permissions are configured.
        </p>

      </div>

      <div className="integration-grid">

        {adapters.map(adapter => (
          <div
            className="integration"
            key={adapter.id}
          >

            <div className="integration-top">

              <div className="integration-icon">
                <Database size={17} />
              </div>

              <span
                className={`adapter-status ${adapter.status}`}
              >
                {adapter.status}
              </span>

            </div>

            <strong>
              {adapter.label}
            </strong>

            <p>
              {adapter.source}
            </p>

          </div>
        ))}

      </div>

      <div className="architecture-note">

        <CheckCircle2 />

        <div>

          <strong>
            Scalability rule
          </strong>

          <p>
            Add business #5 by adding a module
            definition and its adapters. Do not
            copy the dashboard, AI engine,
            workflow engine or data models.
            Change shared behavior in core once;
            change business behavior in that
            module only.
          </p>

        </div>

      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Application bootstrap                                                      */
/* -------------------------------------------------------------------------- */

initializeBusinessStore();

createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
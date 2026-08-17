export type Priority = "critical"|"high"|"medium"|"low";
export type SourceKind =
  | "loyverse"|"swiggy"|"zomato"|"google-sheets"|"instagram"|"google-business"
  | "airbnb"|"booking"|"agoda"|"makemytrip"|"asana"|"zoomcar";

export type EntityType = "sale"|"expense"|"reservation"|"workItem"|"vehicleTrip"|"review"|"message"|"payment";

export type AdapterStatus = "connected"|"planned"|"manual";

export type FieldType = "text"|"number"|"currency"|"date"|"select"|"boolean";

export type ActionType =
  | "notify_owner"|"send_message"|"create_task"|"move_stage"|"calculate"
  | "request_approval"|"create_content"|"create_reminder";

export type FieldDefinition = {
  id:string; label:string; type:FieldType; required?:boolean; options?:string[];
};

export type WorkflowStage = {
  id:string; label:string; description:string; terminal?:boolean;
};

export type WorkflowRule = {
  id:string; name:string; trigger:string; condition:string;
  actions:{type:ActionType;target?:string;template?:string}[]; priority:Priority;
};

export type MetricDefinition = {
  id:string; label:string; value:string; note:string; status:string;
};

export type IntegrationDefinition = {
  id:string; label:string; source:SourceKind; status:AdapterStatus;
  capabilities:string[];
};

export type BusinessModule = {
  id:string; name:string; shortName:string; icon:string; description:string;
  fields:FieldDefinition[]; stages:WorkflowStage[]; rules:WorkflowRule[];
  metrics:MetricDefinition[]; integrations:IntegrationDefinition[];
};

export type WorkItem = {
  id:string; moduleId:string; title:string; stageId:string; priority:Priority;
  detail:string; ownerAction?:string;
};

export type Activity = {
  time:string; moduleId:string; action:string; result:string;
};

export type Adapter<TConfig = unknown> = {
  id:string; source:SourceKind; label:string; status:AdapterStatus; config?:TConfig;
  normalize:(payload:unknown)=>unknown;
};

export type BookingSource =
  | "Airbnb"
  | "Booking.com"
  | "Agoda"
  | "MakeMyTrip"
  | "Direct";

export type BookingStatus =
  | "Enquiry"
  | "Quoted"
  | "Confirmed"
  | "Check-in"
  | "In stay"
  | "Checkout"
  | "Completed"
  | "Cancelled";

export type PaymentStatus =
  | "Pending"
  | "Part paid"
  | "Paid";

export type HomestayBooking = {
  id: string;
  guestName: string;
  source: BookingSource;

  checkIn: string;
  checkOut: string;

  bookedGuests: number;
  actualGuests?: number;

  amount: number;
  paymentStatus: PaymentStatus;
  amountReceived?: number;

  status: BookingStatus;

  otaCommission?: number;
  netAmount?: number;

  guestPhone?: string;
  notes?: string;
};
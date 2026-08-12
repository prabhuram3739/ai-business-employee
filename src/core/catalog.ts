export const sharedEntities = {
  customer: ["id","name","phone","email","notes"],
  sale: ["id","businessId","date","channel","grossAmount","netAmount","status"],
  expense: ["id","businessId","date","category","amount","source","notes","recurring"],
  reservation: ["id","businessId","source","guest","checkIn","checkOut","guestCount","amount","status"],
  workItem: ["id","businessId","client","service","dueDate","stage","documentsPending","fee","paid","balance","updates"],
  vehicleTrip: ["id","businessId","vehicle","start","end","bookingAmount","payout","inspectionStatus","damageStatus"],
  review: ["id","businessId","source","rating","text","sentiment"],
  payment: ["id","businessId","entityId","amount","status","date","source"],
  message: ["id","businessId","recipient","channel","template","status","sentAt"]
} as const;

export const sharedActions = [
  "notify_owner","send_message","create_task","move_stage","calculate",
  "request_approval","create_content","create_reminder"
] as const;
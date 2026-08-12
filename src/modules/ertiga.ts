import {BusinessModule} from "../core/types";
export const ertigaModule:BusinessModule={
 id:"ertiga",name:"Ertiga / Zoomcar Host",shortName:"Ertiga",icon:"car",
 description:"AI Rental Manager for Zoomcar-host operations, utilization, trip readiness, inspections, rating and payouts.",
 fields:[
  {id:"vehicle",label:"Vehicle",type:"text",required:true},
  {id:"registration",label:"Registration",type:"text",required:true},
  {id:"tripStart",label:"Trip start",type:"date"},
  {id:"tripEnd",label:"Trip end",type:"date"},
  {id:"bookingAmount",label:"Booking amount",type:"currency"},
  {id:"payout",label:"Host payout",type:"currency"},
  {id:"rating",label:"Host rating",type:"number"},
  {id:"damageStatus",label:"Damage status",type:"select",options:["None","Possible new damage","Owner review","Reported"]}
 ],
 stages:[
  {id:"available",label:"Available",description:"Vehicle listed/available"},
  {id:"booked",label:"Booked",description:"Upcoming trip"},
  {id:"pre-trip",label:"Pre-trip",description:"Readiness and evidence"},
  {id:"active-trip",label:"Active trip",description:"Guest has vehicle"},
  {id:"post-trip",label:"Post-trip",description:"Inspection and issue capture"},
  {id:"performance",label:"Performance",description:"Rating, payout, incentives"},
  {id:"closed",label:"Closed",description:"Trip/accounting closed",terminal:true}
 ],
 rules:[
  {id:"car-ready",name:"Trip readiness",trigger:"booked",condition:"trip_within_12_hours",actions:[{type:"create_task",target:"owner",template:"Complete readiness, fuel, odometer and photo checklist."}],priority:"high"},
  {id:"car-damage",name:"Damage exception",trigger:"post-trip",condition:"possible_new_damage",actions:[{type:"request_approval",target:"owner",template:"Compare evidence and decide next action; AI does not decide claims."}],priority:"critical"},
  {id:"car-review",name:"Review protection",trigger:"post-trip",condition:"review_received",actions:[{type:"notify_owner",target:"owner",template:"Classify review and flag rating risk."}],priority:"medium"},
  {id:"car-performance",name:"Host performance",trigger:"performance",condition:"monthly_evaluation_or_incentive",actions:[{type:"notify_owner",target:"owner",template:"Summarize rating, utilization, payout and incentive status."}],priority:"high"}
 ],
 metrics:[
  {id:"rating",label:"Rating",value:"4.97 ★",note:"From current Host screen",status:"Excellent"},
  {id:"incentive",label:"August incentive",value:"At Risk",note:"Exact criteria to capture",status:"Action"},
  {id:"evaluation",label:"Professional Host",value:"1 Sep 2026",note:"Next evaluation shown in Host app",status:"Monitor"},
  {id:"vehicle",label:"Vehicle",value:"TN41AY7489",note:"Maruti Suzuki Ertiga",status:"Mapped"}
 ],
 integrations:[
  {id:"zoomcar",label:"Zoomcar Host",source:"zoomcar",status:"planned",capabilities:["booking","host performance","payouts","listing"]},
 ]
};
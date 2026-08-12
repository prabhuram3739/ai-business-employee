import {BusinessModule} from "../core/types";
export const restaurantModule:BusinessModule={
 id:"restaurant",name:"MMVK Chaat & Fast Food",shortName:"Restaurant",icon:"utensils",
 description:"AI Restaurant Manager combining POS, delivery platforms, daily expenses, marketing and Google Business operations.",
 fields:[
  {id:"offlineSales",label:"Offline sales",type:"currency"},
  {id:"swiggySales",label:"Swiggy sales/payout",type:"currency"},
  {id:"zomatoSales",label:"Zomato sales/payout",type:"currency"},
  {id:"expenseDate",label:"Expense date",type:"date"},
  {id:"expenseCategory",label:"Expense category",type:"select",options:["Chicken","Vegetables","Groceries","Parcel covers","Gas cylinder","Helper salary","Chef salary","Vessel washer salary"]},
  {id:"expenseAmount",label:"Expense amount",type:"currency"},
  {id:"marketingContent",label:"Marketing content",type:"text"},
  {id:"review",label:"Customer review",type:"text"}
 ],
 stages:[
  {id:"opening",label:"Opening",description:"Staff and kitchen readiness"},
  {id:"trading",label:"Trading",description:"Orders from offline, Swiggy and Zomato"},
  {id:"monitoring",label:"Monitoring",description:"P&L, expenses, inventory and anomalies"},
  {id:"marketing",label:"Marketing",description:"Instagram and Google Business content/reviews"},
  {id:"closing",label:"Closing",description:"Reconcile sales, expenses and cash"},
  {id:"reported",label:"Reported",description:"Daily report delivered",terminal:true}
 ],
 rules:[
  {id:"food-pnl",name:"Unified daily P&L",trigger:"monitoring",condition:"sales_or_expenses_updated",actions:[{type:"calculate",target:"pnl",template:"Combine Loyverse + Swiggy + Zomato with Google Sheets expenses."}],priority:"high"},
  {id:"food-expense-anomaly",name:"Expense anomaly",trigger:"monitoring",condition:"category_amount_above_baseline",actions:[{type:"notify_owner",target:"owner",template:"Flag unusual expense by category."}],priority:"high"},
  {id:"food-opening",name:"Opening checklist",trigger:"opening",condition:"business_opening",actions:[{type:"create_task",target:"staff",template:"Send kitchen opening checklist."}],priority:"medium"},
  {id:"food-marketing",name:"Marketing drafts",trigger:"marketing",condition:"daily_marketing_due",actions:[{type:"create_content",target:"instagram",template:"Draft one useful local food post/reel concept."},{type:"create_content",target:"google-business",template:"Draft Google Business post/review responses."}],priority:"low"},
  {id:"food-closing",name:"Closing reconciliation",trigger:"closing",condition:"business_closing",actions:[{type:"calculate",target:"daily-report",template:"Generate daily sales, expense and operating-result report."}],priority:"high"}
 ],
 metrics:[
  {id:"sales",label:"Sales sources",value:"3",note:"Loyverse + Swiggy + Zomato",status:"Mapped"},
  {id:"expenses",label:"Expense source",value:"Google Sheets",note:"8 daily categories",status:"Mapped"},
  {id:"marketing",label:"Marketing",value:"2",note:"Instagram + Google Business",status:"Mapped"},
  {id:"pnl",label:"P&L",value:"Unified",note:"Sales + daily expenses",status:"Ready"}
 ],
 integrations:[
  {id:"loyverse",label:"Loyverse POS",source:"loyverse",status:"planned",capabilities:["offline sales","orders"]},
  {id:"swiggy",label:"Swiggy",source:"swiggy",status:"planned",capabilities:["online orders","sales/payout"]},
  {id:"zomato",label:"Zomato",source:"zomato",status:"planned",capabilities:["online orders","sales/payout"]},
  {id:"expenses",label:"Google Sheets expenses",source:"google-sheets",status:"planned",capabilities:["daily expenses","historical P&L"]},
  {id:"instagram",label:"@mmvkfoodspollachi",source:"instagram",status:"planned",capabilities:["content","publishing where permitted"]},
  {id:"gbp",label:"Google Business Profile",source:"google-business",status:"planned",capabilities:["profile","reviews","posts"]}
 ]
};
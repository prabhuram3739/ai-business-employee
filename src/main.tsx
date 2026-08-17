import React,{useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {AlertTriangle,Bot,CheckCircle2,ChevronRight,CircleDollarSign,Database,FileText,RefreshCw,Settings2,Workflow as WorkflowIcon} from "lucide-react";
import {businessModules,activities,workItems} from "./core/registry";
import {getStage,getModuleItems,workflowSummary} from "./core/workflow";
import {adapters} from "./adapters/adapterRegistry";
import {mmvkFoodExpenseCategories, homestayBookings} from "./data/mockData";
import {ModuleIcon} from "./components/ModuleIcon";
import { initializeBusinessStore } from "./core/storeInitializer";
import HomestayBookings from "./components/HomestayBookings";
import "./styles.css";

type View="dashboard"|"architecture"|string;

function App(){
 const [view,setView]=useState<View>("dashboard");
 const [items,setItems]=useState(workItems);
 const module=businessModules.find(m=>m.id===view);
 const open=items.length;
 const resolve=(id:string)=>setItems(p=>p.filter(i=>i.id!==id));
 return <div className="app">
  <aside className="sidebar">
   <div className="brand"><div className="brand-mark"><Bot size={22}/></div><div><strong>AI Business</strong><span>Employee v0.3</span></div></div>
   <button className={view==="dashboard"?"nav active":"nav"} onClick={()=>setView("dashboard")}><Bot/>Command Center</button>
   <button className={view==="architecture"?"nav active":"nav"} onClick={()=>setView("architecture")}><Database/>Architecture</button>
   <div className="nav-label">BUSINESS MODULES</div>
   {businessModules.map(m=><button key={m.id} className={view===m.id?"nav active":"nav"} onClick={()=>setView(m.id)}><ModuleIcon name={m.icon}/>{m.shortName}</button>)}
   <div className="sidebar-bottom"><div className="ai-status"><span className="pulse"/><div><strong>AI engine online</strong><small>4 modules · shared core</small></div></div><button className="nav"><Settings2/>Settings</button></div>
  </aside>
  <main className="main">
   <header className="topbar"><div><p className="eyebrow">{module?.name.toUpperCase() ?? view==="architecture"?"SYSTEM ARCHITECTURE":"OWNER COMMAND CENTER"}</p><h1>{module?.name ?? view==="architecture"?"Integration & architecture":"Good evening, Prabhuram"}</h1></div><div className="top-actions"><span className="date">11 Aug 2026</span><button className="icon-button"><RefreshCw size={18}/></button></div></header>
   {view==="architecture"?<Architecture/>:module?<ModulePage module={module}/>:<Dashboard items={items} resolve={resolve} open={open}/>}
  </main>
 </div>
}

function Dashboard({items,resolve,open}:{items:any[];resolve:(id:string)=>void;open:number}){
 return <>
  <section className="hero"><div><div className="hero-label"><Bot size={16}/>AI employee command center</div><h2>One engine. <span>Four independent businesses.</span></h2><p>AI handles routine work; only money, customer, reputation and policy exceptions reach you.</p></div><div className="hero-stat"><span>Open exceptions</span><strong>{open}</strong><small>owner attention</small></div></section>
  <section className="cards four">{businessModules.map(m=><div className="card metric" key={m.id}><div className="metric-top"><span className="metric-icon"><ModuleIcon name={m.icon}/></span><span className="status">{m.metrics[0].status}</span></div><strong>{m.metrics[0].value}</strong><h3>{m.shortName}</h3><p>{m.metrics[0].note}</p></div>)}</section>
  <div className="section-head"><h2>Needs attention</h2><p>Resolved tasks disappear from the prototype queue; production will persist all events in the audit log.</p></div>
  <section className="task-list">{items.map(i=>{const m=businessModules.find(x=>x.id===i.moduleId)!;return <div className="task" key={i.id}><div className={`priority ${i.priority}`}><AlertTriangle size={18}/></div><div className="task-copy"><div className="task-title"><strong>{i.title}</strong><span>{m.shortName}</span><span>{getStage(m,i.stageId)?.label}</span></div><p>{i.detail}</p></div><button className="secondary" onClick={()=>resolve(i.id)}>Resolve <ChevronRight size={15}/></button></div>})}</section>
  <div className="section-head"><h2>AI activity</h2><p>Cross-business activity using the same internal event model.</p></div>
  <section className="activity">{activities.map((a,i)=><div className="activity-row" key={i}><span className="time">{a.time}</span><span className="agent"><ModuleIcon name={businessModules.find(m=>m.id===a.moduleId)?.icon||"briefcase"} size={15}/>{businessModules.find(m=>m.id===a.moduleId)?.shortName}</span><span>{a.action}</span><span className="result">{a.result}</span></div>)}</section>
 </>
}

function ModulePage({module}:{module:any}){
 const [tab,setTab]=useState<"overview"|"bookings"|"workflow"|"integrations">("overview");
 const items=getModuleItems(workItems,module.id);
 const summary=workflowSummary(module);
 return <>
  <section className="module-banner"><div><span className="module-tag">INDEPENDENT CONFIGURATION MODULE</span><h2>{module.description}</h2><p>Business-specific fields, stages, rules and integrations are isolated from the shared application shell.</p></div><div className="module-score"><span>Workflow stages</span><strong>{module.stages.length}</strong><small>{module.rules.length} rules · {module.integrations.length} integrations</small></div></section>
  <div className="tabs">
  {[
    "overview",
    ...(module.id === "homestay" ? ["bookings"] : []),
    "workflow",
    "integrations"
  ].map(t =>
    <button
      key={t}
      className={tab===t?"tab active":"tab"}
      onClick={()=>setTab(t as any)}
    >
      {t}
    </button>
  )}
</div>
  {tab==="overview"&&<><section className="cards four">{module.metrics.map((m:any)=><div className="card metric" key={m.id}><div className="metric-top"><span className="metric-icon"><CircleDollarSign size={17}/></span><span className="status">{m.status}</span></div><strong>{m.value}</strong><h3>{m.label}</h3><p>{m.note}</p></div>)}</section><section className="two-col"><div><div className="section-head"><h2>Data schema</h2><p>Reusable fields defined by configuration.</p></div><div className="field-grid">{module.fields.map((f:any)=><div className="field" key={f.id}><FileText size={15}/><div><strong>{f.label}</strong><span>{f.type}{f.required?" · required":""}</span></div></div>)}</div></div><div><div className="section-head"><h2>Automation rules</h2><p>Rules are data, not UI code.</p></div><div className="rules">{module.rules.map((r:any)=><div className="rule" key={r.id}><div className={`rule-priority ${r.priority}`}><WorkflowIcon size={15}/></div><div><strong>{r.name}</strong><p>When: {r.trigger} · If: {r.condition}</p><small>{r.actions.map((a:any)=>a.type).join(" → ")}</small></div></div>)}</div></div></section></>}
  {tab==="bookings" && module.id==="homestay" && (
   <HomestayBookings bookings={homestayBookings} />
)}
  {tab==="workflow"&&<><div className="section-head"><h2>Workflow</h2><p>Shared renderer; module-specific stages.</p></div><div className="workflow">{summary.map((s:any,i:number)=><div className="workflow-row" key={s.stage.id}><div className="step">{String(i+1).padStart(2,"0")}</div><div><strong>{s.stage.label}</strong><p>{s.stage.description}</p></div><span className="ready">{s.rules.length} rules</span></div>)}</div>{items.length>0&&<><div className="section-head"><h2>Current exceptions</h2><p>Production will populate these from adapters.</p></div><div className="task-list">{items.map(i=><div className="task" key={i.id}><div className={`priority ${i.priority}`}><AlertTriangle size={18}/></div><div className="task-copy"><div className="task-title"><strong>{i.title}</strong><span>{getStage(module,i.stageId)?.label}</span></div><p>{i.detail}</p></div></div>)}</div></>}</>}
  {tab==="integrations"&&<IntegrationPanel module={module}/>}
 </>
}

function IntegrationPanel({module}:{module:any}){
 return <><div className="section-head"><h2>External systems</h2><p>Adapters isolate platform-specific behavior from the AI and UI.</p></div><div className="integration-grid">{module.integrations.map((x:any)=><div className="integration" key={x.id}><div className="integration-top"><div className="integration-icon"><ModuleIcon name={module.icon}/></div><span className={`adapter-status ${x.status}`}>{x.status}</span></div><strong>{x.label}</strong><p>{x.capabilities.join(" · ")}</p></div>)}</div>{module.id==="restaurant"&&<div className="special-note"><strong>MMVK Food Google Sheets expense schema</strong><p>Daily categories currently captured:</p><div className="chips">{mmvkFoodExpenseCategories.map(x=><span key={x}>{x}</span>)}</div></div>}</>
}

function Architecture(){
 return <><section className="hero"><div><div className="hero-label"><Database size={16}/>Canonical architecture</div><h2>External systems are replaceable. <span>The internal model stays stable.</span></h2><p>Adapters normalize external data into common entities; the workflow engine and AI operate on those entities.</p></div></section>
 <section className="architecture-grid">
  {[
   ["1","External platforms","Loyverse · Swiggy · Zomato · Google Sheets · Instagram · Google Business · Airbnb · Booking.com · Agoda · MakeMyTrip · Asana · Zoomcar"],
   ["2","Adapters","Each adapter knows only how to read/write its platform and normalize data."],
   ["3","Canonical entities","Customer · Sale · Expense · Reservation · WorkItem · VehicleTrip · Review · Payment · Message"],
   ["4","Workflow + Rules","Each business defines stages and rules; the same engine executes them."],
   ["5","AI + Actions","AI selects only registered actions; sensitive actions require owner approval."],
   ["6","Audit log","Every automated action and external write is recorded for traceability."]
  ].map(([n,t,d])=><div className="arch-card" key={n}><div className="arch-num">{n}</div><div><strong>{t}</strong><p>{d}</p></div></div>)}
 </section>
 <div className="section-head"><h2>Adapter inventory</h2><p>Current integrations are intentionally marked Planned until real credentials/API permissions are configured.</p></div>
 <div className="integration-grid">{adapters.map(a=><div className="integration" key={a.id}><div className="integration-top"><div className="integration-icon"><Database size={17}/></div><span className={`adapter-status ${a.status}`}>{a.status}</span></div><strong>{a.label}</strong><p>{a.source}</p></div>)}</div>
 <div className="architecture-note"><CheckCircle2/><div><strong>Scalability rule</strong><p>Add business #5 by adding a module definition and its adapters. Do not copy the dashboard, AI engine, workflow engine or data models. Change shared behavior in core once; change business behavior in that module only.</p></div></div>
 </>
}
initializeBusinessStore();
createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
import {BusinessModule,WorkItem} from "./types";
export function getStage(module:BusinessModule,id:string){return module.stages.find(s=>s.id===id)}
export function getModuleItems(items:WorkItem[],moduleId:string){return items.filter(i=>i.moduleId===moduleId)}
export function workflowSummary(module:BusinessModule){
  return module.stages.map(stage=>({stage,rules:module.rules.filter(r=>r.trigger.includes(stage.id)||r.condition.includes(stage.id))}))
}
export function getCriticalRules(module:BusinessModule){return module.rules.filter(r=>r.priority==="critical"||r.priority==="high")}

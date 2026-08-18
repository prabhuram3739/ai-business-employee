import type {
  BusinessModule,
  WorkItem,
  WorkflowRule,
  WorkflowStage
} from "./types";

export const getStage = (
  module: BusinessModule,
  id: string
): WorkflowStage | undefined =>
  module.stages.find(
    stage => stage.id === id
  );

export const getModuleItems = (
  items: WorkItem[],
  moduleId: string
): WorkItem[] =>
  items.filter(
    item => item.moduleId === moduleId
  );

export const workflowSummary = (
  module: BusinessModule
): Array<{
  stage: WorkflowStage;
  rules: WorkflowRule[];
}> =>
  module.stages.map(stage => ({
    stage,
    rules: module.rules.filter(
      rule =>
        rule.trigger.includes(stage.id) ||
        rule.condition.includes(stage.id)
    )
  }));

export const getCriticalRules = (
  module: BusinessModule
): WorkflowRule[] =>
  module.rules.filter(
    rule =>
      rule.priority === "critical" ||
      rule.priority === "high"
  );
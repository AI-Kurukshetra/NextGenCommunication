export function evaluateWorkflow(
  workflow: {
    triggerEvent: string;
    steps: Array<{ action: string; params: Record<string, unknown> }>;
  },
  event: { type: string; payload: Record<string, unknown> }
) {
  if (workflow.triggerEvent !== event.type) {
    return [];
  }

  return workflow.steps;
}

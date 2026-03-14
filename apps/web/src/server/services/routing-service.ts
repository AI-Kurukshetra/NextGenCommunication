export function chooseRoute(routes: Array<{ carrierId: string; priority: number; healthy: boolean }>) {
  return routes
    .filter((route) => route.healthy)
    .sort((a, b) => a.priority - b.priority)[0] ?? null;
}

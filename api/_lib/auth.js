export function getAdminTokenRequirement() {
  return process.env.DASHBOARD_ADMIN_TOKEN || "";
}

export function readDashboardToken(request) {
  return request.headers["x-dashboard-token"] || request.headers["X-Dashboard-Token"] || "";
}

export function enforceDashboardToken(request, response) {
  const requiredToken = getAdminTokenRequirement();
  if (!requiredToken) {
    return true;
  }

  if (readDashboardToken(request) === requiredToken) {
    return true;
  }

  response.status(401).json({
    ok: false,
    error: "Unauthorized",
    detail: "A valid dashboard admin token is required for this action."
  });
  return false;
}

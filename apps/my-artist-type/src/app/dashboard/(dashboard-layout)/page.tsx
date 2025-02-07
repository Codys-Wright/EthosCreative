"use client";

import {
  WidgetProvider,
  useRegisterWidgets,
  WidgetExamplePage,
} from "@repo/widgets";
import { dashboardWidgets } from "@/widgets";

function DashboardContent() {
  // Register our app-specific widgets
  useRegisterWidgets(dashboardWidgets);

  return <WidgetExamplePage />;
}

export default function DashboardPage() {
  return (
    <WidgetProvider
      initialWidgets={dashboardWidgets}
      storeId="my-artist-type-dashboard"
    >
      <DashboardContent />
    </WidgetProvider>
  );
}

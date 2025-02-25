"use client";

import {
  WidgetProvider,
  useRegisterWidgets,
  WidgetExamplePage,
} from "@/components/widgets";
import { dashboardWidgets } from "@/components/widgets/widgets";

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

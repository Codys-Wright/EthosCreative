"use client";

import {
  WidgetProvider,
  useRegisterWidgets,
  WidgetExamplePage,
} from "@/components/widgets";
import { dashboardWidgets } from "@/components/widgets/widgets";

function DashboardContent() {
  // Register our app-specific widgets
  useRegisterWidgets(dashboardWidgets as any);

  return <WidgetExamplePage />;
}

export default function DashboardPage() {
  return (
    <WidgetProvider
      initialWidgets={dashboardWidgets as any}
      storeId="my-artist-type-dashboard"
    >
      <DashboardContent />
    </WidgetProvider>
  );
}

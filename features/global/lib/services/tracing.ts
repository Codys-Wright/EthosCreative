import {
  type Configuration,
  layer as webSdkLayer,
} from "@effect/opentelemetry/WebSdk";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { SentrySpanProcessor } from "@sentry/opentelemetry";
export const SpansExportLive = webSdkLayer((): Configuration => {
  return {
    resource: {
      serviceName: "web-app",
    },
    spanProcessor: new SentrySpanProcessor(),
  };
});

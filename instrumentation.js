// instrumentation.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  metricExporter: new OTLPMetricExporter({
    temporalPreference: 1, // Ensures cumulative metric aggregations line up with Prometheus schemas
  }),
  logRecordProcessor: new SimpleLogRecordProcessor(new OTLPLogExporter()),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable noisy filesystem hooks to protect performance and prevent memory footprint bloat
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

// Protect application termination loops during rolling deployments
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('✅ OpenTelemetry telemetry channels flushed and shut down cleanly.'))
    .catch((error) => console.error('❌ Error shutting down OpenTelemetry:', error))
    .finally(() => process.exit(0));
});

sdk.start();
console.log('🚀 OpenTelemetry HTTP Infrastructure engine initialized successfully.');

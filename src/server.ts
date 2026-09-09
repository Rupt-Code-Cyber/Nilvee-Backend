// 🚀 LINE 1: OpenTelemetry initialization MUST happen before any other package loads
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

// Only load telemetry tracking if running in production mode with active configurations
if (process.env.NODE_ENV === 'production' && process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    metricExporter: new OTLPMetricExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Turn off local file system tracking to keep your Prometheus metrics uncluttered
        '@opentelemetry/instrumentation-fs': { enabled: false }
      })
    ]
  });

  sdk.start();
  console.log('📡 OpenTelemetry Engine fully active. Streaming runtime metrics to Grafana Cloud...');
}

// -----------------------------------------------------------------------------
// Your existing clean application imports and execution logic follow below:
import { createApplication } from './app.js';

async function startServer() {
  try {
    const app = await createApplication();

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    
    app.log.info(`🚀 Nilvee Engine fully initialized and listening on http://${host}:${port}`);
  } catch (error) {
    console.error('❌ Failed to boot Nilvee Backend Engine:', error);
    process.exit(1);
  }
}

void startServer();

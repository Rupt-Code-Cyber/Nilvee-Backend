// @ts-ignore
import { NodeSDK } from '@opentelemetry/sdk-node';
// @ts-ignore
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// @ts-ignore
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
// @ts-ignore
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

if (process.env.NODE_ENV === 'production' && process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    metricExporter: new OTLPMetricExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false }
      })
    ]
  });

  sdk.start();
  console.log('📡 OpenTelemetry Engine fully active. Streaming runtime metrics to Grafana Cloud...');
}

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

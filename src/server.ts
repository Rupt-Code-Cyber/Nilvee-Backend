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

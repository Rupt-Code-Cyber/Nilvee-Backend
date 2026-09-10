import { createApplication } from './app.js';

async function startServer() {
  try {
    const app = await createApplication();

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    // Fastify natively binds network listeners here cleanly
    await app.listen({ port, host });
    
    // Wire up clean POSIX termination signals directly to Fastify's internal close handler sequence
    const handleShutdown = async (signal: string) => {
      app.log.warn(`⚠️ System caught signal [${signal}]. Initiating graceful application shutdown lifecycle...`);
      try {
        // Triggers preClose/onClose lifecycle hooks inside app.ts automatically
        await app.close(); 
        process.exit(0);
      } catch (err) {
        // FIXED OVERLOAD: Passed the error instance FIRST to satisfy Fastify's Pino log type constraints [2]
        const errorObject = err instanceof Error ? err : new Error(String(err));
        app.log.error(errorObject, '❌ Critical failure caught during graceful shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => void handleShutdown('SIGTERM'));
    process.on('SIGINT', () => void handleShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Fatal error caught during system boot sequence:', error);
    process.exit(1);
  }
}

void startServer();

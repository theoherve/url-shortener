import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // URL du frontend en production
    'https://url-shortener-stoik.vercel.app', // Frontend Vercel
  ].filter(Boolean); // Remove undefined values

  // En production, si aucune origine n'est spécifiée, autoriser toutes les origines
  // Sinon, utiliser la liste des origines autorisées
  const corsOptions = {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  };

  app.enableCors(corsOptions);

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // // Set global prefix for API routes, but exclude redirect route
  // app.setGlobalPrefix('api', {
  //   exclude: [':shortCode'],
  // });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();

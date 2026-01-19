import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  });

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // Set global prefix for API routes, but exclude redirect route
  app.setGlobalPrefix('api', {
    exclude: [':shortCode'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();

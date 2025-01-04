import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as fs from 'fs';

async function bootstrap() {
  // Read certificate files for HTTPS
  const httpsOptions = {
    key: fs.readFileSync('certs/key.pem'),
    cert: fs.readFileSync('certs/cert.pem'),
    // ca: fs.readFileSync('./certificates/ca_bundle.crt'), // Optional, based on your setup
  };

  // Create a NestJS application with HTTPS enabled
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
    cors: {
      origin: '*', // Adjust as needed for security
    },
  });

  
  // Set up global validation
  app.useGlobalPipes(new ValidationPipe());

  // Configure WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Listen on the specified port
  const port = 4000;
  await app.listen(port);
  console.log(`Application is running on https://localhost:${port}`);
}

bootstrap();

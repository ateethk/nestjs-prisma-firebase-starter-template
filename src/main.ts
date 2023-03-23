import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { PrismaService } from './prisma/prisma.service';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { urlencoded, json } from 'express';


const bootstrap = async () => {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');


	/* Firebase */
	const adminConfig: ServiceAccount = {
	  'projectId': process.env.FIREBASE_PROJECT_ID,
	  'privateKey': process.env.FIREBASE_KEY.replace(/\\n/g, '\n'),
	  'clientEmail': process.env.FIREBASE_CLIENT_EMAIL
	};
	admin.initializeApp({ 
	  'credential': admin.credential.cert(adminConfig),
	  'storageBucket': process.env.FIREBASE_STORAGE_BUCKET
	});


	app.useGlobalPipes(new ValidationPipe());
	app.use(json({ limit: '50mb' }));
	app.use(urlencoded({ extended: true, limit: '50mb' }));
	app.enableCors();


	/* Prisma */
	const prismaService: PrismaService = app.get(PrismaService);
	prismaService.enableShutdownHooks(app)


	await app.listen(process.env.PORT || 8080, '0.0.0.0');
};


bootstrap();
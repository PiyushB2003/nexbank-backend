import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

export const authMicroserviceOptions: ClientOptions = {
    transport: Transport.GRPC,
    options : {
        package: 'AuthApi',
        protoPath: join(__dirname, 'protos/auth-api.proto'),
        url: process.env.NB_MICROSERVICE_AUTH,
        keepalive: {
            // Send keepalive pings every 10 seconds.
            keepaliveTimeMs: 30000, // 30 seconds

            // Keepalive ping timeout after.
            keepaliveTimeoutMs: 5000, // 5 seconds
            
            // Allow keepalive pings when there are no gRPC calls.
            keepalivePermitWithoutCalls: 1,
        }
    }
}
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ErrorException, SuccessResponse } from 'src/app/exceptions/nb-responses.exception';
import { AppHelper } from 'src/app/helpers/app.helper';
import { NB } from 'src/app/helpers/nb.helper';
import { createGrpcMetadata } from 'src/grpc/grpc-metadata.helper';
import { authMicroserviceOptions } from 'src/grpc/grpc-options';
import { IAuthGrpcService } from 'src/grpc/grpc.interface';
import { ForgotPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {

    // MICROSERVICE CLIENT INITIALIZES
    @Client(authMicroserviceOptions)
    private readonly client: ClientGrpc;

    // GRPC SERVICE
    private grpcService: IAuthGrpcService;

    constructor(
        // HELPERS
        private readonly AppHelper: AppHelper
    ) { }

    onModuleInit() {
        try {
            this.grpcService = this.client.getService<IAuthGrpcService>('AuthApiController');
        } catch (error) {
            process.exit(1); // Ensures Kubernetes restarts the pod
        }
    }


    /**
     * Responsible to send data to auth service to generate OTP
     * 
     * @param postData - Payload containing mobile number
     * @returns - Success or Failure response
     */
    async registerInitiate(postData: any) {

        const { mobile_number } = postData;

        if (NB.isEmpty(postData)) {

            const dataStringify = {
                mobile_number
            };

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(dataStringify))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'register-initiate');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }


    /**
     * Responsible to send data to auth service to verify OTP
     * 
     * @param postData - Payload containing mobile number and otp
     * @returns - Success or Failure response
     */
    async registerVerifyOtp(postData: any) {

        const { otp, mobile_number } = postData;

        if (NB.isEmpty(postData)) {

            const dataStringify = {
                otp,
                mobile_number
            };

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(dataStringify))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'register-vefiry-otp');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }


    /**
     * Responsible to send data to auth service to complete registration
     * 
     * @param postData - Payload containing user details
     * @returns - Success or Failure response
     */
    async registerComplete(postData: any) {

        const { first_name, last_name, email, password, registration_token } = postData;

        if (NB.isEmpty(postData)) {

            const dataStringify = {
                first_name,
                last_name,
                email,
                password,
                registration_token
            };

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(dataStringify))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'register-complete');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                return ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        // RETURN FAILURE RESPONSE
        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }

    /**
     * Responsible to send data to auth service to login
     * 
     * @param deviceData - Payload containing device details
     * @param postData - Payload containing user details
     * @returns - Success or Failure response
     */
    async login(deviceData: any, postData: any) {

        const { mobile_number, password } = postData;

        if (NB.isEmpty(postData) && NB.isEmpty(deviceData)) {
            const device = {
                browser: deviceData.browser.name || null,
                browser_version: deviceData.browser.version || null,
                os: deviceData.os.name || null,
                os_version: deviceData.os.version || null,
                device_name: deviceData.device.model || null,
                device_type: deviceData.device.type || null,
                device_version: deviceData.device.version || null,
                user_agent: deviceData.userAgent || null,
                ip_address: deviceData.ip || null,
            };

            const dataStringify = {
                mobile_number,
                password,
                device
            };

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(dataStringify))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'login');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                return ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        // RETURN FAILURE RESPONSE
        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }

    /**
     * Responsible to send data to auth service to refresh token
     * 
     * @param postData - Payload containing refresh token
     * @returns - Success or Failure response
     */
    async refreshToken(postData: any) {

        const { refresh_token } = postData;

        if (NB.isEmpty(postData)) {

            const dataStringify = {
                refresh_token
            };

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(dataStringify))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'refresh-token');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                return ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        // RETURN FAILURE RESPONSE
        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }

    /**
     * Responsible to send data to auth service to logout
     * 
     * @param user - Payload containing user details
     * @returns - Success or Failure response
     */
    async logout(user: any) {

        if (NB.isEmpty(user)) {

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(user))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'logout');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                return ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        // RETURN FAILURE RESPONSE
        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }

    /**
     * Responsible to send data to auth service to get user details
     * 
     * @param user - Payload containing user details
     * @returns - Success or Failure response
     */
    async getProfile(user: any) {

        if (NB.isEmpty(user)) {

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(user))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'me');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                return ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        // RETURN FAILURE RESPONSE
        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }

    /**
     * Responsible to send data to auth service to change the current password
     * 
     * @param user - Payload containing user details
     * @param postData - Payload containing old password and new password
     * @returns - Success or Failure response
     */
    async changePassword(user: any, postData: any) {

        const { old_password, new_password } = postData;

        if (NB.isEmpty(postData) && NB.isEmpty(user)) {

            const dataStringify = {
                old_password,
                new_password,
                user
            };

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(dataStringify))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'change-password');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                return ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        // RETURN FAILURE RESPONSE
        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }

    /**
     * Responsible to send data to auth service to change the password because forgot the current
     * 
     * @param postData - Payload containing mobile number
     * @returns - Success or Failure response
     */
    async forgotPassword(postData: ForgotPasswordDto) {

        const { mobile_number } = postData;

        if (NB.isEmpty(postData)) {

            const dataStringify = {
                mobile_number
            };

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(dataStringify))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'forgot-password');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                return ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        // RETURN FAILURE RESPONSE
        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }

    /**
     * Responsible to send data to auth service to reset the password
     * 
     * @param postData - Payload containing mobile number, otp and new password
     * @returns - Success or Failure response
     */
    async resetPassword(postData: any) {

        const { mobile_number, otp, new_password } = postData;

        if (NB.isEmpty(postData)) {

            const dataStringify = {
                mobile_number,
                otp,
                new_password
            };

            const encriptData = {
                authdata: [
                    this.AppHelper.encryptString(JSON.stringify(dataStringify))
                ],
            };

            // CREATE GRPC METADATA
            const metadata: any = createGrpcMetadata();
            metadata.set('operation', 'auth');
            metadata.set('action', 'reset-password');
            metadata.set('service', 'nexbank-backend');

            // SEND DATA TO AUTH MICROSERVICE
            const response = await firstValueFrom(
                this.grpcService.requestSendAuthData(encriptData, metadata),
            );

            const data = this.AppHelper.decryptString(response.authresponse)

            if (!NB.isEmpty(data)) {
                return ErrorException(
                    HttpStatus.BAD_REQUEST,
                    'Missing response'
                );
            }

            if (!data.status) {
                return ErrorException(
                    data.code || HttpStatus.BAD_REQUEST,
                    data.message
                );
            }

            return SuccessResponse(data.code, data.message, data.data);
        }

        // RETURN FAILURE RESPONSE
        return ErrorException(HttpStatus.BAD_REQUEST, 'Missing data');
    }
}

// services/ auth account payment ledger notification fraud audit transaction
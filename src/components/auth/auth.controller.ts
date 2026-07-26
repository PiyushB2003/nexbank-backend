import { Body, Controller, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterCompleteDto, RegisterInitiateDto, RegisterVerifyOtpDto } from './dto/auth.dto';
import { ErrorException } from 'src/app/exceptions/nb-responses.exception';
import { Throttle } from '@nestjs/throttler';
import { OtpThrottlerGuard } from 'src/app/guards/otp-throttler.guard';
import { UAParser } from "ua-parser-js";

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) { }

    /**
     * Registers a new vehicle user by getting mobile number and send otp
     * 
     * @param req - The request object containing user details.
     * @param postData - The user details to be registered.
     * @returns The response object containing the registered user details.
     */
    @UseGuards(OtpThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post("register/initiate")
    async registerInitiate(@Request() req: any, @Body() postData: RegisterInitiateDto) {
        try {
            return this.authService.registerInitiate(postData);
        } catch (error: any) {
            ErrorException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                error.message,
                error.data
            );
        }
    }

    /**
     * Registers a new vehicle user by getting mobile number and verify otp
     * 
     * @param req - The request object containing user details.
     * @param postData - The user details to be registered.
     * @returns The response object containing the registered user details.
     */
    @UseGuards(OtpThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post("register/verify-otp")
    async registerVerifyOtp(@Body() postData: RegisterVerifyOtpDto) {
        try {
            return this.authService.registerVerifyOtp(postData);
        } catch (error: any) {
            ErrorException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                error.message,
                error.data
            );
        }
    }

    /**
     * Registers a new vehicle user by getting other user details
     * 
     * @param req - The request object containing user details.
     * @param postData - The user details to be registered.
     * @returns The response object containing the registered user details.
     */
    @Post("register/complete")
    async registerComplete(@Body() postData: RegisterCompleteDto) {
        try {
            return this.authService.registerComplete(postData);
        } catch (error: any) {
            return ErrorException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                error.message,
                error.data
            );
        }
    }

    /**
     * Log in a registered user
     * 
     * @param req - The request object containing user details.
     * @param postData - The user details to be registered.
     * @returns The response object containing the registered user details.
     */
    @Post("login")
    async login(@Request() req: any, @Body() postData: LoginDto) {
        const userAgent = req.headers['user-agent'];
        const ip = req.ip || '';

        const parser = new UAParser(userAgent);
        const uaResult = parser.getResult();

        try {
            return this.authService.login({ ...uaResult, ip, userAgent }, postData);
        } catch (error: any) {
            return ErrorException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                error.message,
                error.data
            );
        }
    }

    /**
     * Verify refresh token
     * 
     * @param postData - The user details to be registered.
     * @returns The response object containing the registered refresh token.
     */
    @Post("refresh-token")
    async refreshToken(@Body() postData: RefreshTokenDto) {
        try {
            return this.authService.refreshToken(postData);
        } catch (error: any) {
            return ErrorException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                error.message,
                error.data
            );
        }
    }
}

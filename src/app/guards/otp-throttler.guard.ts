// otp-throttler.guard.ts (Inside API Gateway)
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { createHash } from 'crypto';
import { ErrorException } from '../exceptions/nb-responses.exception';

@Injectable()
export class OtpThrottlerGuard extends ThrottlerGuard {


    private generateMd5Hash(data: string): string {
        return createHash('md5').update(data).digest('hex');
    }

    protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {

        const { context, limit, ttl, throttler, blockDuration } = requestProps;

        const request = context.switchToHttp().getRequest();
        const ip = request.ip;
        const mobileNumber = request.body?.mobile_number;

        if (!mobileNumber) {
            throw new HttpException('Mobile number is required', HttpStatus.BAD_REQUEST);
        }

        const hashSuffix = this.generateMd5Hash(`otp_limit:${ip}:${mobileNumber}`);

        const { totalHits } = await this.storageService.increment(
            hashSuffix,
            ttl,
            limit,
            blockDuration,
            throttler.name ?? ''
        );

        if (totalHits > limit) {
            throw new HttpException(
                'Too many OTP attempts. Please try after some time.',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return true;
    }
}
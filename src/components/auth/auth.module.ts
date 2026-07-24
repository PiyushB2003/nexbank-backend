import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AppHelper } from 'src/app/helpers/app.helper';
import { OtpThrottlerGuard } from 'src/app/guards/otp-throttler.guard';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 10,
            },
        ]),
    ],
    controllers: [AuthController],
    providers: [AuthService, AppHelper, OtpThrottlerGuard],
})
export class AuthModule { }

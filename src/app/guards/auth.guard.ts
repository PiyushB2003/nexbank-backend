import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AppHelper } from '../helpers/app.helper';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly appHelper: AppHelper,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid Authorization header');
        }

        try {
            const payload = this.appHelper.verifyAccessToken(token);

            request.user = payload;

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }
}
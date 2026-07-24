import { HttpStatus, HttpException } from '@nestjs/common';

export class NBException extends HttpException {
    constructor(message?: any, status?: any, alarmNumber?: any) {
        super(message, status, alarmNumber);
    }
}
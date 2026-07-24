import { HttpException, HttpStatus } from '@nestjs/common';
import { NB } from '../helpers/nb.helper';
import { NBMoment } from '../helpers/nb-moment.helper';

export const SuccessResponse = (
    code: number = HttpStatus.OK, // Default to HttpStatus.OK
    message?: string,
    data: any = null,
    alarmNumber: any = null
) => {
    const jsonResponse: any = {
        code: code,
        status: true,
        message: message || null,
    };

    if (NB.isEmpty(alarmNumber)) {
        jsonResponse.AlarmNumber = alarmNumber;
    }

    jsonResponse.timestamp = NBMoment.responseDate();

    if (data) {
        jsonResponse.data = data;
    }

    return jsonResponse; // Return the object, it will be handled by the interceptor
};

export const ErrorException = (
    code: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    data: any = null
) => {
    const jsonResponse: any = {
        code,
        status: false,
        message: message || null,
    };

    if (data) {
        jsonResponse.data = data;
    }

    return jsonResponse; // Return the object, it will be handled by the interceptor
};

export const ThrowErrorException = (
    code: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    data: any = null
): never => {

    throw new HttpException(
        ErrorException(code, message, data),
        code
    );
};
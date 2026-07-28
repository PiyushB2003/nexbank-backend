import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterInitiateDto {

    @IsPhoneNumber()
    @IsNotEmpty()
    mobile_number: string;
}

export class RegisterVerifyOtpDto {

    @IsString()
    @IsNotEmpty()
    otp: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    mobile_number: string;
}

export class RegisterCompleteDto {

    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    mobile_number: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        },
    )
    password: string;

    @IsString()
    @IsNotEmpty()
    registration_token: string;
}

export class LoginDto {

    @IsPhoneNumber()
    @IsNotEmpty()
    mobile_number: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RefreshTokenDto {

    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}

export class ChangePasswordDto {

    @IsString()
    @IsNotEmpty()
    old_password: string;

    @IsString()
    @IsNotEmpty()
    new_password: string;
}
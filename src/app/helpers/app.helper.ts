import { HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import * as dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import { NBException } from '../exceptions/forbidden-error.exception';
import * as jwt from 'jsonwebtoken';

dotenv.config();

const encryptMethod = 'aes-256-gcm';
const jwtAccessTokenKey = process.env.JWT_ACCESS_SECRET || '';
const secretKey = process.env.ID_ENCRYPTION_SECRET_KEY || '';
const secretIv = process.env.ID_ENCRYPTION_IV || '';
const CRYPT_JS_KEY = process.env.CRYPT_JS_KEY || '';

// 🔹 Precompute Key & IV once to improve performance
const key = crypto.pbkdf2Sync(secretKey, 'salt', 10000, 32, 'sha256'); // Reduced iterations
const iv = crypto.createHash('sha256').update(secretIv, 'utf8').digest().subarray(0, 12);
@Injectable()
export class AppHelper {

    VIEncodeString(input: any): string {
        if (input) {
            input = input + '**NexBank2026';
            return this.strRot13(this.base64Encode(input));
        }
        return '';
    }

    VIDecodeString(string: any = null): string {
        if (string) {
            const key = 'NexBank2026';
            const data = this.base64Decode(this.strRot13(string));
            const dataArr = data.split("**");
            const decodedString = (key == dataArr[1]) ? dataArr[0] : '';
            return decodedString;
        } else {
            return '';
        }
    }

    private strRot13(str: string): string {
        return (str + '').replace(/[a-z]/gi, (s) =>
            String.fromCharCode(s.charCodeAt(0) + (s.toLowerCase() < 'n' ? 13 : -13)),
        );
    }

    private base64Encode(str: string): string {
        const buff = Buffer.from(str);
        return buff.toString('base64');
    }

    private base64Decode(str: string): string {
        return Buffer.from(str, 'base64').toString()
    }

    public encryptString(data: any): string {
        if (data !== undefined && data !== null) {
            const stringData = typeof data === 'string' ? data : JSON.stringify(data); // Convert to string if not already
            const encrypted = this.__stringDecryption('encrypt', stringData);
            return encrypted;
        }
        return '';
    }

    public decryptString(data: string): any {
        if (data) {
            const decrypted = this.__stringDecryption('decrypt', data);
            try {
                return JSON.parse(decrypted); // Try to parse JSON
            } catch {
                return decrypted; // Return as string if not JSON
            }
        }
        return '';
    }

    private __stringDecryption(action: string, text: string): string {

        const encryptMethod = 'aes-256-gcm'; // Encryption method
        const secretKey = process.env.CRYPTO_SECRETKEY || ''; // Secret Key
        const secretIv = process.env.CRYPTO_SECRETVI || ''; // Initialization Vector

        // Generate key and IV with appropriate lengths
        const key = crypto.createHash('sha256').update(secretKey, 'utf8').digest().slice(0, 32);
        const iv = crypto.createHash('sha256').update(secretIv, 'utf8').digest().slice(0, 12); // 12 bytes for GCM mode

        if (action === 'encrypt') {
            const cipher = crypto.createCipheriv(encryptMethod, key, iv);

            let encrypted = cipher.update(text, 'utf8', 'base64');
            encrypted += cipher.final('base64');

            // Get the authentication tag and attach it to the encrypted output
            const authTag = cipher.getAuthTag();
            return `${encrypted}:${authTag.toString('base64')}`; // Concatenate encrypted text and auth tag
        } else if (action === 'decrypt') {
            try {
                const [encryptedText, authTagBase64] = text.split(':');
                const authTag = Buffer.from(authTagBase64, 'base64');

                const decipher = crypto.createDecipheriv(encryptMethod, key, iv);
                decipher.setAuthTag(authTag); // Set the authentication tag for GCM

                let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            } catch (error) {
                console.error('Decryption error:', error.message);
                return '';
            }
        }
        return '';
    }

    encryptID(id: number): string {
        try {
            const cipher = crypto.createCipheriv(encryptMethod, key, iv);
            const encrypted = Buffer.concat([
                cipher.update(id.toString(), 'utf8'),
                cipher.final(),
            ]);
            return encrypted.toString('hex') + cipher.getAuthTag().toString('hex');
        } catch (error) {
            throw new NBException("invalid_string", HttpStatus.BAD_REQUEST);
        }
    }

    decryptID(encryptedText: string): number | null {

        try {
            const encrypted = Buffer.from(encryptedText.slice(0, -32), 'hex');
            const authTag = Buffer.from(encryptedText.slice(-32), 'hex');

            const decipher = crypto.createDecipheriv(encryptMethod, key, iv);
            decipher.setAuthTag(authTag);

            const decryptedBuffer = Buffer.concat([
                decipher.update(encrypted),
                decipher.final(),
            ]);

            const decryptedId = parseInt(decryptedBuffer.toString('utf8'), 10);
            if (isNaN(decryptedId)) {
                throw new NBException("invalid_encrypted_string", HttpStatus.BAD_REQUEST);
            }
            return decryptedId;
        } catch (error) {
            throw new NBException("invalid_encrypted_string", HttpStatus.BAD_REQUEST);
        }
    }

    hash(password: any) {
        const md5_1 = crypto.createHash('md5').update(password).digest('hex');
        const part1 = crypto.createHash('md5').update(md5_1 + 'dgfghfs').digest('hex');

        const md5_2 = crypto.createHash('md5').update(password).digest('hex');
        const part2Full = crypto.createHash('md5').update(md5_2 + 'fezf4z4z7').digest('hex');
        const part2 = part2Full.substring(0, 8);

        return part1 + part2;
    }

    cryptJsDecode(encryptedJsonStr: string) {
        try {

            const encryptedObj = JSON.parse(encryptedJsonStr);

            // Recreate the CipherParams object expected by CryptoJS
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(encryptedObj.ct),
                iv: CryptoJS.enc.Hex.parse(encryptedObj.iv),
                salt: CryptoJS.enc.Hex.parse(encryptedObj.s),
            });

            // Decrypt
            const decrypted = CryptoJS.AES.decrypt(cipherParams, CRYPT_JS_KEY);

            // Convert to UTF-8 string
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);
            return plainText || '[Decryption failed: empty result]';

        } catch (error) {
            return `[Error decoding message]: ${error.message}`;
        }
    }

    cryptJsEncrypt(data: any) {
        try {
            const plainText = typeof data === 'string' ? data : JSON.stringify(data);

            const salt = CryptoJS.lib.WordArray.random(128 / 8); // 16-byte salt
            const iv = CryptoJS.lib.WordArray.random(128 / 8);   // 16-byte IV

            const encrypted = CryptoJS.AES.encrypt(plainText, CRYPT_JS_KEY, {
                iv: iv,
                salt: salt
            });

            const encryptedObj = {
                ct: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
                iv: iv.toString(CryptoJS.enc.Hex),
                s: salt.toString(CryptoJS.enc.Hex)
            };

            return JSON.stringify(encryptedObj);
        } catch (error) {
            return `[Error encrypting message]: ${error.message}`;
        }
    }

    generateUniqueId(): string {
        try {
            return `${nanoid(21)}`;
        } catch (error) {
            console.log('Error generating unique ID:', error);
            return `[Error generating UUID]: ${error.message}`;
        }
    }

    verifyAccessToken(token: string): any {
        try {
            const payload = jwt.verify(token, jwtAccessTokenKey);
            return payload;
        } catch (error) {
            throw new NBException("invalid_token", HttpStatus.UNAUTHORIZED);
        }
    }
}
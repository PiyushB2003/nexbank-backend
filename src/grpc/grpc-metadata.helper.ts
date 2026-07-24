import { Metadata } from '@grpc/grpc-js';
import { als } from './als';

export function createGrpcMetadata(): Metadata {
    const metadata = new Metadata();

    const requestId = als.getStore()?.get('requestId');

    if (requestId) {
        metadata.set('x-request-id', requestId);
    }

    return metadata;
}
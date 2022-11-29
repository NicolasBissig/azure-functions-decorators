import 'reflect-metadata';
import { HttpRequest } from '@azure/functions';

export const BodyMetaDataKey = Symbol('RequestBody');

export function RequestBody(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        let existingRequiredParameters: number[] = Reflect.getOwnMetadata(BodyMetaDataKey, target, propertyKey) || [];
        existingRequiredParameters.push(parameterIndex);
        Reflect.defineMetadata(BodyMetaDataKey, existingRequiredParameters, target, propertyKey);
    };
}

export function handleRequestBodyParameter(
    target: Object,
    propertyName: string | symbol,
    req: HttpRequest,
    args: any[]
) {
    let bodyParameter: number[] = Reflect.getOwnMetadata(BodyMetaDataKey, target, propertyName);
    if (bodyParameter) {
        if (bodyParameter.length !== 1) {
            throw new Error('only one @RequestBody parameter is allowed');
        }

        const paramIndex = bodyParameter[0];
        args[paramIndex] = JSON.parse(req.rawBody);
    }
}

import 'reflect-metadata';
import { HttpRequest } from '@azure/functions';
import { markParameter } from '../reflection';

export const BodyMetaDataKey = Symbol('RequestBody');

export function RequestBody(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        markParameter(target, propertyKey, BodyMetaDataKey, parameterIndex, 1);
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

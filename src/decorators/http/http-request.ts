import 'reflect-metadata';
import { HttpRequest } from '@azure/functions';
import { markParameter } from '../reflection';

export const RequestMetaDataKey = Symbol('Request');

export function Request(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        markParameter(target, propertyKey, RequestMetaDataKey, parameterIndex, 1);
    };
}

export function handleRequestParameter(
    target: Object,
    propertyName: string | symbol,
    request: HttpRequest,
    args: any[]
) {
    let requestParameter: number[] = Reflect.getOwnMetadata(RequestMetaDataKey, target, propertyName);
    if (requestParameter) {
        if (requestParameter.length !== 1) {
            throw new Error('only one @Request parameter is allowed');
        }

        const paramIndex = requestParameter[0];
        args[paramIndex] = request;
    }
}

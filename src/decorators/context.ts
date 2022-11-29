import 'reflect-metadata';
import { Context as AzureContext } from '@azure/functions';
import { markParameter } from './reflection';

export const ContextMetaDataKey = Symbol('Context');

export function Context(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const contextParameters = markParameter(target, propertyKey, ContextMetaDataKey, parameterIndex);
        if (contextParameters.length > 1) {
            throw new Error('only one @Context parameter is allowed');
        }
    };
}

export function handleContextParameter(
    target: Object,
    propertyName: string | symbol,
    context: AzureContext,
    args: any[]
) {
    let contextParameter: number[] = Reflect.getOwnMetadata(ContextMetaDataKey, target, propertyName);
    if (contextParameter) {
        if (contextParameter.length !== 1) {
            throw new Error('only one @RequestBody parameter is allowed');
        }

        const paramIndex = contextParameter[0];
        args[paramIndex] = context;
    }
}

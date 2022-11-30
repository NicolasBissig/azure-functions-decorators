import 'reflect-metadata';
import { Context as AzureContext } from '@azure/functions';
import { applyToMarked, markParameter } from './reflection';

export const ContextMetaDataKey = Symbol('Context');

export function Context(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        markParameter(target, propertyKey, ContextMetaDataKey, parameterIndex, 1);
    };
}

export function handleContextParameter(
    target: Object,
    propertyName: string | symbol,
    context: AzureContext,
    args: any[]
) {
    applyToMarked<number>(target, propertyName, ContextMetaDataKey, parameter => (args[parameter] = context), 1);
}

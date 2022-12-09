import { Context as AzureContext } from '@azure/functions';
import { applyToMarked, markParameter } from './reflection';

const ContextMetaDataKey = Symbol('Context');

/**
 * The {@link Context @Context} decorator injects the azure context into a parameter.
 * The type of the injected parameter should be {@link Context} from '@azure/functions'.
 */
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
    applyToMarked<number>(target, propertyName, ContextMetaDataKey, (parameter) => (args[parameter] = context));
}

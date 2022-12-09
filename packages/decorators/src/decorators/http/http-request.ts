import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameter } from '../reflection';

const RequestMetaDataKey = Symbol('Request');

/**
 * The {@link Request @Request} decorator injects the {@link HttpRequest} from the context.
 * The injected parameter should be of type {@link HttpRequest}.
 */
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
    applyToMarked<number>(target, propertyName, RequestMetaDataKey, (parameter) => (args[parameter] = request));
}

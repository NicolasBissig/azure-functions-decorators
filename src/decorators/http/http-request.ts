import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameter } from '../reflection';

const RequestMetaDataKey = Symbol('Request');

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
    applyToMarked<number>(target, propertyName, RequestMetaDataKey, parameter => (args[parameter] = request));
}

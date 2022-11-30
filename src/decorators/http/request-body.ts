import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameter } from '../reflection';

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
    applyToMarked<number>(
        target,
        propertyName,
        BodyMetaDataKey,
        parameter => (args[parameter] = JSON.parse(req.rawBody)),
        1
    );
}

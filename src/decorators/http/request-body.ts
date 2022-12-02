import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameter } from '../reflection';

const BodyMetaDataKey = Symbol('RequestBody');

export function RequestBody(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        markParameter(target, propertyKey, BodyMetaDataKey, parameterIndex, 1);
    };
}

function parseBody(req: HttpRequest): any {
    try {
        return JSON.parse(req.rawBody);
    } catch {
        return undefined;
    }
}

export function handleRequestBodyParameter(
    target: Object,
    propertyName: string | symbol,
    req: HttpRequest,
    args: any[]
) {
    applyToMarked<number>(target, propertyName, BodyMetaDataKey, parameter => (args[parameter] = parseBody(req)));
}

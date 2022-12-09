import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameter } from '../reflection';

const BodyMetaDataKey = Symbol('RequestBody');

/**
 * The {@link RequestBody @RequestBody} decorator injects the parsed json request body into a parameter.
 * The type of the injected parameter can be anything, but will not be validated.
 * If the request body is not parseable, undefined will be injected.
 */
export function RequestBody(): ParameterDecorator {
    return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
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
    target: object,
    propertyName: string | symbol,
    req: HttpRequest,
    args: any[]
) {
    applyToMarked<number>(target, propertyName, BodyMetaDataKey, (parameter) => (args[parameter] = parseBody(req)));
}

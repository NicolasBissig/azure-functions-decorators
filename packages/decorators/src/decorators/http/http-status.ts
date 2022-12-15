import { Context, HttpResponse } from '@azure/functions';

const HttpStatusPrototypeProperty = Symbol('_HttpStatus');

type HasPrototype = {
    prototype: unknown;
};

/**
 * The {@link HttpStatus @HttpStatus} decorator injects a http status value into decorated error instances.
 *
 * This is useful for custom Error instances. When an instance of a thrown and decorated Error is caught
 * by {@link HttpFunction @HttpFunction} the response status is set accordingly.
 *
 * Instances of decorated classes will be JSON-serialized and returned in the body of the response if possible.
 * If the instance has no fields or is not serializable, an empty body will be returned with the response.
 */
export function HttpStatus(status: number): ClassDecorator {
    return <F extends HasPrototype>(target: F) => {
        Object.defineProperty(target.prototype, HttpStatusPrototypeProperty, {
            value: status,
        });
    };
}

export function findHttpStatusBySymbol(target: any): number | undefined {
    try {
        const status = target?.[HttpStatusPrototypeProperty];

        const statusCastToNumber = Number(status);

        if (isNaN(statusCastToNumber)) {
            return undefined;
        }

        return statusCastToNumber;
    } catch (e) {
        return undefined;
    }
}

export function handleError(target: unknown, context: Context) {
    const statusFromErrorInstance = findHttpStatusBySymbol(target);

    if (statusFromErrorInstance) {
        const bodyFromErrorInstance = toJsonOrEmptyResponse(target);
        const errorResponseFromDecorator: Partial<HttpResponse> = {
            status: statusFromErrorInstance,
            ...bodyFromErrorInstance,
        };
        context.res = errorResponseFromDecorator;
        return errorResponseFromDecorator;
    }

    throw target;
}

function toJsonOrEmptyResponse(object: unknown): Pick<HttpResponse, 'body' | 'headers'> {
    const emptyResponse = {
        body: undefined,
        headers: {},
    };

    try {
        const json = JSON.stringify(object);

        if (json === '{}') {
            return emptyResponse;
        }

        return {
            body: json,
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (e) {
        return emptyResponse;
    }
}

import { Context } from '@azure/functions';

const HttpStatusPrototypeProperty = Symbol('_HttpStatus');

/**
 * The {@link HttpStatus @HttpStatus} decorator injects a http status value into decorated error instances.
 *
 * This is useful for custom Error instances. When an instance of a thrown and decorated Error is caught
 * by {@link HttpFunction @HttpFunction} the response status is set accordingly.
 */
export function HttpStatus(status: number): ClassDecorator {
    return (target: Function) => {
        Object.defineProperty(target.prototype, HttpStatusPrototypeProperty, {
            value: status,
        });

        Object.defineProperty(target.prototype, '_HttpStatus', {
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

export function handleError(target: Object, context: Context) {
    const statusFromErrorInstance = findHttpStatusBySymbol(target);

    if (statusFromErrorInstance) {
        const errorResponseFromDecorator = {
            status: statusFromErrorInstance,
        };
        context.res = errorResponseFromDecorator;
        return errorResponseFromDecorator;
    }

    throw target;
}

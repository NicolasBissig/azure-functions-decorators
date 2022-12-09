import {Context} from "@azure/functions";

/**
 * The {@link HttpStatus @HttpStatus} decorator injects a http status value into decorated error instances.
 *
 * This is useful for custom Error instances. When an instance of a thrown and decorated Error is caught
 * by {@link HttpFunction @HttpFunction} the response status is set accordingly.
 */
export function HttpStatus(status: number): ClassDecorator {
    return (target: Function) => {
        Object.defineProperty(target.prototype, '_HttpStatus', {
            value: status
        })
    };
}

export function handleError(
    target: Object,
    context: Context
) {

    // @ts-ignore
    const statusFromErrorInstance = target?._HttpStatus

    if (statusFromErrorInstance) {
        const errorResponseFromDecorator = {
            status: statusFromErrorInstance
        }
        context.res = errorResponseFromDecorator
        return errorResponseFromDecorator
    }

    throw new Error('Uncaught error in @HttpFunction', {
        cause: target
    })

}

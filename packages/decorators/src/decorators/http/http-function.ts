import { handleRequestBodyParameter } from './request-body';
import { handleQueryParameters } from './query-parameter';
import { handlePathParameter } from './path-parameter';
import { isContext, isFunction, isHttpRequest } from './type-guards';
import { handleContextParameter } from '../context';
import { handleRequestParameter } from './http-request';
import { handleError } from './http-status';

/**
 * The {@link HttpFunction @HttpFunction} decorator marks a static class function as a httpTrigger function.
 * This decorator must be present for HTTP related decorators to work.
 *
 * Supported decorators are:
 *
 *      General:
 *        {@link Context @Context}
 *
 *      Http specific:
 *        {@link Request @Request}
 *        {@link PathParameter @PathParameter}
 *        {@link QueryParameter @QueryParameter}
 *        {@link RequestBody @RequestBody}
 *        {@link Context @Context}
 */
export function HttpFunction(): MethodDecorator {
    return (target: object, propertyName: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        const method = descriptor?.value;
        if (!isFunction(method)) {
            throw new Error('@HttpFunction can only be applied to functions');
        }

        descriptor.value = async function (...args: unknown[]) {
            if (!args || args.length === 0) {
                throw new Error(`@HttpFunction annotated method ${propertyName.toString()} was provided no arguments`);
            }
            const context = args[0];
            if (!isContext(context)) {
                throw new Error(
                    `@HttpFunction annotated method ${propertyName.toString()} was not provided a Context as first argument`
                );
            }

            const req = context.req;
            if (!isHttpRequest(req)) {
                throw new Error(
                    `@HttpFunction annotated method ${propertyName.toString()} was provided a context without or invalid http request`
                );
            }

            handleContextParameter(target, propertyName, context, args);
            handleRequestParameter(target, propertyName, req, args);
            handleRequestBodyParameter(target, propertyName, req, args);
            handleQueryParameters(target, propertyName, req, args);
            handlePathParameter(target, propertyName, req, args);

            try {
                return await method.apply(this, args);
            } catch (e) {
                return handleError(e, context);
            }
        };
    };
}

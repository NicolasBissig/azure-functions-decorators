import { handleRequestBodyParameter } from './request-body';
import { handleQueryParameters } from './query-parameter';
import { handlePathParameter } from './path-parameter';
import { isContext, isFunction, isHttpRequest, isHttpResponse } from './type-guards';
import { handleContextParameter } from '../context';
import { handleRequestParameter } from './http-request';
import { handleError } from './http-status';
import { HttpResponse } from '@azure/functions';

type ResultMapper<T> = (result: T) => HttpResponse;

type FullHttpFunctionOptions = {
    ResultMapper: ResultMapper<any>;
};

type HttpFunctionOptions = Partial<FullHttpFunctionOptions>;

const defaultResultMapper: ResultMapper<unknown> = (result: unknown): HttpResponse => {
    if (!result) {
        // is undefined, return empty success response
        return { status: 204, statusCode: 204 };
    }

    if (isHttpResponse(result)) {
        // is already a HttpResponse so return it
        return result;
    }

    if (typeof result === 'object') {
        // is an object, serialize it in the body
        return {
            body: JSON.stringify(result),
        };
    }

    return {
        // is probably a primitive, return it as body
        body: result,
    };
};

const defaultOptions = {
    ResultMapper: defaultResultMapper,
} as FullHttpFunctionOptions;

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
 *        {@link HttpStatus @HttpStatus}
 *        {@link Context @Context}
 */
export function HttpFunction(options?: HttpFunctionOptions): MethodDecorator {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };

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
                const result = await method.apply(this, args);
                return mergedOptions.ResultMapper(result);
            } catch (e) {
                return handleError(e);
            }
        };
    };
}

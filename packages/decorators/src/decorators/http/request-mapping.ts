import { isContext, isFunction, isHttpRequest, isHttpResponse } from './type-guards';
import { handleContextParameter } from '../context';
import { handleRequestParameter } from './http-request';
import { handleRequestBodyParameter } from './request-body';
import { handleQueryParameters } from './query-parameter';
import { handlePathParameter } from './path-parameter';
import { handleError } from './http-status';
import { injectParameters, parsePathWithParameters, pathWithParametersToRegex, toValidPath } from './parameters';
import { RequestMapping } from './rest-controller';
import { HttpResponse } from '@azure/functions';

type ResultMapper<T> = (result: T) => HttpResponse;

type FullRequestMappingOptions = {
    ResultMapper: ResultMapper<any>;
};

type RequestMappingOptions = Partial<FullRequestMappingOptions>;

const defaultResultMapper: ResultMapper<unknown> = (result: unknown): HttpResponse => {
    if (result === undefined || result === null) {
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
} as FullRequestMappingOptions;

export function RequestMapping(path?: string, options?: RequestMappingOptions): MethodDecorator {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };

    const validPath = toValidPath(path);
    const parameters = parsePathWithParameters(validPath);

    return (target: object, propertyName: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        const method = descriptor?.value;
        if (!isFunction(method)) {
            throw new Error('@RequestMapping can only be applied to functions');
        }

        descriptor.value = async function (...args: unknown[]) {
            if (!args || args.length === 0) {
                throw new Error(
                    `@RequestMapping annotated method ${propertyName.toString()} was provided no arguments`
                );
            }
            const context = args[0];
            if (!isContext(context)) {
                throw new Error(
                    `@RequestMapping annotated method ${propertyName.toString()} was not provided a Context as first argument`
                );
            }

            const req = context.req;
            if (!isHttpRequest(req)) {
                throw new Error(
                    `@RequestMapping annotated method ${propertyName.toString()} was provided a context without or invalid http request`
                );
            }

            // inject extra path parameters
            injectParameters(context, parameters);

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

        // register the mapping in the controller
        const controller = target.constructor.prototype;
        const mappings = (controller.requestMappings as RequestMapping[]) || [];

        const regex = pathWithParametersToRegex(validPath);

        mappings.push({
            methods: [],
            regex: regex,
            func: descriptor.value,
        });

        Object.defineProperty(controller, 'requestMappings', {
            value: mappings,
        });
    };
}

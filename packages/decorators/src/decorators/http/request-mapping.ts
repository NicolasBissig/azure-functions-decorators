import { isContext, isFunction, isHttpRequest, isHttpResponse } from './type-guards';
import { handleContextParameter } from '../context';
import { handleRequestParameter } from './http-request';
import { handleRequestBodyParameter } from './request-body';
import { handleQueryParameters } from './query-parameter';
import { handlePathParameter } from './path-parameter';
import { handleError } from './http-status';
import { injectParameters, parsePathWithParameters, pathWithParametersToRegex, toValidPath } from './parameters';
import { registerMapping } from './rest-controller';
import { HttpMethod, HttpResponse } from '@azure/functions';

type ResultMapper<T> = (result: T) => HttpResponse;

type FullRequestMappingOptions = {
    ResultMapper: ResultMapper<any>;
    methods: HttpMethod[];
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
    methods: [],
} as FullRequestMappingOptions;

/**
 * The {@link RequestMapping @RequestMapping} decorator marks a function inside a {@link RestController @RestController} as a http triggered function.
 *
 * The result from functions will be transformed into a {@link HttpResponse}.
 *
 * Errors thrown inside this function that are decorated with {@link HttpStatus @HttpStatus} will be transformed to their correct http error.
 * All other errors will be a 500 error.
 *
 * This decorator must be present for http related parameter decorators to work.
 * Supported parameter decorators are:
 *
 *      General:
 *        {@link Context @Context}
 *
 *      Http specific:
 *        {@link Request @Request}
 *        {@link PathParameter @PathParameter}
 *        {@link QueryParameter @QueryParameter}
 *        {@link RequestBody @RequestBody}
 *
 * @param path this function should react to. Default: '/'. Can include path (optional) parameters '/user/{userId?}'
 * @param options see {@link RequestMappingOptions}
 */
export function RequestMapping(path?: string, options?: RequestMappingOptions): MethodDecorator {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };

    const validPath = toValidPath(path);
    const parameters = parsePathWithParameters(validPath);

    return (target: object, propertyName: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        const controller = target.constructor.prototype;

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

        registerMapping(controller, pathWithParametersToRegex(validPath), mergedOptions.methods, descriptor.value);
    };
}

/**
 * GET only version of {@link RequestMapping @RequestMapping}
 */
export function GetMapping(path?: string, options?: Omit<RequestMappingOptions, 'methods'>): MethodDecorator {
    return RequestMapping(path, { ...options, methods: ['GET'] });
}

/**
 * POST only version of {@link RequestMapping @RequestMapping}
 */
export function PostMapping(path?: string, options?: Omit<RequestMappingOptions, 'methods'>): MethodDecorator {
    return RequestMapping(path, { ...options, methods: ['POST'] });
}

/**
 * DELETE only version of {@link RequestMapping @RequestMapping}
 */
export function DeleteMapping(path?: string, options?: Omit<RequestMappingOptions, 'methods'>): MethodDecorator {
    return RequestMapping(path, { ...options, methods: ['DELETE'] });
}

/**
 * HEAD only version of {@link RequestMapping @RequestMapping}
 */
export function HeadMapping(path?: string, options?: Omit<RequestMappingOptions, 'methods'>): MethodDecorator {
    return RequestMapping(path, { ...options, methods: ['HEAD'] });
}

/**
 * PATCH only version of {@link RequestMapping @RequestMapping}
 */
export function PatchMapping(path?: string, options?: Omit<RequestMappingOptions, 'methods'>): MethodDecorator {
    return RequestMapping(path, { ...options, methods: ['PATCH'] });
}

/**
 * PUT only version of {@link RequestMapping @RequestMapping}
 */
export function PutMapping(path?: string, options?: Omit<RequestMappingOptions, 'methods'>): MethodDecorator {
    return RequestMapping(path, { ...options, methods: ['PUT'] });
}

/**
 * OPTIONS only version of {@link RequestMapping @RequestMapping}
 */
export function OptionsMapping(path?: string, options?: Omit<RequestMappingOptions, 'methods'>): MethodDecorator {
    return RequestMapping(path, { ...options, methods: ['OPTIONS'] });
}

/**
 * TRACE only version of {@link RequestMapping @RequestMapping}
 */
export function TraceMapping(path?: string, options?: Omit<RequestMappingOptions, 'methods'>): MethodDecorator {
    return RequestMapping(path, { ...options, methods: ['TRACE'] });
}

/**
 * CONNECT only version of {@link RequestMapping @RequestMapping}
 */
export function ConnectMapping(path?: string, options?: Omit<RequestMappingOptions, 'methods'>): MethodDecorator {
    return RequestMapping(path, { ...options, methods: ['CONNECT'] });
}

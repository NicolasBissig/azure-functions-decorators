import { Context, HttpMethod, HttpResponse } from '@azure/functions';
import { extractPath, injectParameters, PathParameter, toValidPath } from './parameters';
import { constants } from 'http2';
import { isFunction, isHttpRequest } from './type-guards';

export type TestableRequestMapping = {
    methods: HttpMethod[];
    regex: RegExp;
    parameters: PathParameter[];
    func: (context: Context) => Promise<HttpResponse>;
};

type FullRestControllerOptions = {
    remainingPathVariableName: string;
};

type RestControllerOptions = Partial<FullRestControllerOptions>;

export const REMAINING_PATH = 'RemainingPath';

const defaultOptions = {
    remainingPathVariableName: REMAINING_PATH,
} satisfies FullRestControllerOptions;

const notFoundResponse: HttpResponse = {
    status: constants.HTTP_STATUS_NOT_FOUND,
    statusCode: constants.HTTP_STATUS_NOT_FOUND,
};

type Constructor = {
    // constructors are just this way, we need to allow any arguments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): object;
};

/**
 * The {@link RestController @RestController} decorator makes a class exportable as http function.
 * This decorator must be present for HTTP related decorators to work.
 *
 * Methods in this class can be decorated with {@link RequestMapping @RequestMapping} and alternatives like {@link GetMapping @GetMapping}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RestController(options?: RestControllerOptions): (c: Constructor) => any {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };

    return (constructor) => {
        return class extends constructor {
            public httpTrigger: (context: Context) => Promise<HttpResponse>;

            constructor(...args: unknown[]) {
                super(...args);
                this.httpTrigger = async (context: Context) => {
                    if (!context) return notFoundResponse;

                    if (!isHttpRequest(context.req) || context.req.method === null) {
                        return notFoundResponse;
                    }
                    const method = context.req.method;

                    const path = toValidPath(extractPath(context, mergedOptions.remainingPathVariableName));

                    const mappings = getMappings(constructor.prototype);
                    const filteredMappings = mappings
                        // only mappings with no explicit method, or where the requested method is included
                        .filter((m) => m.methods.length === 0 || m.methods.includes(method))
                        // only if the path matches
                        .filter((m) => m.regex.test(path));

                    if (filteredMappings.length === 0) {
                        console.error('could not find mapping for path: ' + path);
                        return notFoundResponse;
                    }

                    if (filteredMappings.length !== 1) {
                        console.warn('found multiple matching mappings for path: ' + path);
                        mappings.forEach((m) => {
                            console.warn(m.regex);
                        });
                    }

                    const mapping = filteredMappings[0];
                    injectParameters(context, mapping.parameters, mergedOptions.remainingPathVariableName);

                    return await mapping.func.apply(this, [context]);
                };
            }
        };
    };
}

const REQUEST_MAPPINGS = Symbol('requestMappings');

export function getMappings(controller: object): TestableRequestMapping[] {
    if (controller === undefined || controller === null) return [];

    return (Object.getOwnPropertyDescriptor(controller, REQUEST_MAPPINGS)?.value as TestableRequestMapping[]) || [];
}

export function registerMapping(
    controller: object,
    regex: RegExp,
    parameters: PathParameter[],
    methods: HttpMethod[],
    handler: (context: Context) => Promise<HttpResponse>
): void {
    if (controller === undefined || controller === null) return;

    const mappings = getMappings(controller);

    const mapping = {
        methods: methods,
        regex: regex,
        parameters: parameters,
        func: handler,
    } satisfies TestableRequestMapping;
    mappings.push(mapping);

    Object.defineProperty(controller, REQUEST_MAPPINGS, {
        value: mappings,
    });
}

/**
 * Easy way to export and test {@link RestController @RestController} decorated classes as azure functions.
 *
 * @example
 * ```ts
 * @RestController()
 * class Example {
 *     @RequestMapping()
 *     async health(): Promise<void> {
 *         return;
 *     }
 * }
 *
 * export default toAzureFunction(() => new Example());
 * ```
 *
 * @param creator {@link RestController @RestController} decorated class factory
 */
export function toAzureFunction<T extends object>(creator: () => T): (context: Context) => Promise<HttpResponse> {
    const controller = creator();

    if (!('httpTrigger' in controller) || !isFunction(controller.httpTrigger)) {
        throw new Error(
            'Provided RestController has no valid internal httpTrigger, have you decorated it with @RestController?'
        );
    }

    return (controller as { httpTrigger: (context: Context) => Promise<HttpResponse> }).httpTrigger.bind(controller);
}

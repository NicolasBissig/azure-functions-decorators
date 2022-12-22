import { Context, HttpMethod, HttpResponse } from '@azure/functions';
import { extractPath, toValidPath } from './parameters';
import { constants } from 'http2';
import { isFunction, isHttpRequest } from './type-guards';

export type TestableRequestMapping = {
    methods: HttpMethod[];
    regex: RegExp;
    func: (context: Context) => Promise<HttpResponse>;
};

const notFoundResponse: HttpResponse = {
    status: constants.HTTP_STATUS_NOT_FOUND,
    statusCode: constants.HTTP_STATUS_NOT_FOUND,
};

type Constructor = {
    new (...args: any[]): object;
};

export function RestController(): (c: Constructor) => any {
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

                    const path = toValidPath(extractPath(context));

                    const mappings = (constructor.prototype.requestMappings as TestableRequestMapping[]) || [];
                    const mapping = mappings
                        // only mappings with no explicit method, or where the requested method is included
                        .filter((m) => m.methods.length === 0 || m.methods.includes(method))
                        // only if the path matches
                        .filter((m) => m.regex.test(path));

                    if (mapping.length === 0) {
                        console.error('could not find mapping for path: ' + path);
                        return notFoundResponse;
                    }

                    if (mapping.length !== 1) {
                        console.warn('found multiple matching mappings for path: ' + path);
                        mappings.forEach((m) => {
                            console.warn(m.regex);
                        });
                    }

                    return await mapping[0].func.apply(this, [context]);
                };
            }
        };
    };
}

export function toAzureFunction<T extends object>(creator: () => T): (context: Context) => Promise<HttpResponse> {
    const controller = creator();

    if (!('httpTrigger' in controller) || !isFunction(controller.httpTrigger)) {
        throw new Error(
            'Provided RestController has no valid internal httpTrigger, have you decorated it with @RestController?'
        );
    }

    return (controller as { httpTrigger: (context: Context) => Promise<HttpResponse> }).httpTrigger.bind(controller);
}

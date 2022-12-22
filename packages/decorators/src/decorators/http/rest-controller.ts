import { Context, HttpMethod, HttpResponse } from '@azure/functions';
import { extractPath, toValidPath } from './parameters';
import { constants } from 'http2';
import { isFunction, isHttpRequest } from './type-guards';

type HasPrototype = {
    prototype: any;
    name: string;
};

export type TestableRequestMapping = {
    methods: HttpMethod[];
    regex: RegExp;
    func: (context: Context) => Promise<unknown>;
};

const notFoundResponse: HttpResponse = {
    status: constants.HTTP_STATUS_NOT_FOUND,
    statusCode: constants.HTTP_STATUS_NOT_FOUND,
};

export function RestController(): ClassDecorator {
    return <F extends HasPrototype>(target: F) => {
        const instance = target.prototype;

        instance.httpTrigger = async (context: Context) => {
            if (!context) return notFoundResponse;

            if (!isHttpRequest(context.req) || context.req.method === null) {
                return notFoundResponse;
            }
            const method = context.req.method;

            const path = toValidPath(extractPath(context));

            const mappings = (instance.requestMappings as TestableRequestMapping[]) || [];
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

            return await mapping[0].func.apply(instance, [context]);
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

    // we are sure that only HttpResponses can be returned.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return controller.httpTrigger.bind(controller);
}

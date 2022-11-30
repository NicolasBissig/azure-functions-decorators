import { Context, HttpRequest } from '@azure/functions';

const defaultHttpRequest: HttpRequest = ({
    method: 'GET',
} as unknown) as HttpRequest;

export function createHttpRequest(req?: Partial<HttpRequest>): HttpRequest {
    return { ...defaultHttpRequest, ...req };
}

const defaultContext: Context = ({
    req: defaultHttpRequest,
} as unknown) as Context;

export function createContext(context?: Partial<Context>): Context {
    return { ...defaultContext, ...context };
}

export function createContextWithHttpRequest(req: Partial<HttpRequest>): Context {
    const context = createContext();
    context.req = createHttpRequest(req);
    return context;
}

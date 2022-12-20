import { Context, HttpRequest, HttpResponse } from '@azure/functions';

export function isFunction(f: unknown): f is (...args: unknown[]) => unknown {
    return !!f && f instanceof Function;
}

export function isContext(c: unknown): c is Context {
    return !!c && typeof c === 'object' && 'req' in c;
}

export function isHttpRequest(req: unknown): req is HttpRequest {
    return !!req && typeof req === 'object' && 'method' in req;
}

export function isHttpResponse(resp: unknown): resp is HttpResponse {
    return (
        !!resp &&
        typeof resp === 'object' &&
        ('body' in resp || 'status' in resp || 'statusCode' in resp || 'headers' in resp)
    );
}

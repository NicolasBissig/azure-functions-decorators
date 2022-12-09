import { Context, HttpRequest } from '@azure/functions';

export function isFunction(f: any): f is Function {
    return !!f && f instanceof Function;
}

export function isContext(c: any): c is Context {
    return !!c && typeof c === 'object' && 'req' in c;
}

export function isHttpRequest(req: any): req is HttpRequest {
    return !!req && typeof req === 'object' && 'method' in req;
}

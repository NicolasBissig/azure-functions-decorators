import { Context } from '@azure/functions';

export function extractPath(context: Context, remainingPathParameter: string): string | undefined {
    const params = context?.req?.params;
    if (params === undefined) return undefined;
    return params[remainingPathParameter];
}

export function toValidPath(path: string | undefined): string {
    if (path === undefined || path === '') {
        return '/';
    }
    if (path.charAt(0) !== '/') {
        return '/' + path;
    }
    return path;
}

export type PathParameter = {
    index: number;
    name: string;
};

export function parsePathWithParameters(path: string): PathParameter[] {
    const segments = toValidPath(path).split('/');
    return segments
        .map((segment, index) => {
            return {
                index: index,
                value: segment,
            };
        })
        .filter((segment) => segment.value.startsWith('{') && segment.value.endsWith('}'))
        .map((segment) => {
            return {
                index: segment.index,
                name: segment.value.substring(1, segment.value.length - 1),
            };
        });
}

export function injectParameters(context: Context, parameters: PathParameter[], remainingPathParameter: string): void {
    const request = context.req;
    if (!request) return;
    const requestedPath = extractPath(context, remainingPathParameter);
    if (!requestedPath) return;

    const segmentValues = toValidPath(requestedPath).split('/');
    parameters.forEach((parameter) => {
        request.params[parameter.name] = segmentValues[parameter.index];
    });
}

export function pathWithParametersToRegex(path: string): RegExp {
    // replace all slashes with regex matching
    const replacedSlash = toValidPath(path).replace('/', '\\/');
    // all path parameters, {name}, are replaced with matcher that requires at least one character (+) until /
    const withParameters = replacedSlash.replaceAll(/{\w*}/gs, '[^\\/]+');
    // make sure string starts (^) and ends ($)
    return RegExp('^' + withParameters + '$');
}

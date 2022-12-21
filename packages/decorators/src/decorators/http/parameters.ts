import { Context } from '@azure/functions';

export const REMAINING_PATH = 'RemainingPath';

export function extractPath(context: Context, parameter?: string): string | undefined {
    return context?.req?.params[parameter || REMAINING_PATH];
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

type PathParameter = {
    index: number;
    name: string;
    optional: boolean;
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
                name: segment.value.substring(1, segment.value.length - 1).replace('?', ''),
                optional: segment.value.charAt(segment.value.length - 2) === '?',
            };
        });
}

export function injectParameters(context: Context, parameters: PathParameter[]): void {
    const request = context.req;
    if (!request) return;
    const requestedPath = extractPath(context);
    if (!requestedPath) return;

    const segmentValues = requestedPath.split('/');
    parameters.forEach((parameter) => {
        request.params[parameter.name] = segmentValues[parameter.index];
    });
}

export function pathWithParametersToRegex(path: string): RegExp {
    // replace all slashes with regex matching
    const replacedSlash = toValidPath(path).replace('/', '\\/');
    // all non-optional path parameters, {name}, are replaced with matcher that requires at least one character (+) until /
    const withParameters = replacedSlash.replaceAll(/{\w*}/gs, '[^\\/]+');
    // all optional path parameters, {name?}, are replaced with matcher that requires no characters (*) until /
    const optionalParameters = withParameters.replaceAll(/{\w*\?*}/gs, '[^\\/]*');
    // make sure string starts (^) and ends ($)
    return RegExp('^' + optionalParameters + '$');
}

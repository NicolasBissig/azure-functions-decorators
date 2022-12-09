import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameterWithValue } from '../reflection';

const PathParameterMetaDataKey = Symbol('PathParameter');
type PathParameterDescriptor = {
    index: number;
    name: string;
};

/**
 * The {@link PathParameter @PathParameter} decorator injects a path parameter value from the request into a parameter.
 * The type of the injected parameter should be {@link string}.
 * If the variable is not available undefined will be injected.
 * @param key of the path parameter value to inject.
 */
export function PathParameter(key: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const markedParameter = { index: parameterIndex, name: key };
        markParameterWithValue<PathParameterDescriptor>(target, propertyKey, PathParameterMetaDataKey, markedParameter);
    };
}

function findPathParameter(req: HttpRequest, parameter: string): string | undefined {
    const params = req?.params;
    if (!params) return undefined;
    const value = params[parameter];
    return value ? value : undefined;
}

export function handlePathParameter(target: Object, propertyName: string | symbol, req: HttpRequest, args: any[]) {
    applyToMarked<PathParameterDescriptor>(
        target,
        propertyName,
        PathParameterMetaDataKey,
        (parameter) => (args[parameter.index] = findPathParameter(req, parameter.name))
    );
}

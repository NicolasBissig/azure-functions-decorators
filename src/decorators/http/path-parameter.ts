import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameterWithValue } from '../reflection';

const PathParameterMetaDataKey = Symbol('PathParameter');
type PathParameterDescriptor = {
    index: number;
    name: string;
};

export function PathParameter(key: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const markedParameter = { index: parameterIndex, name: key };
        markParameterWithValue<PathParameterDescriptor>(target, propertyKey, PathParameterMetaDataKey, markedParameter);
    };
}

function findParameter(req: HttpRequest, parameter: string): string | undefined {
    const params = req.params;
    if (!params) return undefined;
    const value = params[parameter];
    return value ? value : undefined;
}

export function handlePathParameter(target: Object, propertyName: string | symbol, req: HttpRequest, args: any[]) {
    applyToMarked<PathParameterDescriptor>(
        target,
        propertyName,
        PathParameterMetaDataKey,
        parameter => (args[parameter.index] = findParameter(req, parameter.name))
    );
}

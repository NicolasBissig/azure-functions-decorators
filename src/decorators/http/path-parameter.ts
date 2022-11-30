import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameterWithValue } from '../reflection';

const PathParameterMetaDataKey = Symbol('PathParameter');
type PathParameterDescriptor = {
    index: number;
    name: string;
};

export function PathParameter(pathParameterName?: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const markedParameter = { index: parameterIndex, name: pathParameterName || propertyKey.toString() };
        markParameterWithValue<PathParameterDescriptor>(target, propertyKey, PathParameterMetaDataKey, markedParameter);
    };
}

export function handlePathParameter(target: Object, propertyName: string | symbol, req: HttpRequest, args: any[]) {
    applyToMarked<PathParameterDescriptor>(
        target,
        propertyName,
        PathParameterMetaDataKey,
        parameter => (args[parameter.index] = req.params[parameter.name])
    );
}

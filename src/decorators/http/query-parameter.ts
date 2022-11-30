import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameterWithValue } from '../reflection';

const QueryMetaDataKey = Symbol('QueryParameter');
type QueryDescriptor = {
    index: number;
    name: string;
};

export function QueryParameter(key: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const markedParameter = { index: parameterIndex, name: key };
        markParameterWithValue<QueryDescriptor>(target, propertyKey, QueryMetaDataKey, markedParameter);
    };
}

function findParameter(req: HttpRequest, parameter: string): string | undefined {
    const query = req.query;
    if (!query) return undefined;
    const value = query[parameter];
    return value ? value : undefined;
}

export function handleQueryParameters(target: Object, propertyName: string | symbol, req: HttpRequest, args: any[]) {
    applyToMarked<QueryDescriptor>(
        target,
        propertyName,
        QueryMetaDataKey,
        parameter => (args[parameter.index] = findParameter(req, parameter.name))
    );
}

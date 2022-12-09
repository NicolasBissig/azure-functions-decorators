import { HttpRequest } from '@azure/functions';
import { applyToMarked, markParameterWithValue } from '../reflection';

const QueryMetaDataKey = Symbol('QueryParameter');
type QueryDescriptor = {
    index: number;
    name: string;
};

/**
 * The {@link QueryParameter @QueryParameter} decorator injects a query parameter value from the request into a parameter.
 * The type of the injected parameter should be {@link string}.
 * If the variable is not available undefined will be injected.
 * @param key of the query parameter value to inject.
 */
export function QueryParameter(key: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const markedParameter = { index: parameterIndex, name: key };
        markParameterWithValue<QueryDescriptor>(target, propertyKey, QueryMetaDataKey, markedParameter);
    };
}

function findQueryParameter(req: HttpRequest, parameter: string): string | undefined {
    const query = req?.query;
    if (!query) return undefined;
    const value = query[parameter];
    return value ? value : undefined;
}

export function handleQueryParameters(target: Object, propertyName: string | symbol, req: HttpRequest, args: any[]) {
    applyToMarked<QueryDescriptor>(
        target,
        propertyName,
        QueryMetaDataKey,
        parameter => (args[parameter.index] = findQueryParameter(req, parameter.name))
    );
}

import 'reflect-metadata';
import { HttpRequest } from '@azure/functions';
import { markParameterWithValue } from '../reflection';

export const QueryMetaDataKey = Symbol('QueryParameter');
export type QueryDescriptor = {
    index: number;
    name: string;
};

export function QueryParameter(queryName?: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const markedParameter = { index: parameterIndex, name: queryName || propertyKey.toString() };
        markParameterWithValue<QueryDescriptor>(target, propertyKey, QueryMetaDataKey, markedParameter);
    };
}

export function handleQueryParameters(target: Object, propertyName: string | symbol, req: HttpRequest, args: any[]) {
    let queryParameters: QueryDescriptor[] = Reflect.getOwnMetadata(QueryMetaDataKey, target, propertyName);

    if (queryParameters) {
        for (let parameter of queryParameters) {
            args[parameter.index] = req.query[parameter.name];
        }
    }
}

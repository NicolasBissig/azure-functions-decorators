import 'reflect-metadata';
import { HttpRequest } from '@azure/functions';

export const QueryMetaDataKey = Symbol('QueryParameter');
export type QueryDescriptor = {
    index: number;
    name: string;
};

export function QueryParameter(queryName?: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        let existingQueryParameters: QueryDescriptor[] =
            Reflect.getOwnMetadata(QueryMetaDataKey, target, propertyKey) || [];
        existingQueryParameters.push({ index: parameterIndex, name: queryName || propertyKey.toString() });
        Reflect.defineMetadata(QueryMetaDataKey, existingQueryParameters, target, propertyKey);
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

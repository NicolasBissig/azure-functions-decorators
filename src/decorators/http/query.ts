import 'reflect-metadata';

export const QueryMetaDataKey = Symbol('Query');
export type QueryDescriptor = {
    index: number;
    name: string;
};

export function Query(queryName?: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        let existingQueryParameters: QueryDescriptor[] =
            Reflect.getOwnMetadata(QueryMetaDataKey, target, propertyKey) || [];
        existingQueryParameters.push({ index: parameterIndex, name: queryName || propertyKey.toString() });
        Reflect.defineMetadata(QueryMetaDataKey, existingQueryParameters, target, propertyKey);
    };
}

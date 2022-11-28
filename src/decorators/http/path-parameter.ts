import 'reflect-metadata';

export const PathParameterMetaDataKey = Symbol('PathParameter');
export type PathParameterDescriptor = {
    index: number;
    name: string;
};

export function PathParameter(pathParameterName?: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        let existingQueryParameters: PathParameterDescriptor[] =
            Reflect.getOwnMetadata(PathParameterMetaDataKey, target, propertyKey) || [];
        existingQueryParameters.push({ index: parameterIndex, name: pathParameterName || propertyKey.toString() });
        Reflect.defineMetadata(PathParameterMetaDataKey, existingQueryParameters, target, propertyKey);
    };
}

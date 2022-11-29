import 'reflect-metadata';
import { HttpRequest } from '@azure/functions';

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

export function handlePathParameter(target: Object, propertyName: string | symbol, req: HttpRequest, args: any[]) {
    let pathParameters: PathParameterDescriptor[] = Reflect.getOwnMetadata(
        PathParameterMetaDataKey,
        target,
        propertyName
    );
    if (pathParameters) {
        for (let parameter of pathParameters) {
            args[parameter.index] = req.params[parameter.name];
        }
    }
}

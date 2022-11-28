import 'reflect-metadata';

export const BodyMetaDataKey = Symbol('Body');

export function Body(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    let existingRequiredParameters: number[] = Reflect.getOwnMetadata(BodyMetaDataKey, target, propertyKey) || [];
    existingRequiredParameters.push(parameterIndex);
    Reflect.defineMetadata(BodyMetaDataKey, existingRequiredParameters, target, propertyKey);
}

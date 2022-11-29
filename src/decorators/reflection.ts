export function markParameter(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
    key: symbol
): number[] {
    let alreadyMarkedParameters: number[] = Reflect.getOwnMetadata(key, target, propertyKey) || [];
    alreadyMarkedParameters.push(parameterIndex);
    Reflect.defineMetadata(key, alreadyMarkedParameters, target, propertyKey);

    return alreadyMarkedParameters;
}

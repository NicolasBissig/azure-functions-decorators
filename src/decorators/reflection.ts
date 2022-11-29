export function markParameterWithValue<T>(target: Object, propertyKey: string | symbol, key: symbol, value: T): T[] {
    let alreadyMarkedParameters: T[] = Reflect.getOwnMetadata(key, target, propertyKey) || [];
    alreadyMarkedParameters.push(value);
    Reflect.defineMetadata(key, alreadyMarkedParameters, target, propertyKey);

    return alreadyMarkedParameters;
}

export function markParameter(
    target: Object,
    propertyKey: string | symbol,
    key: symbol,
    parameterIndex: number
): number[] {
    return markParameterWithValue<number>(target, propertyKey, key, parameterIndex);
}

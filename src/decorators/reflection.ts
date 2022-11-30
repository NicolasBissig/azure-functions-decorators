import 'reflect-metadata';

export function markParameterWithValue<T>(
    target: Object,
    propertyKey: string | symbol,
    key: symbol,
    value: T,
    maxMarked?: number
): T[] {
    const markedParameters: T[] = Reflect.getOwnMetadata(key, target, propertyKey) || [];
    markedParameters.push(value);
    if (maxMarked && markedParameters.length > maxMarked) {
        throw new Error(
            `only ${maxMarked} @${key.description} parameter(s) per method is allowed, got ${
                markedParameters.length
            } on ${String(propertyKey)}`
        );
    }
    Reflect.defineMetadata(key, markedParameters, target, propertyKey);

    return markedParameters;
}

export function markParameter(
    target: Object,
    propertyKey: string | symbol,
    key: symbol,
    parameterIndex: number,
    maxMarked?: number
): number[] {
    return markParameterWithValue<number>(target, propertyKey, key, parameterIndex, maxMarked);
}

export function applyToMarked<T>(
    target: Object,
    propertyName: string | symbol,
    key: symbol,
    handler: (parameter: T) => any
) {
    const markedParameters: T[] = Reflect.getOwnMetadata(key, target, propertyName);
    if (markedParameters) {
        for (const parameter of markedParameters) {
            handler(parameter);
        }
    }
}

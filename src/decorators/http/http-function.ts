import 'reflect-metadata';
import { Context } from '@azure/functions';
import { BodyMetaDataKey } from './body';
import { QueryDescriptor, QueryMetaDataKey } from './query';

export function HttpFunction(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;

    descriptor.value = function(...args: any[]) {
        const context: Context = args[0];
        const req = context.req;

        let bodyParameter: number[] = Reflect.getOwnMetadata(BodyMetaDataKey, target, propertyName);
        if (bodyParameter) {
            if (bodyParameter.length !== 1) {
                throw new Error('only one @Body parameter is allowed');
            }

            const paramIndex = bodyParameter[0];
            args[paramIndex] = JSON.parse(req.rawBody);
        }
        let queryParameters: QueryDescriptor[] = Reflect.getOwnMetadata(QueryMetaDataKey, target, propertyName);

        if (queryParameters) {
            for (let parameter of queryParameters) {
                args[parameter.index] = req.query[parameter.name];
            }
        }

        return method.apply(this, args);
    };
}

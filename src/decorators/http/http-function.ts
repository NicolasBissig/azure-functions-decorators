import 'reflect-metadata';
import { Context } from '@azure/functions';
import { BodyMetaDataKey } from './request-body';
import { QueryDescriptor, QueryMetaDataKey } from './query-parameter';
import { PathParameterDescriptor, PathParameterMetaDataKey } from './path-parameter';

export function HttpFunction(): MethodDecorator {
    return (target: any, propertyName: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        let method: Function = descriptor.value!;

        descriptor.value = function(...args: any[]) {
            const context: Context = args[0];
            const req = context.req!;

            let bodyParameter: number[] = Reflect.getOwnMetadata(BodyMetaDataKey, target, propertyName);
            if (bodyParameter) {
                if (bodyParameter.length !== 1) {
                    throw new Error('only one @RequestBody parameter is allowed');
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

            return method.apply(this, args);
        };
    };
}

import 'reflect-metadata';
import { handleRequestBodyParameter } from './request-body';
import { handleQueryParameters } from './query-parameter';
import { handlePathParameter } from './path-parameter';
import { isContext, isFunction, isHttpRequest } from './type-guards';
import { handleContextParameter } from '../context';

export function HttpFunction(): MethodDecorator {
    return (target: Object, propertyName: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        const method = descriptor?.value;
        if (!isFunction(method)) {
            throw new Error('@HttpFunction can only be applied to functions');
        }

        descriptor.value = function(...args: any[]) {
            if (!args || args.length === 0) {
                throw new Error(`@HttpFunction annotated method ${propertyName.toString()} was provided no arguments`);
            }
            const context = args[0];
            if (!isContext(context)) {
                throw new Error(
                    `@HttpFunction annotated method ${propertyName.toString()} was not provided a Context as first argument`
                );
            }

            const req = context.req;
            if (!isHttpRequest(req)) {
                throw new Error(
                    `@HttpFunction annotated method ${propertyName.toString()} was provided a context without or invalid http request`
                );
            }

            handleContextParameter(target, propertyName, context, args);
            handleRequestBodyParameter(target, propertyName, req, args);
            handleQueryParameters(target, propertyName, req, args);
            handlePathParameter(target, propertyName, req, args);

            return method.apply(this, args);
        };
    };
}

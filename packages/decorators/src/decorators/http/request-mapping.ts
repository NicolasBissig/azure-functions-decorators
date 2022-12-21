import { isContext, isFunction, isHttpRequest } from './type-guards';
import { handleContextParameter } from '../context';
import { handleRequestParameter } from './http-request';
import { handleRequestBodyParameter } from './request-body';
import { handleQueryParameters } from './query-parameter';
import { handlePathParameter } from './path-parameter';
import { handleError } from './http-status';
import { injectParameters, parsePathWithParameters, pathWithParametersToRegex, toValidPath } from './parameters';
import { RequestMapping } from './rest-controller';
import { defaultOptions, HttpFunctionOptions } from './http-function';

export function RequestMapping(path?: string, options?: HttpFunctionOptions): MethodDecorator {
    const mergedOptions = {
        ...defaultOptions,
        ...options,
    };

    const validPath = toValidPath(path);
    const parameters = parsePathWithParameters(validPath);

    return (target: object, propertyName: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        // @HttpFunction stuff
        const method = descriptor?.value;
        if (!isFunction(method)) {
            throw new Error('@RequestMapping can only be applied to functions');
        }

        descriptor.value = async function (...args: unknown[]) {
            if (!args || args.length === 0) {
                throw new Error(`@GetMapping annotated method ${propertyName.toString()} was provided no arguments`);
            }
            const context = args[0];
            if (!isContext(context)) {
                throw new Error(
                    `@GetMapping annotated method ${propertyName.toString()} was not provided a Context as first argument`
                );
            }

            const req = context.req;
            if (!isHttpRequest(req)) {
                throw new Error(
                    `@GetMapping annotated method ${propertyName.toString()} was provided a context without or invalid http request`
                );
            }

            // inject extra path parameters
            injectParameters(context, parameters);
            // done

            handleContextParameter(target, propertyName, context, args);
            handleRequestParameter(target, propertyName, req, args);
            handleRequestBodyParameter(target, propertyName, req, args);
            handleQueryParameters(target, propertyName, req, args);
            handlePathParameter(target, propertyName, req, args);

            try {
                const result = await method.apply(this, args);
                return mergedOptions.ResultMapper(result);
            } catch (e) {
                return handleError(e);
            }
        };

        // @RequestMapping
        const controller = target.constructor.prototype;
        const mappings = (controller.requestMappings as RequestMapping[]) || [];

        const regex = pathWithParametersToRegex(validPath);

        mappings.push({
            methods: [],
            regex: regex,
            func: descriptor.value,
        });

        Object.defineProperty(controller, 'requestMappings', {
            value: mappings,
        });
    };
}

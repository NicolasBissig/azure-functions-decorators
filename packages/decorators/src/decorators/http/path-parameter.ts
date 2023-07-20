import { createParameterDecoratorWithOptions } from '../create-parameter-decorator';

/**
 * The {@link PathParameter @PathParameter} decorator injects a path parameter value from the request into a parameter.
 * The type of the injected parameter should be {@link string}.
 * If the variable is not available undefined will be injected.
 * @param key of the path parameter value to inject.
 */
export const PathParameter = createParameterDecoratorWithOptions({
    symbol: 'PathParameter',
    injector: (context, key: string) => context?.req?.params?.[key],
});

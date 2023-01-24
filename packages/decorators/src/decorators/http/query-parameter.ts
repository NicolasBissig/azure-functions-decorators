import { createParameterDecoratorWithOptions } from '../create-parameter-decorator';

/**
 * The {@link QueryParameter @QueryParameter} decorator injects a query parameter value from the request into a parameter.
 * The type of the injected parameter should be {@link string}.
 * If the variable is not available undefined will be injected.
 * @param key of the query parameter value to inject.
 */
export const QueryParameter = createParameterDecoratorWithOptions({
    symbol: 'QueryParameter',
    injector: (context, key: string) => context?.req?.query?.[key],
});

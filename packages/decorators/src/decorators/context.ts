import { createParameterDecorator } from './create-parameter-decorator';

/**
 * The {@link Context @Context} decorator injects the azure context into a parameter.
 * The type of the injected parameter should be {@link Context} from '@azure/functions'.
 */
export const Context = createParameterDecorator({
    symbol: 'Context',
    injector: (context) => context,
    maxParameters: 1,
});

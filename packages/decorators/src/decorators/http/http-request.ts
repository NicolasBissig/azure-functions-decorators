import { createParameterDecorator } from '../create-parameter-decorator';

/**
 * The {@link Request @Request} decorator injects the {@link HttpRequest} from the context.
 * The injected parameter should be of type {@link HttpRequest}.
 */
export const Request = createParameterDecorator({
    symbol: 'Request',
    injector: (context) => context.req,
    maxParameters: 1,
});

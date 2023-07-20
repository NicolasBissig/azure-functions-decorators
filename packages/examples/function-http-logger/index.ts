import {
    Context,
    createParameterDecorator,
    RequestMapping,
    RestController,
    toAzureFunction,
} from 'azure-functions-decorators';
import { Context as AzureContext, Logger as AzureLogger } from '@azure/functions';

const Logger = createParameterDecorator({
    symbol: 'Logger',
    injector: (context) => context.log,
    maxParameters: 1,
});

@RestController()
class Example {
    @RequestMapping()
    async customError(@Context() ctx: AzureContext, @Logger() logger: AzureLogger): Promise<void> {
        logger.info('The logger is working');
    }
}

export default toAzureFunction(() => new Example());

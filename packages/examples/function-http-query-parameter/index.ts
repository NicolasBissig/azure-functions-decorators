import { toAzureFunction, QueryParameter, RequestMapping, RestController } from 'azure-functions-decorators';

@RestController()
class Example {
    @RequestMapping()
    async queryParameterEcho(@QueryParameter('page') page: string): Promise<string> {
        return page;
    }
}

export default toAzureFunction(() => new Example());

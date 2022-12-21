import { exportableRestController, QueryParameter, RequestMapping, RestController } from 'azure-functions-decorators';

@RestController()
class Example {
    @RequestMapping()
    async queryParameterEcho(@QueryParameter('page') page: string): Promise<string> {
        return page;
    }
}

export default exportableRestController(() => new Example());

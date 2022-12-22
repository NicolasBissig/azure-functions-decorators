import { PathParameter, RequestMapping, RestController, toAzureFunction } from 'azure-functions-decorators';

@RestController()
class Example {
    @RequestMapping('/{parameter?}')
    async pathParameterEcho(@PathParameter('parameter') parameter: string): Promise<string> {
        return parameter;
    }
}

export default toAzureFunction(() => new Example());

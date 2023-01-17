import { toAzureFunction, RequestMapping, RestController } from 'azure-functions-decorators';

@RestController()
class Example {
    @RequestMapping()
    async health(): Promise<void> {
        return;
    }
}

export default toAzureFunction(() => new Example());

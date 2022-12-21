import { HttpFunction, RequestMapping, RestController, exportableRestController } from 'azure-functions-decorators';

@RestController()
class Example {
    @RequestMapping()
    async health(): Promise<void> {
        return;
    }
}

export default exportableRestController(() => new Example());

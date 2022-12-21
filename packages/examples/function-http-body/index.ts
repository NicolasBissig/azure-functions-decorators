import { exportableRestController, RequestBody, RequestMapping, RestController } from 'azure-functions-decorators';

@RestController()
class Example {
    @RequestMapping()
    async echoBody(@RequestBody() body: unknown): Promise<unknown> {
        return body;
    }
}

export default exportableRestController(() => new Example());

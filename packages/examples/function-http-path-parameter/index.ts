import {
    Context,
    exportableRestController,
    PathParameter,
    RequestMapping,
    RestController,
} from 'azure-functions-decorators';

@RestController()
class Example {
    @RequestMapping('/{parameter?}')
    async pathParameterEcho(
        @Context() context: unknown,
        @PathParameter('parameter') parameter: string
    ): Promise<string> {
        console.log(context);
        return parameter;
    }
}

export default exportableRestController(() => new Example());

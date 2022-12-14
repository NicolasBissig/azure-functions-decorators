# Azure functions decorators

Spring / NestJS like decorators for your Azure functions.

⚠️Under heavy development, unstable! ⚠️

## Install

```shell
npm i azure-functions-decorators
```

add

```json
"experimentalDecorators": true
```

to your `tsconfig.json`

## Example

```ts
class FunctionApp {
    @HttpFunction()
    static async httpTrigger(@QueryParameter('name') name: string): Promise<string> {
        return `Hello, ${name}`;
    }
}
```
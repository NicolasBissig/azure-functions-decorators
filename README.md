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

## Releasing

First, update the [CHANGELOG](./CHANGELOG.md). Then run these commands.

```shell
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
git push --tags
```

Github Actions will publish a new release to the npm registry and create a new release on Github.

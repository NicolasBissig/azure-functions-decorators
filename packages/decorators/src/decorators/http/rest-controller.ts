//const RestControllerPrototypeProperty = Symbol('_RestController');

import { Context, HttpMethod } from '@azure/functions';
import { extractPath, toValidPath } from './parameters';

type HasPrototype = {
    prototype: any;
    name: string;
};

export type RequestMapping = {
    methods: HttpMethod[];
    regex: RegExp;
    func: (context: Context) => Promise<unknown>;
};

export function RestController(): ClassDecorator {
    return <F extends HasPrototype>(target: F) => {
        const instance = target.prototype;

        instance.httpTrigger = async (context: Context) => {
            const path = toValidPath(extractPath(context));

            const mappings = (instance.requestMappings as RequestMapping[]) || [];
            const mapping = mappings.filter((m) => m.regex.test(path));

            if (mapping.length === 0) {
                console.error('could not find mapping for path: ' + path);
            }

            if (mapping.length !== 1) {
                console.warn('found multiple matching mappings for path: ' + path);
                mappings.forEach((m) => {
                    console.warn(m.regex);
                });
            }

            return await mapping[0].func(context);
        };
    };
}

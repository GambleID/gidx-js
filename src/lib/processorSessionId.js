import "core-js/stable"; 
import { loadScript } from './util.js';
import { options as gidxOptions } from './index.js'
import finixFactory from './processorSessionId-finix.js';

/**
 * @module gidx-js
 * @typicalname GIDX
 */

let handler = null;
let handlerFactories = {
    finix: finixFactory
}

export function init(options) {
    let factory = handlerFactories[options.name.toLowerCase()];
    if (!factory) {
        let handlerNames = Object.keys(handlerFactories).join(', ');
        throw new Error(`Unable to find handler for ${options.name}. Available handlers: ${handlerNames}.`)
    }

    handler = factory(options);
}

export function getProcessorSessionId() {
    return handler?.getProcessorSessionId();
}
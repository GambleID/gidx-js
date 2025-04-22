import "core-js/stable"; 
import "./index.css";

/**
 * @module gidx-js
 * @typicalname GIDX
 */

export let options = {
    merchantId: '',
    environment: 'sandbox'
};

export function init(o) {
    options = { ...options, ...o };
}

export * from './rapid.js';
export * from './tokenization.js';
import "core-js/stable"; 
import { init as initProcessorSessionId, getProcessorSessionId } from "./processorSessionId.js";
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

    if (options.processorSessionId) {
        initProcessorSessionId(options.processorSessionId);
    }
}

export * from './3ds.js';
export { showPaymentMethodForm, showApplePayButton, showGooglePayButton, showAeroPayButton } from './tokenization.js';
export { getProcessorSessionId };
import { loadScript } from './util.js';
import { options as gidxOptions } from './index.js';
import { sendPaymentMethodRequest } from './tokenization.js';


class AeroPay {
    constructor(elementId, options) {
        this.init(elementId, options);
    }

    init(elementId, options) {
        
    }
}

export default function (type, elementId, options) {
    return new AeroPay(elementId, options);
}

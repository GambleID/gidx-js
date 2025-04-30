import { loadScript } from './util.js';
import { options as gidxOptions } from './index.js'

let defaultSandboxOptions = {
    merchantId: 'MU4cihj5vQnQ1x8zxmE5jG4G' //GambleID's Finix Sandbox Merchant ID
}

class Finix {
    constructor(options) {
        var self = this;
        if (!window.Finix) {
            loadScript('https://js.finix.com/v/1/finix.js').then(() => self.init(options));
        }
        else {
            self.init(options);
        }
    }

    init(options) {
        //Default environment is provided by gidxOptions, but let merchant override.
        let environment = options.environment || gidxOptions.environment;
        //Finix's production environment is called live.
        if (environment == "production") {
            environment = "live";
        }

        //Only use default options if it's sandbox. We want to force the merchant to pass their production Finix Merchant ID.
        if (environment == "sandbox") {
            options = { ...defaultSandboxOptions, ...options };
        }

        if (!options.merchantId) {
            throw new Error("You must provide a Finix merchantId to use Finix's processorSessionId.")
        }

        this.finixAuth = window.Finix.Auth(environment, options.merchantId);
    }

    getProcessorSessionId() {
        return this.finixAuth.getSessionKey();
    }
}

export default function (options) {
    return new Finix(options);
}

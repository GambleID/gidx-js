import { loadScript } from './util.js';
import { options as gidxOptions } from './index.js';
import { sendPaymentMethodRequest } from './tokenization.js';
import buttonHTML from './aeropay-button.html';

const defaultOptions = {
    aeroSyncOptions: {
        iframeTitle: 'Connect',
        theme: 'light'
    }
};

class AeroPay {
    constructor(elementId, options) {
        var self = this;
        if (!window.aerosync) {
            loadScript('https://cdn.sync.aero.inc/1.1.3/aerosync-widget.js').then(() => self.init(elementId, options));
        }
        else {
            self.init(elementId, options);
        }
    }

    init(elementId, options) {
        document.getElementById(elementId).innerHTML = buttonHTML;
    }

    resendCode() {

    }

    enterCode(code) {

    }


}

export default function (type, elementId, options) {
    return new AeroPay(elementId, options);
}

/*
showAeroPayButton
 - Events
    - onCodeSent? 
    - onUserCreated (after successful first-time user and successful code confirmation)
    - onSaved (after AeroSync)
 - Phone Number
 - Email
 - AeroSync Options

showPaymentMethodForm for just AeroSync?

AeroPay class
 - resendCode
 - enterCode
 - launch (for manually launching without button)
*/
import { loadScript } from './util.js';
import { options as gidxOptions } from './index.js';
import { sendPaymentMethodRequest } from './tokenization.js';

const buttonHTML = `
    <div style="position: relative; width: min-content; height: min-content;">
        <button type="button" style="position: relative; box-sizing: border-box; width: auto; height: auto; border-radius: 10px; background: linear-gradient(225deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%); border: 1px solid rgb(255, 255, 255); display: grid; grid-template: &quot;. logo .&quot; / 25px 145px 25px; gap: 0px; place-items: center; cursor: pointer;">
        <img width="145" height="30" src="https://vendor.aeropay.com/AERO/legacy/AP-Logo-Landscape-White.svg" alt="AeroPay logo" style="grid-area: logo; width: 145px; height: 30px; user-select: none; margin: 12px 0px;">
        </button>
    </div>`;

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
*/
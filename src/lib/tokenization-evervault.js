import { loadScript } from './util.js';
import { sendPaymentMethodRequest } from './tokenization.js';


class Evervault {
    constructor(elementId, options) {
        let self = this;
        if (!window.Evervault) {
            loadScript('https://js.evervault.com/v2').then(() => self.init(elementId, options));
        }
        else {
            self.init(elementId, options);
        }
    }

    init(elementId, options) {
        let evervault = new window.Evervault(options.tokenizer.teamid, options.tokenizer.appid);
        let card = evervault.ui.card(options)
        card.mount('#' + elementId);
        this.card = card;
    }

    submit() {
        //Evervault provides isComplete and isValid booleans. If either are false, don't continue.
        if (!this.card.values.isComplete || !this.card.values.isValid)
            return;

        let paymentMethod = {
            type: 'CC',
            processorToken: {
                processor: 'Evervault',

                //Send the full Evervault object as a JSON string to GIDX.
                //This will give us the encrypted card number and cvv, along with the bin and last 4.
                token: JSON.stringify(this.card.values)
            }
        };
        sendPaymentMethodRequest(this, paymentMethod);
    }
}

export default function (elementId, options) {
    return new Evervault(elementId, options);
}

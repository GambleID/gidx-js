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

        if (typeof options.theme === 'string' && typeof evervault.ui.themes[options.theme] === "function")
            options.theme = evervault.ui.themes[options.theme]()

        if (options.cvvOnly)
            options.fields = ['cvc'];

        let card = evervault.ui.card(options)
        card.mount('#' + elementId);
        this.card = card;
    }

    submit() {
        //Don't send PaymentMethod request if just collecting a CVV.
        if (this.options.cvvOnly)
            return;

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

    getCvv() {
        return this.card.values.card.cvc;
    }
}

export default function (elementId, options) {
    return new Evervault(elementId, options);
}

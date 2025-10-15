import { loadScript } from './util.js';
import { sendPaymentMethodRequest } from './tokenization.js';

let evervaultCache = {};

class EvervaultBase {
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
        this.evervault = evervaultCache[options.tokenizer.appid];
        if (!this.evervault) {
            this.evervault = new window.Evervault(options.tokenizer.teamid, options.tokenizer.appid);
            evervaultCache[options.tokenizer.appid] = this.evervault;
        }
    }
}

class EvervaultForm extends EvervaultBase {

    init(elementId, options) {
        super.init(elementId, options);

        if (typeof options.theme === 'string' && typeof this.evervault.ui.themes[options.theme] === "function")
            options.theme = this.evervault.ui.themes[options.theme]()

        if (options.cvvOnly)
            options.fields = ['cvc'];

        if (options.tokenizer.acceptedbrands && !options.acceptedBrands)
            options.acceptedBrands = options.tokenizer.acceptedbrands

        let card = this.evervault.ui.card(options);

        if (options.onLoad) {
            card.on('ready', options.onLoad);
        }

        if (options.onUpdate) {
            card.on('change', options.onUpdate);
        }

        card.mount('#' + elementId);
        this.card = card;
    }

    submit() {
        //Don't send PaymentMethod request if just collecting a CVV.
        if (this.options.cvvOnly)
            return;

        if (!this.card.values.isComplete)
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

class EvervaultButton extends EvervaultBase {

}

export default function (type, elementId, options) {
    if (type == 'applePay' || type == 'googlePay')
        return new EvervaultButton(elementId, options);
    return new EvervaultForm(elementId, options);
}

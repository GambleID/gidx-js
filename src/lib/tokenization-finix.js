import { loadScript } from './util.js';
import { options as gidxOptions } from './index.js';
import { sendPaymentMethodRequest } from './tokenization.js';


class Finix {
    constructor(elementId, options) {
        var self = this;
        if (!window.Finix) {
            loadScript('https://js.finix.com/v/1/finix.js').then(() => self.init(elementId, options));
        }
        else {
            self.init(elementId, options);
        }
    }

    init(elementId, options) {
        //Passing Finix the onSubmit option will show their submit button. If showSubmitButton is false, merchant will need to manually call submit.
        if (options.showSubmitButton) {
            options.onSubmit = this.submit.bind(this);
        };

        let finixForm = window.Finix.TokenForm;

        if (options.paymentMethodTypes.length == 1) {
            if (options.paymentMethodTypes[0] == 'CC') {
                finixForm = window.Finix.CardTokenForm;
            }
            else if (options.paymentMethodTypes[0] == 'ACH') {
                finixForm = window.Finix.BankTokenForm;
            }
        }

        this.finixForm = finixForm.call(window.Finix, elementId, options);
    }

    submit() {
        let self = this;
        let options = self.options;
        let finixEnvironment = gidxOptions.environment == "production" ? "live" : "sandbox";
        this.finixForm.submit(finixEnvironment, options.tokenizer.applicationid, async function (err, res) {
            if (!res.data?.id)
                options.onError(res || err, null);

            let paymentMethod = {
                type: res.data.instrument_type == 'BANK_ACCOUNT' ? 'ACH' : 'CC',
                processorToken: {
                    processor: 'Finix',
                    token: res.data.id
                }
            };
            sendPaymentMethodRequest(self, paymentMethod);
        });
    }

    getCvv() {
        //getCvv method was added for Evervault, but won't be supported by Finix.
        return null;
    }
}

class FinixV2 {
    constructor(elementId, options) {
        var self = this;
        if (!window.Finix?.PaymentForm) {
            //If Finix v1 exists on the page, remove it. Finix v2 won't overwrite the window.Finix variable, so we need to remove it first.
            window.Finix = null;
            loadScript('https://js.finix.com/v/2/finix.js').then(() => self.init(elementId, options));
        }
        else {
            self.init(elementId, options);
        }
    }

    init(elementId, options) {
        //Passing Finix the onSubmit option will show their submit button. If showSubmitButton is false, merchant will need to manually call submit.
        if (options.showSubmitButton) {
            options.onSubmit = this.onSubmit.bind(this);
        };

        let finixEnvironment = gidxOptions.environment == "production" ? "prod" : "sandbox";

        //Map our paymentMethodTypes (CC, ACH) to Finix's paymentMethods (card, bank)
        if (!options.paymentMethods) {
            options.paymentMethods = options.paymentMethodTypes.map(i => i == 'ACH' ? 'bank' : 'card');
        }

        this.finixForm = window.Finix.PaymentForm(elementId, finixEnvironment, options.tokenizer.applicationid, options);
    }

    submit() {
        this.finixForm.submit(this.onSubmit.bind(this));
    }

    async onSubmit(err, res) {
        let self = this;
        let options = self.options;

        if (!res.data?.id)
            options.onError(res || err, null);

        let paymentMethod = {
            type: res.data.instrument_type == 'PAYMENT_CARD' ? 'CC' : 'ACH',
            processorToken: {
                processor: 'Finix',
                token: res.data.id
            }
        };
        sendPaymentMethodRequest(self, paymentMethod);
    }

    getCvv() {
        //getCvv method was added for Evervault, but won't be supported by Finix.
        return null;
    }
}

export default function (type, elementId, options) {
    //If merchant has manually included Finix v1 on page, use it. Otherwise, default to v2.
    if (window.Finix?.TokenForm)
        return new Finix(elementId, options);
    return new FinixV2(elementId, options);
}

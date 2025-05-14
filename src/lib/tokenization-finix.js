import { loadScript } from './util.js';
import { options as gidxOptions } from './index.js'


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
        var options = this.options;
        let finixEnvironment = gidxOptions.environment == "production" ? "live" : "sandbox";
        this.finixForm.submit(finixEnvironment, options.tokenizer.applicationid, async function (err, res) {
            if (!res.data?.id)
                options.onError(res || err, null);

            let request = {
                merchantId: gidxOptions.merchantId,
                merchantSessionId: options.merchantSessionId,
                paymentMethod: {
                    type: res.data.instrument_type == 'BANK_ACCOUNT' ? 'ACH' : 'CC',
                    processorToken: {
                        processor: 'Finix',
                        token: res.data.id
                    }
                },
                savePaymentMethod: options.savePaymentMethod
            };

            options.onSaving(request);

            let response = await fetch(options.endpoint, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(request)
            })
            if (!response.ok)
                options.onError(null, response);

            let responseData = await response.json();
            if (responseData.ResponseCode === 0)
                options.onSaved(responseData.PaymentMethod);
            else
                options.onError(null, responseData);
        });
    }
}

export default function (elementId, options) {
    return new Finix(elementId, options);
}

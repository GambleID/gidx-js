import "core-js/stable"; 
import { options as gidxOptions }  from './index.js'

const endpoint = {
    sandbox: 'https://api.gidx-service.in/v3.0/api/DirectCashier/PaymentMethod',
    production: 'https://api.gidx-service.com/v3.0/api/DirectCashier/PaymentMethod'
}

const defaultOptions = {
    paymentMethodTypes: ['CC', 'ACH'],
    savePaymentMethod: true,
    tokenizer: {
        name: 'Finix',
        applicationId: null
    },
    merchantSessionId: null,
    showSubmitButton: true,
    onLoad: () => { },
    onUpdate: () => { },
    onTokenized: () => { },
    onError: () => { }
};

export function showPaymentMethodForm(elementId, options) {
    options = { ...defaultOptions, ...options };

    if (typeof (options.paymentMethodTypes) === 'string')
        options.paymentMethodTypes = [options.paymentMethodTypes];

    let result = {
        options
    };
    result.submit = submit.bind(result);

    if (options.showSubmitButton) {
        options.onSubmit = result.submit
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

    result.finixForm = finixForm.call(window.Finix, elementId, options);

    return result;
}

function submit() {
    var options = this.options;
    let finixEnvironment = gidxOptions.environment == "production" ? "live" : "sandbox";
    this.finixForm.submit(finixEnvironment, options.tokenizer.applicationId, async function (err, res) {
        if (!res.data?.id)
            options.onError(res || err);

        let request = {
            merchantId: gidxOptions.merchantId,
            merchantSessionId: options.merchantSessionId,
            paymentMethod: {
                type: res.data.instrument_type == 'BANK_ACCOUNT' ? 'ACH' : 'CC',
                processorToken: {
                    processor: 'Finix',
                    token: res.data.id,
                    fingerprint: res.data.fingerprint
                }
            },
            savePaymentMethod: options.savePaymentMethod
        };

        let response = await fetch(endpoint[gidxOptions.environment], {
            method: 'POST',
            body: JSON.stringify(request)
        })
        if (!response.ok)
            options.onError(response);

        let responseData = await response.json();
        if (responseData.ResponseCode === 0)
            options.onTokenized(responseData.PaymentMethod);
        else
            options.onError(responseData);
    });
}
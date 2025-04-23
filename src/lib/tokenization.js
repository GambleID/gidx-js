import "core-js/stable"; 
import { options as gidxOptions } from './index.js'
import { normalizeApiResponse } from './util.js';

const endpoints = {
    sandbox: 'https://api.gidx-service.in/v3.0/api/DirectCashier/PaymentMethod',
    production: 'https://api.gidx-service.com/v3.0/api/DirectCashier/PaymentMethod'
}

const defaultOptions = {
    endpoint: endpoints[gidxOptions.environment],
    paymentMethodTypes: ['CC', 'ACH'],
    savePaymentMethod: true,
    tokenizer: {
        type: 'Finix',
        applicationId: null
    },
    merchantSessionId: null,
    showSubmitButton: true,
    onLoad: () => { },
    onUpdate: () => { },
    onSaving: (request) => { },
    onSaved: (response) => { },
    onError: () => { }
};

export function showPaymentMethodForm(elementId, options) {
    options = { ...defaultOptions, ...options };

    if (typeof (options.paymentMethodTypes) === 'string')
        options.paymentMethodTypes = [options.paymentMethodTypes];

    //We want the properties in options.tokenizer to be case-insensitive, so normalizeApiResponse converts them all the lower case.
    //We want merchants to be able to just forward the full Tokenizer object they get back in the CreateSession response as-is.
    //That means it will be in C# style case (ApplicationID), but we also want to support typical javascript style (applicationId).
    options.tokenizer = normalizeApiResponse(options.Tokenizer || options.tokenizer);

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
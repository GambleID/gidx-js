import { options as gidxOptions } from './index.js'
import { normalizeApiResponse } from './util.js';
import finixFactory from './tokenization-finix.js';

/**
 * @module gidx-js
 * @typicalname GIDX
 */

/**
 * Returned from the `showPaymentMethodForm` function. Gives you the ability to manually submit the form by calling `submit`.
 * @typedef {Object} PaymentMethodForm
 * @memberof module:gidx-js
 * @category tokenizer objects
 * @property {function} submit A function used to manually submit the payment method form. Must be used if showSubmitButton = false.
 */

/**
 * Options used by showPaymentMethodForm. Along with these options, you may also provide any of the options {@link https://finix.com/docs/guides/payments/online-payments/payment-details/token-forms/|documented by Finix}.
 * @typedef {Object} PaymentMethodFormOptions
 * @memberof module:gidx-js
 * @category tokenizer objects
 * @property {string} merchantSessionId Required. The same MerchantSessionID that you passed to CreateSession.
 * @property {Object} tokenizer Required. The Tokenizer object returned in CreateSessionResponse.PaymentMethodSettings[].Tokenizer
 * @property {onSaved} onSaved Required. A function called after the PaymentMethod was successfully saved.
 * @property {(string[]|string)} [paymentMethodTypes=["CC", "ACH"]] The types of PaymentMethods that the form should accept. Only CC and ACH are supported.
 * @property {boolean} savePaymentMethod=true Save the payment method for the customer to re-use.
 * @property {boolean} showSubmitButton=true Set to false if you want to submit the form yourself using the .submit() method.
 * @property {onLoad} onLoad A function called after the form has loaded.
 * @property {onUpdate} onUpdate A function called after any input in the form is updated.
 * @property {onSaving} onSaving A function called right before sending the PaymentMethod API request. The request can be modified here.
 * @property {onError} onError A function called when an error occurs. The error could be sent by the tokenizer, or by the PaymentMethod API.
 */

/**
 * @callback onLoad 
 * @memberof module:gidx-js
 * @category tokenizer callbacks
 */

/**
 * @callback onUpdate
 * @memberof module:gidx-js
 * @category tokenizer callbacks
 */

/**
 * @callback onSaving 
 * @memberof module:gidx-js
 * @category tokenizer callbacks
 * @param {Object} request The PaymentMethod request that is about to be sent.
 */

/**
 * @callback onSaved
 * @memberof module:gidx-js
 * @category tokenizer callbacks
 * @param {Object} paymentMethod The PaymentMethod object returned from the PaymentMethod API response.
 */

/**
 * @callback onError 
 * @memberof module:gidx-js
 * @category tokenizer callbacks
 * @param {Object} tokenizerError An error returned from the tokenizer.
 * @param {Object} paymentMethodError An error response returned from the PaymentMethod API.
 */

const endpoints = {
    sandbox: 'https://api.gidx-service.in/v3.0/api/DirectCashier/PaymentMethod',
    production: 'https://api.gidx-service.com/v3.0/api/DirectCashier/PaymentMethod'
}

const defaultOptions = {
    endpoint: null,
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

let tokenizerFactories = {
    finix: finixFactory
}

/**
 * Show the payment method form.
 * @returns {PaymentMethodForm}
 * @static
 * @category tokenizer functions
 */
export function showPaymentMethodForm(elementId, options) {
    if (!gidxOptions.merchantId)
        throw new Error('You must call GIDX.init first to provide the merchantId and environment.');
    if (!options.merchantSessionId)
        throw new Error('merchantSessionId is required. Provide the same merchantSessionId that you passed to CreateSession.');
    
    options = { ...defaultOptions, ...options };

    if (typeof (options.paymentMethodTypes) === 'string')
        options.paymentMethodTypes = [options.paymentMethodTypes];

    if (!options.endpoint)
        options.endpoint = endpoints[gidxOptions.environment];

    //We want the properties in options.tokenizer to be case-insensitive, so normalizeApiResponse converts them all the lower case.
    //We want merchants to be able to just forward the full Tokenizer object they get back in the CreateSession response as-is.
    //That means it will be in C# style case (ApplicationID), but we also want to support typical javascript style (applicationId).
    options.tokenizer = normalizeApiResponse(options.Tokenizer || options.tokenizer);

    let factory = tokenizerFactories[options.tokenizer.type.toLowerCase()];
    if (!factory) {
        let tokenizerTypes = Object.keys(tokenizerFactories).join(', ');
        throw new Error(`Unable to find tokenizer for ${options.tokenizer.type}. Available tokenizers: ${tokenizerTypes}.`)
    }

    console.log('showPaymentMethodForm', elementId, options);
    let tokenizer = factory(elementId, options);
    tokenizer.options = options;

    return tokenizer;
}
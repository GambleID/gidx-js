﻿[![view on npm](http://img.shields.io/npm/v/gidx-js.svg)](https://www.npmjs.org/package/gidx-js)

# gidx-js
Client-side Javascript utilities for GambleID.

This library includes utilities for:
* [Credit Card Tokenization](#tokenization)
* [Apple Pay and Google Pay](#apple-pay-and-google-pay)
* [3DS](#3ds)
* [Processor Session ID](#processor-session-id)

## Install
As a script tag (added to window.GIDX):

```html
<script src="https://cdn.jsdelivr.net/npm/gidx-js"></script>

<script>
    //Library is added to window.GIDX
    let threeDS = window.GIDX.get3DSDeviceData();
</script>
```

As a module:
```js
import * as GIDX from 'https://cdn.jsdelivr.net/npm/gidx-js/+esm'
```

As a NPM package:

```
$ npm install gidx-js
import * as GIDX from 'gidx-js';
```

## Initialization
First, call the `init` function with your GIDX Merchant ID and target environment.
```js
GIDX.init({
    merchantId: "5OQAQWZbkkSdEmlfVxsNlA",
    environment: "sandbox" //or production
});
```

## Tokenization
You must use this library to collect credit card information from your users to avoid PCI compliance issues.

### Usage
See the commented code sample below.
```js
//First, make sure to initialize the library with your GIDX Merchant ID and target environment
GIDX.init({
    merchantId: "5OQAQWZbkkSdEmlfVxsNlA",
    environment: "sandbox" //or production
})

//Get the Tokenizer configuration returned in the CreateSession response
let ccSettings = createSessionResponse.PaymentMethodSettings.find((s) => s.Type === "CC"); //Or look for Type === "ACH" for bank accounts.

//Call the function to render the form inside of your HTML element
GIDX.showPaymentMethodForm(
    'id-of-html-element', //The id of the HTML element. Must already exist on the page.
    {
        merchantSessionId: '1234', //Must be the same MerchantSessionID provided to the CreateSession API.
        paymentMethodTypes: ['CC'],
        tokenizer: ccSettings.Tokenizer,
        onSaved: function (paymentMethod) {
            //The full PaymentMethod object returned from our API is passed to this function.
            //Use it to populate your CompleteSession request and finalize the transaction.
            let completeSessionRequest = {
                MerchantSessionID: '1234',
                PaymentMethod: {
                    Type: paymentMethod.Type,
                    Token: paymentMethod.Token
                }
            };
        }
    });
```

### Manually submit
To submit the payment method to be saved, you should call `submit` on the object returned from `showPaymentMethodForm`, as shown below.
```js
let form = GIDX.showPaymentMethodForm(
    'id-of-html-element', //The id of the HTML element. Must already exist on the page.
    {
        merchantSessionId: '1234', //Must be the same MerchantSessionID provided to the CreateSession API.
        paymentMethodTypes: ['CC'],
        tokenizer: ccSettings.Tokenizer,
        onSaved: function (paymentMethod) {
            //The full PaymentMethod object returned from our API is passed to this function.
            //Use it to populate your CompleteSession request and finalize the transaction.
            let completeSessionRequest = {
                MerchantSessionID: '1234',
                PaymentMethod: {
                    Type: paymentMethod.Type,
                    Token: paymentMethod.Token
                }
            };
        }
    });

//When you are ready to submit, call this function.
form.submit();
```

### Billing address
You must set the billing address of the payment method before we can save it. You can do this by providing the `onSaving` callback. This callback allows you to make any changes to the PaymentMethod API request before it is sent.
```js
GIDX.showPaymentMethodForm('id-of-html-element', {
    merchantSessionId: '1234',
    paymentMethodTypes: ['CC'],
    tokenizer: ccSettings.Tokenizer,
    onSaved: function (paymentMethod) { },
    onSaving: function (request) {
        //Here you could get the address information from other inputs on the page that you control.
        request.paymentMethod.billingAddress = {
            addressLine1: '123 Main St.',
            city: 'Houston',
            stateCode: 'TX',
            postalCode: '77001'
        };
    }
})
```

### CVV only
To allow the user to re-enter their CVV for an existing credit card, use the `cvvOnly` option. Only a single input for the CVV will be rendered. You can then call the `getCvv` function to collect the encrypted CVV and pass it to your backend for your CompleteSession API request.
```js
let form = GIDX.showPaymentMethodForm('id-of-html-element', {
    merchantSessionId: '1234',
    paymentMethodTypes: ['CC'],
    tokenizer: ccSettings.Tokenizer,
    cvvOnly: true
});

//Then populate the CVV of your CompleteSession API request with getCvv
let completeSessionRequest = {
    MerchantSessionID: '1234',
    PaymentMethod: {
        Type: 'CC',
        Token: '707435d1-998c-4463-9367-c7ecf584e10d',
        CVV: form.getCvv()
    }
};
```

### Customizing the tokenization form
Along with the options documented here, you can also provide any of the options that the [Evervault JS library accepts](https://docs.evervault.com/sdks/javascript#ui.card()).
```js
GIDX.showPaymentMethodForm('id-of-html-element', {
    merchantSessionId: '1234',
    paymentMethodTypes: ['CC'],
    tokenizer: ccSettings.Tokenizer,
    onSaved: function (paymentMethod) { },

    theme: 'material'
});
```

## Apple Pay and Google Pay
We support Apple Pay and Google Pay using the same tokenization framework outlined above through the `showAppleBayButton` and `showGooglePayButton` methods.

### Usage
See the commented code sample below.
```js
//Get the Tokenizer configuration returned in the CreateSession response
let applePaySettings = createSessionResponse.PaymentMethodSettings.find((s) => s.Type === "ApplePay"); //Or look for Type === "GooglePay".

//Call the function to render the form inside of your HTML element
GIDX.showApplePayButton(
    'id-of-html-element', //The id of the HTML element to insert the button into. Must already exist on the page.
    {
        merchantSessionId: '1234', //Must be the same MerchantSessionID provided to the CreateSession API.
        tokenizer: applePaySettings.Tokenizer,

        //Apple and Google require some information on the transaction
        transaction: {
            amount: 1000 //The amount in cents (ex $10 = 1000)
        },
        onSaving: function (request) {
            //Here you could get the address information from other inputs on the page that you control.
            request.paymentMethod.billingAddress = {
                addressLine1: '123 Main St.',
                city: 'Houston',
                stateCode: 'TX',
                postalCode: '77001'
            };
        },
        onSaved: function (paymentMethod) {
            //The full PaymentMethod object returned from our API is passed to this function.
            //Use it to populate your CompleteSession request and finalize the transaction.
            let completeSessionRequest = {
                MerchantSessionID: '1234',
                PaymentMethod: {
                    Type: paymentMethod.Type,
                    Token: paymentMethod.Token
                }
            };
        }
    });
```

### Customizing the buttons
Along with the options documented here, you can also provide any of the options that the Evervault JS library accepts. See their docs on [Apple Pay](https://docs.evervault.com/payments/apple-pay#customize-the-apple-pay-button) and [Google Pay](http://docs.evervault.com/payments/google-pay#customize-the-google-pay-button) customizations.
```js
//Get the Tokenizer configuration returned in the CreateSession response
let applePaySettings = createSessionResponse.PaymentMethodSettings.find((s) => s.Type === "ApplePay"); //Or look for Type === "GooglePay".

//Call the function to render the form inside of your HTML element
GIDX.showApplePayButton('id-of-html-element', {
    merchantSessionId: '1234',
    tokenizer: applePaySettings.Tokenizer,
    transaction: { amount: 1000 },
    onSaved: function (paymentMethod) { },

    style: 'black',
    size: {
        width: '200px',
        height: '40px'
    }
});
```

## 3DS
3D Secure (3DS, ThreeDS) can be used to protect a credit card deposit from chargebacks. Some processors, like Approvely Rapid, require you use their 3DS implementation, but we also offer standalone 3DS through Evervault.
This library provides functions to help you populate the PaymentMethod.ThreeDS object of your CompleteSession API requests, and handle 3DS challenges returned in the CompleteSession API response.
### Populating the ThreeDS object
Populate the `PaymentMethod.ThreeDS` object of your CompleteSession API requests using the `get3DSDeviceData` function.
```js
let completeSessionRequest = {
    PaymentMethod: {
        Type: "CC",
        Token: "{insert token here}",
        CVV: "123",
        ThreeDS: GIDX.get3DSDeviceData()
    }
};
```

### Handling the 3DSChallenge Action
Handle the 3DSChallenge Action that can be returned from the CompleteSession API by calling the `show3DSChallenge` function.
```js
let completeSessionResponse = {
    Action: {
        Type: "3DSChallenge",

        //Evervault 3DS challenges have these properties
        Provider: "Evervault",
        TransactionID: "tds_visa_b0237020561f",
        EvervaultTeamID: "team_1234",
        EvervaultAppID: "app_1234",

        //ApprovelyRapid 3DS challenges have these properties
        Provider: "ApprovelyRapid",
        TransactionID: "707435d1-998c-4463-9367-c7ecf584e10d",
        URL: "https://acs-public.tp.mastercard.com/api/v1/browser_challenges",
        CReq: "eyJ0aHJlZURTU2VydmVyVHJhbnNJRCI..."
    }
};

if (completeSessionResponse.Action?.Type == "3DSChallenge") {
    GIDX.show3DSChallenge(completeSessionResponse.Action, {
        onComplete: function (transactionId) {
            //Send another CompleteSession request after challenge is completed.
            let completeSessionRequest = {
                PaymentMethod: {
                    Type: "CC",
                    Token: "{insert token here}",
                    ThreeDS: {
                        TransactionID: transactionId,

                        //Optional. Only required if using Approvely Rapid's chargeback protection
                        DeviceID: window.nSureSDK?.getDeviceId()
                    }
                }
            };

            //Call CompleteSession API here
        }
    });
}
```

A 3DS challenge is a URL that gets loaded in a modal iframe that let's the user verify themselves with their bank. For more info on 3DS, [see the Approvely Rapid docs](https://docs.coinflow.cash/docs/about-3ds) or the [Evervault docs](https://docs.evervault.com/payments/3d-secure).

### Customizing the Approvely Rapid 3DS Challenge HTML

By default, the Approvely Rapid 3DS challenge is an HTML5 dialog element inserted into the body of your page. The HTML looks like this:
```html
<dialog class="challenge-container">
    <iframe></iframe>
</dialog>
```

The [default CSS](src/lib/index.css) is included in the library, but feel free to add your own CSS to your page.

For more advanced customization, you can provide `insertElement` and `removeElement` functions in your `options` object.

## Processor Session ID
Some processors, like Finix, require you to use their own JS SDK's for monitoring risk and fraud. To do this, you must call `GIDX.init` on every page of your application. Then, you must pass the `ProcessorSessionID` in your CreateSession or CompleteSession API requests.

### Initialization
Call this on every page. You will get the required processor's credentials when you go live.
```js
GIDX.init({
    merchantId: "5OQAQWZbkkSdEmlfVxsNlA",
    environment: "sandbox" //or production,
    processorSessionId: {
        type: "Finix",
        merchantId: "You will get this from Finix. In sandbox you can leave it empty."
    }
})
```

### Getting the Processor Session ID
Pass the `ProcessorSessionID` in either you CreateSession or CompleteSession API requests.
```js
{
    "ProcessorSessionID": GIDX.getProcessorSessionId()
}
```

## API Reference

* [gidx-js](#module_gidx-js)
    * _3ds callbacks_
        * [.onComplete](#module_gidx-js.onComplete) : <code>function</code>
        * [.onShown](#module_gidx-js.onShown) : <code>function</code>
        * [.insertElement](#module_gidx-js.insertElement) ⇒ <code>Element</code>
        * [.removeElement](#module_gidx-js.removeElement) : <code>function</code>
    * _3ds functions_
        * [.get3DSDeviceData()](#module_gidx-js.get3DSDeviceData) ⇒ <code>DeviceData</code>
        * [.show3DSChallenge(action, options)](#module_gidx-js.show3DSChallenge)
    * _3ds objects_
        * [.Action](#module_gidx-js.Action) : <code>Object</code>
        * [.DeviceData](#module_gidx-js.DeviceData) : <code>Object</code>
        * [.3DSChallengeOptions](#module_gidx-js.3DSChallengeOptions) : <code>Object</code>
    * _tokenizer callbacks_
        * [.onLoad](#module_gidx-js.onLoad) : <code>function</code>
        * [.onUpdate](#module_gidx-js.onUpdate) : <code>function</code>
        * [.onSaving](#module_gidx-js.onSaving) : <code>function</code>
        * [.onSaved](#module_gidx-js.onSaved) : <code>function</code>
        * [.onError](#module_gidx-js.onError) : <code>function</code>
        * [.onCancel](#module_gidx-js.onCancel) : <code>function</code>
    * _tokenizer functions_
        * [.showPaymentMethodForm()](#module_gidx-js.showPaymentMethodForm) ⇒ <code>PaymentMethodForm</code>
        * [.showApplePayButton()](#module_gidx-js.showApplePayButton)
        * [.showGooglePayButton()](#module_gidx-js.showGooglePayButton)
    * _tokenizer objects_
        * [.PaymentMethodForm](#module_gidx-js.PaymentMethodForm) : <code>Object</code>
        * [.TokenizationOptions](#module_gidx-js.TokenizationOptions) : <code>Object</code>

<a name="module_gidx-js.onComplete"></a>

### GIDX.onComplete : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: 3ds callbacks  

| Param | Type | Description |
| --- | --- | --- |
| transactionId | <code>string</code> | The transactionID to pass in the ThreeDS object of your second CompleteSession API request. |

<a name="module_gidx-js.onShown"></a>

### GIDX.onShown : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: 3ds callbacks  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element containing the challenge iframe. |

<a name="module_gidx-js.insertElement"></a>

### GIDX.insertElement ⇒ <code>Element</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Returns**: <code>Element</code> - The Element that was inserted into the page.  
**Category**: 3ds callbacks  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element to insert into the page. |

<a name="module_gidx-js.removeElement"></a>

### GIDX.removeElement : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: 3ds callbacks  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element that was inserted into the page. |

<a name="module_gidx-js.get3DSDeviceData"></a>

### GIDX.get3DSDeviceData() ⇒ <code>DeviceData</code>
Get the data required for the PaymentMethod.ThreeDS object passed to the CompleteSession API.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: 3ds functions  
<a name="module_gidx-js.show3DSChallenge"></a>

### GIDX.show3DSChallenge(action, options)
Show the 3DS challenge to the user.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: 3ds functions  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>Action</code> | The Action (Type = "3DSChallenge") object returned from the CompleteSession API. Properties are case insensitive. |
| options | <code>3DSChallengeOptions</code> | Options for how to handle the challenge. At least onComplete is required. |

<a name="module_gidx-js.Action"></a>

### GIDX.Action : <code>Object</code>
Action object that is returned from the CompleteSession API when a 3DS challenge is required.

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: 3ds objects  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| provider | <code>string</code> | The 3DS provider (ex "ApprovelyRapid" or "Evervault") |
| url | <code>string</code> |  |
| creq | <code>string</code> |  |
| transactionId | <code>string</code> | Either the 3DS transaction ID, or for Evervault, their session ID |

<a name="module_gidx-js.DeviceData"></a>

### GIDX.DeviceData : <code>Object</code>
Device data that is used to process 3DS.

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: 3ds objects  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| colorDepth | <code>number</code> |  |
| screenHeight | <code>number</code> |  |
| screenWidth | <code>number</code> |  |
| timeZone | <code>number</code> |  |
| deviceId | <code>string</code> | The nSure deviceId to forward to Rapid/Coinflow. |

<a name="module_gidx-js.3DSChallengeOptions"></a>

### GIDX.3DSChallengeOptions : <code>Object</code>
Options used by show3DSChallenge.

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: 3ds objects  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| onComplete | <code>onComplete</code> | Function called after challenge has been completed by the user. |
| onShown | <code>onShown</code> | Function called after Element is inserted into the page. |
| insertElement | <code>insertElement</code> | Insert the Element containing the challenge iframe into the page. Only for Rapid. |
| removeElement | <code>removeElement</code> | Remove the Element containing the challenge iframe from the page. Only for Rapid. |

<a name="module_gidx-js.onLoad"></a>

### GIDX.onLoad : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer callbacks  
<a name="module_gidx-js.onUpdate"></a>

### GIDX.onUpdate : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer callbacks  
<a name="module_gidx-js.onSaving"></a>

### GIDX.onSaving : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer callbacks  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Object</code> | The PaymentMethod request that is about to be sent. |

<a name="module_gidx-js.onSaved"></a>

### GIDX.onSaved : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer callbacks  

| Param | Type | Description |
| --- | --- | --- |
| paymentMethod | <code>Object</code> | The PaymentMethod object returned from the PaymentMethod API response. |

<a name="module_gidx-js.onError"></a>

### GIDX.onError : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer callbacks  

| Param | Type | Description |
| --- | --- | --- |
| tokenizerError | <code>Object</code> | An error returned from the tokenizer. |
| paymentMethodError | <code>Object</code> | An error response returned from the PaymentMethod API. |

<a name="module_gidx-js.onCancel"></a>

### GIDX.onCancel : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer callbacks  
<a name="module_gidx-js.showPaymentMethodForm"></a>

### GIDX.showPaymentMethodForm() ⇒ <code>PaymentMethodForm</code>
Show the payment method form.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer functions  
<a name="module_gidx-js.showApplePayButton"></a>

### GIDX.showApplePayButton()
Render an Apple Pay button.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer functions  
<a name="module_gidx-js.showGooglePayButton"></a>

### GIDX.showGooglePayButton()
Render a Google Pay button.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer functions  
<a name="module_gidx-js.PaymentMethodForm"></a>

### GIDX.PaymentMethodForm : <code>Object</code>
Returned from the `showPaymentMethodForm` function. Gives you the ability to manually submit the form by calling `submit`.

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer objects  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| submit | <code>function</code> | A function used to manually submit the payment method form. Must be used if showSubmitButton = false. |
| getCvv | <code>function</code> | If cvvOnly option is set to true, call this method to get the encrypted CVV to pass to your backend. |

<a name="module_gidx-js.TokenizationOptions"></a>

### GIDX.TokenizationOptions : <code>Object</code>
Options used by showPaymentMethodForm, showApplePayButton and showGooglePayButton. Along with these options, you may also provide any of the options [documented by Evervault](https://docs.evervault.com/sdks/javascript#ui.card()).

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer objects  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| merchantSessionId | <code>string</code> |  | Required. The same MerchantSessionID that you passed to CreateSession. |
| tokenizer | <code>Object</code> |  | Required. The Tokenizer object returned in CreateSessionResponse.PaymentMethodSettings[].Tokenizer |
| onSaved | <code>onSaved</code> |  | Required. A function called after the PaymentMethod was successfully saved. |
| [paymentMethodTypes] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | <code>[&quot;CC&quot;, &quot;ACH&quot;]</code> | The types of PaymentMethods that the form should accept. Only CC and ACH are supported. |
| savePaymentMethod | <code>boolean</code> | <code>true</code> | Save the payment method for the customer to re-use. Not available for Apple Pay and Google Pay. |
| showSubmitButton | <code>boolean</code> | <code>true</code> | Set to false if you want to submit the form yourself using the .submit() method. |
| cvvOnly | <code>boolean</code> | <code>false</code> | Set to true to display only the CVV input. Lets user re-enter CVV on a saved credit card. Use the getCvv function to get the encrypted CVV. |
| onLoad | <code>onLoad</code> |  | A function called after the form has loaded. Not available for Apple Pay and Google Pay. |
| onUpdate | <code>onUpdate</code> |  | A function called after any input in the form is updated. Not available for Apple Pay and Google Pay. |
| onSaving | <code>onSaving</code> |  | A function called right before sending the PaymentMethod API request. The request can be modified here. |
| onError | <code>onError</code> |  | A function called when an error occurs. The error could be sent by the tokenizer, or by the PaymentMethod API. |
| onCancel | <code>onCancel</code> |  | A function called when the user cancels out of the Apple Pay or Google Pay window. |

* * *

&copy; 2025 GambleID. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
[![view on npm](http://img.shields.io/npm/v/gidx-js.svg)](https://www.npmjs.org/package/gidx-js)

# gidx-js
Client-side Javascript utilities for GambleID.

This library includes utilities for:
* [Approvely Rapid 3DS](#rapid-3ds)
* [Credit Card Tokenization (via Finix)](#tokenization)

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
## Rapid 3DS
Approvely Rapid requires 3D Secure (3DS, ThreeDS) for all credit card, Apple Pay and Google Pay payments. This library provides functions to help you populate the PaymentMethod.ThreeDS object of your CompleteSession API requests, and handle 3DS challenges.
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

If you are also using Approvely Rapid's [chargeback protection](https://docs.coinflow.cash/docs/implement-chargeback-protection) and have initiated the nSure SDK on the page, `get3DSDeviceData` will also include the `DeviceID`. Below is the javascript Approvely Rapid wants you to include on every page of your app, if you are using their chargeback protection.

```html
<script src="https://sdk.nsureapi.com/sdk.js"></script>
<script>
    window.nSureAsyncInit = function (deviceId) {
        window.nSureSDK.init('9JBW2RHC7JNJN8ZQ');
        window.nSureSDK.init({
            appId: '9JBW2RHC7JNJN8ZQ',
            partnerId: '<contact Approvely for this>'
        });
    };
</script>
```

### Handling the 3DSChallenge Action
Handle the 3DSChallenge Action that can be returned from the CompleteSession API by calling the `show3DSChallenge` function.
```js
let completeSessionResponse = {
    Action: {
        Type: "3DSChallenge",
        URL: "https://acs-public.tp.mastercard.com/api/v1/browser_challenges",
        CReq: "eyJ0aHJlZURTU2VydmVyVHJhbnNJRCI...",
        TransactionID: "707435d1-998c-4463-9367-c7ecf584e10d"
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

A 3DS challenge is a URL that gets loaded in a modal iframe that let's the user verify themselves with their bank. For more info on 3DS, [see the Approvely Rapid docs](https://docs.coinflow.cash/docs/about-3ds).

Although in our API requests to Approvely Rapid we set the option that we prefer not to receive a 3DS challenge, in the end it's up to the user's bank, so you need to handle the possibility that a challenge will be requested.

### Customizing the 3DS Challenge HTML

By default, the 3DS challenge is an HTML5 dialog element inserted into the body of your page. The HTML looks like this:
```html
<dialog class="challenge-container">
    <iframe></iframe>
</dialog>
```

The [default CSS](src/lib/index.css) is included in the library, but feel free to add your own CSS to your page.

For more advanced customization, you can provide `insertElement` and `removeElement` functions in your `options` object.

## Tokenization
In order to use Finix to process credit cards, you must use their [tokenization form](https://finix.com/docs/guides/payments/online-payments/payment-details/token-forms/). Our library provides a function, `showPaymentMethodForm`, that renders the Finix form and handles the submission to our PaymentMethod API.

### Usage
See the commented code sample below.
```js
//First, make sure to initialize the library with your GIDX Merchant ID and target environment
GIDX.init({
    merchantId: "5OQAQWZbkkSdEmlfVxsNlA",
    environment: "sandbox" //or production
})

//Get the Tokenizer configuration returned in the CreateSession response
let ccSettings = createSessionResponse.PaymentMethodSettings.find((s) => s.Type === "CC");

//Call the function to render the form inside of your HTML element
GIDX.showPaymentMethodForm(
    'id-of-html-element', //The id of the HTML element. Must already exist on the page.
    {
        merchantSessionId: '1234', //Must be the same MerchantSessionID provided to the CreateSession API.
        paymentMethodTypes: ['CC'], //Finix tokenization form accepts both credit card and bank accounts, but only credit cards are required to use it.
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

### Billing address
The Finix tokenization form does have the ability to collect the customer's billing address by passing `showAddress: true` in the options.
However, it is also possible to pass the billing address yourself by using the `onSaving` option. This option allows you to make any changes to the PaymentMethod API request before it is sent.
```js
GIDX.showPaymentMethodForm('id-of-html-element', {
    merchantSessionId: '1234',
    paymentMethodTypes: ['CC'],
    tokenizer: ccSettings.Tokenizer,
    onSaved: function (paymentMethod) { },

    showAddress: false, //Tell Finix not to build their own address elements.
    onSaving: function (request) {
        //Here you could get the address information from other inputs on the page that you control.
        request.billingAddress = {
            addressLine1: '123 Main St.',
            city: 'Houston',
            stateCode: 'TX',
            postalCode: '77001'
        };
    }
})
```

### Customizing the tokenization form
Along with the options documented here, you can also provide any of the options that the [Finix JS library accepts](https://finix.com/docs/guides/payments/online-payments/payment-details/token-forms/).
```js
GIDX.showPaymentMethodForm('id-of-html-element', {
    merchantSessionId: '1234',
    paymentMethodTypes: ['CC'],
    tokenizer: ccSettings.Tokenizer,
    onSaved: function (paymentMethod) { },

    styles: {
        default: {
            border: '1px solid #CCCDCF',
            borderRadius: '8px'
        },
        error: {
            border: '1px solid rgba(255,0,0, 0.3)'
        }
    }
});
```

## API Reference

* [gidx-js](#module_gidx-js)
    * _rapid callbacks_
        * [.onComplete](#module_gidx-js.onComplete) : <code>function</code>
        * [.onShown](#module_gidx-js.onShown) : <code>function</code>
        * [.insertElement](#module_gidx-js.insertElement) ⇒ <code>Element</code>
        * [.removeElement](#module_gidx-js.removeElement) : <code>function</code>
    * _rapid functions_
        * [.get3DSDeviceData()](#module_gidx-js.get3DSDeviceData) ⇒ <code>DeviceData</code>
        * [.show3DSChallenge(action, options)](#module_gidx-js.show3DSChallenge)
    * _rapid objects_
        * [.Action](#module_gidx-js.Action) : <code>Object</code>
        * [.DeviceData](#module_gidx-js.DeviceData) : <code>Object</code>
        * [.3DSChallengeOptions](#module_gidx-js.3DSChallengeOptions) : <code>Object</code>
    * _tokenizer callbacks_
        * [.onLoad](#module_gidx-js.onLoad) : <code>function</code>
        * [.onUpdate](#module_gidx-js.onUpdate) : <code>function</code>
        * [.onSaving](#module_gidx-js.onSaving) : <code>function</code>
        * [.onSaved](#module_gidx-js.onSaved) : <code>function</code>
        * [.onError](#module_gidx-js.onError) : <code>function</code>
    * _tokenizer functions_
        * [.showPaymentMethodForm()](#module_gidx-js.showPaymentMethodForm) ⇒ <code>PaymentMethodForm</code>
    * _tokenizer objects_
        * [.PaymentMethodForm](#module_gidx-js.PaymentMethodForm) : <code>Object</code>
        * [.PaymentMethodFormOptions](#module_gidx-js.PaymentMethodFormOptions) : <code>Object</code>

<a name="module_gidx-js.onComplete"></a>

### GIDX.onComplete : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: rapid callbacks  

| Param | Type | Description |
| --- | --- | --- |
| transactionId | <code>string</code> | The transactionID to pass in the ThreeDS object of your second CompleteSession API request. |

<a name="module_gidx-js.onShown"></a>

### GIDX.onShown : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: rapid callbacks  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element containing the challenge iframe. |

<a name="module_gidx-js.insertElement"></a>

### GIDX.insertElement ⇒ <code>Element</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Returns**: <code>Element</code> - The Element that was inserted into the page.  
**Category**: rapid callbacks  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element to insert into the page. |

<a name="module_gidx-js.removeElement"></a>

### GIDX.removeElement : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: rapid callbacks  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element that was inserted into the page. |

<a name="module_gidx-js.get3DSDeviceData"></a>

### GIDX.get3DSDeviceData() ⇒ <code>DeviceData</code>
Get the data required for the PaymentMethod.ThreeDS object passed to the CompleteSession API.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: rapid functions  
<a name="module_gidx-js.show3DSChallenge"></a>

### GIDX.show3DSChallenge(action, options)
Show the 3DS challenge to the user.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: rapid functions  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>Action</code> | The Action (Type = "3DSChallenge") object returned from the CompleteSession API. Properties are case insensitive. |
| options | <code>3DSChallengeOptions</code> | Options for how to handle the challenge. At least onComplete is required. |

<a name="module_gidx-js.Action"></a>

### GIDX.Action : <code>Object</code>
Action object that is returned from the CompleteSession API when a 3DS challenge is required.

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: rapid objects  
**Properties**

| Name | Type |
| --- | --- |
| url | <code>string</code> | 
| creq | <code>string</code> | 
| transactionId | <code>string</code> | 

<a name="module_gidx-js.DeviceData"></a>

### GIDX.DeviceData : <code>Object</code>
Device data that is used to process 3DS.

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: rapid objects  
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
**Category**: rapid objects  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| onComplete | <code>onComplete</code> | Function called after challenge has been completed by the user. |
| onShown | <code>onShown</code> | Function called after Element is inserted into the page. |
| insertElement | <code>insertElement</code> | Insert the Element containing the challenge iframe into the page. |
| removeElement | <code>removeElement</code> | Remove the Element containing the challenge iframe from the page. |

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

<a name="module_gidx-js.showPaymentMethodForm"></a>

### GIDX.showPaymentMethodForm() ⇒ <code>PaymentMethodForm</code>
Show the payment method form.

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

<a name="module_gidx-js.PaymentMethodFormOptions"></a>

### GIDX.PaymentMethodFormOptions : <code>Object</code>
Options used by showPaymentMethodForm. Along with these options, you may also provide any of the options [documented by Finix](https://finix.com/docs/guides/payments/online-payments/payment-details/token-forms/).

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: tokenizer objects  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| merchantSessionId | <code>string</code> |  | Required. The same MerchantSessionID that you passed to CreateSession. |
| tokenizer | <code>Object</code> |  | Required. The Tokenizer object returned in CreateSessionResponse.PaymentMethodSettings[].Tokenizer |
| onSaved | <code>onSaved</code> |  | Required. A function called after the PaymentMethod was successfully saved. |
| [paymentMethodTypes] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | <code>[&quot;CC&quot;, &quot;ACH&quot;]</code> | The types of PaymentMethods that the form should accept. Only CC and ACH are supported. |
| savePaymentMethod | <code>boolean</code> | <code>true</code> | Save the payment method for the customer to re-use. |
| showSubmitButton | <code>boolean</code> | <code>true</code> | Set to false if you want to submit the form yourself using the .submit() method. |
| onLoad | <code>onLoad</code> |  | A function called after the form has loaded. |
| onUpdate | <code>onUpdate</code> |  | A function called after any input in the form is updated. |
| onSaving | <code>onSaving</code> |  | A function called right before sending the PaymentMethod API request. The request can be modified here. |
| onError | <code>onError</code> |  | A function called when an error occurs. The error could be sent by the tokenizer, or by the PaymentMethod API. |

* * *

&copy; 2025 GambleID. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
[![view on npm](http://img.shields.io/npm/v/gidx-js.svg)](https://www.npmjs.org/package/gidx-js)

# gidx-js
Client-side Javascript utilities for GambleID when using Approvely Rapid.

Approvely Rapid requires 3D Secure (3DS, ThreeDS) for all credit card, Apple Pay and Google Pay payments. This library provides functions to help you populate the PaymentMethod.ThreeDS object of your CompleteSession API requests, and handle 3DS challenges.

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

## Usage
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

## API Reference

* [gidx-js](#module_gidx-js)
    * _callbacks_
        * [.onComplete](#module_gidx-js.onComplete) : <code>function</code>
        * [.onShown](#module_gidx-js.onShown) : <code>function</code>
        * [.insertElement](#module_gidx-js.insertElement) ⇒ <code>Element</code>
        * [.removeElement](#module_gidx-js.removeElement) : <code>function</code>
    * _functions_
        * [.get3DSDeviceData()](#module_gidx-js.get3DSDeviceData) ⇒ <code>DeviceData</code>
        * [.show3DSChallenge(action, options)](#module_gidx-js.show3DSChallenge)
    * _objects_
        * [.Action](#module_gidx-js.Action) : <code>Object</code>
        * [.DeviceData](#module_gidx-js.DeviceData) : <code>Object</code>
        * [.Options](#module_gidx-js.Options) : <code>Object</code>

<a name="module_gidx-js.onComplete"></a>

### GIDX.onComplete : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: callbacks  

| Param | Type | Description |
| --- | --- | --- |
| transactionId | <code>string</code> | The transactionID to pass in the ThreeDS object of your second CompleteSession API request. |

<a name="module_gidx-js.onShown"></a>

### GIDX.onShown : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: callbacks  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element containing the challenge iframe. |

<a name="module_gidx-js.insertElement"></a>

### GIDX.insertElement ⇒ <code>Element</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Returns**: <code>Element</code> - The Element that was inserted into the page.  
**Category**: callbacks  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element to insert into the page. |

<a name="module_gidx-js.removeElement"></a>

### GIDX.removeElement : <code>function</code>
**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: callbacks  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element that was inserted into the page. |

<a name="module_gidx-js.get3DSDeviceData"></a>

### GIDX.get3DSDeviceData() ⇒ <code>DeviceData</code>
Get the data required for the PaymentMethod.ThreeDS object passed to the CompleteSession API.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: functions  
<a name="module_gidx-js.show3DSChallenge"></a>

### GIDX.show3DSChallenge(action, options)
Show the 3DS challenge to the user.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: functions  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>Action</code> | The Action (Type = "3DSChallenge") object returned from the CompleteSession API. Properties are case insensitive. |
| options | <code>Options</code> | Options for how to handle the challenge. At least onComplete is required. |

<a name="module_gidx-js.Action"></a>

### GIDX.Action : <code>Object</code>
Action object that is returned from the CompleteSession API when a 3DS challenge is required.

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: objects  
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
**Category**: objects  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| colorDepth | <code>number</code> |  |
| screenHeight | <code>number</code> |  |
| screenWidth | <code>number</code> |  |
| timeZone | <code>number</code> |  |
| deviceId | <code>string</code> | The nSure deviceId to forward to Rapid/Coinflow. |

<a name="module_gidx-js.Options"></a>

### GIDX.Options : <code>Object</code>
Options used by show3DSChallenge.

**Kind**: static typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Category**: objects  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| onComplete | <code>onComplete</code> | Function called after challenge has been completed by the user. |
| onShown | <code>onShown</code> | Function called after Element is inserted into the page. |
| insertElement | <code>insertElement</code> | Insert the Element containing the challenge iframe into the page. |
| removeElement | <code>removeElement</code> | Remove the Element containing the challenge iframe from the page. |

* * *

&copy; 2025 GambleID. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
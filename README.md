[![view on npm](http://img.shields.io/npm/v/gidx-js.svg)](https://www.npmjs.org/package/gidx-js)

# gidx-js
Client-side Javascript utilities for GambleID when using Approvely Rapid.

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

## API Reference
<a name="module_gidx-js"></a>

## gidx-js

* [gidx-js](#module_gidx-js)
    * _static_
        * [.get3DSDeviceData()](#module_gidx-js.get3DSDeviceData) ⇒ <code>DeviceData</code>
        * [.show3DSChallenge(action, options)](#module_gidx-js.show3DSChallenge)
    * _inner_
        * [~Action](#module_gidx-js..Action) : <code>Object</code>
        * [~DeviceData](#module_gidx-js..DeviceData) : <code>Object</code>
        * [~Options](#module_gidx-js..Options) : <code>Object</code>
        * [~onComplete](#module_gidx-js..onComplete) : <code>function</code>
        * [~onShown](#module_gidx-js..onShown) : <code>function</code>
        * [~insertElement](#module_gidx-js..insertElement) ⇒ <code>Element</code>
        * [~removeElement](#module_gidx-js..removeElement) : <code>function</code>

<a name="module_gidx-js.get3DSDeviceData"></a>

### GIDX.get3DSDeviceData() ⇒ <code>DeviceData</code>
Get the data required for the PaymentMethod.ThreeDS object passed to the CompleteSession API.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  
<a name="module_gidx-js.show3DSChallenge"></a>

### GIDX.show3DSChallenge(action, options)
Show the 3DS challenge to the user.

**Kind**: static method of [<code>gidx-js</code>](#module_gidx-js)  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>Action</code> | The Action (Type = "3DSChallenge") object returned from the CompleteSession API. Properties are case insensitive. |
| options | <code>Options</code> | Options for how to handle the challenge. At least onComplete is required. |

<a name="module_gidx-js..Action"></a>

### gidx-js~Action : <code>Object</code>
Action object that is returned from the CompleteSession API when a 3DS challenge is required.

**Kind**: inner typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Properties**

| Name | Type |
| --- | --- |
| url | <code>string</code> | 
| creq | <code>string</code> | 
| transactionId | <code>string</code> | 

<a name="module_gidx-js..DeviceData"></a>

### gidx-js~DeviceData : <code>Object</code>
Device data that is used to process 3DS.

**Kind**: inner typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| colorDepth | <code>number</code> |  |
| screenHeight | <code>number</code> |  |
| screenWidth | <code>number</code> |  |
| timeZone | <code>number</code> |  |
| deviceId | <code>string</code> | The nSure deviceId to forward to Rapid/Coinflow. |

<a name="module_gidx-js..Options"></a>

### gidx-js~Options : <code>Object</code>
Options used by show3DSChallenge.

**Kind**: inner typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| onComplete | <code>onComplete</code> | Function called after challenge has been completed by the user. |
| onShown | <code>onShown</code> | Function called after Element is inserted into the page. |
| insertElement | <code>insertElement</code> | Insert the Element containing the challenge iframe into the page. |
| removeElement | <code>removeElement</code> | Remove the Element containing the challenge iframe from the page. |

<a name="module_gidx-js..onComplete"></a>

### gidx-js~onComplete : <code>function</code>
**Kind**: inner typedef of [<code>gidx-js</code>](#module_gidx-js)  

| Param | Type | Description |
| --- | --- | --- |
| transactionId | <code>string</code> | The transactionID to pass in the ThreeDS object of your second CompleteSession API request. |

<a name="module_gidx-js..onShown"></a>

### gidx-js~onShown : <code>function</code>
**Kind**: inner typedef of [<code>gidx-js</code>](#module_gidx-js)  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element containing the challenge iframe. |

<a name="module_gidx-js..insertElement"></a>

### gidx-js~insertElement ⇒ <code>Element</code>
**Kind**: inner typedef of [<code>gidx-js</code>](#module_gidx-js)  
**Returns**: <code>Element</code> - The Element that was inserted into the page.  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element to insert into the page. |

<a name="module_gidx-js..removeElement"></a>

### gidx-js~removeElement : <code>function</code>
**Kind**: inner typedef of [<code>gidx-js</code>](#module_gidx-js)  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Element</code> | The Element that was inserted into the page. |


* * *

&copy; 2025 GambleID. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
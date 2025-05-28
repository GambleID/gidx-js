import { normalizeApiResponse } from './util.js';
import rapidFactory from './3ds-rapid.js';
import evervaultFactory from './3ds-evervault.js';

/**
 * @module gidx-js
 * @typicalname GIDX
 */

/**
 * Action object that is returned from the CompleteSession API when a 3DS challenge is required.
 * @typedef {Object} Action
 * @memberof module:gidx-js
 * @category 3ds objects
 * @property {string} provider The 3DS provider (ex "ApprovelyRapid" or "Evervault")
 * @property {string} url
 * @property {string} creq
 * @property {string} transactionId Either the 3DS transaction ID, or for Evervault, their session ID
 */

/**
 * Device data that is used to process 3DS.
 * @typedef {Object} DeviceData
 * @memberof module:gidx-js
 * @category 3ds objects
 * @property {number} colorDepth
 * @property {number} screenHeight
 * @property {number} screenWidth
 * @property {number} timeZone
 * @property {string} deviceId The nSure deviceId to forward to Rapid/Coinflow.
 */

/**
 * Options used by show3DSChallenge.
 * @typedef {Object} 3DSChallengeOptions
 * @memberof module:gidx-js
 * @category 3ds objects
 * @property {onComplete} onComplete Function called after challenge has been completed by the user.
 * @property {onShown} onShown Function called after Element is inserted into the page. 
 * @property {insertElement} insertElement Insert the Element containing the challenge iframe into the page. Only for Rapid.
 * @property {removeElement} removeElement Remove the Element containing the challenge iframe from the page. Only for Rapid.
 */

/**
 * @callback onComplete 
 * @memberof module:gidx-js
 * @category 3ds callbacks
 * @param {string} transactionId The transactionID to pass in the ThreeDS object of your second CompleteSession API request.
 */

/**
 * @callback onShown 
 * @memberof module:gidx-js
 * @category 3ds callbacks
 * @param {Element} e The Element containing the challenge iframe.
 */

/**
 * @callback insertElement
 * @memberof module:gidx-js
 * @category 3ds callbacks
 * @param {Element} e The Element to insert into the page.
 * @returns {Element} The Element that was inserted into the page.
 */

/**
 * @callback removeElement
 * @memberof module:gidx-js
 * @category 3ds callbacks
 * @param {Element} e The Element that was inserted into the page.
 */

/**
 * Get the data required for the PaymentMethod.ThreeDS object passed to the CompleteSession API.
 * @returns {DeviceData}
 * @static
 * @category 3ds functions
 */
export function get3DSDeviceData() {
    return {
        colorDepth: window.screen.colorDepth,
        screenHeight: window.screen.height,
        screenWidth: window.screen.width,
        timeZone: -new Date().getTimezoneOffset(),
        userAgent: navigator.userAgent,
        deviceId: window?.nSureSDK?.getDeviceId()
    };
} 


let factories = {
    approvelyrapid: rapidFactory,
    evervault: evervaultFactory
}

/**
 * Show the 3DS challenge to the user. 
 * @param {Action} action The Action (Type = "3DSChallenge") object returned from the CompleteSession API. Properties are case insensitive.
 * @param {3DSChallengeOptions} options Options for how to handle the challenge. At least onComplete is required.
 * @static
 * @category 3ds functions
 */
export function show3DSChallenge(action, options) {
    if (!options.onComplete)
        throw new Error("options.onComplete is required to show a 3DS challenge.");

    action = normalizeApiResponse(action);

    //Make default provider Rapid for backwards compatibility.
    if (!action.provider)
        action.provider = "approvelyrapid";

    let factory = factories[action.provider.toLowerCase()];
    if (!factory) {
        throw new Error(`Unable to find 3DS provider for ${action.provider}.`);
    }

    factory(action, options);
}

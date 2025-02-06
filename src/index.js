import "core-js/stable"; 
import "./index.css";

let challengeContainer = null,
    currentAction = null,
    currentOptions = null;

/**
 * Device data that is used to process 3DS.
 * @typedef {Object} Action
 * @property {string} url
 * @property {string} creq
 * @property {string} transactionId
 */

/**
 * Device data that is used to process 3DS.
 * @typedef {Object} DeviceData
 * @property {number} colorDepth
 * @property {number} screenHeight
 * @property {number} screenWidth
 * @property {number} timeZone
 * @property {number} deviceId The nSure deviceId to forward to Rapid/Coinflow.
 */

/**
 * Options used by show3DSChallenge.
 * @typedef {Object} Options
 * @property {createElement} createElement Create the Element containing the challenge iframe.
 * @property {insertElement} insertElement Insert the Element containing the challenge iframe into the page.
 * @property {onShown} onShown Function called after Element is inserted on the page.
 * @property {onComplete} onComplete Function called after challenge has been completed by the user.
 */

/**
 * @callback createElement
 * @param {string} url 
 * @param {string} creq
 * @returns {string|Element} The HTML string or Element to insert on the page.
 */

/**
 * @callback insertElement
 * @param {Element} e The Element to insert on the page.
 * @returns {Element} The Element that was inserted on the page.
 */

/**
 * @callback onShown 
 * @param {Element} e The Element containing the challenge iframe.
 */

/**
 * @callback onComplete 
 * @param {string} transactionId The transactionID to pass in the ThreeDS object of your second CompleteSession API request.
 */

/**
 * Default options used by show3DSChallenge
 * @type {Options} 
 */
export const default3DSChallengeOptions = {
    createElement: function (url, creq) {
        //Default HTML copied from: https://docs.coinflow.cash/recipes/complete-checkout-with-3ds-challenge
        return `<div class="3ds-challenge-container">
                    <iframe class="3ds-challenge-iframe"
                            srcDoc='<html><body onload="document.challenge.submit()">
                                    <form method="post" name="challenge" action="${encodeURI(url)}">
                                        <input type="hidden" name="creq" value="${creq}" />
                                    </form>
                                    </body></html>'
                    />
                </div>`;
    },
    insertElement: function (e) {
        return document.body.appendChild(e);
    },
    onShown: (e) => { }
};

/**
 * Get the data required for the ThreeDS object passed to the CompleteSession API
 * @returns {DeviceData}
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

/**
 * Show the 3DS challenge to the user. 
 * @param {Action} action The Action (Type = "3DSChallenge") object returned from the CompleteSession API. Properties are case insensitive.
 * @param {Options} options Options for how to handle the challenge. At least onComplete is required.
 */
export function show3DSChallenge(action, options) {
    //3DS Challenge is already open
    if (challengeContainer)
        return;

    window.addEventListener("message", handleMessage);

    let currentAction = normalizeAction(action),
        url = currentAction.url,
        creq = currentAction.creq,
        transactionId = currentAction.transactionid;

    if (!url || !creq || !transactionId)
        throw new Error("url, creq, and transactionId are required to show a 3DS challenge.");

    if (!options.onComplete)
        throw new Error("options.onComplete is required to show a 3DS challenge.");

    let currentOptions = Object.assign({}, default3DSChallengeOptions, options);

    let element = currentOptions.createElement(url, creq);
    if (typeof (element) == "string") {
        let template = document.createElement("template");
        template.innerHTML = element;
        element = template.content.firstChild;
    }

    challengeContainer = currentOptions.insertElement(element);
    currentOptions.onShown(challengeContainer);
}

function normalizeAction(action) {
    //Action object from API response has properties in C# style case (TransactionID), but we want to support normal javascript style as well (transactionId).
    //Create new object with all keys converted to lower case.
    return Object.fromEntries(
        Object.entries(action).map(([k, v]) => [k.toLowerCase(), v])
    );
}

function handleMessage(event) {
    if (event.data == "challenge_success") {
        currentOptions.onComplete(currentAction.transactionid);

        challengeContainer.remove();
        challengeContainer = null;
        currentAction = null;
    }
}
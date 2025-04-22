import "core-js/stable"; 
import "./index.css";

let challengeContainer = null,
    currentAction = null,
    currentOptions = null;

/**
 * @module gidx-js
 * @typicalname GIDX
 */

/**
 * Action object that is returned from the CompleteSession API when a 3DS challenge is required.
 * @typedef {Object} Action
 * @memberof module:gidx-js
 * @category objects
 * @property {string} url
 * @property {string} creq
 * @property {string} transactionId
 */

/**
 * Device data that is used to process 3DS.
 * @typedef {Object} DeviceData
 * @memberof module:gidx-js
 * @category objects
 * @property {number} colorDepth
 * @property {number} screenHeight
 * @property {number} screenWidth
 * @property {number} timeZone
 * @property {string} deviceId The nSure deviceId to forward to Rapid/Coinflow.
 */

/**
 * Options used by show3DSChallenge.
 * @typedef {Object} Options
 * @memberof module:gidx-js
 * @category objects
 * @property {onComplete} onComplete Function called after challenge has been completed by the user.
 * @property {onShown} onShown Function called after Element is inserted into the page.
 * @property {insertElement} insertElement Insert the Element containing the challenge iframe into the page.
 * @property {removeElement} removeElement Remove the Element containing the challenge iframe from the page.
 */

/**
 * @callback onComplete 
 * @memberof module:gidx-js
 * @category callbacks
 * @param {string} transactionId The transactionID to pass in the ThreeDS object of your second CompleteSession API request.
 */

/**
 * @callback onShown 
 * @memberof module:gidx-js
 * @category callbacks
 * @param {Element} e The Element containing the challenge iframe.
 */

/**
 * @callback insertElement
 * @memberof module:gidx-js
 * @category callbacks
 * @param {Element} e The Element to insert into the page.
 * @returns {Element} The Element that was inserted into the page.
 */

/**
 * @callback removeElement
 * @memberof module:gidx-js
 * @category callbacks
 * @param {Element} e The Element that was inserted into the page.
 */

const defaultOptions = {
    insertElement: function (e) {
        document.body.appendChild(e);
        e.showModal();
        return e;
    },
    removeElement: function (e) {
        //If it's a dialog element, call close.
        if (e.close)
            e.close();
        else
            e.remove();
    },
    onShown: (e) => { }
};

/**
 * Get the data required for the PaymentMethod.ThreeDS object passed to the CompleteSession API.
 * @returns {DeviceData}
 * @static
 * @category functions
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
 * @static
 * @category functions
 */
export function show3DSChallenge(action, options) {
    //3DS Challenge is already open
    if (challengeContainer)
        return;

    window.addEventListener("message", handleMessage);

    //Remove any previous container that somehow didn't get removed.
    document.querySelector(".challenge-container")?.remove();

    currentAction = normalizeAction(action);
    let url = currentAction.url,
        creq = currentAction.creq,
        transactionId = currentAction.transactionid;

    if (!url || !creq || !transactionId)
        throw new Error("url, creq, and transactionId are required to show a 3DS challenge.");

    if (!options.onComplete)
        throw new Error("options.onComplete is required to show a 3DS challenge.");

    currentOptions = Object.assign({}, defaultOptions, options);

    challengeContainer = currentOptions.insertElement(createContainer(url, creq));
    currentOptions.onShown(challengeContainer);
}

function createContainer(url, creq) {
    let container = document.createElement("dialog");
    container.className = "challenge-container";

    //Iframe srcDoc copied from: https://docs.coinflow.cash/recipes/complete-checkout-with-3ds-challenge
    let srcDoc = `<html><body onload="document.challenge.submit()">
                    <form method="post" name="challenge" action="${encodeURI(url)}">
                        <input type="hidden" name="creq" value="${creq}" />
                    </form>
                </body></html>`;
    let iframe = document.createElement("iframe");
    iframe.srcdoc = srcDoc;
    container.appendChild(iframe);

    return container;
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

        currentOptions.removeElement(challengeContainer);
        challengeContainer = null;
        currentAction = null;
    }
}

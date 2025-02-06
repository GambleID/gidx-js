import "core-js/stable"; 
import "./index.css";

let challengeContainer = null,
    currentAction = null,
    currentOptions = null;

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
    onShown: () => { }
};

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
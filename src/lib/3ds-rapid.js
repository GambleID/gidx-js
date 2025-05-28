let currentInstance = null;

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

class Rapid {
    constructor(action, options) {
        //3DS Challenge is already open
        if (currentInstance)
            return;
        currentInstance = this;

        window.addEventListener("message", handleMessage);

        //Remove any previous container that somehow didn't get removed.
        document.querySelector(".challenge-container")?.remove();

        this.action = action;
        let url = action.url,
            creq = action.creq,
            transactionId = action.transactionid;

        if (!url || !creq || !transactionId)
            throw new Error("url, creq, and transactionId are required to show a 3DS challenge.");

        this.options = Object.assign({}, defaultOptions, options);

        this.challengeContainer = this.options.insertElement(createContainer(url, creq));
        this.options.onShown(this.challengeContainer);
    }
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

function handleMessage(event) {
    if (event.data == "challenge_success") {
        currentInstance.options.onComplete(currentInstance.action.transactionid);

        currentInstance.options.removeElement(currentInstance.challengeContainer);
        currentInstance = null;
    }
}

export default function (elementId, options) {
    return new Rapid(elementId, options);
}

import { loadScript } from './util.js';
let currentInstance = null;

class Evervault {
    constructor(action, options) {
        let self = this;
        if (!window.Evervault) {
            loadScript('https://js.evervault.com/v2').then(() => self.init(action, options));
        }
        else {
            self.init(action, options);
        }
    }

    init(action, options) {
        //3DS Challenge is already open
        if (currentInstance)
            return;
        currentInstance = this;

        this.options = options
        this.action = action;
        let transactionId = action.transactionid;  //transactionId is the Evervault session ID.

        if (!transactionId)
            throw new Error("transactionId is required to show a 3DS challenge.");

        const evervault = new window.Evervault(action.evervaultteamid, action.evervaultappid);
        const threeDSecure = evervault.ui.threeDSecure(transactionId);
        threeDSecure.mount();

        threeDSecure.on("success", () => {
            currentInstance = null;
            options.onComplete(transactionId);
            threeDSecure.unmount();
        });
        threeDSecure.on("failure", () => {
            currentInstance = null;
            //Still call onComplete even if it failed, so CompleteSession can be called. Our backend will check the status of the 3DS session.
            options.onComplete(transactionId);
            threeDSecure.unmount();
        });
        threeDSecure.on("ready", () => {
            if (options.onShown)
                options.onShown();
        });
    }
}

export default function (action, options) {
    return new Evervault(action, options);
}

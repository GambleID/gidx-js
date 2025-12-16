import { loadScript } from './util.js';
import { options as gidxOptions } from './index.js';
import { sendPaymentMethodRequest } from './tokenization.js';
import { normalizeApiResponse } from './util.js';
import buttonHTML from './aeropay-button.html';

const defaultAeroSyncOptions = {
    iframeTitle: 'Connect',
    theme: 'light'
};

class AeroPay {
    constructor(elementId, options) {
        let self = this;
        if (!window.aerosync) {
            loadScript('https://cdn.sync.aero.inc/1.1.3/aerosync-widget.js').then(() => self.init(elementId, options));
        }
        else {
            self.init(elementId, options);
        }
    }

    init(elementId, options) {
        let self = this;

        //Initial state is determined by PaymentMethodSettings.Tokenizer, but then updated based on Action returned from PaymentMethod API.
        self.setState(options.tokenizer);
        options.aeroSyncOptions = { ...defaultAeroSyncOptions, ...options.aeroSyncOptions };

        if (!options.userEmailAddress || !options.userPhoneNumber)
            throw new Error("userEmailAddress and userPhoneNumber are required for AeroPay.")

        self.button = document.getElementById(elementId);
        if (self.button) {
            self.button.innerHTML = buttonHTML;
            self.button.addEventListener('click', function () {
                self.launch();
            });
        }
    }

    setState(newState) {
        //Forcing state to use C# style camel-case since that is what's returned from the Payment Method API.
        let lower = normalizeApiResponse(newState);
        let oldState = this.state;
        this.state = {
            Step: lower.step,
            AeroSyncToken: lower.aerosynctoken,
            ConsumerID: lower.consumerid,
            LocationID: lower.locationid,
            Environment: lower.environment,
            Message: lower.message,
            BankAccounts: lower.bankaccounts
        };

        if (oldState) {
            if (this.state.Step == "AeroSync" && oldState.Step != "AeroSync") {
                this.options.onUserCreated();
            }
            else if (this.state.Step == "EnterCode") {
                this.options.onCodeSent();
            }
        }
    }

    launch() {
        if (this.state.Step == "AeroSync") {
            this.showAeroSync();
        }
        else if (this.state.Step == "CreateUser") {
            this.createUser();
        }
        else if (this.state.Step == "EnterCode") {
            this.options.onCodeSent();
        }
    }

    showAeroSync() {
        let self = this;
        let aeroSyncOptions = this.options.aeroSyncOptions;
        aeroSyncOptions.environment = this.state.Environment;
        aeroSyncOptions.token = this.state.AeroSyncToken;
        aeroSyncOptions.consumerId = this.state.ConsumerID;

        aeroSyncOptions.onSuccess = function (event) {
            let paymentMethod = {
                type: "ACH",
                processorToken: {
                    processor: "AeroPay",
                    token: JSON.stringify(event)
                }
            };
            sendPaymentMethodRequest(self, paymentMethod);
        };

        this.aeroSync = window.aerosync.initWidget(aeroSyncOptions);
        this.aeroSync.launch();
    }

    createUser() {
        let self = this;
        let paymentMethod = {
            type: "ACH",
            phoneNumber: typeof self.options.userPhoneNumber == "function" ? self.options.userPhoneNumber() : self.options.userPhoneNumber,
            emailAddress: typeof self.options.userEmailAddress == "function" ? self.options.userEmailAddress() : self.options.userEmailAddress,
            processorToken: {
                processor: "AeroPay",

                //Just always passing resetUser. If createUser is being called on an already confirmed user, assume they want to start the user over.
                resetUser: true 
            }
        };

        let overrideOptions = {
            onSaving: () => { },
            onSaved: (pm, response) => {
                if (response.Action?.Type == "AeroPay") {
                    self.setState(response.Action);
                }
            }
        };

        sendPaymentMethodRequest(self, paymentMethod, overrideOptions);
    }

    resendCode() {
        //Resending the code is just doing the createUser flow again.
        this.createUser();
    }

    enterCode(code) {
        let self = this;
        let paymentMethod = {
            type: "ACH",
            processorToken: {
                processor: "AeroPay",
                aeroPayCode: code
            }
        };

        let overrideOptions = {
            onSaving: () => { },
            onSaved: (pm, response) => {
                if (response.Action?.Type == "AeroPay") {
                    self.setState(response.Action);
                }
            }
        };

        sendPaymentMethodRequest(self, paymentMethod, overrideOptions);
    }
}

export default function (type, elementId, options) {
    return new AeroPay(elementId, options);
}

/*
showAeroPayButton
 - Events
    - onCodeSent? 
    - onUserCreated (after successful first-time user and successful code confirmation)
    - onSaved (after AeroSync)
 - Phone Number
 - Email
 - AeroSync Options

showPaymentMethodForm for just AeroSync?

AeroPay class
 - resendCode
 - enterCode
 - launch (for manually launching without button)
*/
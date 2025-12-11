import * as GIDX from "../lib/index.js";

//In your first CompleteSession request, use get3DSDeviceData to populate paymentMethod.threeDS.
let firstCompleteSessionRequest = {
    paymentMethod: {
        type: "CC", 
        token: "{insert token here}",
        cvv: "123",
        threeDS: GIDX.get3DSDeviceData()
    }
}; 

//Send CompleteSession request, and look for action.type == "3DSChallenge" in the response.
let firstCompleteSessionResponse = {
    action: {
        type: "3DSChallenge",

        //provider: "ApprovelyRapid",
        //url: "https://acs-public.tp.mastercard.com/api/v1/browser_challenges",
        //creq: "eyJ0aHJlZURTU2VydmVyVHJhbnNJRCI6IjcwNzQzNWQxLTk5OGMtNDQ2My05MzY3LWM3ZWNmNTg0ZTEwZCIsImFjc1RyYW5zSUQiOiJhMGY1NmRhNC04NDVlLTRkMTMtYTM5OS0xNDhiY2FiMGM4YmQiLCJjaGFsbGVuZ2VXaW5kb3dTaXplIjoiMDIiLCJtZXNzYWdlVHlwZSI6IkNSZXEiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIn0",
        //transactionId: "707435d1-998c-4463-9367-c7ecf584e10d"

        provider: "Evervault",
        transactionId: "tds_visa_3b17e154076a",
        evervaultTeamId: "team_138d39e80bcb",
        evervaultAppId: "app_eaa0d7860365"
    }
};

document.getElementById("show-challenge").onclick = function () {

    if (firstCompleteSessionResponse.action?.type == "3DSChallenge") {

        GIDX.show3DSChallenge(firstCompleteSessionResponse.action, {
            onComplete: function (transactionId) {

                //Send another CompleteSession request after challenge is completed.
                let completeSessionRequest = {
                    paymentMethod: {
                        type: "CC",
                        token: "{insert token here}",
                        threeDS: {
                            transactionId
                        }
                    }
                };

                console.log(transactionId);
            }
        })

    }
}

GIDX.init({
    merchantId: "1234",
    processorSessionId: {
        type: "Finix",
        merchantId: "MU4cihj5vQnQ1x8zxmE5jG4G"
    }
});

let tokenizer = {
    //type: "Finix",
    //applicationId: "APeETPt5ca7BSf3bTQYnFr5T"
    type: "Evervault",
    teamId: "team_138d39e80bcb",
    appId: "app_eaa0d7860365",
    merchantId: "merchant_14d1b2bc033c"
};

let form = GIDX.showPaymentMethodForm("payment-method-form", {
    //paymentMethodTypes: ["ACH", "CC"]
    merchantSessionId: "1234",
    tokenizer,
    theme: "material"
});

//document.getElementById("save-payment-method").onclick = function () {
//    form.submit();
//}

document.getElementById("get-processor-session-id").onclick = function () {
    alert(GIDX.getProcessorSessionId());
}

GIDX.showGooglePayButton('google-pay-button', {
    merchantSessionId: "1234",
    tokenizer,
    transaction: {
        amount: 1000
    },
    onCancel: function () {
        console.log('Google Pay canceled')
    }
});

GIDX.showApplePayButton('apple-pay-button', {
    merchantSessionId: "1234",
    tokenizer,
    transaction: {
        amount: 1000
    },
    onCancel: function () {
        console.log('Apple Pay canceled')
    }
});

GIDX.showAeroPayButton('aero-pay-button', {
    merchantSessionId: "1234",
    tokenizer: {
        type: "AeroPay"
    }
})
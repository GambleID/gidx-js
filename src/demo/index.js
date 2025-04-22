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
        url: "https://acs-public.tp.mastercard.com/api/v1/browser_challenges",
        creq: "eyJ0aHJlZURTU2VydmVyVHJhbnNJRCI6IjcwNzQzNWQxLTk5OGMtNDQ2My05MzY3LWM3ZWNmNTg0ZTEwZCIsImFjc1RyYW5zSUQiOiJhMGY1NmRhNC04NDVlLTRkMTMtYTM5OS0xNDhiY2FiMGM4YmQiLCJjaGFsbGVuZ2VXaW5kb3dTaXplIjoiMDIiLCJtZXNzYWdlVHlwZSI6IkNSZXEiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIn0",
        transactionId: "707435d1-998c-4463-9367-c7ecf584e10d"
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
    merchantId: "1234"
});

let form = GIDX.showPaymentMethodForm('payment-method-form', {
    //paymentMethodTypes: ['ACH', 'CC']
    tokenizer: {
        name: 'Finix',
        applicationId: 'APeETPt5ca7BSf3bTQYnFr5T'
    },
    showSubmitButton: true,
    hideErrorMessages: false
});

//document.getElementById("save-payment-method").onclick = function () {
//    form.submit();
//}
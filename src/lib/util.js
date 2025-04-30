export function normalizeApiResponse(action) {
    //API responses have properties in C# style case (TransactionID), but we want to support normal javascript style as well (transactionId).
    //Create new object with all keys converted to lower case.
    return Object.fromEntries(
        Object.entries(action).map(([k, v]) => [k.toLowerCase(), v])
    );
}

export function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.setAttribute('src', url);
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('async', 'true');

        script.onload = () => {
            resolve();
        }

        script.onerror = () => {
            reject(new Error(`Could not load script: ${url}`));
        }

        document.head.appendChild(script);
    });
}
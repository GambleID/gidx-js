export function normalizeApiResponse(action) {
    //API responses have properties in C# style case (TransactionID), but we want to support normal javascript style as well (transactionId).
    //Create new object with all keys converted to lower case.
    return Object.fromEntries(
        Object.entries(action).map(([k, v]) => [k.toLowerCase(), v])
    );
}
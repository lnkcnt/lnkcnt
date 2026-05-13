"use client";

import { useSearchParams } from "next/navigation";

/**
 * Resolve query-string error key to user-facing text.
 * @param errorKey - Error key from query string.
 * @returns Human-readable error message.
 */
function getErrorMessage(errorKey?: string | null) {
    // if (errorKey === "invalid_form") {
    //     return "Please provide email, password, and secret code.";
    // }
    // if (errorKey === "server_secret_not_set") {
    //     return "Server is missing DATABASE_PASSWORD configuration.";
    // }
    // if (errorKey === "invalid_secret") {
    //     return "Secret code does not match.";
    // }
    // if (errorKey === "signup_failed") {
    //     return "Failed to create account. The email may already exist.";
    // }
    if (errorKey === "password_not_match") {
        return "Password and Repeat password do not match.";
    } else if (errorKey) {
        return "Failed.";
    } else {
        return null;
    }
}

/**
 * Returns error box component based on errorKey.
 * @returns Error box component with error message.
 */
export default function ErrorMessage() {
    const searchParams = useSearchParams();
    const errorKey = searchParams.get("error");

    /** Resolved search params from the current request. */
    /** Error key from query string. */
    /** User-visible error text rendered above form. */
    const errorMessage = getErrorMessage(errorKey);

    return (
        <>
            {errorMessage ? (
                <p className="border-destructive/40 bg-destructive/10 text-destructive mb-4 rounded-md border p-3 text-sm">
                    {errorMessage}
                </p>
            ) : null}
        </>
    );
}

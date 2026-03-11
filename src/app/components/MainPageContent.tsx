"use client";

import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

/**
 * Copy button component for copying text to clipboard
 * @param text - Text to copy to clipboard
 * @returns JSX.Element containing button
 */
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            type="button"
            onClick={handleCopy}
            variant="outline"
            size="sm"
            title="Copy to clipboard"
        >
            {copied ? (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                </>
            ) : (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    Copy
                </>
            )}
        </Button>
    );
}

/**
 * Form state type
 */
type FormState = {
    message: string;
    success?: boolean;
    generatedId?: string;
    managePage?: string;
    errors?: {
        errors: string[];
        properties: {
            url?: {
                errors: string[];
            };
        };
    };
};

/**
 * Mainpage's content component.
 * @returns JSX.Element containing div.
 */
export default function Content() {
    /** Initial state for the form */
    const initialState: FormState = { message: "" };

    const [state, setState] = useState<FormState>(initialState);
    const [isPending, setIsPending] = useState(false);

    /**
     * Handle form submission by calling POST /api/create.
     * @param e - React form event
     */
    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const url = (form.elements.namedItem("url") as HTMLInputElement).value;

        setIsPending(true);
        setState(initialState);

        try {
            const res = await fetch("/api/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data: FormState = await res.json();
            setState(data);
            if (data.success) form.reset();
        } catch {
            setState({
                message: "Network error. Please try again.",
                errors: {
                    errors: ["Failed to connect to server"],
                    properties: {},
                },
            });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-start px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <h1 className="text-center text-3xl font-black sm:text-4xl md:text-5xl lg:text-6xl">
                URL Shortener +
                <br />
                Click Checker
            </h1>
            <div className="h-10 sm:h-20" />
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 sm:align-middle">
                    <Input
                        name="url"
                        type="url"
                        placeholder="Enter your URL here..."
                        className="h-10 w-full sm:flex-1"
                        required
                    />
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full cursor-pointer sm:w-auto"
                        disabled={isPending}
                    >
                        {isPending ? "Shortening..." : "Shorten!"}
                    </Button>
                </div>
            </form>

            {/* Error Messages */}
            {state.errors && (
                <Alert variant="destructive" className="mt-5 w-full max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{state.message}</AlertTitle>
                    <AlertDescription>
                        <div className="mt-2 space-y-2">
                            {state.errors.errors.length > 0 && (
                                <ul className="list-inside list-disc space-y-1 text-sm">
                                    {state.errors.errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            )}
                            {state.errors.properties.url && (
                                <ul className="list-inside list-disc space-y-1 text-sm">
                                    {state.errors.properties.url.errors?.map(
                                        (error, index) => (
                                            <li key={index}>{error}</li>
                                        ),
                                    )}
                                </ul>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Success Message */}
            {state.success && state.generatedId && (
                <Alert className="mt-5 w-full max-w-2xl border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">
                        {state.message}
                    </AlertTitle>
                    <AlertDescription className="space-y-4">
                        <div className="text-sm font-semibold text-green-900 sm:text-base">
                            MAKE SURE TO BACK UP THE Management Page URL!
                            <br />
                            IF LOST, YOU CANNOT ACCESS THE MANAGEMENT PAGE
                            <br /> AND YOU WILL NOT ABLE TO DELETE OR MODIFY
                            YOUR SHORTENED URL.
                            <br /> IT CAN&apos;T BE RETRIEVED LATER!
                        </div>
                        <div>
                            <p className="font-semibold text-green-900">
                                Shortened URL:
                            </p>
                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                <code className="flex-1 overflow-x-auto rounded border border-gray-300 bg-gray-100 p-2 text-xs sm:text-sm">
                                    {`${typeof window !== "undefined" ? window.location.origin : ""}/${state.generatedId}`}
                                </code>
                                <CopyButton
                                    text={`${typeof window !== "undefined" ? window.location.origin : ""}/${state.generatedId}`}
                                />
                            </div>
                        </div>
                        {state.managePage && (
                            <div>
                                <p className="font-semibold text-green-900">
                                    Management Page:
                                </p>
                                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                    <code className="flex-1 overflow-x-auto rounded border border-gray-300 bg-gray-100 p-2 text-xs sm:text-sm">
                                        {`${typeof window !== "undefined" ? window.location.origin : ""}/manage/${state.managePage}`}
                                    </code>
                                    <CopyButton
                                        text={`${typeof window !== "undefined" ? window.location.origin : ""}/manage/${state.managePage}`}
                                    />
                                </div>
                            </div>
                        )}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}

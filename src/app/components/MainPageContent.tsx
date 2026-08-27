"use client";

import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import ky from "ky";
import { Field, FieldLabel } from "@/src/components/ui/field";
import { ShortenResponse } from "@/src/types";

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
            className="dark:text-white"
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
                        aria-label="Check icon that means success."
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
                        aria-label="Clipboard icon that means copy."
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
 * Mainpage's content component.
 * @returns JSX.Element containing div.
 */
export default function Content() {
    /** Initial state for the form */
    const initialState: ShortenResponse = { success: false, message: "" };

    const [state, setState] = useState<ShortenResponse>(initialState);
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
            const res = await ky.post("/api/url/shorten", {
                body: JSON.stringify({ url: url }),
                headers: { "Content-Type": "application/json" },
                throwHttpErrors: false,
            });
            const body = await res.json<ShortenResponse>();
            if (res.ok) {
                setState(body);
            } else {
                setState({
                    success: body.success,
                    message: body.message,
                    errors: {
                        errors: [body.message],
                        properties: {},
                    },
                });
            }
        } catch {
            setState({
                success: false,
                message: "Internal Server Error",
                errors: {
                    errors: ["Internal Server Error"],
                    properties: {},
                },
            } as ShortenResponse);
            setIsPending(false);
        } finally {
            form.reset();
            setIsPending(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-start px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <h1 className="flex-1 text-center text-3xl font-black sm:text-4xl md:text-5xl lg:text-6xl">
                URL Shortener +
                <br />
                Click Checker
            </h1>
            <div className="h-20 grow max-md:h-10" />
            <form onSubmit={handleSubmit} className="w-full max-w-2xl flex-2">
                <Field>
                    <FieldLabel htmlFor="main-content">URL</FieldLabel>
                    <div className="flex flex-row gap-2">
                        <Input
                            id="main-content"
                            name="url"
                            type="url"
                            placeholder="Enter your URL here..."
                            className="flex-5"
                            required
                        />
                        <Button
                            type="submit"
                            className="flex-1 cursor-pointer"
                            disabled={isPending}
                        >
                            {isPending ? "Shortening..." : "Shorten!"}
                        </Button>
                    </div>
                </Field>
            </form>

            {/* Error Messages */}
            {state.errors && (
                <Alert variant="destructive" className="mt-5 w-full max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{state.message}</AlertTitle>
                    {/* {state.errors.errors.length > 0 && (
                        <AlertDescription>
                            <div className="mt-2 space-y-2">
                                <ul className="list-inside list-disc space-y-1 text-sm">
                                    {state.errors.errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
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
                    )} */}
                </Alert>
            )}

            {/* Success Message */}
            {state.success && state.generatedId && (
                <Alert className="mt-5 w-full max-w-2xl border-green-500 bg-green-50 dark:border-emerald-500 dark:bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-emerald-400" />
                    <AlertTitle className="text-green-800 dark:text-emerald-400">
                        {state.message}
                    </AlertTitle>
                    <AlertDescription className="space-y-4">
                        <div className="text-sm font-semibold text-green-900 sm:text-base dark:text-white">
                            MAKE SURE TO BACK UP THE Management Page URL!
                            <br />
                            IF LOST, YOU CANNOT ACCESS THE MANAGEMENT PAGE
                            <br /> AND YOU WILL NOT ABLE TO DELETE OR MODIFY
                            YOUR SHORTENED URL.
                            <br /> IT CAN&apos;T BE RETRIEVED LATER!
                        </div>
                        <div>
                            <p className="font-semibold text-green-900 dark:text-white">
                                Shortened URL:
                            </p>
                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                <code className="flex-1 overflow-x-auto rounded border border-gray-300 bg-gray-100 p-2 text-xs text-black sm:text-sm">
                                    {`${typeof window !== "undefined" ? window.location.origin : ""}/${state.generatedId}`}
                                </code>
                                <CopyButton
                                    text={`${typeof window !== "undefined" ? window.location.origin : ""}/${state.generatedId}`}
                                />
                            </div>
                        </div>
                        {state.managePage && (
                            <div>
                                <p className="font-semibold text-green-900 dark:text-white">
                                    Management Page:
                                </p>
                                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                    <code className="flex-1 overflow-x-auto rounded border border-gray-300 bg-gray-100 p-2 text-xs text-black sm:text-sm">
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

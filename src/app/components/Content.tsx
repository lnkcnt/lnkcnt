"use client";

import Form from "next/form";
import React, { useActionState } from "react";
import { useFormStatus } from "react-dom";

/**
 * Submit button component with pending state
 * @returns JSX.Element containing button
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-xl" disabled={pending}>
      {pending ? "Shortening..." : "Shorten!"}
    </button>
  );
}

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
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-sm btn-outline"
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
    </button>
  );
}

/**
 * Server action function type for URL generation
 */
type GenURLFunc = (state: FormState, formData: FormData) => Promise<FormState>;

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
 * @param props - Component props
 * @param props.genURL - Server action for URL generation
 * @returns JSX.Element containing div.
 */
export default function Content({ genURL }: { genURL: GenURLFunc }) {
  /**
   * Initial state for the form
   */
  const initialState: FormState = { message: "" };

  const [state, formAction] = useActionState(genURL, initialState);

  return (
    <div className="m-1% flex flex-col items-center justify-start p-10">
      <h1 className="text-6xl font-black">URL Shortener + Click Checker</h1>
      <div className="h-20" />
      <Form
        action={formAction}
        className="flex flex-row justify-center align-middle"
      >
        <input
          name="url"
          type="text"
          placeholder="Enter your URL here..."
          className="input input-xl"
          required
        />
        <div className="w-5"></div>
        <SubmitButton />
      </Form>

      {/* Error Messages */}
      {state.errors && (
        <div className="alert alert-error mt-5 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">{state.message}</h3>
            {state.errors.errors.length > 0 && (
              <ul className="list-inside list-disc">
                {state.errors.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
            {state.errors.properties.url && (
              <ul className="list-inside list-disc">
                {state.errors.properties.url.errors?.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {state.success && state.generatedId && (
        <div className="alert alert-success mt-5 max-w-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold">{state.message}</h3>
            <h3 className="font-extrabold">
              MAKE SURE TO BACK UP THE Management Page URL!
              <br />
              IF LOST, YOU CANNOT ACCESS THE MANAGEMENT PAGE
              <br /> AND YOU WILL NOT ABLE TO DELETE OR MODIFY YOUR SHORTENED
              URL.
              <br /> IT CAN&apos;T BE RETRIEVED LATER!
            </h3>
            <div className="h-1" />
            <div>
              <p className="font-semibold">Shortened URL:</p>
              <div className="h-2" />
              <div className="flex gap-2">
                <code className="bg-base-200 flex-1 rounded p-2 text-sm">
                  {`${typeof window !== "undefined" ? window.location.origin : ""}/${state.generatedId}`}
                </code>
                <CopyButton
                  text={`${typeof window !== "undefined" ? window.location.origin : ""}/${state.generatedId}`}
                />
              </div>
            </div>
            <div className="h-1" />
            {state.managePage && (
              <div>
                <p className="font-semibold">Management Page:</p>
                <div className="h-2" />
                <div className="flex gap-2">
                  <code className="bg-base-200 flex-1 rounded p-2 text-sm">
                    {`${typeof window !== "undefined" ? window.location.origin : ""}/manage/${state.managePage}`}
                  </code>
                  <CopyButton
                    text={`${typeof window !== "undefined" ? window.location.origin : ""}/manage/${state.managePage}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

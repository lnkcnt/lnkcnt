"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import React, { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle } from "lucide-react";

/**
 * Submit button component with pending state
 * @returns JSX.Element containing button
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Shortening..." : "Shorten!"}
    </Button>
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
      <Form action={formAction} className="w-150">
        <div className="flex flex-row justify-center gap-4 align-middle">
          <Input
            name="url"
            type="url"
            placeholder="Enter your URL here..."
            className="h-10"
            required
          />
          <Button type="submit" size="lg" className="cursor-pointer">
            Shorten!
          </Button>
        </div>
      </Form>

      {/* Error Messages */}
      {state.errors && (
        <Alert variant="destructive" className="mt-5 max-w-md">
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
                  {state.errors.properties.url.errors?.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {state.success && state.generatedId && (
        <Alert className="mt-5 max-w-2xl border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">{state.message}</AlertTitle>
          <AlertDescription className="space-y-4">
            <div className="font-semibold text-green-900">
              MAKE SURE TO BACK UP THE Management Page URL!
              <br />
              IF LOST, YOU CANNOT ACCESS THE MANAGEMENT PAGE
              <br /> AND YOU WILL NOT ABLE TO DELETE OR MODIFY YOUR SHORTENED
              URL.
              <br /> IT CAN&apos;T BE RETRIEVED LATER!
            </div>
            <div>
              <p className="font-semibold text-green-900">Shortened URL:</p>
              <div className="mt-2 flex gap-2">
                <code className="flex-1 rounded border border-gray-300 bg-gray-100 p-2 text-sm">
                  {`${typeof window !== "undefined" ? window.location.origin : ""}/${state.generatedId}`}
                </code>
                <CopyButton
                  text={`${typeof window !== "undefined" ? window.location.origin : ""}/${state.generatedId}`}
                />
              </div>
            </div>
            {state.managePage && (
              <div>
                <p className="font-semibold text-green-900">Management Page:</p>
                <div className="mt-2 flex gap-2">
                  <code className="flex-1 rounded border border-gray-300 bg-gray-100 p-2 text-sm">
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

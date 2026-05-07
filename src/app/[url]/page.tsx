"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { resolveRedirectUrl } from "./ServerRedirectAction";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface RedirectionProps {
    params: Promise<{ url: string }>;
}

/**
 * Client-side redirection page
 * @param params - Dynamic route params promise
 * @returns Loading UI while resolving the redirect target on server
 */
export default function Redirection({ params }: RedirectionProps) {
    const { url } = use(params);
    const [isNotFound, setIsNotFound] = useState<boolean>(false);
    const [isTrusted, setIsTrusted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [redirectUrl, setRedirectUrl] = useState<string>("");
    const [warningCount, setWarningCount] = useState<number>(5);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        /**
         * Resolves and redirects to target URL
         */
        const resolveURL = async (): Promise<void> => {
            try {
                const result = await resolveRedirectUrl(url);
                if (!isMounted) return;

                if (!result.redirectUrl) {
                    setIsNotFound(true);
                    return;
                }

                if (result.isTrusted) {
                    setIsTrusted(true);
                }

                setRedirectUrl(result.redirectUrl);
                setIsLoading(false);
            } catch {
                if (!isMounted) return;
                setIsNotFound(true);
            }
        };

        resolveURL();

        return () => {
            isMounted = false;
        };
    }, [url]);

    useEffect(() => {
        if (isTrusted) {
            router.push(redirectUrl);
        }
    }, [isTrusted, redirectUrl, router]);

    useEffect(() => {
        const timer = setInterval(() => {
            setWarningCount((warningCount) => warningCount - 1);
            if (warningCount < 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [warningCount]);

    if (isNotFound) {
        notFound();
    }

    if (isTrusted || isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground text-sm">
                    Redirecting...
                </p>
            </main>
        );
    } else {
        return (
            <div className="flex flex-col items-center justify-start gap-5 p-10 text-center max-sm:items-stretch">
                <div className="amber-50 flex flex-row items-center justify-center gap-5 text-amber-800 dark:text-amber-400">
                    <TriangleAlert className="h-8 w-8" />
                    <p className="text-4xl font-bold">WARNING</p>
                </div>
                <p>
                    This page may not be safe.
                    <br />
                    Please double-check the URL before move.
                </p>
                <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => router.push(`/report/${url}`)}
                >
                    <TriangleAlert />
                    Report URL
                </Button>
                <code className="rounded border border-gray-300 bg-gray-100 p-2 text-xs text-black sm:text-sm">
                    {redirectUrl}
                </code>
                <div className="flex flex-row items-center justify-center gap-3 max-sm:flex-col max-sm:items-stretch">
                    <Button
                        disabled={
                            warningCount !== null ? warningCount >= 0 : false
                        }
                        id="main-content"
                        onClick={() => router.push(redirectUrl)}
                    >
                        {warningCount >= 0 ? warningCount : "Continue"}
                    </Button>
                    <Button variant="secondary" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }
}

"use client";

import { Button } from "@/src/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function RedirectionWarning({
    isTrusted,
    redirectUrl,
}: {
    isTrusted: boolean;
    redirectUrl: string;
}) {
    const router = useRouter();
    const [warningCount, setWarningCount] = useState<number>(5);
    const { url } = useParams();

    if (isTrusted) {
        router.push(redirectUrl);
    }

    useEffect(() => {
        if (warningCount < 0) {
            return;
        }
        const timer = setInterval(() => {
            setWarningCount((prev) => prev - 1);
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [warningCount]);

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
            <form
                autoComplete="off"
                className="flex flex-row items-center justify-center gap-3 max-sm:flex-col max-sm:items-stretch"
            >
                <Button
                    disabled={warningCount > 0}
                    id="main-content"
                    onClick={() => router.push(redirectUrl)}
                >
                    {warningCount > 0 ? warningCount : "Continue"}
                </Button>
                <Button variant="secondary" onClick={() => router.back()}>
                    Go Back
                </Button>
            </form>
        </div>
    );
}

"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { resolveRedirectUrl } from "./ServerRedirectAction";

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
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        /**
         * Resolves and redirects to target URL
         */
        const resolveAndRedirect = async (): Promise<void> => {
            try {
                const result = await resolveRedirectUrl(url);
                if (!isMounted) return;

                if (!result.redirectUrl) {
                    setIsNotFound(true);
                    return;
                }

                router.push(result.redirectUrl);
            } catch {
                if (!isMounted) return;
                setIsNotFound(true);
            }
        };

        void resolveAndRedirect();

        return () => {
            isMounted = false;
        };
    }, [url, router]);

    if (isNotFound) {
        notFound();
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <p className="text-muted-foreground text-sm">
                리다이렉트 중입니다...
            </p>
        </main>
    );
}

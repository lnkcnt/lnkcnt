"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import { Spinner } from "@/src/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { JSX } from "react";

interface SessionInfo {
    expiresAt: Date;
    email?: string;
}

/**
 * 클라이언트 측 관리 페이지 컴포넌트.
 * 세션 정보, 유효시간 표시 및 갱신 기능 제공.
 * @returns 관리 페이지 콘텐츠
 */
export function AdminPageClient(): JSX.Element {
    /** 현재 활성 세션 정보 */
    const { data: session, isPending } = authClient.useSession();

    /** 세션 유효시간 정보 */
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

    /** 세션 갱신 중 상태 */
    const [isRefreshing, setIsRefreshing] = useState(false);

    /** 현재 시간 (매 초 업데이트) */
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    /**
     * 컴포넌트 초기화 시 세션 정보 업데이트
     */
    useEffect(() => {
        if (session?.session?.expiresAt) {
            setSessionInfo({
                expiresAt: new Date(session.session.expiresAt),
                email: session.user?.email,
            });
        }
    }, [session]);

    /**
     * 매 초 현재 시간 업데이트
     */
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    /**
     * 타이머가 0이 되면 자동 새로고침
     */
    useEffect(() => {
        if (sessionInfo) {
            const timeLeft = getTimeLeft(sessionInfo.expiresAt);
            if (timeLeft <= 0) {
                window.location.reload();
            }
        }
    }, [currentTime, sessionInfo]);

    /**
     * 세션 갱신 handler
     */
    const handleRefreshSession = async (): Promise<void> => {
        setIsRefreshing(true);
        try {
            // 서버에서 세션 정보를 다시 가져와 갱신
            const result = await authClient.getSession();

            if (result?.data?.session?.expiresAt) {
                setSessionInfo({
                    expiresAt: new Date(result.data.session.expiresAt),
                    email: result.data.user?.email,
                });
            }
        } catch (error) {
            console.error("Failed to refresh session:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    /**
     * 남은 시간 계산 (밀리초)
     * @param expiresAt - 세션 만료 시간
     * @returns 남은 시간 (밀리초)
     */
    const getTimeLeft = (expiresAt: Date): number => {
        return expiresAt.getTime() - currentTime.getTime();
    };

    /**
     * 세션 만료 위험도에 따른 스타일링
     * @param timeLeft - 남은 시간 (밀리초)
     * @returns CSS 클래스 문자열
     */
    const getExpiryWarningClass = (timeLeft: number): string => {
        const minutesLeft = timeLeft / (1000 * 60);

        if (minutesLeft < 1) return "text-red-600"; // 5분 미만: 빨강
        if (minutesLeft < 3) return "text-amber-600"; // 30분 미만: 주황
        return "text-green-600"; // 30분 이상: 초록
    };

    /**
     * 남은 시간을 mm:ss 형식으로 포맷
     * @param timeLeft - 남은 시간 (밀리초)
     * @returns 포맷된 시간 문자열
     */
    const formatTimeLeft = (timeLeft: number): string => {
        if (timeLeft < 0) return "00:00";

        const totalSeconds = Math.floor(timeLeft / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    if (isPending) {
        return (
            <main className="container mx-auto flex min-h-[70dvh] items-center justify-center px-4 py-10">
                <Spinner />
            </main>
        );
    }

    return (
        <main className="container mx-auto space-y-6 px-4 py-10">
            {/* 세션 정보 카드 */}
            <Card>
                <CardContent className="space-y-4">
                    {sessionInfo && (
                        <>
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <div
                                        className={`text-2xl font-semibold ${getExpiryWarningClass(getTimeLeft(sessionInfo.expiresAt))}`}
                                    >
                                        {formatTimeLeft(
                                            getTimeLeft(sessionInfo.expiresAt),
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleRefreshSession}
                                    disabled={isRefreshing}
                                >
                                    {isRefreshing ? (
                                        <>
                                            <Spinner className="mr-2 h-4 w-4" />
                                            갱신 중...
                                        </>
                                    ) : (
                                        "세션 갱신"
                                    )}
                                </Button>
                                <SignOutForm />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* 관리 도구 카드 */}
            <Card>
                <CardHeader>
                    <CardTitle>관리 도구</CardTitle>
                    <CardDescription>
                        This screen is only available to authenticated users.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Add your admin-only management tools here.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}

/**
 * 로그아웃 폼 컴포넌트.
 * @returns 로그아웃 버튼을 포함한 폼
 */
function SignOutForm(): JSX.Element {
    /** 로그아웃 중 상태 */
    const [isLoading, setIsLoading] = useState(false);

    /** Next.js 라우터 */
    const router = useRouter();

    /**
     * 로그아웃 handler
     */
    const handleSignOut = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await authClient.signOut();
            router.push("/");
        } catch (error) {
            console.error("Failed to sign out:", error);
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSignOut}
            variant="destructive"
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Sign Out...
                </>
            ) : (
                "Sign Out"
            )}
        </Button>
    );
}

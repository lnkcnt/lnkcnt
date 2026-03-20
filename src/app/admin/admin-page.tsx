"use client";

import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Spinner } from "@/src/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/src/components/ui/table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { JSX } from "react";

interface SessionInfo {
    expiresAt: Date;
    email?: string;
}

interface ReportItem {
    reportId: number;
    id: string;
    reason: string;
    message: string;
    ip: string;
    createdAt: string;
    redirectUrl: string;
}

interface LinkItem {
    id: string;
    redirectUrl: string;
    managePage: string | null;
}

interface BlacklistItem {
    blacklistId: number;
    pattern: string;
    note: string | null;
    createdAt: string;
}

interface ActionFeedback {
    type: "success" | "error";
    text: string;
}

interface BlockDialogState {
    source: "report" | "link";
    targetId: string;
    pattern: string;
    report?: ReportItem;
    link?: LinkItem;
}

interface AdminPageClientProps {
    initialReports: ReportItem[];
    initialLinks: LinkItem[];
    initialBlacklistEntries: BlacklistItem[];
    blockURL: (pattern: string, note?: string | null) => Promise<BlacklistItem>;
    removeBlockedURL: (blacklistId: number) => Promise<void>;
    deleteLink: (linkId: string) => Promise<void>;
    deleteReport: (reportId: number) => Promise<void>;
}

/**
 * Extract a domain-like blacklist pattern from URL text.
 * @param url - Full URL string.
 * @returns Hostname when parsable, otherwise the original trimmed value.
 */
function getSuggestedPattern(url: string): string {
    try {
        return new URL(url).hostname.toLowerCase();
    } catch {
        return url.trim().toLowerCase();
    }
}

/**
 * 클라이언트 측 관리 페이지 컴포넌트.
 * 세션 정보, 유효시간 표시 및 갱신 기능 제공.
 * @param props - Component props with initial data and server actions.
 * @returns 관리 페이지 콘텐츠
 */
export function AdminPageClient({
    initialReports,
    initialLinks,
    initialBlacklistEntries,
    blockURL,
    removeBlockedURL,
    deleteLink,
    deleteReport,
}: AdminPageClientProps): JSX.Element {
    /** 현재 활성 세션 정보 */
    const { data: session, isPending } = authClient.useSession();

    /** 세션 유효시간 정보 */
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

    /** 세션 갱신 중 상태 */
    const [isRefreshing, setIsRefreshing] = useState(false);

    /** 현재 시간 (매 초 업데이트) */
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    /** 신고 목록 */
    const [reports, setReports] = useState<ReportItem[]>(initialReports);

    /** 단축 URL 목록 */
    const [links, setLinks] = useState<LinkItem[]>(initialLinks);

    /** URL 블랙리스트 목록 */
    const [blacklistEntries, setBlacklistEntries] = useState<BlacklistItem[]>(
        initialBlacklistEntries,
    );

    /** 신고별 차단 패턴 입력값 */
    const [reportPatternInputs, setReportPatternInputs] = useState<
        Record<number, string>
    >({});

    /** URL별 차단 패턴 입력값 */
    const [linkPatternInputs, setLinkPatternInputs] = useState<
        Record<string, string>
    >({});

    /** 수동 블랙리스트 등록 패턴 입력값 */
    const [manualBlockPattern, setManualBlockPattern] = useState("");

    /** 수동 블랙리스트 등록 메모 입력값 */
    const [manualBlockNote, setManualBlockNote] = useState("");

    /** 차단 사유 입력 다이얼로그 상태 */
    const [blockDialogState, setBlockDialogState] =
        useState<BlockDialogState | null>(null);

    /** 다이얼로그의 차단 사유 입력값 */
    const [blockDialogReason, setBlockDialogReason] = useState("");

    /** 개별 액션 로딩 상태 */
    const [actionLoadingMap, setActionLoadingMap] = useState<
        Record<string, boolean>
    >({});

    /** 액션 결과 메시지 */
    const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(
        null,
    );

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
     * Initialize state with initial data
     */
    useEffect(() => {
        setReports(initialReports);
        setLinks(initialLinks);
        setBlacklistEntries(initialBlacklistEntries);
        const reportInputs: Record<number, string> = {};
        initialReports.forEach((report) => {
            reportInputs[report.reportId] = getSuggestedPattern(
                report.redirectUrl,
            );
        });
        setReportPatternInputs(reportInputs);

        const linkInputs: Record<string, string> = {};
        initialLinks.forEach((link) => {
            linkInputs[link.id] = getSuggestedPattern(link.redirectUrl);
        });
        setLinkPatternInputs(linkInputs);
    }, [initialReports, initialLinks, initialBlacklistEntries]);

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
            const timeLeft =
                sessionInfo.expiresAt.getTime() - currentTime.getTime();
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
     * 신고 항목 기준으로 차단 다이얼로그를 연다.
     * @param report - 신고 데이터.
     */
    const openBlockDialogFromReport = (report: ReportItem): void => {
        const pattern = reportPatternInputs[report.reportId]
            ?.trim()
            .toLowerCase();

        if (!pattern) {
            setActionFeedback({
                type: "error",
                text: "신고 차단 패턴을 입력해 주세요.",
            });
            return;
        }

        setBlockDialogReason("");
        setBlockDialogState({
            source: "report",
            targetId: String(report.reportId),
            pattern,
            report,
        });
    };

    /**
     * URL 항목 기준으로 차단 다이얼로그를 연다.
     * @param link - URL 데이터.
     */
    const openBlockDialogFromLink = (link: LinkItem): void => {
        const pattern = linkPatternInputs[link.id]?.trim().toLowerCase();

        if (!pattern) {
            setActionFeedback({
                type: "error",
                text: "URL 차단 패턴을 입력해 주세요.",
            });
            return;
        }

        setBlockDialogReason("");
        setBlockDialogState({
            source: "link",
            targetId: link.id,
            pattern,
            link,
        });
    };

    /**
     * 차단 다이얼로그를 닫고 입력을 초기화한다.
     */
    const closeBlockDialog = (): void => {
        setBlockDialogState(null);
        setBlockDialogReason("");
    };

    /**
     * 다이얼로그에서 입력한 사유로 차단을 수행한다.
     */
    const handleConfirmBlockInDialog = async (): Promise<void> => {
        if (!blockDialogState) {
            return;
        }

        const actionKey =
            blockDialogState.source === "report"
                ? `report-block-${blockDialogState.targetId}`
                : `link-block-${blockDialogState.targetId}`;
        const note = blockDialogReason.trim();

        setActionLoadingMap((prev) => ({ ...prev, [actionKey]: true }));

        try {
            const savedEntry = await blockURL(blockDialogState.pattern, note);
            setActionFeedback({
                type: "success",
                text: `패턴 '${blockDialogState.pattern}' 을(를) 차단 목록에 추가했습니다.`,
            });
            setBlacklistEntries((prev) => {
                const filtered = prev.filter(
                    (entry) => entry.pattern !== savedEntry.pattern,
                );
                return [savedEntry, ...filtered];
            });

            if (
                blockDialogState.source === "report" &&
                blockDialogState.report
            ) {
                setReports((prev) =>
                    prev.filter(
                        (r) => r.reportId !== blockDialogState.report?.reportId,
                    ),
                );
            }

            closeBlockDialog();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "차단에 실패했습니다.";
            setActionFeedback({
                type: "error",
                text: errorMessage,
            });
        } finally {
            setActionLoadingMap((prev) => ({ ...prev, [actionKey]: false }));
        }
    };

    const handleDeleteReport = async (report: ReportItem): Promise<void> => {
        const actionKey = `report-rm-${report.reportId}`;
        setActionLoadingMap((prev) => ({ ...prev, [actionKey]: true }));

        try {
            await deleteReport(report.reportId);
            setActionFeedback({
                type: "success",
                text: "해당 신고가 삭제되었습니다.",
            });
            setReports((prev) =>
                prev.filter((r) => r.reportId !== report.reportId),
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "신고를 기각하지 못했습니다.";
            setActionFeedback({
                type: "error",
                text: errorMessage,
            });
        } finally {
            setActionLoadingMap((prev) => ({ ...prev, [actionKey]: false }));
        }
    };

    /**
     * 단축 URL을 삭제한다.
     * @param linkId - 삭제할 단축 URL id.
     */
    const handleDeleteLink = async (linkId: string): Promise<void> => {
        const actionKey = `link-delete-${linkId}`;
        setActionLoadingMap((prev) => ({ ...prev, [actionKey]: true }));

        try {
            await deleteLink(linkId);
            setActionFeedback({
                type: "success",
                text: `단축 URL '${linkId}' 을(를) 삭제했습니다.`,
            });
            setLinks((prev) => prev.filter((l) => l.id !== linkId));
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "URL 삭제에 실패했습니다.";
            setActionFeedback({
                type: "error",
                text: errorMessage,
            });
        } finally {
            setActionLoadingMap((prev) => ({ ...prev, [actionKey]: false }));
        }
    };

    /**
     * 수동으로 URL 차단 패턴을 등록한다.
     */
    const handleAddManualBlock = async (): Promise<void> => {
        const actionKey = "blacklist-add";
        const pattern = manualBlockPattern.trim().toLowerCase();
        const note = manualBlockNote.trim();

        if (!pattern) {
            setActionFeedback({
                type: "error",
                text: "차단할 패턴을 입력해 주세요.",
            });
            return;
        }

        setActionLoadingMap((prev) => ({ ...prev, [actionKey]: true }));

        try {
            const savedEntry = await blockURL(pattern, note);
            setActionFeedback({
                type: "success",
                text: `패턴 '${pattern}' 을(를) 차단 목록에 추가했습니다.`,
            });
            setBlacklistEntries((prev) => {
                const filtered = prev.filter(
                    (entry) => entry.pattern !== pattern,
                );
                return [savedEntry, ...filtered];
            });
            setManualBlockPattern("");
            setManualBlockNote("");
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "차단 목록 추가에 실패했습니다.";
            setActionFeedback({
                type: "error",
                text: errorMessage,
            });
        } finally {
            setActionLoadingMap((prev) => ({ ...prev, [actionKey]: false }));
        }
    };

    /**
     * 블랙리스트 항목을 삭제한다.
     * @param entry - 삭제 대상 블랙리스트 항목.
     */
    const handleRemoveBlacklistEntry = async (
        entry: BlacklistItem,
    ): Promise<void> => {
        const actionKey = `blacklist-remove-${entry.blacklistId}`;
        setActionLoadingMap((prev) => ({ ...prev, [actionKey]: true }));

        try {
            await removeBlockedURL(entry.blacklistId);
            setActionFeedback({
                type: "success",
                text: `패턴 '${entry.pattern}' 을(를) 차단 목록에서 삭제했습니다.`,
            });
            setBlacklistEntries((prev) =>
                prev.filter((item) => item.pattern !== entry.pattern),
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "차단 목록 삭제에 실패했습니다.";
            setActionFeedback({
                type: "error",
                text: errorMessage,
            });
        } finally {
            setActionLoadingMap((prev) => ({ ...prev, [actionKey]: false }));
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
            {actionFeedback && (
                <Alert
                    variant={
                        actionFeedback.type === "error"
                            ? "destructive"
                            : "default"
                    }
                >
                    <AlertDescription>{actionFeedback.text}</AlertDescription>
                </Alert>
            )}

            {/* 세션 정보 카드 */}
            <Card>
                <CardHeader>
                    <CardTitle>세션 정보</CardTitle>
                    <CardDescription>
                        로그인 세션 상태를 확인하고 수동 갱신할 수 있습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sessionInfo && (
                        <>
                            <div className="space-y-2">
                                <div className="text-muted-foreground text-sm">
                                    사용자: {sessionInfo.email ?? "Unknown"}
                                </div>
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

            {/* 신고 관리 카드 */}
            <Card>
                <CardHeader>
                    <CardTitle>신고 접수 내역</CardTitle>
                    <CardDescription>
                        접수된 신고를 확인하고 차단 목록에 즉시 추가할 수
                        있습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {reports.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            접수된 신고가 없습니다.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>신고 ID</TableHead>
                                        <TableHead>단축 URL ID</TableHead>
                                        <TableHead>원본 URL</TableHead>
                                        <TableHead>사유</TableHead>
                                        <TableHead>차단 패턴</TableHead>
                                        <TableHead className="text-right">
                                            작업
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.map((report) => {
                                        const actionKey = `report-block-${report.reportId}`;
                                        const isActionLoading =
                                            actionLoadingMap[actionKey] ??
                                            false;

                                        return (
                                            <TableRow key={report.reportId}>
                                                <TableCell>
                                                    #{report.reportId}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {report.id}
                                                </TableCell>
                                                <TableCell
                                                    className="max-w-64 truncate"
                                                    title={report.redirectUrl}
                                                >
                                                    {report.redirectUrl}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div>
                                                            {report.reason}
                                                        </div>
                                                        <div
                                                            className="text-muted-foreground max-w-64 truncate text-xs"
                                                            title={
                                                                report.message
                                                            }
                                                        >
                                                            {report.message}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={
                                                            reportPatternInputs[
                                                                report.reportId
                                                            ] ?? ""
                                                        }
                                                        onChange={(event) =>
                                                            setReportPatternInputs(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [report.reportId]:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        placeholder="example.com"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                openBlockDialogFromReport(
                                                                    report,
                                                                )
                                                            }
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                        >
                                                            {isActionLoading ? (
                                                                <>
                                                                    <Spinner className="mr-2 h-4 w-4" />
                                                                    처리 중...
                                                                </>
                                                            ) : (
                                                                "차단 목록 추가"
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDeleteReport(
                                                                    report,
                                                                )
                                                            }
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                        >
                                                            {isActionLoading ? (
                                                                <>
                                                                    <Spinner className="mr-2 h-4 w-4" />
                                                                    처리 중...
                                                                </>
                                                            ) : (
                                                                "기각"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* URL 관리 카드 */}
            <Card>
                <CardHeader>
                    <CardTitle>단축 URL 관리</CardTitle>
                    <CardDescription>
                        단축 URL 목록을 확인하고 삭제 또는 차단 목록 추가를
                        수행할 수 있습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {links.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            등록된 단축 URL이 없습니다.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>단축 URL ID</TableHead>
                                        <TableHead>원본 URL</TableHead>
                                        <TableHead>차단 패턴</TableHead>
                                        <TableHead className="text-right">
                                            작업
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {links.map((link) => {
                                        const blockActionKey = `link-block-${link.id}`;
                                        const deleteActionKey = `link-delete-${link.id}`;
                                        const isBlockLoading =
                                            actionLoadingMap[blockActionKey] ??
                                            false;
                                        const isDeleteLoading =
                                            actionLoadingMap[deleteActionKey] ??
                                            false;

                                        return (
                                            <TableRow key={link.id}>
                                                <TableCell className="font-mono text-xs">
                                                    {link.id}
                                                </TableCell>
                                                <TableCell
                                                    className="max-w-80 truncate"
                                                    title={link.redirectUrl}
                                                >
                                                    {link.redirectUrl}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={
                                                            linkPatternInputs[
                                                                link.id
                                                            ] ?? ""
                                                        }
                                                        onChange={(event) =>
                                                            setLinkPatternInputs(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [link.id]:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        placeholder="example.com"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                openBlockDialogFromLink(
                                                                    link,
                                                                )
                                                            }
                                                            disabled={
                                                                isBlockLoading ||
                                                                isDeleteLoading
                                                            }
                                                        >
                                                            {isBlockLoading ? (
                                                                <>
                                                                    <Spinner className="mr-2 h-4 w-4" />
                                                                    처리 중...
                                                                </>
                                                            ) : (
                                                                "차단"
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleDeleteLink(
                                                                    link.id,
                                                                )
                                                            }
                                                            disabled={
                                                                isBlockLoading ||
                                                                isDeleteLoading
                                                            }
                                                        >
                                                            {isDeleteLoading ? (
                                                                <>
                                                                    <Spinner className="mr-2 h-4 w-4" />
                                                                    삭제 중...
                                                                </>
                                                            ) : (
                                                                "삭제"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 블랙리스트 관리 카드 */}
            <Card>
                <CardHeader>
                    <CardTitle>URL 블랙리스트 관리</CardTitle>
                    <CardDescription>
                        차단 패턴을 수동으로 추가하거나 기존 항목을 삭제할 수
                        있습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <Input
                            value={manualBlockPattern}
                            onChange={(event) =>
                                setManualBlockPattern(event.target.value)
                            }
                            placeholder="차단 패턴 (예: example.com)"
                        />
                        <Input
                            value={manualBlockNote}
                            onChange={(event) =>
                                setManualBlockNote(event.target.value)
                            }
                            placeholder="메모 (선택)"
                        />
                        <Button
                            onClick={handleAddManualBlock}
                            disabled={
                                actionLoadingMap["blacklist-add"] ?? false
                            }
                        >
                            {actionLoadingMap["blacklist-add"] ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    차단 중...
                                </>
                            ) : (
                                "차단"
                            )}
                        </Button>
                    </div>

                    {blacklistEntries.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            등록된 차단 패턴이 없습니다.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>패턴</TableHead>
                                        <TableHead>메모</TableHead>
                                        <TableHead>등록일</TableHead>
                                        <TableHead className="text-right">
                                            작업
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blacklistEntries.map((entry) => {
                                        const actionKey = `blacklist-remove-${entry.blacklistId}`;
                                        const isRemoving =
                                            actionLoadingMap[actionKey] ??
                                            false;

                                        return (
                                            <TableRow
                                                key={`${entry.pattern}-${entry.blacklistId}`}
                                            >
                                                <TableCell className="font-mono text-xs">
                                                    {entry.pattern}
                                                </TableCell>
                                                <TableCell
                                                    className="max-w-80 truncate"
                                                    title={entry.note ?? ""}
                                                >
                                                    {entry.note ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        entry.createdAt,
                                                    ).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveBlacklistEntry(
                                                                    entry,
                                                                )
                                                            }
                                                            disabled={
                                                                isRemoving
                                                            }
                                                        >
                                                            {isRemoving ? (
                                                                <>
                                                                    <Spinner className="mr-2 h-4 w-4" />
                                                                    해제 중...
                                                                </>
                                                            ) : (
                                                                "차단 해제"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={blockDialogState !== null}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        closeBlockDialog();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>차단 사유 입력</DialogTitle>
                        <DialogDescription>
                            차단 사유는 선택 사항입니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <Input
                            value={blockDialogState?.pattern ?? ""}
                            readOnly
                        />
                        <Input
                            value={blockDialogReason}
                            onChange={(event) =>
                                setBlockDialogReason(event.target.value)
                            }
                            placeholder="차단 사유 (선택)"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={closeBlockDialog}
                            disabled={
                                blockDialogState
                                    ? (actionLoadingMap[
                                          blockDialogState.source === "report"
                                              ? `report-block-${blockDialogState.targetId}`
                                              : `link-block-${blockDialogState.targetId}`
                                      ] ?? false)
                                    : false
                            }
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleConfirmBlockInDialog}
                            variant="destructive"
                            disabled={
                                blockDialogState
                                    ? (actionLoadingMap[
                                          blockDialogState.source === "report"
                                              ? `report-block-${blockDialogState.targetId}`
                                              : `link-block-${blockDialogState.targetId}`
                                      ] ?? false)
                                    : true
                            }
                        >
                            {blockDialogState &&
                            (actionLoadingMap[
                                blockDialogState.source === "report"
                                    ? `report-block-${blockDialogState.targetId}`
                                    : `link-block-${blockDialogState.targetId}`
                            ] ??
                                false) ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    처리 중...
                                </>
                            ) : (
                                "차단"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
        <Button onClick={handleSignOut} variant="outline" disabled={isLoading}>
            {isLoading ? (
                <>
                    <Spinner className="mr-2 h-4 w-4" />
                    로그아웃 중...
                </>
            ) : (
                "로그아웃"
            )}
        </Button>
    );
}

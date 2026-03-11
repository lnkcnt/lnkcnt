"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/src/components/ui/table";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
    Loader2,
    Copy,
    CheckCircle2,
    ArrowLeft,
    Trash2,
    ArrowRight,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/src/components/ui/chart";

import { DeleteURL } from "./delete";

interface ClickRecord {
    ip: string;
    date: string;
}

interface LinkData {
    id: string;
    redirect_url: string;
    click_count?: number;
    clicks?: ClickRecord[];
}

interface ChartRecord {
    date: string;
    sum: number;
}

const chartConfig = {
    sum: {
        label: "Clicks",
        color: "#155dfc",
    },
} satisfies ChartConfig;

/**
 * URL Management Page Component
 * Allows users to view and manage their shortened URLs
 * @returns JSX.Element
 */
export default function ManageLink() {
    const params = useParams();
    const managePage = params.id as string;

    const [linkData, setLinkData] = useState<LinkData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chartData, setChartData] = useState<ChartRecord[]>([]);
    const [chartLoading, setChartLoading] = useState(false);

    /**
     * Delete link handler
     */
    const handleDelete = async () => {
        if (!managePage || deleting) return;
        setDeleting(true);
        try {
            const response = await DeleteURL(managePage);
            if (!response) {
                throw new Error("Failed to delete link");
            }
            window.location.href = "/";
        } catch (err) {
            setError(err instanceof Error ? err.message : "삭제 중 오류 발생");
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    /**
     * Fetch link data from the API
     */
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const fetchLinkData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/url/manage/${managePage}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch link data");
                }

                const data = await response.json();
                setLinkData(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred",
                );
            } finally {
                setLoading(false);
            }
        };

        if (managePage) {
            fetchLinkData();
            intervalId = setInterval(fetchLinkData, 10000); // 10초마다 새로고침
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [managePage]);

    /**
     * Fetch chart data from the API
     */
    useEffect(() => {
        if (!linkData?.id) return;

        const fetchChartData = async () => {
            try {
                setChartLoading(true);
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const searchParams = new URLSearchParams({
                    id: linkData.id,
                    startYear: String(oneWeekAgo.getFullYear()),
                    startMonth: String(oneWeekAgo.getMonth()),
                });

                const response = await fetch(`/api/charts?${searchParams}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch chart data");
                }

                const result = await response.json();
                setChartData(result?.data ?? []);
            } catch {
                setChartData([]);
            } finally {
                setChartLoading(false);
            }
        };

        fetchChartData();
    }, [linkData?.id]);

    /**
     * Copy shortened URL to clipboard
     */
    const copyToClipboard = () => {
        if (linkData) {
            const shortUrl = `${window.location.origin}/${linkData.id}`;
            navigator.clipboard.writeText(shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <>
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin" />
                </div>
            </>
        );
    }

    if (error || !linkData) {
        return (
            <>
                <div className="flex min-h-screen items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold">Invalid Link</h1>
                        <p className="mt-6 text-gray-600">
                            The management page ID you provided does not exist
                            or has expired.
                        </p>
                        <Link href="/">
                            <Button className="mt-6">Create a New Link</Button>
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const shortUrl = `${
        typeof window !== "undefined" ? window.location.origin : ""
    }/${linkData.id}`;

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Your Link</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Shortened URL */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold">
                                    Shortened URL
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        value={shortUrl}
                                        readOnly
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={copyToClipboard}
                                        variant={copied ? "default" : "outline"}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Original URL */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold">
                                    Original URL
                                </label>
                                <Input
                                    type="text"
                                    value={linkData.redirect_url}
                                    readOnly
                                />
                            </div>

                            {/* Click Count */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold">
                                    Total Clicks
                                </label>
                                <div className="rounded-lg bg-gray-100 p-4">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {linkData.click_count || 0}
                                    </div>
                                </div>
                            </div>

                            {/* Click History Table */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">
                                    Click History
                                </h3>
                                {chartLoading ? (
                                    <div className="flex h-55 items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : chartData.length > 0 ? (
                                    <div className="rounded-lg border bg-white p-4">
                                        <ChartContainer
                                            config={chartConfig}
                                            className="h-30 w-full"
                                        >
                                            <LineChart data={chartData}>
                                                <CartesianGrid />
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tickFormatter={(
                                                        value: string,
                                                    ) => value.slice(5)}
                                                />
                                                <ChartTooltip
                                                    cursor={true}
                                                    content={
                                                        <ChartTooltipContent
                                                            labelFormatter={(
                                                                value,
                                                            ) =>
                                                                `Date: ${value}`
                                                            }
                                                        />
                                                    }
                                                />
                                                <Line
                                                    dataKey="sum"
                                                    type="monotone"
                                                    stroke="var(--color-sum)"
                                                    strokeWidth={2}
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <></>
                                )}
                                {linkData.clicks &&
                                linkData.clicks.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        IP Address
                                                    </TableHead>
                                                    <TableHead>
                                                        Date & Time
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {linkData.clicks.map(
                                                    (click, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-mono text-sm">
                                                                {click.ip}
                                                            </TableCell>
                                                            <TableCell>
                                                                {new Date(
                                                                    click.date,
                                                                ).toLocaleString(
                                                                    "ko-KR",
                                                                    {
                                                                        year: "numeric",
                                                                        month: "2-digit",
                                                                        day: "2-digit",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        second: "2-digit",
                                                                    },
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <Alert>
                                        <AlertDescription>
                                            No clicks recorded yet.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 border-t pt-6">
                                <Link href="/">
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                                <Button
                                    onClick={() => setDeleteDialogOpen(true)}
                                    variant="destructive"
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Link
                                        </>
                                    )}
                                </Button>
                                <a
                                    href={linkData.redirect_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button>
                                        Visit Link
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogTitle>Delete Link</AlertDialogTitle>
                    <AlertDialogDescription>
                        정말로 이 링크를 삭제하시겠습니까? 복구할 수 없습니다.
                    </AlertDialogDescription>
                    <div className="flex justify-end gap-3">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

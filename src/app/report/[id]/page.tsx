"use client";

// #region Imports

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import axios from "axios";

// #endregion

/**
 * URL Report Page Component
 * Allows users to report inappropriate or malicious URLs
 * @returns JSX.Element
 */
export default function ReportPage() {
    const params = useParams();
    const id = params.id as string;

    const [reason, setReason] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handle report submission
     */
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post(
                "/api/report",
                JSON.stringify({
                    id,
                    reason,
                    message,
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            setSubmitted(true);
            setReason("");
            setMessage("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report URL</CardTitle>
                            <CardDescription>
                                이 URL이 부적절하거나 해롭다고 생각하신다면
                                신고해 주세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {submitted ? (
                                <Alert className="border-green-500 bg-green-50">
                                    <AlertDescription className="text-green-800">
                                        신고가 정상적으로 접수되었습니다.
                                        감사합니다!
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* URL Display */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold">
                                            URL
                                        </label>
                                        <Input
                                            type="text"
                                            value={id}
                                            readOnly
                                        />
                                    </div>

                                    {/* Reason Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold">
                                            신고 사유 *
                                        </label>
                                        <select
                                            value={reason}
                                            onChange={(e) =>
                                                setReason(e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            required
                                        >
                                            <option value="">
                                                신고 사유를 선택해 주세요
                                            </option>
                                            <option value="phishing">
                                                피싱
                                            </option>
                                            <option value="malware">
                                                악성 소프트웨어/바이러스
                                            </option>
                                            <option value="spam">스팸</option>
                                            <option value="redirectloop">
                                                이미 단축된 URL(다중 리다이렉트)
                                            </option>
                                            <option value="unaccessible">
                                                접속 불가능한 URL
                                            </option>
                                            <option value="adult">
                                                성인 콘텐츠
                                            </option>
                                            <option value="harassment">
                                                괴롭힘/학대
                                            </option>
                                            <option value="violence">
                                                폭력 콘텐츠
                                            </option>
                                            <option value="illegal">
                                                불법 콘텐츠
                                            </option>
                                            <option value="other">기타</option>
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold">
                                            상세 설명
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            placeholder="신고 사유에 대해 상세히 설명해 주세요."
                                            rows={5}
                                            required
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>
                                                {error}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex justify-between border-t pt-6">
                                        <Link href="/">
                                            <Button variant="outline">
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                취소
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    제출 중...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    신고하기
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

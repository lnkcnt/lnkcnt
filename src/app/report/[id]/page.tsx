"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          reason,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      setSubmitted(true);
      setReason("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigation bar component
   */
  function NavBar() {
    return (
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost text-xl">
            LnkCnt
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {NavBar()}
      <div className="bg-base-200 min-h-screen p-4">
        <div className="mx-auto max-w-2xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Report URL</h2>
              <p className="text-sm text-gray-600">
                이 URL이 부적절하거나 해롭다고 생각하신다면 신고해 주세요.
              </p>

              {submitted ? (
                <div className="alert alert-success">
                  <span>신고가 정상적으로 접수되었습니다. 감사합니다!</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* URL Display */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">URL</span>
                    </label>
                    <input
                      type="text"
                      value={id}
                      readOnly
                      className="input input-bordered"
                    />
                  </div>

                  {/* Reason Selection */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        신고 사유 *
                      </span>
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="select select-bordered"
                      required
                    >
                      <option value="">신고 사유를 선택해 주세요</option>
                      <option value="spam">스팸</option>
                      <option value="malware">악성 소프트웨어/바이러스</option>
                      <option value="phishing">피싱</option>
                      <option value="adult">성인 콘텐츠</option>
                      <option value="harassment">괴롭힘/학대</option>
                      <option value="violence">폭력 콘텐츠</option>
                      <option value="illegal">불법 콘텐츠</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        상세 설명
                      </span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="textarea textarea-bordered"
                      placeholder="신고 사유에 대해 상세히 설명해 주세요."
                      rows={5}
                      required
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-error">
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="card-actions justify-between">
                    <a href="/" className="btn btn-outline">
                      취소
                    </a>
                    <button
                      type="submit"
                      className={`btn btn-primary ${loading ? "btn-disabled loading" : ""}`}
                      disabled={loading}
                    >
                      {loading ? "제출 중..." : "신고하기"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

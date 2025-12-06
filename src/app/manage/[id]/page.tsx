"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  /**
   * Delete link handler
   */
  const handleDelete = async () => {
    if (!managePage || deleting) return;
    if (
      !window.confirm("정말로 이 링크를 삭제하시겠습니까? 복구할 수 없습니다.")
    )
      return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/links/${managePage}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete link");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 중 오류 발생");
    } finally {
      setDeleting(false);
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
        const response = await fetch(`/api/links/${managePage}`);

        if (!response.ok) {
          throw new Error("Failed to fetch link data");
        }

        const data = await response.json();
        setLinkData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
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

  if (loading) {
    return (
      <>
        {NavBar()}
        <div className="flex min-h-screen items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </>
    );
  }

  if (error || !linkData) {
    return (
      <>
        {NavBar()}
        <div className="hero bg-base-200 min-h-screen">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">Invalid Link</h1>
              <p className="py-6">
                The management page ID you provided does not exist or has
                expired.
              </p>
              <a href="/" className="btn btn-primary">
                Create a New Link
              </a>
            </div>
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
      {NavBar()}
      <div className="bg-base-200 min-h-screen p-4">
        <div className="mx-auto max-w-4xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Manage Your Link</h2>

              {/* Link Information */}
              <div className="divider"></div>

              {/* Shortened URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Shortened URL
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="input input-bordered flex-1"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`btn ${copied ? "btn-success" : "btn-primary"}`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Original URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Original URL</span>
                </label>
                <div className="w-1" />
                <input
                  type="text"
                  value={linkData.redirect_url}
                  readOnly
                  className="input input-bordered"
                />
              </div>

              {/* Click Count */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Total Clicks</span>
                </label>
                <div className="stat bg-base-200">
                  <div className="stat-value text-primary">
                    {linkData.click_count || 0}
                  </div>
                </div>
              </div>

              {/* Click History Table */}
              <div className="divider"></div>
              <h3 className="text-lg font-semibold">Click History</h3>
              {linkData.clicks && linkData.clicks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>IP Address</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkData.clicks.map((click, index) => (
                        <tr key={index}>
                          <td className="font-mono text-sm">{click.ip}</td>
                          <td>
                            {new Date(click.date).toLocaleString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  <span>No clicks recorded yet.</span>
                </div>
              )}

              {/* Actions */}
              <div className="divider"></div>
              <div className="card-actions justify-between">
                <a href="/" className="btn btn-outline">
                  Back
                </a>
                <button
                  onClick={handleDelete}
                  className={`btn btn-error ${deleting ? "btn-disabled loading" : ""}`}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Link"}
                </button>
                <a
                  href={linkData.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Visit Link
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

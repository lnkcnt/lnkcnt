export type ShortenResponse = {
    success: boolean;
    message: string;
    generatedId?: string;
    managePage?: string;
    errors?: {
        errors: string[];
        properties: { url?: string[] };
    };
};
export type ManageResponse = {
    success: boolean;
    message: string;
    id?: string;
    redirect_url?: string;
    click_count?: number;
    clicks?: {
        date: Date;
    }[];
};
export type DeleteResponse = {
    success: boolean;
    message: string;
};
export type ReportRequest = {
    id: string;
    reason:
        | "phishing"
        | "malware"
        | "spam"
        | "redirectloop"
        | "unaccessible"
        | "adult"
        | "harassment"
        | "violence"
        | "illegal"
        | "other";
    message: string;
};
export type ReportResponse = {
    success: boolean;
    message: string;
    reportId?: number;
};
export type ChartsResponse = {
    success: boolean;
    message: string;
    data?: {
        date: string;
        sum: number;
    }[];
};

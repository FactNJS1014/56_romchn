export interface UserSession {
    username?: string;
    empno?: string;
    department?: string;
    USE_PERMISSION?: number;
    sec?: string;
    MSECT_ID?: string;
}

export interface SharedData {
    name: string;
    auth: { user: User | null };
    userSession: UserSession;
    [key: string]: unknown;
}
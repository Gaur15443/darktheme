export interface AstrologyStatusPayload {
    astrologerId: string;
    status: 'Online' | 'Offline' | string;
}
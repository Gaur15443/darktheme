interface ToastMessages {
    Home: { [key: number]: string };
    Trees: { [key: number]: string };
    Stories: { [key: number]: string };
    Communities: { [key: number]: string };
    Whatson: { [key: number]: string };
    Lifestory: { [key: number]: string };
    Memory: { [key: number]: string };
    Profile_Settings: { [key: number]: string };
    ImuwSearchResults: { [key: number]: string };
    ai_astro_reports: { [key: number]: string };
}

interface ToastState {
    toastMessages: ToastMessages | null;
    loading: boolean;
    error: string | null;
}

export {
    ToastMessages,
    ToastState
}
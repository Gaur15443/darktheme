export interface PanchangDataProps {
    date?: string;
    tithi?: {
        name?: string;
        start?: string;
        next_tithi?: string;
        end?: string;
    };
    advanced_details?: {
        sun_rise?: string;
        sun_set?: string;
        moon_rise?: string;
        moon_set?: string;
    };
}
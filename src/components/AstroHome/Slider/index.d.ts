export interface SliderProps {
    vedic: {
        banners: { url: string; text: string }[];
    };
    onIndexChanged?: (index: number) => void;
}
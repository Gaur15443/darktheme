type SortOptionKey = 'expLTH' | 'expHTL' | 'costHTL' | 'costLTH' | 'ratingHTL';
type GenderOption = 'Male' | 'Female';

interface SortOption {
    key: SortOptionKey;
    value: string;
}

interface FilterOption {
    type: 'tab' | 'checkbox' | 'radio';
    [key: string]: string[] | SortOption[];
}

interface AstroFilters {
    speciality: FilterOption;
    skills: FilterOption;
    languages: FilterOption;
    gender: {
        type: 'checkbox';
        data: GenderOption[];
    };
    sortList: {
        type: 'radio';
        data: SortOption[];
    };
}
type AstroFilterKey = keyof AstroFilters;

export type { AstroFilters, FilterOption, SortOption, SortOptionKey, GenderOption, AstroFilterKey};
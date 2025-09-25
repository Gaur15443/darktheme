export interface HomeReportCardProps {
    data: {
            header?: string;
            subHeader?: string;
            btn?: string;
    };
    gradient?: string[];
    Icon: React.FC;
    navigationScreen?: string;
}
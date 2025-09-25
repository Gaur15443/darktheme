export interface RecommendedAstrologer {
    _id: string;
    userId: string;
    astrologername: string;
    displayStrikeRate: number;
    displayActualRate: number;
    isOffer: boolean;
    profilepic: string;
    rates: {
        India: {
            transferPrice: number;
            basePricePayoutPercent: number;
            basePrice: number;
            markupPercent: number;
            markupPrice: number;
            displayPrice: number;
            STPrice: number;
        };
        OutsideIndia: {
            multiplyingFactorTransfer: number;
            transferPrice: number;
            multiplyingFactor: number;
            displayPrice: number;
            STPrice: number;
            currency: string;
        };
    };
    offerRates: {
        India: {
            tranferPrice: number;
            displayPrice: number;
        };
        OutsideIndia: {
            tranferPrice: number;
            displayPrice: number;
        };
    };
}

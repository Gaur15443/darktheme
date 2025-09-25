interface CallHistoryCardProp {
  astrologerProfilePic: null | string;
  astrologerName: string;
  duration: number;
  total: number;
  currency: string;
  callStartedAt: string | null;
  callStatus: 'CALL_COMPLETED' | 'CALL_MISSED';
  userId: string;
  amountType: 'CASHBACK_REAL' | 'REAL' | 'CASHBACK' | 'FREE';
  deductedAmount: number;
  ratePerMin: number;
  transactionId: string;
  astrologerId: string;
  onShowRecording?: (name: string) => undefined;
}

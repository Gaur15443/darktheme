interface ChatHistoryCardProp {
  astrologerProfilePic: null | string;
  astrologerName: string;
  duration: number;
  total: number;
  currency: string;
  sessionStartedAt: string | null;
  chatRoomId: string;
  userId: string;
  astrologerId: string;
  eventStatus: 'SESSION_ENDED' | 'REQ_MISSED';
  amountType: 'CASHBACK_REAL' | 'REAL' | 'CASHBACK' | 'FREE';
  deductedAmount: number;
  ratePerMin: number;
  transactionId: string;
}

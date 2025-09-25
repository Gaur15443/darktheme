type ReportOrder = {
  _id: string;
  userId: string;
  reportId: string;
  kundliId: string;
  typeOfReport: 'Kundli' | 'Marriage' | 'Career';
  createdAt: string;
  invoicePdfUrl?: string;
  name: string;
  birthDateTime: string;
  birthPlaceName: string;
  birthTimezone: string;
  titleOfReport: string;
  bannerOfReport: string;
  generatedStatus: boolean;
  generatedAt?: string;
};

type OrderGroup = {
  month: string;
  orders: ReportOrder[];
};

export {
    ReportOrder,
    OrderGroup,
}
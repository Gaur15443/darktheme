import {Fragment, useEffect, useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import {useIsFocused, useNavigation, useTheme} from '@react-navigation/native';
import {Text} from 'react-native-paper';
import AstroHeader from '../../../common/AstroHeader';
import ErrorBoundary from '../../../common/ErrorBoundary';
import OutlinedSupportIcon from '../../../images/Icons/OutlinedSupportIcon';
import Config from 'react-native-config';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {getOrderHistory} from '../../../store/apps/orderHistory';
import downloader from '../../../common/downloader';
import ButtonSpinner from '../../../common/ButtonSpinner';
import Toast from 'react-native-toast-message';
import {getAstroPdf} from '../../../store/apps/astroKundali';
import DownloadIcon from '../../../images/Icons/DownloadIcon';
import EmptyBoxIcon from '../../../images/Icons/EmptyBoxIcon';
import Spinner from '../../../common/Spinner';

const OrderHistory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.userInfo);
  const data = useSelector(
    (state: RootState) => state.orderHistory.orderHistory,
  );

  const pageIsFocused = useIsFocused();
  const navigation = useNavigation();
  const toastMessages = useSelector(
    (state: RootState) =>
      state.getToastMessages.toastMessages?.ai_astro_reports,
  );
  const [loading, setLoading] = useState(false);
  const [isInvoiceDownloading, setIsInvoiceDownloading] = useState(false);
  const [invoiceDownloadingId, setInvoiceDownloadingId] = useState<
    string | null
  >(null);
  const [isReportDownloading, setIsReportDownloading] = useState(false);
  const [reportDownloadingId, setReportDownloadingId] = useState<string | null>(
    null,
  );
  const theme = useTheme();
  const goBack = () => {
    navigation.goBack();
  };
  const reportColors = {
    Career: 'rgba(72, 157, 255, 1)',
    Marriage: 'rgba(255, 184, 0, 1)',
    Kundali: 'rgba(212, 160, 255, 1)',
    Kundli: 'rgba(212, 160, 255, 1)',
  };

  useEffect(() => {
    if (userData._id && pageIsFocused) {
      setLoading(true);
      fetchOrders(userData._id).finally(() => setLoading(false));
    }
  }, [userData._id, pageIsFocused]);

  async function fetchOrders(userId: string) {
    try {
      await dispatch(getOrderHistory(userId)).unwrap();
    } catch (error) {
      /**
       * empty.
       */
    }
  }

  function openWhatsApp({
    name,
    dob,
    tob,
    pob,
    reportType,
    timeRequested,
    timeReceived,
  }: {
    name: string;
    dob: string;
    tob: string;
    pob: string;
    reportType: string;
    timeRequested: string;
    timeReceived: string;
  }) {
    const message = `
Add Query:
Note: Kindly do not edit the details below.
Report Type: ${reportType}
Name in the Report: ${name}
Date of Birth: ${dob}
Time of Birth: ${tob}
Place of Birth: ${pob}

Time Report Requested: ${timeRequested}
Time Report Received: ${timeReceived}`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${Config.WHATSAPP_NUMBER}?text=${encodedMessage}`;
    Linking.openURL(url);
  }

  async function downloadInvoice(invoiceUrl: string) {
    try {
      await downloader({
        url: invoiceUrl,
        httpMethod: 'GET',
        filename: `Invoice_${Date.now()}.pdf`,
      });
      Toast.show({
        type: 'success',
        text1: toastMessages?.[11018],
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.[11019],
      });
    }
  }
  async function fetchPdf({
    reportId,
    kundliId,
    userId,
  }: {
    reportId: string;
    kundliId: string;
    userId: string;
  }) {
    try {
      const result = await dispatch(
        getAstroPdf({
          reportId,
          kundliId,
          userId,
        }),
      ).unwrap();
      return result.data.pdfUrl;
    } catch (error) {
      return null;
    }
  }
  async function downloadReport({
    reportId,
    kundliId,
    userId,
  }: {
    reportId: string;
    kundliId: string;
    userId: string;
  }) {
    try {
      const pdfUrl = await fetchPdf({
        reportId,
        kundliId,
        userId,
      });
      if (typeof pdfUrl === 'string') {
        await downloader({
          url: pdfUrl,
          httpMethod: 'GET',
          filename: `Report_${Date.now()}.pdf`,
          // payload: invoiceUrl,
        });
        Toast.show({
          type: 'success',
          text1: toastMessages?.[11020],
        });
      } else {
        Toast.show({
          type: 'error',
          text1: toastMessages?.[11021],
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.[11021],
      });
    }
  }

  function formatDate(dateTime: string) {
    // result sample: 17/07/2004 ·
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function formatTimeTo12Hour(time: string) {
    // result sample: 07:56 PM
    const date = new Date(time);
    return date
      .toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .toUpperCase();
  }

  function shouldShowWhatsAppSupport(order: any) {
    // WhatsApp Support icon is visible for Generated reports
    if ('generatedStatus' in order && order.generatedStatus) {
      return true;
    }

    // For Generating reports (not generated yet)
    if ('generatedStatus' in order && !order.generatedStatus) {
      // Check if the order is older than 24 hours
      const orderTime = new Date(order.createdAt);
      const currentTime = new Date();
      const timeDifferenceInHours =
        (currentTime.getTime() - orderTime.getTime()) / (1000 * 60 * 60);

      // WhatsApp Support icon is visible for Generating reports older than 24 hours
      // WhatsApp Support icon is hidden for Generating reports less than 24 hours old
      return timeDifferenceInHours >= 24;
    }

    // Default to false for any edge cases
    return false;
  }

  return (
    <ErrorBoundary.Screen>
      <View style={{flex: 1, backgroundColor: 'rgba(19, 16, 43, 1)'}}>
        <AstroHeader>
          <AstroHeader.BackAction onPress={goBack} />
          <AstroHeader.Content
            title="Order History"
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingRight: 10,
            }}
          />
        </AstroHeader>
        {loading && (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Spinner />
          </View>
        )}
        {!loading && (
          <Fragment>
            {Array.isArray(data) && data?.length > 0 ? (
              <ScrollView
                contentContainerStyle={{padding: 12, paddingBottom: 32}}>
                {data.map((item, idx: number) => (
                  <View key={item.month + idx} style={{marginBottom: 16}}>
                    <Text style={styles.monthLabel}>{item.month}</Text>

                    {Array.isArray(item.orders) &&
                      item.orders.map((order, oidx: number) => (
                        <View
                          key={order._id}
                          style={[
                            styles.card,
                            {
                              backgroundColor:
                                'generatedStatus' in order &&
                                order.generatedStatus
                                  ? 'rgba(42, 39, 64, 1)'
                                  : '#FFE03D1A',
                              borderWidth: 1,
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          ]}>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flex: 1,
                              }}>
                              <Image
                                source={{uri: order.bannerOfReport}}
                                style={styles.banner}
                              />
                              <View style={{flex: 1, marginLeft: 12}}>
                                {/* @ts-ignore */}
                                <Text
                                  variant={'bold' as any}
                                  style={[
                                    styles.reportTitle,
                                    {
                                      color:
                                        reportColors?.[
                                          order?.typeOfReport as keyof typeof reportColors
                                        ],
                                    },
                                  ]}>
                                  {order?.titleOfReport} Report
                                </Text>
                                <Text style={styles.name}>{order.name}</Text>
                                <Text style={styles.datetime}>
                                  {formatDate(order.birthDateTime)} ·{' '}
                                  {formatTimeTo12Hour(order.birthDateTime)}
                                </Text>
                                <Text style={styles.location}>
                                  {order.birthPlaceName}
                                </Text>
                                <Text style={styles.orderedOn}>
                                  Ordered on {formatDate(order.createdAt)}
                                </Text>
                              </View>
                            </View>
                            {shouldShowWhatsAppSupport(order) && (
                              <TouchableOpacity
                                style={styles.supportIcon}
                                onPress={() =>
                                  openWhatsApp({
                                    name: order.name,
                                    dob: formatDate(order.birthDateTime),
                                    tob: formatTimeTo12Hour(
                                      order.birthDateTime,
                                    ),
                                    pob: order.birthPlaceName,
                                    reportType: order.typeOfReport,
                                    timeRequested: `${formatDate(order.createdAt)}, ${formatTimeTo12Hour(order.createdAt)}`,
                                    timeReceived: order?.generatedAt?.length
                                      ? `${formatDate(order.generatedAt)}, ${formatTimeTo12Hour(order.generatedAt)}`
                                      : 'Not received yet',
                                  })
                                }>
                                <OutlinedSupportIcon />
                              </TouchableOpacity>
                            )}
                          </View>
                          {/* @ts-ignore */}
                          {'generatedStatus' in order &&
                            !order.generatedStatus && (
                              <Text
                                variant={'bold' as any}
                                style={{
                                  color: 'rgba(255, 157, 0, 1)',
                                  fontSize: 16,
                                  textAlign: 'center',
                                  textShadowColor: 'rgba(255, 255, 255, 0.25)',
                                  textShadowOffset: {width: 0, height: 2},
                                  textShadowRadius: 4,
                                }}>
                                We will notify you once it's ready.
                              </Text>
                            )}
                          <View style={styles.buttonRow}>
                            <TouchableOpacity
                              style={[
                                styles.button,
                                {
                                  opacity:
                                    ('generatedStatus' in order &&
                                      !order.generatedStatus) ||
                                    (isReportDownloading &&
                                      reportDownloadingId === order._id)
                                      ? 0.5
                                      : 1,
                                },
                              ]}
                              onPress={async () => {
                                setIsReportDownloading(true);
                                setReportDownloadingId(order._id);
                                await downloadReport({
                                  reportId: order.reportId,
                                  kundliId: order.kundliId,
                                  userId: order.userId,
                                });
                                setIsReportDownloading(false);
                                setReportDownloadingId(null);
                              }}
                              disabled={
                                (isReportDownloading &&
                                  reportDownloadingId === order._id) ||
                                ('generatedStatus' in order &&
                                  !order.generatedStatus)
                              }>
                              <DownloadIcon />
                              {isReportDownloading &&
                              reportDownloadingId === order._id ? (
                                <ButtonSpinner color={'#fff'} />
                              ) : (
                                <Text style={styles.buttonText}>Report</Text>
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.button,
                                {
                                  opacity:
                                    !order?.invoicePdfUrl ||
                                    (isInvoiceDownloading &&
                                      invoiceDownloadingId === order._id)
                                      ? 0.5
                                      : 1,
                                },
                              ]}
                              onPress={async () => {
                                if (!order?.invoicePdfUrl) return;
                                setIsInvoiceDownloading(true);
                                setInvoiceDownloadingId(order._id);
                                await downloadInvoice(order.invoicePdfUrl);
                                setIsInvoiceDownloading(false);
                                setInvoiceDownloadingId(null);
                              }}
                              disabled={
                                !order?.invoicePdfUrl ||
                                (isInvoiceDownloading &&
                                  invoiceDownloadingId === order._id)
                              }>
                              <DownloadIcon />
                              {isInvoiceDownloading &&
                              invoiceDownloadingId === order._id ? (
                                <ButtonSpinner color={'#fff'} />
                              ) : (
                                <Text style={styles.buttonText}>Invoice</Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 55,
                }}>
                <EmptyBoxIcon />
                <Text
                  variant={'bold' as any}
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                  }}>
                  Looks like you haven't made any purchases yet!
                </Text>
              </View>
            )}
          </Fragment>
        )}
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  monthLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  banner: {
    width: 54,
    height: 74,
    backgroundColor: '#444',
  },
  reportTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  datetime: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 2,
  },
  orderedOn: {
    fontSize: 10,
    color: '#B0B0B0',
    fontStyle: 'italic',
    marginTop: 2,
  },
  supportIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 8,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 10,
  },
  button: {
    borderRadius: 8,
    flex: 1,
    backgroundColor: 'rgba(105, 68, 211, 1)',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OrderHistory;

import React, {useEffect, useState} from 'react';
import {Image, Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {GlobalHeader} from '../../../components';
import {GlobalStyle} from '../../../core';
import NewTheme from '../../../common/NewTheme';
import {useNavigation} from '@react-navigation/native';
import InvoiceIcon from '../../../images/Icons/InvoiceIcon';
import ReportIcon from '../../../images/Icons/ReportIcon';
import LinearGradient from 'react-native-linear-gradient';
import {
  getAstroPdf,
  getSavedKundliById,
} from '../../../store/apps/astroKundali';
import {useDispatch, useSelector} from 'react-redux';
import Spinner from '../../../common/ButtonSpinner';

const ReportOrderDetails = ({route}) => {
  const {order, type} = route.params;

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userId = useSelector(state => state?.userInfo._id);

  const [data, setData] = useState();
  const [reportAvailable, setReportAvailable] = useState(false); // State to track report availability

  const [loading, setLoading] = useState(false);

  function handleBack() {
    navigation.goBack();
  }

  async function fetchSavedKundaliById(id) {
    try {
      setLoading(true);
      const saved = await dispatch(getSavedKundliById(id)).unwrap();
      setData(saved);
      setLoading(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  useEffect(() => {
    fetchSavedKundaliById(order.kundliId);
  }, [order.kundliId]);

  useEffect(() => {
    if (data?.purchasedReports) {
      const report = data.purchasedReports.find(
        item =>
          item?.reportId?._id === order.reportId ||
          item?.reportId === order.reportId,
      );

      // Check if the report exists and its generatedStatus
      if (report && report.generatedStatus === false) {
        setReportAvailable(false); // Report is not available
      } else {
        setReportAvailable(true); // Report is available
      }
    }
  }, [data, order.reportId]);

  const [pdfUrl, setPdfUrl] = useState();

  const getAstroPdfUrl = async () => {
    try {
      const payload = {
        reportId: order.reportId,
        kundliId: order.kundliId,
        userId,
      };

      const result = await dispatch(getAstroPdf(payload)).unwrap();
      setPdfUrl(() => result.data.pdfUrl);
    } catch (error) {}
  };
  useEffect(() => {
    try {
      getAstroPdfUrl();
    } catch (error) {}
  }, []);

  console.log(order.invoicePdfUrl, 'order.invoicePdfUrl ===>');
  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        accessibilityLabel="My-Orders"
        onBack={handleBack}
        heading={`${type} Report`}
        backgroundColor={NewTheme.colors.backgroundCreamy}
      />
      <View style={styles.container}>
        {order.invoicePdfUrl && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('OrderInvoice', {
                invoicePdfUrl: order.invoicePdfUrl,
              })
            }
            activeOpacity={0.7}>
            <LinearGradient
              colors={['rgba(239, 152, 65, 1)', 'rgba(191, 106, 20, 1)']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={styles.box}>
              <Text style={styles.text}>Invoice</Text>
              <View style={styles.innerBox}>
                <InvoiceIcon />
                <Text style={styles.placeholderText}> </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {/* Report Box */}
        <TouchableOpacity
          onPress={() => {
            if (!reportAvailable) return;
            navigation.navigate('AstroViewReports', {
              reportId: order.reportId,
              kundliId: order.kundliId,
              reportName: type,
            });
          }}
          activeOpacity={0.7}>
          <LinearGradient
            colors={['rgba(39, 195, 148, 1)', 'rgba(20, 123, 92, 1)']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.box}>
            <Text style={styles.text}>Report</Text>
            <View style={styles.innerBox}>
              <ReportIcon />
              <Text style={styles.placeholderText}>
                {loading ? (
                  <Spinner color="white" />
                ) : reportAvailable ? (
                  ''
                ) : (
                  'Your report will be available soon.'
                )}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ErrorBoundary.Screen>
  );
};

const boxHeight = 160;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    // paddingHorizontal: 122,
    gap: 14,
  },
  box: {
    height: boxHeight,
    borderRadius: 12,
    marginHorizontal: 15,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  text: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: 16,
    color: 'black',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  innerBox: {
    flex: 1,
    paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  placeholderText: {
    marginTop: 20,
    color: 'white',
    textAlign: 'center',
  },
});

export default ReportOrderDetails;

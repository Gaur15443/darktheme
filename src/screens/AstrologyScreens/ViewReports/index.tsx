import { StyleSheet, View, ActivityIndicator, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Appbar, Button, Text, useTheme } from 'react-native-paper';
import downloader from '../../../common/downloader';
import DownloadIcon from '../../../images/Icons/DownloadIcon';
import { useNavigation, useRoute } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import { Track } from '../../../../App';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { getAstroPdf } from '../../../store/apps/astroKundali';
import type { AppDispatch, RootState } from '../../../store';
import Spinner from '../../../common/Spinner';
import ButtonSpinner from '../../../common/ButtonSpinner';
import AstroHeader from '../../../common/AstroHeader';

export default function ViewReports() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute();
  const userId = useSelector((state: RootState) => (state.userInfo._id as unknown as string));
  const toastMessages = useSelector((state: RootState) => (state.getToastMessages.toastMessages?.ai_astro_reports));
  const userData = useSelector((state: RootState) => state.userInfo);
  // @ts-ignore
  const { sampleUrl, sampleType, reportId, kundliId, reportName, nameOfPerson } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const downloadPdf = () => {
    setIsDownloading(true)
    downloader({
      url: sampleUrl || pdfUrl,
      httpMethod: 'GET',
      filename: `Chart_${Date.now()}.pdf`,//to avoid duplicate
      payload: sampleUrl || pdfUrl,
    })
      .then(res => {
        Toast.show({
          type: "success",
          text1: toastMessages?.[11010]
        });
      })
      .finally(() => {
        setIsDownloading(false);
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text1: err.message,
        });
      });
  };
  useEffect(() => {
    if (!sampleUrl?.length) {
      setIsLoading(true);
      (async () => {
        try {
          await fetchPdf();
        } catch (error) {
          Toast.show({
            type: "error",
            text1: error.message,
          });
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [sampleUrl, reportId]);

  async function fetchPdf() {
    const payload = {
      reportId,
      kundliId,
      userId
    }
    const result = await dispatch(getAstroPdf(payload)).unwrap();

    setPdfUrl(() => result.data.pdfUrl);
  }

  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}>
      {isDownloading && <View
        style={{
          width: '100%',
          height: '100%',
          alignSelf: 'center',
          justifyContent: 'center',
          marginTop: 30,
          backgroundColor: theme.colors.background,
        }}>
        <Spinner />
      </View>}
      {isLoading ? <View
        style={{
          width: '100%',
          height: '100%',
          alignSelf: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}>
        <Spinner />
      </View> : <>
        <AstroHeader>
          <AstroHeader.BackAction onPress={() => navigation.goBack()} style={{
            paddingBottom: 14
          }} />
          <AstroHeader.Content
            title={sampleType?.length ? `Sample ${sampleType} Report` : `${reportName} Report`}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 14
            }}
          >
            {!(sampleType?.length > 1) && <Button mode="text" onPress={() => {
              const props = {
                "Name of Report": reportName,
                "Name of Person": nameOfPerson || ""
              };
              downloadPdf();
              Track({
                cleverTapEvent: "Report_downloads",
                mixpanelEvent: "Reports_Download",
                userData,
                cleverTapProps: props,
                mixpanelProps: props
              });
            }}>
              <DownloadIcon />
            </Button>
            }
          </AstroHeader.Content>
        </AstroHeader>
        <View
          style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.containerPdf}>
            <Pdf
              source={{ uri: sampleType?.length > 1 ? (sampleUrl as string) : (pdfUrl ? (pdfUrl as string) : "") }}
              trustAllCerts={false}
              style={styles.pdf}
            />

          </View>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}

          {error && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View></>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  containerPdf: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  }
});
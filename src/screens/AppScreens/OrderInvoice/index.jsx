import React from 'react';
import {StyleSheet, View} from 'react-native';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {GlobalHeader} from '../../../components';
import NewTheme from '../../../common/NewTheme';
import Pdf from 'react-native-pdf';
import downloader from '../../../common/downloader';
import {useNavigation} from '@react-navigation/native';
import { Text } from 'react-native-paper';

const OrderInvoice = ({route}) => {
  const {invoicePdfUrl} = route.params;
  const navigation = useNavigation();

  function handleBack() {
    navigation.goBack();
  }

  const downloadPdf = () => {
    downloader({
      url: invoicePdfUrl,
      httpMethod: 'GET',
      filename: `Chart_${Date.now()}.pdf`,
      payload: invoicePdfUrl,
    }).catch(err => {});
  };

  return (
    <ErrorBoundary.Screen>
      <View style={styles.container}>
        <GlobalHeader
          onBack={handleBack}
          heading={'Invoice'}
          backgroundColor={NewTheme.colors.backgroundCreamy}
          fontSize={30}
          onPressAction={() => downloadPdf()}
          download={true}
        />
        <Pdf
          source={{uri: invoicePdfUrl}}
          trustAllCerts={false}
          style={styles.pdf}
        />
    
      </View>
    </ErrorBoundary.Screen>
  );
};

export default OrderInvoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

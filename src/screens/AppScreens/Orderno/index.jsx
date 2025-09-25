import React from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {Divider, Text} from 'react-native-paper';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {GlobalHeader} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import NewTheme from '../../../common/NewTheme';
import {GlobalStyle} from '../../../core';
import {useRoute} from '@react-navigation/native';

const Orderno = () => {
  const route = useRoute();
  const {order} = route.params;

  const navigation = useNavigation();
  function handleBack() {
    navigation.goBack();
  }

  const formatDate = dateString => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
  };

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        accessibilityLabel="My-Orders"
        onBack={handleBack}
        heading={'My Orders'}
        backgroundColor={NewTheme.colors.backgroundCreamy}
        fontSize={30}
      />
      <View style={{paddingTop: 24}}>
        <GlobalStyle>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
              <View style={styles.container}>
                <View>
                  <Text style={styles.textheader}>
                    Order No #{order?.order_number}
                  </Text>
                  <Text style={styles.text}>
                    Placed on {formatDate(order?.created_at)}
                  </Text>
                </View>
              </View>
              <View style={{justifyContent: 'flex-end'}}>
                <Text style={[styles.text, {color:'#444444'}]}>
                  Total : Rs. {order?.total_price}
                </Text>
              </View>
            </View>
            <View>
              <Text style={styles.include}>Includes</Text>
            </View>
            <View>
              <View style={[styles.container, {alignItems: 'center'}]}>
                <View>
                  <Text style={styles.theader}>{order?.title}</Text>
                  <Text style={[styles.text, {color:'#444444'}]}>Rs. {order?.total_price}</Text>
                </View>
                {order?.kit_info?.[0]?.status ? (
                <View>
                  <Text style={styles.status}>
                    {order?.kit_info?.[0]?.status}
                  </Text>
                </View>
                    ) : null}
              </View>
              <Divider
                style={{
                  borderColor: NewTheme.colors.darkText,
                  marginVertical: 12,
                }}
              />
            </View>
          </ScrollView>
        </GlobalStyle>
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    paddingHorizontal: 8,
    borderRadius: 4,
    color: NewTheme.colors.whiteText,
    backgroundColor: NewTheme.colors.secondaryDarkBlue,
    fontWeight: '500',
    fontSize: 14,
  },
  include: {
    color: NewTheme.colors.primaryOrange,
    fontWeight: '600',
    fontSize: 14,
    paddingTop: 24,
    paddingBottom:8,
  },
  text: {
    color: NewTheme.colors.blackText,
    fontWeight: '600',
    fontSize: 14,
  },
  textheader: {
    color: NewTheme.colors.blackText,
    fontWeight: '600',
    fontSize: 20,
  },
  theader: {
    color: NewTheme.colors.blackText,
    fontWeight: '600',
    fontSize: 18,
  },

});

export default Orderno;

import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {memo} from 'react';
import GradientView from '../../../common/gradient-view';
import FastImage from '@d11/react-native-fast-image';
import moment from 'moment';
import {ASTRO_DEFAULT_AVATAR} from '../../../configs/Calls/Constants';
import {Track} from '../../../../App';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {CommonActions, useNavigation} from '@react-navigation/native';

function formatDisplayTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) {
    return null;
  }

  const duration = moment.duration(seconds, 'seconds');
  const h = duration.hours();
  const m = duration.minutes();
  const s = duration.seconds();

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);

  return parts.join(' ');
}

const CallHistoryCard = ({
  astrologerProfilePic = null,
  astrologerName = 'Astrologer name',
  duration = 752,
  currency = '₹',
  callStartedAt = null,
  callStatus = 'CALL_COMPLETED',
  userId,
  amountType = 'REAL',
  deductedAmount = 0.0,
  ratePerMin = 0,
  astrologerId = '',
  transactionId = '',
  onShowRecording = () => {},
}: CallHistoryCardProp) => {
  const userData = useSelector((state: RootState) => state.userInfo);
  const navigation = useNavigation();
  return (
    <ErrorBoundary>
      <GradientView
        style={{
          borderRadius: 10,
          borderWidth: 0.4,
          borderColor: callStatus === 'CALL_MISSED' ? '#FF4F4F' : '#6944D3',
        }}
        variant={callStatus === 'CALL_COMPLETED' ? 'normal' : 'highlight'}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {/* child 1 */}
          <View
            style={{
              height: 150,
              width: 155,
              position: 'relative',
              paddingHorizontal: 10,
              paddingBottom: 10,
              paddingTop: 7,
            }}>
            <FastImage
              style={{borderRadius: 7, width: '100%', height: '100%'}}
              resizeMode="cover"
              source={{
                uri: astrologerProfilePic ?? ASTRO_DEFAULT_AVATAR,
              }}
            />
          </View>
          {/* ------- */}

          {/* child 2 */}
          <View
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingRight: 10,
              paddingLeft: 6,
              gap: 10,
            }}>
            {/* name & ordercard */}
            <View style={{gap: 10}}>
              {/* name */}
              <View style={{width: '100%'}}>
                <Text
                  numberOfLines={1}
                  style={[styles.textBold, {fontSize: 18}]}>
                  {astrologerName}
                </Text>
              </View>

              {/* orderCard */}
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: 5,
                  borderRadius: 7,
                }}>
                {callStatus !== 'CALL_MISSED' && (
                  <View style={{flexDirection: 'column'}}>
                    <Text style={styles.textBold}>Order ID: </Text>
                    <Text style={styles.textDim} numberOfLines={2}>
                      {transactionId}
                    </Text>
                  </View>
                )}

                <Text style={styles.textDim}>
                  {moment(callStartedAt || new Date()).format(
                    'DD MMMM YYYY · LT',
                  )}
                </Text>
                <Text style={styles.textDim}>
                  @ ₹{isNaN(Number(ratePerMin)) ? 0 : ratePerMin}/min
                </Text>
              </View>
            </View>

            {/* total & duration */}
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                gap: 50,
              }}>
              {/* total */}
              <View style={{flex: 1}}>
                <Text style={styles.textDim}>Total</Text>
                <Text style={[styles.textBold, {fontSize: 15}]}>
                  {currency}
                  {callStatus === 'CALL_COMPLETED'
                    ? isNaN(Number(deductedAmount))
                      ? '0.00'
                      : deductedAmount.toFixed(2)
                    : '0.00'}
                </Text>
              </View>

              {/* duration */}
              <View style={{flex: 1}}>
                <Text style={styles.textDim}>Duration</Text>
                <Text style={[styles.textBold, {fontSize: 15}]}>
                  {formatDisplayTime(duration)}
                </Text>
              </View>
            </View>
            {/* ------- */}
          </View>
          {/* ------- */}
        </View>
        {/* call again */}
        <View style={{width: '100%', flexDirection: 'row'}}>
          {callStatus === 'CALL_COMPLETED' && (
            <TouchableOpacity
              style={styles.callButton1}
              onPress={() => {
                onShowRecording(astrologerName);
              }}>
              <Text style={[styles.textBold, {fontSize: 14}]}>View Call</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              const props = {
                name: astrologerName,
                'Astrologer ID': userId,
              };
              if (astrologerId?.length) {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [
                      {
                        name: 'AstroBottomTabs',

                        params: {
                          screen: 'Consultation',
                        },
                      },
                      {
                        name: 'AstroProfile',
                        params: {
                          astroId: astrologerId,
                          showReview: false,
                        },
                      },
                    ],
                  }),
                );
              }
              Track({
                userData,
                cleverTapEvent: 'Call_CTA_ChatHistory',
                mixpanelEvent: 'Call_CTA_ChatHistory',
                cleverTapProps: props,
                mixpanelProps: props,
              });
            }}
            style={styles.callButton2}>
            <Text style={[styles.textBold, {fontSize: 14}]}>Call Again</Text>
          </TouchableOpacity>
        </View>
      </GradientView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  textDim: {
    color: 'white',
    fontSize: 12,
    opacity: 0.6,
    flex: 1,
  },
  textBold: {color: 'white', fontSize: 12, fontWeight: '600'},

  callButton1: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 7,
    color: 'white',
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    flex: 1,
  },
  callButton2: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 7,
    color: 'white',
    backgroundColor: '#6944D3',
    borderRadius: 8,
    borderColor: '#6944D3',
    borderWidth: 1,
    flex: 1,
  },
});

export default memo(CallHistoryCard);

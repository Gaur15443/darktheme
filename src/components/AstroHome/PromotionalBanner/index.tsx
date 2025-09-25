import React from 'react';
import {Text, Portal, Modal} from 'react-native-paper';
import {Pressable, StyleSheet, View} from 'react-native';
import GradientView from '../../../common/gradient-view';
import {CrossIcon} from '../../../images';
import FastImage from '@d11/react-native-fast-image';

import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../store';
import type {GradientTextProps} from './index.d';
import {setShowedBanner} from '../../../store/apps/astroHome';

const GradientText = ({
  text,
  style,
  angle = 180,
  colors = ['#FF5959', '#F5BA08'],
  selectable,
  ...props
}: GradientTextProps) => (
  <MaskedView
    maskElement={
      <Text
        selectable={selectable}
        style={[style, {backgroundColor: 'transparent'}]}>
        {text}
      </Text>
    }>
    <LinearGradient
      colors={colors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      useAngle={true}
      angle={angle}
      angleCenter={{x: 0.5, y: 0.5}}
      {...props}>
      <Text style={[style, {opacity: 0}]}>{text}</Text>
    </LinearGradient>
  </MaskedView>
);

export default function PromotionalBanner({onClose}: {onClose?: () => void}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const bannerDetails = useSelector(
    (state: RootState) => state.astroHome.bannerDetails,
  );

  function handleClose() {
    dispatch(setShowedBanner(true));
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  return (
    <Portal>
      <Modal
        onDismiss={handleClose}
        dismissable={true}
        visible={true}
        theme={{
          colors: {
            backdrop: '#000000E5',
          },
        }}
        style={{
          paddingHorizontal: 15,
        }}
        contentContainerStyle={{}}>
        {bannerDetails && (
          <View
            style={{
              backgroundColor: '#241626',
              borderRadius: 8,
              padding: 20,
              position: 'relative',
              width: '100%',
              borderWidth: 1,
              borderColor: '#4B1100',
            }}>
            <Pressable
              style={{
                position: 'absolute',
                right: -20,
                backgroundColor: '#fff',
                borderRadius: 12,
                margin: 10,
                width: 24,
                height: 24,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1,
                top: -18,
              }}
              onPress={handleClose}
              testID="promotional-close-button">
              <CrossIcon
                testID={'promotional-close-icon'}
                fill={'#000'}
                height={'12'}
                width={'12'}
              />
            </Pressable>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 2,
              }}>
              {bannerDetails.imageUrl.map((img, index) => (
                <FastImage
                  key={index}
                  source={{
                    uri: img,
                  }}
                  style={{
                    flex: 1,
                    height: 126,
                  }}
                  resizeMode="cover"
                />
              ))}
            </View>
            <GradientText
              text={bannerDetails.bannerlines[0].line1}
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
              locations={[0.4, 0.99, 1]}
              // angle={60}
            />

            <GradientText
              text={bannerDetails.bannerlines[0].line2}
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
              colors={['#FF5959', '#F5BA08', '#F5BA08']}
              locations={[0, 0.7, 1]}
              angle={180}
            />
            <Text
              style={[
                styles.text,
                {
                  fontSize: 18,
                  fontWeight: 500,
                  marginVertical: 15,
                },
              ]}>
              {bannerDetails.bannerlines[0].line3}
            </Text>
            <GradientText
              text={bannerDetails.bannerlines[0].line4}
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
              locations={[0.3, 0.99, 1]}
            />
            <GradientText
              selectable={true}
              text={bannerDetails.couponCode}
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
              colors={['#FF5959', '#F5BA08', '#F5BA08']}
              locations={[0, 0.3, 1]}
              angle={180}
            />

            <Pressable
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Reports');
              }}
              style={{
                marginTop: 40,
                borderRadius: 8,
                overflow: 'hidden',
                borderColor: 'rgba(244, 196, 30, 1)',
                borderWidth: 0.6,
              }}>
              <GradientView
                contentStyle={{paddingVertical: 10}}
                colors={['rgba(224, 71, 0, 1)', 'rgba(125, 20, 1, 1)']}
                locations={[0, 0.7, 1]}>
                <Text
                  variant={'bold' as any}
                  style={{textAlign: 'center', fontSize: 14}}>
                  {bannerDetails.ctaText}
                </Text>
              </GradientView>
            </Pressable>
          </View>
        )}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});

import React, {useCallback, useState} from 'react';
import {View, Dimensions, StyleSheet} from 'react-native';
import {useTheme, Portal, Button, Text, Modal} from 'react-native-paper';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {useNavigation} from '@react-navigation/native';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import {saveAstroUserKundli} from '../../../store/apps/astroKundali';
import type {AppDispatch, RootState} from '../../../store/index';
import AstroBirthForm from '../../../components/AstrologyBirthForm';
import GradientView from '../../../common/gradient-view';
import Horoscope from '../../AstrologyScreens/Horoscope';
import Verified from '../../../images/Icons/AstrologyHoroscopeIcon/AstroHoroscopeTickIcon';
import SavedKundlis from '../../../components/AstroConsultation/AstroBirthDetailsTabs/SavedKundlis';
import {
  getPersonalHoroscope,
  resetHoroscopeBirthDetails,
  setShouldRefreshHoroscope,
} from '../../../store/apps/astroHoroscope';
import {Track} from '../../../../App';
import Toast from 'react-native-toast-message';
import type {SaveKundliData} from '../../../store/apps/astroKundali/index.d';
import {getTimezone} from '../../../utils';
import AstroHeader from '../../../common/AstroHeader';
const NewKundaliScreen = () => {
  const userData = useSelector((state: RootState) => state.userInfo);
  const [payload, setPayload] = useState<object | null>(null);
  const [props, setProps] = useState('');
  const [isSubmit, setSubmit] = useState(false);
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigator = useNavigation();
  const userId = useSelector(
    (state: RootState) => state?.userInfo?._id as unknown as string,
  );
  const toastMessages = useSelector(
    (state: RootState) =>
      state.getToastMessages.toastMessages?.ai_astro_reports,
  );
  const hideDialog = () => {
    setVisible(false);
    setPayload(null);
    setSubmit(false);
  };
  const purpose = 'horoscope';
  const confirmSubmission = async () => {
    if (!payload) return;
    setVisible(false);
    setSubmit(true);
    try {
      await dispatch(
        saveAstroUserKundli({...(payload as SaveKundliData), purpose}),
      ).unwrap();
      let _props = props;
      dispatch(resetHoroscopeBirthDetails());
      // Add this line to trigger refresh immediately after submission
      dispatch(setShouldRefreshHoroscope(true));

      if (!_props?.length) {
        _props = JSON.stringify({});
      }
      Toast.show({
        type: 'success',
        text1: toastMessages?.[11001],
      });

      Track({
        cleverTapEvent: 'Birth_Details_Submitted',
        mixpanelEvent: 'Birth_Details_Submitted',
        userData,
        cleverTapProps: _props,
        mixpanelProps: _props,
      });
      // @ts-ignore
      navigator.navigate('Horoscope');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.[11004],
      });
    } finally {
      setSubmit(false);
    }
  };

  return (
    <View style={styles.container}>
      <AstroBirthForm
        skipPopUp={true}
        isSubmitting={isSubmit}
        customHandleSubmit={({props, ...data}) => {
          if (isSubmit) {
            return;
          }
          setVisible(true);
          setProps(props);
          setPayload(data);
        }}
      />

      {/* Confirmation Dialog */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideDialog}
          dismissable={true}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 15,
          }}
          contentContainerStyle={{
            backgroundColor: 'transparent',
          }}>
          <View>
            <View
              style={{
                borderRadius: 8,
                overflow: 'hidden',
              }}>
              <GradientView
                style={{borderRadius: 8, overflow: 'hidden'}}
                contentStyle={{
                  minHeight: 200,
                  width: '100%',
                  padding: 10,
                  gap: 15,
                  borderRadius: 8,
                  paddingBottom: 28,
                }}>
                <View style={{alignItems: 'center', marginVertical: 10}}>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      height: 48,
                      width: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Verified />
                  </View>
                </View>
                <View style={{gap: 4, marginBottom: 10}}>
                  <Text
                    // @ts-ignore
                    variant="bold"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      textAlign: 'center',
                    }}>
                    Are you sure your birth details are correct?
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Once submitted, you won't be able to change your birth
                    details, as a dedicated astrologer will start creating your
                    Horoscope.
                  </Text>
                </View>
                <View style={styles.buttonContainer}>
                  <Button
                    onPress={hideDialog}
                    mode="outlined"
                    textColor="#fff"
                    style={styles.cancelButton}>
                    No
                  </Button>
                  <Button
                    onPress={confirmSubmission}
                    mode="contained"
                    buttonColor="#fff"
                    textColor="#6944D3"
                    style={styles.confirmButton}
                    disabled={isSubmit}>
                    Yes
                  </Button>
                </View>
              </GradientView>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const SavedKundaliScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const purpose = 'horoscope';
  const [visible, setVisible] = useState(false);
  const userData = useSelector((state: RootState) => state.userInfo);
  const [props, setProps] = useState('');
  const [isSubmit, setSubmit] = useState(false);
  const [payload, setPayload] = useState<object | null>(null);
  const toastMessages = useSelector(
    (state: RootState) =>
      state.getToastMessages.toastMessages?.ai_astro_reports,
  );
  const navigator = useNavigation();
  const hideDialog = () => {
    setVisible(false);
    setPayload(null);
    setSubmit(false);
  };
  const confirmSubmission = async () => {
    if (!payload) return;
    setVisible(false);
    setSubmit(true);
    try {
      await dispatch(
        saveAstroUserKundli({...(payload as SaveKundliData), purpose}),
      ).unwrap();
      dispatch(setShouldRefreshHoroscope(true));
      let _props = props;

      if (!_props?.length) {
        _props = JSON.stringify({});
      }
      Toast.show({
        type: 'success',
        text1: toastMessages?.[11001],
      });

      Track({
        cleverTapEvent: 'Birth_Details_Submitted',
        mixpanelEvent: 'Birth_Details_Submitted',
        userData,
        cleverTapProps: _props,
        mixpanelProps: _props,
      });
      // @ts-ignore
      navigator.navigate('Horoscope');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.[11004],
      });
    } finally {
      setSubmit(false);
    }
  };
  const handleSelectedKundli = useCallback((params: SaveKundliData) => {
    const {
      _id: kundliId,
      userId,
      horoscopeReport,
      purchasedReports,
      createdAt,
      updatedAt,
      birthDetails,
      __v,
      ...kundli
    } = params;
    const payload = {
      ...kundli,
      birthDetails: {timezoneString: getTimezone(), ...birthDetails},
    };
    setPayload(payload);
    dispatch(
      saveAstroUserKundli({
        ...(kundli as SaveKundliData),
        birthDetails: {timezoneString: getTimezone(), ...birthDetails},
        purpose,
        kundliId,
      }),
    )
      .then(res => setVisible(true))
      .catch(error => undefined);
  }, []);
  return (
    <View style={styles.container}>
      <SavedKundlis onArrowClick={handleSelectedKundli} />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideDialog}
          dismissable={true}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 15,
          }}
          contentContainerStyle={{
            backgroundColor: 'transparent',
          }}>
          <View>
            <View
              style={{
                borderRadius: 8,
                overflow: 'hidden',
              }}>
              <GradientView
                style={{borderRadius: 8, overflow: 'hidden'}}
                contentStyle={{
                  minHeight: 200,
                  width: '100%',
                  padding: 10,
                  gap: 15,
                  borderRadius: 8,
                  paddingBottom: 28,
                }}>
                <View style={{alignItems: 'center', marginVertical: 10}}>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      height: 48,
                      width: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Verified />
                  </View>
                </View>
                <View style={{gap: 4, marginBottom: 10}}>
                  <Text
                    // @ts-ignore
                    variant="bold"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      textAlign: 'center',
                    }}>
                    Are you sure your birth details are correct?
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    Once submitted, you won't be able to change your birth
                    details, as a dedicated astrologer will start creating your
                    Horoscope.
                  </Text>
                </View>
                <View style={styles.buttonContainer}>
                  <Button
                    onPress={hideDialog}
                    mode="outlined"
                    textColor="#fff"
                    style={styles.cancelButton}>
                    No
                  </Button>
                  <Button
                    onPress={confirmSubmission}
                    mode="contained"
                    buttonColor="#fff"
                    textColor="#6944D3"
                    style={styles.confirmButton}
                    disabled={isSubmit}>
                    Yes
                  </Button>
                </View>
              </GradientView>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default function HoroscopeBirthDetailsScreen() {
  const navigator = useNavigation();
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'newKundali', title: 'New Kundli'},
    {key: 'savedKundali', title: 'Saved Kundli'},
  ]);

  const goBack = useCallback(() => {
    navigator.goBack();
  }, [navigator]);

  const renderScene = SceneMap({
    newKundali: () => <NewKundaliScreen />,
    savedKundali: () => <SavedKundaliScreen key={index} />,
  });

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <AstroHeader>
        <AstroHeader.BackAction onPress={goBack} />
        <AstroHeader.Content title="Birth Details" />
      </AstroHeader>

      {/* Tab Navigation */}
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: Dimensions.get('window').width}}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{backgroundColor: 'white'}}
            style={{backgroundColor: theme.colors.background}}
            labelStyle={{textTransform: 'none'}}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  modalContainer: {
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
  },
  dialogBox: {
    padding: 16,
    borderRadius: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconBackground: {
    backgroundColor: '#fff',
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTextContainer: {
    gap: 6,
    marginBottom: 10,
  },
  textCenter: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 13,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
  },
});

NewKundaliScreen.propTypes = {
  onSubmit: PropTypes.func,
};

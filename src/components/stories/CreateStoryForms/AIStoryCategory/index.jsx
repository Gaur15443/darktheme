import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import {
  setSelectedCategory,
} from './../../../../store/apps/story/index';
import {Appbar, Text, useTheme} from 'react-native-paper';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import  ClickYesIcon from '../../../../images/Icons/ClickYesIcon';
import {Constants} from '../../../../common';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {GlobalHeader} from '../../../../components';
import Theme from '../../../../common/Theme';
import ErrorBoundary from '../../../../common/ErrorBoundary';
function AIStoryCategories() {
  const navigation = useNavigation();
  const styles = createStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const quotes = useSelector(state => state.story.quotesPrompts);
  const selectedCategory = useSelector(state => state.story.selectedCategory);
  const {bottom} = useSafeAreaInsets();
  const [value, setValue] = useState(0);
  const [open, setOpen] = useState(false);
  function close() {
    navigation.goBack();
  }

  function handleBack() {
    navigation.goBack();
  }
  return (
    <>
      <ErrorBoundary>
        <GlobalHeader
          accessibilityLabel="goBackStory"
          onBack={handleBack}
          heading={'Select Category'}
          backgroundColor={Theme.light.background}
          fontSize={20}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: Theme.light.background,
          }}>
          <View
            style={{
              height: Constants.Dimension.ScreenHeight(),
              backgroundColor: Theme.light.background,
              paddingBottom: bottom,
            }}>
            <View
              style={{
                height: '105%',
              }}>
              {/* <View>

                </View> */}
                <ScrollView
                  style={styles.tabPanel}
                  contentContainerStyle={{flexGrow: 1}}>
                  <View
                    style={{
                      backgroundColor: Theme.light.background,
                      borderRadius: 8,
                      //paddingTop: 10,
                      //marginTop: 10,
                    }}>
                    <View>
  {[
    'Holiday',
    'Celebration',
    'Tradition',
    'Achievement',
    'Recipe',
    'Life Lessons',
    'Travel',
    'Other',
  ].map((category, index) => (
    <Pressable
      key={index}
      onPress={() => {
        dispatch(setSelectedCategory(category));
        close();
      }}>
      {/* Container for text and icon */}
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '90%'}}>
        <Text style={[styles.category, {flex: 1}]}>{category}</Text>
        {selectedCategory === category && <ClickYesIcon />}
      </View>
      <View style={styles.divider} />
    </Pressable>
  ))}
</View>

                  </View>
                </ScrollView>
            </View>
          </View>
        </View>
      </ErrorBoundary>
    </>
  );
}

function createStyles() {
  return StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 10,
      paddingBottom: 15,
      backgroundColor: '#FF4F4F',
      zIndex: 100,
    },
    backgroundContainer: {
      height: 180,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    },
    touchableOpacity: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.4,
      shadowRadius: 3,
      elevation: 3,
      borderRadius: 20,
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 15,
    },
    tabPanel: {
      flexGrow: 1,
      marginTop: 10,
    },
    category: {
      marginLeft:20,
      marginTop: 12,
      marginBottom: 12,
      fontWeight: '700',
      color: 'black',
      fontSize: 16,
      paddingHorizontal: 20,
      width: '100%',
    },
    divider: {
      position: 'relative',
      height: 1,
      width: '90%',
      marginLeft:20,
      //marginRight:20,
      backgroundColor: 'lightgrey',
    },
  });
}

export default AIStoryCategories;

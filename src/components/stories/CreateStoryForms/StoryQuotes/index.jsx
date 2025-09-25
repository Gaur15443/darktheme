import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import {
  fetchQuotePrompts,
  setSelectedQuote,
} from './../../../../store/apps/story/index';
import {Appbar, Text, useTheme} from 'react-native-paper';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Constants} from '../../../../common';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import GreenTickIcon from '../../../../images/Icons/GreenTickIon';

function StoryQuotes() {
  const navigation = useNavigation();
  const styles = createStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const quotes = useSelector(state => state.story.quotesPrompts);
  const selectedQuote = useSelector(state => state.story.selectedQuote);
  const {bottom} = useSafeAreaInsets();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (quotes.length) {
          return;
        }
        await dispatch(fetchQuotePrompts()).unwrap();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      }
    };

    fetchData();
  }, []);

  function close() {
    navigation.goBack();
  }

  function handleChange(newValue) {
    setValue(newValue);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.onBackground,
      }}>
      <View
        style={{
          height: Constants.Dimension.ScreenHeight(),
          backgroundColor: 'white',
          paddingBottom: bottom,
        }}>
        <View
          style={{
            height: '105%',
          }}>
          <Appbar.Header
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              backgroundColor: '#FF4F4F',
              height: 140,
            }}>
            <Appbar.BackAction color="#FFF" onPress={close} />
            {quotes && quotes?.length && (
              <ScrollView
                showsHorizontalScrollIndicator={false}
                horizontal
                style={{flexGrow: 0}}>
                <View
                  style={[styles.buttonContainer, {alignSelf: 'flex-start'}]}>
                  {quotes.map((quote, index) => (
                    <TouchableOpacity
                      key={quote.title}
                      style={[
                        styles.touchableOpacity,
                        {
                          backgroundColor: index === value ? '#DB3939' : '#FFF',
                          marginLeft: 10,
                        },
                      ]}
                      onPress={() => handleChange(index)}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: index === value ? 'white' : '#DB3939',
                          fontWeight: 'bold',
                        }}>
                        {quote.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </Appbar.Header>

          {quotes.length > 0 && (
            <ScrollView
              style={styles.tabPanel}
              contentContainerStyle={{flexGrow: 1}}>
              <View
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: 8,
                  paddingTop: 10,
                  marginTop: 10,
                }}>
                <View
                  pointerEvents="none"
                  style={{
                    borderColor: '#DB3939',
                    padding: 15,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderStyle: 'dashed',
                    marginBottom: 4,
                    marginHorizontal: 15,
                  }}>
                  <Text
                    style={{
                      color: '#DB3939',
                      textAlign: 'center',
                      fontSize: 16,
                    }}>
                    Pick a Quote
                  </Text>
                </View>
                <View>
                  {quotes[value].prompts.map((prompt, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        dispatch(setSelectedQuote(prompt));
                        close();
                      }}>
                      <View style={styles.promptContainer}>
                        <Text style={styles.prompt}>{prompt}</Text>
                        {selectedQuote === prompt && (
                          <View style={styles.greenTick}>
                            <GreenTickIcon
                              width={28}
                              height={28}
                              transform={'translate(-2, 0) scale(1.35)'}
                            />
                          </View>
                        )}
                      </View>
                      <View style={styles.divider} />
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
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
    prompt: {
      marginTop: 10,
      marginBottom: 10,
      fontWeight: '600',
      color: 'black',
      fontSize: 16,
      paddingHorizontal: 20,
      maxWidth: '90%',
    },
    divider: {
      position: 'relative',
      height: 1,
      width: '100%',
      backgroundColor: 'lightgrey',
    },
    greenTick: {
      marginLeft: 'auto',
      paddingRight: 10,
    },
    promptContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
}

export default StoryQuotes;

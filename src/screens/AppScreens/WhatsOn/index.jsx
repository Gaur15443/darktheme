import React, {useState} from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useTheme, Text} from 'react-native-paper';
import Theme from '../../../common/Theme';
import NewTheme from '../../../common/NewTheme';
import {GlobalHeader, Notifications} from '../../../components';
import {Calendar} from '../../../components';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CustomTabBar = ({ tabs, activeIndex, onIndexChange }) => {
  const theme = useTheme();
  
  return (
    <View
      style={{
        backgroundColor: theme.colors.unSelectedTabBackgr,
        borderRadius: 8,
        marginHorizontal: 12,
        height: 40,
        shadowColor: '#000',
        marginVertical: 10,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        flexDirection: 'row',
      }}>
      {tabs.map((route, index) => {
        const focused = index === activeIndex;
        
        return (
          <TouchableOpacity
            key={route.key}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => onIndexChange(index)}>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -5,
              }}>
              <Text
                variant="bold"
                style={{
                  color: focused
                    ? Theme.light.primary
                    : theme.colors.infoContentColor,
                  fontSize: 15,
                }}>
                {route.title}
              </Text>
            </View>
            {focused && (
              <View
                style={{
                  position: 'absolute',
                  backgroundColor: theme.colors.onBackground,
                  borderRadius: 8,
                  height: 40,
                  width: '100%',
                  borderWidth: 1.5,
                  borderColor: theme.colors.outline,
                  zIndex: -1,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const CustomTabView = ({ routes, renderScene }) => {
  const [index, setIndex] = useState(0);
  
  return (
    <View style={{ width: width, height: height }}>
      <CustomTabBar 
        tabs={routes} 
        activeIndex={index} 
        onIndexChange={setIndex} 
      />
      <View style={{ flex: 1 }}>
        {renderScene({ route: routes[index], index })}
      </View>
    </View>
  );
};

const CustomTabViewScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  
  const FirstRoute = ({ isFocused }) => (
    <View style={{ paddingHorizontal: 10 }}>
      <Notifications isFocused={isFocused} />
    </View>
  );

  const SecondRoute = ({ isFocused }) => (
    <View style={{}}>
      <Calendar isFocused={isFocused} />
    </View>
  );
  
  const renderScene = ({ route, index }) => {
    switch (route.key) {
      case 'first':
        return <FirstRoute isFocused={index === 0} />;
      case 'second':
        return <SecondRoute isFocused={index === 1} />;
      default:
        return null;
    }
  };
  
  const routes = [
    {key: 'first', title: 'Notifications'},
    {key: 'second', title: 'My Calendar'},
  ];

  const onBack = () => {
        navigation.goBack();
      };

  return (
    <>
      <GlobalHeader
        onBack={onBack}
        heading={'What’s On'}
        backgroundColor={NewTheme.colors.backgroundCreamy}
      />
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.modalContainer}>
            <CustomTabView
              routes={routes}
              renderScene={renderScene}
              style={{ width: width }}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    paddingBottom: 30,
    paddingLeft: 15,
    paddingRight: 15,
  },
});

export default CustomTabViewScreen;
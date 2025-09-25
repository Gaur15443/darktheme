import React, {useEffect, useState, useCallback} from 'react';
import {Text, View, useWindowDimensions, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TabView, TabBar} from 'react-native-tab-view';
import type {SaveKundliData} from '../../../store/apps/astroKundali/index.d';

import SavedKundlis from '../../../components/AstroConsultation/AstroBirthDetailsTabs/SavedKundlis';
import BirthForm from '../../../components/MatchMaking/BirthForm';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {navigatedStack} from '../../../../AppChild';
import {Track} from '../../../../App';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';
import AstroHeader from '../../../common/AstroHeader';
import {useNavigation} from '@react-navigation/native';

const AstroMatchMakingTabs = () => {
  const {top} = useSafeAreaInsets();
  const layout = useWindowDimensions();
  const pageIsFocused = useIsFocused();
  const userData = useSelector((state: RootState) => state.userInfo);

  const [selectedKundli, setSelectedKundli] = useState<SaveKundliData | null>(
    null,
  );
  const [index, setIndex] = useState(0);
  const [shouldReset, setShouldReset] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      Track({
        cleverTapEvent: 'Matchmaking_Page_Visited',
        mixpanelEvent: undefined,
        userData,
      });
    }, []),
  );

  useEffect(() => {
    if (pageIsFocused) {
      console.log('Prev 2: ', navigatedStack[navigatedStack.length - 2]);
    }
    if (
      pageIsFocused &&
      navigatedStack?.length &&
      navigatedStack[navigatedStack.length - 2] !==
        'AstroViewMatchMakingResults' &&
      navigatedStack[navigatedStack.length - 2] !== 'AstroLocation'
    ) {
      setShouldReset(true);

      setTimeout(() => {
        setShouldReset(false);
      }, 1000);
    }
    return () => {
      setSelectedKundli(null);
    };
  }, [pageIsFocused]);

  useEffect(() => {
    if (index === 1) setSelectedKundli(null);
  }, [index]);

  const handleSelectedKundli = useCallback((kundli: SaveKundliData) => {
    setSelectedKundli(kundli);
    setIndex(0);
  }, []);

  const renderScene = ({route}: {route: {key: string}}) => {
    switch (route.key) {
      case 'first':
        return (
          <BirthForm
            shouldReset={shouldReset}
            selectedKundli={selectedKundli}
          />
        );
      case 'second':
        return <SavedKundlis onArrowClick={handleSelectedKundli} />;
      default:
        return null;
    }
  };

  const routes = [
    {key: 'first', title: 'New Matching'},
    {key: 'second', title: 'Saved Kundli'},
  ];

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      renderLabel={({route, focused}) => (
        <Text style={{color: focused ? 'white' : 'rgba(255, 255, 255, 0.7)'}}>
          {route.title}
        </Text>
      )}
      indicatorStyle={styles.indicatorStyle}
      style={{backgroundColor: 'transparent'}}
    />
  );

  return (
    <View style={styles.container}>
      <AstroHeader>
        <AstroHeader.BackAction onPress={() => navigation.goBack()} />
        <AstroHeader.Content title="Birth Details" />
      </AstroHeader>

      <View style={styles.tabViewContainer}>
        <TabView
          lazy
          renderTabBar={renderTabBar}
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(18, 16, 41, 1)',
  },
  header: {
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(18, 16, 41, 1)',
  },
  headerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    paddingVertical: 10,
  },
  tabViewContainer: {
    flex: 1,
    padding: 10,
    width: '100%',
  },
  indicatorStyle: {
    height: 45,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: 'rgba(255, 255 ,255, 0.1)',
    flex: 1,
    borderBottomWidth: 2,
    borderColor: 'white',
  },
});

export default AstroMatchMakingTabs;

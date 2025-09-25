import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Text,
  View,
  useWindowDimensions,
  StyleSheet,
  Platform,
  ScaledSize,
} from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabView, TabBar, TabBarProps } from 'react-native-tab-view';
import AstroBirthDetailsForm from './AstroBirthDetailsForm';
import SavedKundlis from './SavedKundlis';
import { useTheme } from 'react-native-paper';
import AstroHeader from '../../../common/AstroHeader';
import AstroBirthDetailsFormReports from './AstroBirthDetailsFormReports';
// import { getAudioPermission } from '../AstroAgoraCall/AgoraPermisions/AgoraPermissions';

export interface CallAstrologerFunctions {
  callAstrologer: () => void;
  endAstrologerCall: () => void;
}

export interface PayUValidationFunctions {
  hasBalance: () => boolean;
}

interface TabBarRoutes {
  key: string;
  title: string;
}

const routes: TabBarRoutes[] = [
  { key: 'first', title: 'Saved Kundli' },
  { key: 'second', title: 'New Kundli' },
];
function renderTabBar(props: TabBarProps<any>) {
  return (
    <TabBar
      {...props}
      renderLabel={({ route, focused }) => (
        <Text style={{ color: focused ? 'white' : 'rgba(255, 255, 255, 0.7)' }}>
          {route.title}
        </Text>
      )}
      indicatorStyle={styles.indicatorStyle}
      style={{ backgroundColor: 'transparent' }}
    />
  );
}

interface FirstRouteProps {
  onArrowClick: () => void;
}
interface SecondRouteProps {
  onNewKundli: () => void;
}

const FirstRoute: React.FC<FirstRouteProps> = React.memo(({ onArrowClick = () => null, }) => (
  <View style={{ flex: 1 }}>
    <SavedKundlis onArrowClick={onArrowClick} />
  </View>
));
const SecondRoute: React.FC<SecondRouteProps> = React.memo(({ onNewKundli = () => null }) => (
  <View style={{ flex: 1 }}>
    {/* <AstroBirthDetailsForm onConfirm={callAstrologer} /> */}
    <AstroBirthDetailsFormReports onConfirm={() => null} onNewKundli={onNewKundli} />
  </View>
));

// const renderScene = ({ route, onArrowClick = () => null }) => {
//   switch (route.key) {
//     case 'first':
//       return <FirstRoute onArrowClick={onArrowClick} />;
//     case 'second':
//       return <SecondRoute />;
//     default:
//       return null;
//   }
// };


interface AstroBirthDetailsTabsProps {
  onBack?: () => void;
  onArrowClick?: (_data: any) => void;
  onNewKundli?: (_data: any) => void;
  showHeader?: boolean;
}

const AstroBirthDetailsTabsReports: React.FC<AstroBirthDetailsTabsProps> = ({ onBack = () => null, onArrowClick = () => null, onNewKundli = () => null, showHeader = true }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { top }: EdgeInsets = useSafeAreaInsets();
  const layout: ScaledSize = useWindowDimensions();

  const callAstrologerFunctionRef = useRef<CallAstrologerFunctions>({
    callAstrologer: () => { },
    endAstrologerCall: () => { },
  });
  const payUValidationFunctionRef = useRef<PayUValidationFunctions>({
    hasBalance: () => false,
  });

  const [index, setIndex] = React.useState<number>(0);
  const [initiateCall, setInitiateCall] = useState<boolean>(false);

  const callAstrologer = useCallback(async () => {
    if (Platform.OS === 'android') {
      // await getAudioPermission();
    }
    payUValidationFunctionRef?.current?.hasBalance?.();
    // if (payUValidationFunctionRef?.current?.hasBalance?.()) {
    // setInitiateCall(true);
    // await callAstrologerFunctionRef?.current?.callAstrologer?.();
    // }
  }, []);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'first':
        return <FirstRoute onArrowClick={onArrowClick} />;
      case 'second':
        return <SecondRoute key={index} callAstrologer={callAstrologer} onNewKundli={onNewKundli} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {showHeader && <AstroHeader>
        <AstroHeader.BackAction onPress={onBack} />
        <AstroHeader.Content title="Birth Details" />
      </AstroHeader>}
      {/*-------------------------------------------*/}

      <View style={styles.tabViewContainer}>
        <TabView
          lazy
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default memo(AstroBirthDetailsTabsReports);
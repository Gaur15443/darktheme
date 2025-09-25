import {Text, View} from 'react-native';
import React from 'react';
import {
  AccountLanding,
  DeleteAccount,
  ProfileHeader,
} from '../../../components';
// import AddChapter from '../../../components/ProfileTab/AddChapter';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Theme} from '../../../common';
import {ViewMemberDetails, ViewMemberDetailsHeader} from '../ViewMemberDetails';
import {enableScreens} from 'react-native-screens';
import ErrorBoundary from '../../../common/ErrorBoundary';
enableScreens(false);
const stack = createNativeStackNavigator();
const Profile = () => {
  const globalScreenOptions = {
    headerShown: false,
    contentStyle: {
      backgroundColor: Theme.light.background,
    },
    headerBackTitleVisible: false,
  };
  return (
    <ErrorBoundary.Screen>
      <stack.Navigator screenOptions={globalScreenOptions}>
        <stack.Screen
          name="ViewMemberDetail"
          component={ViewMemberDetails}
          options={() => ({
            headerShown: true,
            header: () => <ProfileHeader />,
          })}
        />

        <stack.Screen name="DeleteAccount" component={DeleteAccount} />
      </stack.Navigator>
    </ErrorBoundary.Screen>
  );
};

export default Profile;

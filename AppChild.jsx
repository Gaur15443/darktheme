import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserInfo } from './src/store/apps/userInfo/index';
import { useNavigation, } from '@react-navigation/native';
import InviteReceive from './src/components/invite-receive';
import { getToastMessages } from './src/store/apps/getToastMessages';
import { authConfigProxy, setChangeCallback } from './src/configs';
import { AuthContextFunc } from './src/context/AuthContext';
import * as Sentry from "@sentry/react-native";
export const navigatedStack = [];

export default function AppChild() {
  const { logout } = AuthContextFunc();
  const dispatch = useDispatch();

  const navigation = useNavigation();
  const [currentRoutes, setCurrentRoutes] = useState([]);
  const isSignedIn = useSelector(state => state?.CheckAuth?.isSignedIn);
  const personalDetails = useSelector(
    state => state?.userInfo?.personalDetails,
  );
  const [shouldForceLogout, setShouldForceLogout] = useState(
    authConfigProxy.shouldForceLogout,
  );

  useEffect(() => {
    setChangeCallback(change => {
      if (change.key === 'shouldForceLogout') {
        setShouldForceLogout(change.value);
      }
    });

    return () => setChangeCallback(null);
  }, []);

  useEffect(() => {
    if (shouldForceLogout) {
      logout();
      authConfigProxy.shouldForceLogout = false;
    }
  }, [shouldForceLogout]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const navigationState = navigation.getState();
      const routes = navigationState?.routes || [];

      // Update current routes state
      setCurrentRoutes(routes);

      console.log('routes', navigationState);
      console.log('currentRoutes', routes);

      if (navigationState?.routes?.[navigationState.index]?.name) {
        navigatedStack.push(navigationState.routes[navigationState.index].name);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const fetchToastMessages = async () => {
    try {
      await dispatch(getToastMessages()).unwrap();
    } catch (_error) {
      /** empty */
    }
  };
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (isSignedIn && !Object.keys(personalDetails || {})?.length) {
          await dispatch(getUserInfo()).unwrap();
        }

        if (
          isSignedIn &&
          Object.keys(personalDetails || {})?.length > 0 &&
          (!personalDetails?.gender ||
            !personalDetails?.name ||
            !personalDetails?.lastname)
        ) {
          navigation.navigate('ProfileDetails');
        }
      } catch (_error) {
        /** empty */
      }
    };

    fetchUserInfo?.();
    fetchToastMessages();
  }, [dispatch, isSignedIn, personalDetails]);

  return <InviteReceive currentRoutes={currentRoutes} />;
}

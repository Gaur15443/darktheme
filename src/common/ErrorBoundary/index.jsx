import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import axios from 'axios';
import { colors } from '../NewTheme';
import ErrorBoundaryIcon from './error-boundary-icon';
import authConfig from '../../configs';
import { getDeviceInfo } from '../../utils/format';
import * as Sentry from '@sentry/react-native';

const styles = StyleSheet.create({
  button: colors.primaryOrange,
  textContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: 8,
  },
  centeredText: {
    textAlign: 'center',
  },
  text: {
    color: "#000"
  },
  background: {
    backgroundColor: '#fff'
  }
});

class ErrorBoundaryBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.logErrorToAPI(error, errorInfo);
  }

  logErrorToAPI = async (error, errorInfo) => {
    try {
      const errorLog = {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        deviceInfo: getDeviceInfo(),
      };

      await axios.post(`${authConfig.appBaseUrl}/log`, {
        log: JSON.stringify(errorLog),
      });
      Sentry.captureException(JSON.stringify(errorLog));
    } catch (apiError) {
      /** empty. */
    }
  };

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback({
        error: this.state.error,
        resetError: this.resetError,
      });
    }

    return this.props.children;
  }
}

const DefaultFallback = ({ error, resetError }) => (
  <View style={[styles.background, { flex: 1, justifyContent: 'center', alignItems: 'center', }]}>
    <View style={styles.textContainer}>
      <Text
        style={[
          styles.centeredText,
          styles.text,
          { fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
        ]}>
        Oops! Something went wrong.
      </Text>
      <Text style={[styles.centeredText, styles.text, { color: '#777777' }]}>
        To reload the page, please click the button present below
      </Text>
    </View>
    {/* <Text style={{marginBottom: 20}}>{error?.toString()}</Text> */}
    <Button
      style={{
        borderRadius: 6,
        backgroundColor: colors.primaryOrange,
      }}
      mode="contained"
      textColor="#fff"
      onPress={resetError}>
      Try again
    </Button>
  </View>
);

const ScreenFallBack = ({ error, resetError }) => (
  <View style={[styles.background, { flex: 1, justifyContent: 'center', alignItems: 'center', }]}>
    <ErrorBoundaryIcon />
    <View style={styles.textContainer}>
      <Text
        style={[
          styles.centeredText,
          styles.text,
          { fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
        ]}>
        Oops! Something went wrong.
      </Text>
      <Text style={[styles.centeredText, styles.text, { color: '#777777' }]}>
        To reload the page, please click the button present below
      </Text>
    </View>
    {/* <Text style={{marginBottom: 20}}>{error?.toString()}</Text> */}
    <Button
      style={{
        borderRadius: 6,
        backgroundColor: colors.primaryOrange,
      }}
      mode="contained"
      textColor="#fff"
      onPress={resetError}>
      Try again
    </Button>
  </View>
);

const ErrorBoundary = ({ children, fallback = DefaultFallback }) => (
  <ErrorBoundaryBase fallback={fallback}>{children}</ErrorBoundaryBase>
);

class ErrorBoundaryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.logErrorToAPI(error, errorInfo);
  }
  logErrorToAPI = async (error, errorInfo) => {
    try {
      const errorLog = {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        deviceInfo: getDeviceInfo(),
      };

      await axios.post(`${authConfig.appBaseUrl}/log`, {
        log: JSON.stringify(errorLog),
      });
      Sentry.captureException(JSON.stringify(errorLog));
    } catch (apiError) {
      /** empty. */
    }
  };

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { children, fallback = ScreenFallBack } = this.props;

    if (this.state.hasError) {
      return (
        <View style={{ flex: 1 }}>
          <Text>{JSON.stringify(this.state.error)}</Text>
          {fallback({ error: this.state.error, resetError: this.resetError })}
        </View>
      );
    }

    return children;
  }
}

ErrorBoundary.Screen = ErrorBoundaryScreen;

export default ErrorBoundary;
export { ErrorBoundary as ErrorBoundaryRoot };

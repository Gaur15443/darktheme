import {
  DeviceEventEmitter,
  NativeAppEventEmitter,
  Platform,
  EmitterSubscription,
} from 'react-native';
import _BackgroundTimer from 'react-native-background-timer';

const EventEmitter = Platform.select({
  ios: () => NativeAppEventEmitter,
  android: () => DeviceEventEmitter,
})?.();

class BackgroundTimer {
  private static backgroundListener: EmitterSubscription | null = null;
  private static locationTimer: number | null = null;

  static setInterval(callback: () => void, delay: number): number | null {
    if (!this.backgroundListener && !this.locationTimer && EventEmitter) {
      _BackgroundTimer.start();
      this.backgroundListener = EventEmitter.addListener(
        'backgroundTimer',
        () => {
          this.locationTimer = _BackgroundTimer.setInterval(callback, delay);
        },
      );
      return this.locationTimer;
    }
    return null;
  }

  static clearInterval(): void {
    if (this.backgroundListener) {
      this.backgroundListener.remove();
    }
    if (this.locationTimer) {
      _BackgroundTimer.clearInterval(this.locationTimer);
    }
    this.backgroundListener = null;
    this.locationTimer = null;
    _BackgroundTimer.stop();
    _BackgroundTimer.start();
  }
}

export default BackgroundTimer;

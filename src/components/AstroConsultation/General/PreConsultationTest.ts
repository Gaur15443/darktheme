import {
  getBatteryLevelSync,
  isBatteryChargingSync,
} from 'react-native-device-info';

export async function measureNetworkLatency(): Promise<number | null> {
  const url = 'https://www.google.com/generate_204'; // Lightweight URL
  const start = Date.now();
  try {
    const response = await fetch(url, {method: 'GET'});
    if (response.ok) {
      const end = Date.now();
      const ping = end - start;
      return ping;
    }
    return null;
  } catch {
    return null;
  }
}

export function hasSufficientCharge() {
  try {
    const batteryLevel = getBatteryLevelSync();
    const batteryState = isBatteryChargingSync();
    if (batteryLevel <= 0.15 && !batteryState) {
      return false;
    }
    return true;
  } catch (error) {
    return true;
  }
}

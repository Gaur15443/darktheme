import axios from 'axios';
// import authConfig from '../configs';

export const isEmpty = value => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  return !!(Array.isArray(value) && value.length === 0);
};

/**
 * Allows only integer input in a text input.
 *
 * @param {string} text - The input text.
 * @returns {string} - The sanitized text containing only integers.
 */
export const onlyInteger = text => {
  // Replace all non-integer characters with an empty string
  const sanitizedText = text ? `${text}`.replace(/[^0-9]/g, '') : '';
  return sanitizedText;
};

export function getRandomLetters(count = 20) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    randomString += alphabet.charAt(randomIndex);
  }

  return randomString;
}

/**
 * Finds the value of a property from an object.
 * @param {Object} obj - source object.
 * @param {string} propertyName - property to check value of.
 */
export function findPropertyValueIgnoreCase(obj, propertyName) {
  const lowerCasePropertyName = propertyName.toLowerCase();

  const key = Object.keys(obj).find(
    _key => _key.toLowerCase() === lowerCasePropertyName,
  );

  // Return the value if key is found, otherwise null or a default value
  return key ? obj[key] : null;
}

export function getTimezone() {
  return new Intl.DateTimeFormat('en-US').resolvedOptions().timeZone;
}

export function generateRandomString(length) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
export function formatDateAndTimeToISO(dateStr, timeStr) {
  const [month, day, year] = dateStr.split('/').map(Number);

  timeStr = timeStr.replace(/\s+/g, ' ').trim();
  const [time, modifier] = timeStr.split(' ');
  let [hour, minute] = time.split(':').map(Number);

  if (modifier.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (modifier.toUpperCase() === 'AM' && hour === 12) hour = 0;

  const date = new Date(year, month - 1, day, hour, minute);

  const offsetMinutes = date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMins = Math.abs(offsetMinutes) % 60;

  const offsetSign = offsetMinutes > 0 ? '-' : '+';
  const offsetStr = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

  const isoString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}${offsetStr}`;

  return isoString;
}

export function isMessageSentSuccessfully(messageId) {
  if (messageId?.toString?.().length > 0 && isNaN(Number(messageId))) {
    return false;
  }
  return true;
}
/**
 * Fetches user's location info.
 */
// export async function getUserLocation() {
//   const defaultValues = {
//     city: '',
//     region: '',
//     country_name: '',
//     timezone: '',
//   };

//   try {
//     const response = await fetch(`https://ipapi.co/json/?key=${authConfig.ipapiTrialKey}`);
//     const data = await response.json();
//     return {
//       city: data.city,
//       region: data.region,
//       country_name: data.country_name,
//       timezone: data.timezone,
//     };
//   } catch (error) {
//     /** empty. */
//     return defaultValues;
//   }
// }

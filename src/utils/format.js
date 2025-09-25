import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import DeviceInfo from 'react-native-device-info';
import {PhoneNumberUtil} from 'google-libphonenumber';
import moment from 'moment';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
const phoneUtil = PhoneNumberUtil.getInstance();
/**
 ** Format and return date in Humanize format
 ** Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 ** Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Object} formatting Intl object to format with
 */
// ** Checks if the passed date is today
const isToday = date => {
  const today = new Date();

  return (
    new Date(date).getDate() === today.getDate() &&
    new Date(date).getMonth() === today.getMonth() &&
    new Date(date).getFullYear() === today.getFullYear()
  );
};

export const formatDate = (
  value,
  formatting = {month: 'short', day: 'numeric', year: 'numeric'},
) => {
  if (!value) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value));
};

// ** Returns short month of passed date
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value);
  let formatting = {month: 'short', day: 'numeric'};
  if (toTimeForCurrentDay && isToday(date)) {
    formatting = {hour: 'numeric', minute: 'numeric'};
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value));
};

// ? The following functions are taken from https://codesandbox.io/s/ovvwzkzry9?file=/utils.js for formatting credit card details
// Get only numbers from the input value
const clearNumber = (value = '') => value.replace(/\D+/g, '');

// Format credit cards according to their types
export const formatCreditCardNumber = (value, Payment) => {
  if (!value) {
    return value;
  }
  const issuer = Payment.fns.cardType(value);
  const clearValue = clearNumber(value);
  let nextValue;
  switch (issuer) {
    case 'amex':
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        10,
      )} ${clearValue.slice(10, 15)}`;
      break;
    case 'dinersclub':
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        10,
      )} ${clearValue.slice(10, 14)}`;
      break;
    default:
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        8,
      )} ${clearValue.slice(8, 12)} ${clearValue.slice(12, 19)}`;
      break;
  }

  return nextValue.trim();
};

// Format expiration date in any credit card
export const formatExpirationDate = value => {
  const finalValue = value
    .replace(/^([1-9]\/|[2-9])$/g, '0$1/') // 3 > 03/
    .replace(/^(0[1-9]|1[0-2])$/g, '$1/') // 11 > 11/
    .replace(/^([0-1])([3-9])$/g, '0$1/$2') // 13 > 01/3
    .replace(/^(0?[1-9]|1[0-2])([0-9]{2})$/g, '$1/$2') // 141 > 01/41
    .replace(/^([0]+)\/|[0]+$/g, '0') // 0/ > 0 and 00 > 0
    // To allow only digits and `/`
    .replace(/[^\d/]|^[/]*$/g, '')
    .replace(/\/\//g, '/'); // Prevent entering more than 1 `/`

  return finalValue;
};

// Format CVC in any credit card
export const formatCVC = (value, cardNumber, Payment) => {
  const clearValue = clearNumber(value);
  const issuer = Payment.fns.cardType(cardNumber);
  const maxLength = issuer === 'amex' ? 4 : 3;

  return clearValue.slice(0, maxLength);
};
/**
 * Returns the total days in a month.
 *
 * @param {number} year - Year.
 * @param {number} month - Month
 * @param {number} [showFutureDate] - If `true` it returns all the days in a month,
 * else it returns till current day if the year and month are of today.
 * @returns
 */
export function daysInMonth(year, month, showFutureDate = false) {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (
      Number(year) === currentYear &&
      Number(month) === currentMonth &&
      !showFutureDate
    ) {
      return new Date().getDate();
    }

    return new Date(year, month, 0).getDate();
  } catch {
    return 0;
  }
}

/**
 * Capitalizes text.
 * @param {string} value - text to capitalize
 */
export function capitalize(value) {
  value = typeof value === 'string' ? value : `${value}`;
  let splittedText = value.split(' ');

  splittedText = splittedText.map(
    word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );

  return splittedText.join(' ');
}
/**
 * Formats text into kebab case.
 * @param {string} value - text to capitalize
 */
export function kebabCase(value) {
  return value.split(' ').join('-');
}
/**
 * Returns the plural of a noun if it's count is more than 1.
 *
 * @param {number} count - count of the noun
 * @param {string} noun - word to pluralize
 * @param {string} suffix - default suffix to add on the plural word.
 */
export function pluralize(count, noun, suffix = 's') {
  count = count || 0;

  noun = noun || '';
  const result = `${count} ${noun}${count > 1 ? suffix : ''}`;
  return result;
}

export function timePassed(dateString, addSuffix = true) {
  const dateFormat = dayjs().to(dayjs(dateString));
  let newDateFormat;
  const suffix = addSuffix ? 'ago' : '';

  if (dateFormat === 'a few seconds ago' || dateFormat === 'in a few seconds') {
    newDateFormat = 'now';
  } else if (dateFormat.includes('minute ago')) {
    newDateFormat = `1m ${suffix}`;
  } else if (dateFormat === 'an hour ago') {
    newDateFormat = `1h ${suffix}`;
  } else if (dateFormat === 'a day ago') {
    newDateFormat = `1d ${suffix}`;
  } else if (dateFormat === 'a month ago') {
    newDateFormat = `1mon ${suffix}`;
  } else if (dateFormat === 'a year ago') {
    newDateFormat = `1y ${suffix}`;
  } else {
    newDateFormat = dateFormat.split(' ');

    // return only the first letter of the second word if it's not months e.g 2 hours ago becomes 2h ago.
    // this avoids confusion between minutes and months.
    newDateFormat[1] = newDateFormat[1].includes('month')
      ? 'mon'
      : newDateFormat[1][0];

    newDateFormat = `${newDateFormat[0]}${newDateFormat[1]} ${suffix}`;
  }

  return newDateFormat;
}

/**
 * Calculates date from ISOString's offset.
 * @reference https://stackoverflow.com/questions/15517024/how-to-assume-local-time-zone-when-parsing-iso-8601-date-string
 *
 * @param {string} ISOString - ISOString
 * @returns
 */
export function getDateFromOffset(ISOString) {
  // FIXME: Update timezone fix.
  // const startTimeISOString = ISOString;

  // let startTime = new Date(startTimeISOString);
  // startTime = new Date(
  // 	startTime.getTime() + startTime.getTimezoneOffset() * 60000
  // );

  // return startTime;

  return ISOString;
}
/**
 * Formats ISOString to use Indian timezone.
 */
export const setDateInDefaultTimezone = (year, month = 1, day = 1) => {
  const result = dayjs(`${year}-${month}-${day}`)
    .tz('Asia/Kolkata')
    .toISOString();
  return result;
};
/**
 * Assumes the timezone to be IST
 */
export const getDateInDefaultTimezone = ISOString => {
  const {$y, $M, $D} = dayjs(ISOString || new Date()).tz('Asia/Kolkata');
  return {year: $y, month: $M, day: $D};
};

export const hexToRgba = (hex, alpha = 0.6) => {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const formatToDayMonthYear = (ISOString, timezone = 'Asia/Kolkata') => {
  if (!ISOString?.length) return undefined;
  const date = new Date(ISOString);

  const localDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
  }).format(date);

  return localDate;
};

export const formatTimeto12Hour = (ISOString, timezone = 'Asia/Kolkata') => {
  try {
    if (!ISOString?.length) return undefined;
    const _timezone = timezone?.length ? timezone : 'Asia/Kolkata';
    const date = new Date(ISOString);
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: _timezone,
    };
    const localTime = new Intl.DateTimeFormat('en-GB', options).format(date);

    return localTime.replace('am', 'AM').replace('pm', 'PM');
  } catch (__error) {
    return '';
  }
};

// formatted date
export const formattedDate = (dateString, flag) => {
  if (dateString) {
    flag = Number(flag);

    dateString = getDateFromOffset(dateString);

    if (flag === 1) {
      return dayjs(dateString).format('Do MMM YYYY');
    }
    if (flag === 2) {
      return dayjs(dateString).format('MMM YYYY');
    }
    if (flag === 3) {
      return dayjs(dateString).year();
    }
    return dayjs(dateString).format('Do MMM YYYY');
  }
  return '';
};

/**
 * Generate a list of months for a given year.
 *
 * @param {number} year - The year for which to generate the month list.
 * @returns {Array} An array of objects representing the months, each with a "value" and "label" property.
 *
 * @example
 * // Example usage:
 * const year = 2023;
 * const months = generateMonthList(year);
 * // Output:
 * // [
 * //   { value: 1, label: "January" },
 * //   { value: 2, label: "February" },
 * //   ...
 * //   { value: 12, label: "December" }
 * // ]
 */
export function generateMonthList(year) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  year = parseInt(year, 10);

  let totalMonth = 12;

  if (year < 1000) {
    return [];
  }
  if (year === new Date().getFullYear()) {
    totalMonth = new Date().getMonth() + 1;
  }

  const allMonths = [];

  if (totalMonth > 0) {
    for (let _month = 1; _month <= totalMonth; _month += 1) {
      const monthText = new Date(currentYear, _month, 0).toLocaleString(
        'default',
        {month: 'long'},
      );
      allMonths.push({value: _month, label: monthText});
    }
  }
  return allMonths;
}

export function getDeviceInfo() {
  const model = DeviceInfo.getModel();
  const platform = DeviceInfo.getSystemName();
  const osVersion = DeviceInfo.getSystemVersion();
  const operatingSystem = DeviceInfo.getSystemName();

  const result = {
    model,
    platform,
    osVersion,
    operatingSystem,
  };

  return result;
}
/**
 * @param {string} status
 */
export function transformStatus(status) {
  if (!status) return '';
  return status.replace('Online', 'Available').replace('Offline', 'Busy');
}

/**
 * Converts markdown to html.
 *
 * @param {string} - markdown content.
 * @returns
 */
// export function mdToHtml(data) {
//   data = data || '';
//   const html = parse(data);
//   return html || '';
// }

/**
 * @typedef {Object} PhoneInfo - An object containing the parsed components of the phone number.
 * @property {string} country - Country abbreviation e.g `IN` for India
 * @property {string} iso - Country code e.g +91 for India
 * @property {string} nationalNumber - National number e.g `2086213307` from +912086213307.
 */
/**
 * Parses a phone number and returns its components.
 *
 * @param {string} phone The phone number to parse e.g `+912086213307`.
 * @param {string} [countryAbbreviation="ZZ"] The country abbreviation for the phone number's region e.g `IN` for India. Default is "ZZ" (unknown).
 * @returns {PhoneInfo}
 */
export function parsePhone(phone, countryAbbreviation = 'ZZ') {
  const parsedNumber = phoneUtil.parse(phone, countryAbbreviation);
  const country = phoneUtil.getRegionCodeForNumber(parsedNumber);
  const iso = phoneUtil.getRegionCodeForNumber(parsedNumber);
  const nationalNumber = parsedNumber.getNationalNumber();

  return {
    country,
    iso,
    nationalNumber,
  };
}
/**
 * Formats markdown links to html.
 * @param {string} text - markdown text
 * @returns
 */
export function formatTagsText(text) {
  if (!text?.length) {
    text = '';
  }
  return text.replace(
    /\@\[(.*?)\]\((imeuswe:(.*?))\)/gim,
    function (match, text, link, id) {
      const url = link.startsWith('imeuswe:') ? '#' : link;
      return `<a href="${url}">${text}</a>`;
    },
  );
}

export function formatLinkText(text) {
  if (!text) {
    return '';
  } // Handle null, undefined, or empty string

  const urlRegex = /(https?:\/\/\S+)|(www\.\S+)/g; // Updated regex to capture URLs

  return text.replace(urlRegex, function (match) {
    const url = match.startsWith('http') ? match : 'http://' + match; // Add protocol if missing
    return `<a href="${url}">${match}</a>`;
  });
}

export function numberToWords(num) {
  if (num === 0) {
    return 'zero';
  }

  const belowTwenty = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];

  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  const thousand = 'thousand';
  const hundred = 'hundred';

  let words = '';

  if (Math.floor(num / 1000) > 0) {
    words += belowTwenty[Math.floor(num / 1000)] + ' ' + thousand + ' ';
    num %= 1000;
  }

  if (Math.floor(num / 100) > 0) {
    words += belowTwenty[Math.floor(num / 100)] + ' ' + hundred + ' ';
    num %= 100;
  }

  if (num > 0) {
    if (num < 20) {
      words += belowTwenty[num] + ' ';
    } else {
      words += tens[Math.floor(num / 10)] + ' ';
      if (num % 10 > 0) {
        words += belowTwenty[num % 10] + ' ';
      }
    }
  }

  return words.trim();
}
export const formatDuration = seconds => {
  const duration = moment.duration(seconds, 'seconds');
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const secs = duration.seconds();
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(secs).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(
      2,
      '0',
    )}`;
  }
};
export function handleTimeChange(time) {
  if (!time) return;

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
    hour12: true,
  }).format(new Date(time));

  return formattedTime;
}

export function handleDateChange(date) {
  if (!date) return;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));

  return formattedDate;
}

export function formatDateAndTimeToISO(dateStr, timeStr) {
  const [month, day, year] = dateStr.split('/').map?.(Number);
  timeStr = timeStr.replace(/\s+/g, ' ').trim();

  const [time, modifier] = timeStr.split(' ');
  let [hour, minute] = time.split(':').map(Number);

  if (modifier.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (modifier.toUpperCase() === 'AM' && hour === 12) hour = 0;

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return date.toISOString();
}
export function formatDateWithName(inputDate) {
  if (!inputDate?.length) return '';

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const [month, day, year] = inputDate?.split?.('/')?.map?.(Number) || [];
  if (!month || !day || !year) return '';

  return `${day} ${months[month - 1]} ${year}`;
}

export function toSentenceCase(str = '') {
  return (
    (str?.charAt?.(0)?.toUpperCase?.() || '') +
    (str?.slice?.(1)?.toLowerCase?.() || '')
  );
}

export function getDifferenceInTime(startDate, endDate) {
  const diffInSeconds = endDate.diff(startDate, 'seconds');
  return diffInSeconds;
}

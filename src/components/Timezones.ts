import {cityTimezonesObj, Timezone} from '../types/timezone';
import {DBuserTimezones} from '../utils/databases';
import ct from 'countries-and-timezones';
import cityTimezones from 'city-timezones';
import {ControlledError} from '../utils/errors';

// eslint-disable-next-line
// @ts-ignore // NOTE: library is not typed
const cityMapping = cityTimezones.cityMapping;

export class Timezones {
  /**
   * Add a timezone to a users store
   */
  public static add(userId: string, tz: string): Timezone[] {
    const timezone = ct.getTimezone(tz);
    if (!timezone) {
      throw new ControlledError(`Invalid timezone: ${tz}`, {tz}, 400);
    }

    if (DBuserTimezones[userId]) {
      DBuserTimezones[userId].add(tz);
    } else {
      DBuserTimezones[userId] = new Set([tz]);
    }

    return this.list(userId);
  }

  /**
   * List all timezones in a users store
   */
  public static list(userId: string): Timezone[] {
    const timezones = DBuserTimezones[userId];

    if (!timezones) {
      DBuserTimezones[userId] = new Set();
      return [];
    }

    return [...timezones].map(tz => {
      const localTime = new Date().toLocaleString('en-US', {timeZone: tz});
      const countryName = ct.getCountryForTimezone(tz)?.name || 'Unkmown';
      const timezone = ct.getTimezone(tz);
      const city = cityMapping.find((c: cityTimezonesObj) => c.timezone === tz);

      if (!timezone) {
        throw new Error(`Could not find timezone data for ${tz}`);
      }

      return {
        name: tz,
        cityName: city?.city || 'n/a',
        countryName,
        localTime,
        timeDifferenceToGMT: timezone.utcOffsetStr,
      };
    });
  }

  /**
   * Remove a timezone from a users store
   */
  public static delete(userId: string, tz: string): Timezone[] {
    if (DBuserTimezones[userId]) {
      DBuserTimezones[userId].delete(tz);
    } else {
      DBuserTimezones[userId] = new Set([]);
    }

    return this.list(userId);
  }
}

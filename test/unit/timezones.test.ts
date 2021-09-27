import {expect} from 'chai';
import {Timezones} from '../../src/components/Timezones';
import {DBuserTimezones} from '../../src/utils/databases';
import {ControlledError} from '../../src/utils/errors';

describe('Timezones', () => {
  beforeEach(() => {
    // Clear all timezones
    for (const prop in DBuserTimezones) {
      delete DBuserTimezones[prop];
    }
  });

  describe('add', () => {
    it('Should add a timezone to a users store', () => {
      const userId = '12345';
      const timezones = Timezones.add(userId, 'Europe/Lisbon');

      expect(timezones).to.be.an('array');
      expect(timezones[0]).to.be.an('object');
      expect(timezones[0].cityName).to.be.a('string');
      expect(timezones[0].localTime).to.be.a('string');
      expect(timezones[0].timeDifferenceToGMT).to.be.a('string');
      expect(timezones[0].cityName).to.be.a('string');
      expect(timezones[0].name).to.be.a('string');
    });

    it('Should throw an error on invalid timezone passed', () => {
      const userId = '12345';
      const timezone = 'not a timezone';
      expect(() => Timezones.add(userId, timezone)).to.throw(ControlledError, `Invalid timezone: ${timezone}`);
    });

    it('Should not add a duplicate timezone', () => {
      const userId = '12345';
      Timezones.add(userId, 'Europe/Lisbon');
      Timezones.add(userId, 'Europe/Lisbon');
      Timezones.add(userId, 'Europe/Lisbon');
      const timezones = Timezones.add(userId, 'Europe/Lisbon');

      expect(timezones).to.be.an('array');
      expect(timezones).to.have.length(1);
      expect(timezones[0]).to.be.an('object');
      expect(timezones[0].cityName).to.be.a('string');
      expect(timezones[0].localTime).to.be.a('string');
      expect(timezones[0].timeDifferenceToGMT).to.be.a('string');
      expect(timezones[0].cityName).to.be.a('string');
      expect(timezones[0].name).to.be.a('string');
    });
  });

  describe('list', () => {
    it('Should return a list of timezones for a user', () => {
      const userId = '12345';
      DBuserTimezones[userId] = new Set(['Europe/Lisbon', 'Europe/Athens', 'Pacific/Norfolk']);
      const timezones = Timezones.list(userId);

      expect(timezones).to.be.an('array');
      expect(timezones).to.have.length(3);

      timezones.forEach(tz => {
        expect(tz).to.be.an('object');
        expect(tz.cityName).to.be.a('string');
        expect(tz.localTime).to.be.a('string');
        expect(tz.timeDifferenceToGMT).to.be.a('string');
        expect(tz.cityName).to.be.a('string');
        expect(tz.name).to.be.a('string');
      });
    });

    it('Should return an empty list of timezones for a new user', () => {
      const userId = '12345';
      const timezones = Timezones.list(userId);

      expect(timezones).to.be.an('array');
      expect(timezones).to.have.length(0);
    });
  });

  describe('delete', () => {
    it('Should delete a timezone from a users store', () => {
      const userId = '12345';
      DBuserTimezones[userId] = new Set(['Europe/Lisbon', 'Europe/Athens', 'Pacific/Norfolk']);
      const timezones = Timezones.delete(userId, 'Europe/Lisbon');

      expect(timezones).to.be.an('array');
      expect(timezones).to.have.length(2);
      expect(timezones[0].name).to.equal('Europe/Athens');

      timezones.forEach(tz => {
        expect(tz).to.be.an('object');
        expect(tz.cityName).to.be.a('string');
        expect(tz.localTime).to.be.a('string');
        expect(tz.timeDifferenceToGMT).to.be.a('string');
        expect(tz.cityName).to.be.a('string');
        expect(tz.name).to.be.a('string');
      });
    });

    it('Should return an empty store if a user tries to delete an entry from an already empty store', () => {
      const userId = '12345';
      const timezones = Timezones.delete(userId, 'Europe/Lisbon');
      expect(timezones).to.be.an('array');
      expect(timezones).to.have.length(0);
    });
  });
});

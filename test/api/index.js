import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
  vus: 1, // 1 user looping for 1 minute
//   duration: '30s',

  thresholds: {
    // 99% of requests must complete below 1.5s
    http_req_duration: ['p(99)<1500'],

    // During the whole test execution, the error rate must be lower than 1%.
    // `http_req_failed` metric is available since v0.31.0
    // http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:8080';
const LOGIN_URL = `${BASE_URL}/login`;
const REFRESH_URL = `${BASE_URL}/refresh`;
const USERS_URL = `${BASE_URL}/users`;
const TIMEZONES_URL = `${BASE_URL}/timezones`;
const ADMIN_TIMEZONES_URL = (userId) => `${BASE_URL}/admin/timezones/${userId}`;

const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'password';

const generateEmailAddress = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '@test.com';
const generatePassword = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export default () => {
  group('Log in as admin, refresh token & CRUD another users store', function () {
    // Login
    const loginResponse = http.post(LOGIN_URL, JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    }), { headers: { 'Content-Type': 'application/json' } })
    let accessToken = loginResponse.json('accessToken')
    const refreshToken = loginResponse.json('refreshToken')
    check(loginResponse, {
        '[login] logged in successfully (tokens returned)': (r) => !!accessToken && !!refreshToken,
        '[login] is status 200': (r) => r.status === 200,
    })

    // Refresh token
    const refreshResponse = http.post(REFRESH_URL, JSON.stringify({
        token: refreshToken
    }), { headers: { 'Content-Type': 'application/json' } })
    check(refreshResponse, {
        '[refresh] session refreshed successfully (new token returned)': (r) => !!accessToken,
        '[refresh] is status 200': (r) => r.status === 200,
    })
    accessToken = refreshResponse.json('accessToken')

    const newUsersEmail = generateEmailAddress();
    const newUsersPassword = generatePassword();

    // Create new user
    const userCreateResponse = http.post(USERS_URL, JSON.stringify({
        email: newUsersEmail,
        password: newUsersPassword
    }), { headers: { 'Content-Type': 'application/json' } })
    const userId = userCreateResponse.json('id');
    check(userCreateResponse, {
        '[create user] user successfully created (userId returned)': (r) => !!userId,
        '[create user] is status 200': (r) => r.status === 200,
    })

    // Get users TZ's as admin
    const adminTimezonesGetResponse = http.get(ADMIN_TIMEZONES_URL(userId), { headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
    }})
    check(adminTimezonesGetResponse, {
        '[get tzs by admin] successfully listed users tzs': (r) => r.json('timezones').length === 0 && Array.isArray(r.json('timezones')),
        '[get tzs by admin] is status 200': (r) => r.status === 200,
    })

    // Add a TZ to a users store
    const adminAddTimezoneResponse = http.post(ADMIN_TIMEZONES_URL(userId), JSON.stringify({
        timezone: 'Europe/Lisbon'
    }), { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, } })
    check(adminAddTimezoneResponse, {
        '[add first tz by admin] successfully added a tz': (r) => r.json('timezones').length === 1 && Array.isArray(r.json('timezones')),
        '[add first tz by admin] is status 200': (r) => r.status === 200,
    })

    // Add another TZ to a users store
    const adminAddTimezoneResponse2 = http.post(ADMIN_TIMEZONES_URL(userId), JSON.stringify({
        timezone: 'Europe/Athens'
    }), { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, } })
    check(adminAddTimezoneResponse2, {
        '[add second tz by admin] successfully added a tz': (r) => r.json('timezones').length === 2 && Array.isArray(r.json('timezones')),
        '[add second tz by admin] is status 200': (r) => r.status === 200,
    })

    // Delete a users TZ
    const adminDeleteTimezoneResponse = http.del(ADMIN_TIMEZONES_URL(userId), JSON.stringify({
        timezone: 'Europe/Athens'
    }), { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, } })
    check(adminDeleteTimezoneResponse, {
        '[delete tz by admin] successfully deleted a users tzs': (r) => r.json('timezones').length === 1 && Array.isArray(r.json('timezones')),
        '[delete tz by admin] is status 200': (r) => r.status === 200,
    })

    // Get users TZ's as admin after the updates
    const adminTimezonesGetResponse2 = http.get(ADMIN_TIMEZONES_URL(userId), { headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
    }})
    check(adminTimezonesGetResponse2, {
        '[get tzs by admin] successfully listed a users tzs': (r) => r.json('timezones').length === 1 && Array.isArray(r.json('timezones')),
        '[get tzs by admin] is status 200': (r) => r.status === 200,
    })

    sleep(1);
  });

  group('Create new user, CRUD tzs', function () {
    // Create new user
    const newUsersEmail = generateEmailAddress();
    const newUsersPassword = generatePassword();
    const userCreateResponse = http.post(USERS_URL, JSON.stringify({
        email: newUsersEmail,
        password: newUsersPassword
    }), { headers: { 'Content-Type': 'application/json' } })
    const userId = userCreateResponse.json('id');
    check(userCreateResponse, {
        '[create user] user successfully created (userId returned)': (r) => !!userId,
        '[create user] is status 200': (r) => r.status === 200,
    })

    // Login
    const loginResponse = http.post(LOGIN_URL, JSON.stringify({
        email: newUsersEmail,
        password: newUsersPassword
    }), { headers: { 'Content-Type': 'application/json' } })
    const accessToken = loginResponse.json('accessToken')
    const refreshToken = loginResponse.json('refreshToken')
    check(loginResponse, {
        '[login] logged in successfully (tokens returned)': (r) => !!accessToken && !!refreshToken,
        '[login] is status 200': (r) => r.status === 200,
    })

    // Get TZ's
    const timezonesGetResponse = http.get(TIMEZONES_URL, { headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
    }})
    check(timezonesGetResponse, {
        '[get tzs] successfully listed users tzs': (r) => r.json('timezones').length === 0 && Array.isArray(r.json('timezones')),
        '[get tzs] is status 200': (r) => r.status === 200,
    })

    // Add a TZ
    const addTimezoneResponse = http.post(TIMEZONES_URL, JSON.stringify({
        timezone: 'Europe/Lisbon'
    }), { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, } })
    check(addTimezoneResponse, {
        '[add tz] successfully added a tz': (r) => r.json('timezones').length === 1 && Array.isArray(r.json('timezones')),
        '[add tz] is status 200': (r) => r.status === 200,
    })

    // Delete a TZ
    const deleteTimezoneResponse = http.del(TIMEZONES_URL, JSON.stringify({
        timezone: 'Europe/Lisbon'
    }), { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, } })
    check(deleteTimezoneResponse, {
        '[delete tz] successfully deleted a tz': (r) => r.json('timezones').length === 0 && Array.isArray(r.json('timezones')),
        '[delete tz] is status 200': (r) => r.status === 200,
    })
  })

  group('Standard users should not be able to update timezones of others', function () {
    // Create new user
    const newUsersEmail = generateEmailAddress();
    const newUsersPassword = generatePassword();
    const userCreateResponse = http.post(USERS_URL, JSON.stringify({
        email: newUsersEmail,
        password: newUsersPassword
    }), { headers: { 'Content-Type': 'application/json' } })
    const userId = userCreateResponse.json('id');
    check(userCreateResponse, {
        '[create user] user successfully created (userId returned)': (r) => !!userId,
        '[create user] is status 200': (r) => r.status === 200,
    })

    // Login
    const loginResponse = http.post(LOGIN_URL, JSON.stringify({
        email: newUsersEmail,
        password: newUsersPassword
    }), { headers: { 'Content-Type': 'application/json' } })
    const accessToken = loginResponse.json('accessToken')
    const refreshToken = loginResponse.json('refreshToken')
    check(loginResponse, {
        '[login] logged in successfully (tokens returned)': (r) => !!accessToken && !!refreshToken,
        '[login] is status 200': (r) => r.status === 200,
    })

    // Create second new user
    const newUsersEmail2 = generateEmailAddress();
    const newUsersPassword2 = generatePassword();
    const userCreateResponse2 = http.post(USERS_URL, JSON.stringify({
        email: newUsersEmail2,
        password: newUsersPassword2
    }), { headers: { 'Content-Type': 'application/json' } })
    const userId2 = userCreateResponse.json('id');
    check(userCreateResponse2, {
        '[create user2] user successfully created (userId returned)': (r) => !!userId,
        '[create user2] is status 200': (r) => r.status === 200,
    })

    // Try to add a TZ to the second users store
    const adminAddTimezoneResponse = http.post(ADMIN_TIMEZONES_URL(userId2), JSON.stringify({
        timezone: 'Europe/Lisbon'
    }), { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, } })
    check(adminAddTimezoneResponse, {
        '[add tz by admin] is status 401': (r) => r.status === 401,
    })
  })

  group('Entering an incorrect password should throw an error', function () {
    // Create new user
    const newUsersEmail = generateEmailAddress();
    const newUsersPassword = generatePassword();
    const userCreateResponse = http.post(USERS_URL, JSON.stringify({
        email: newUsersEmail,
        password: newUsersPassword
    }), { headers: { 'Content-Type': 'application/json' } })
    const userId = userCreateResponse.json('id');
    check(userCreateResponse, {
        '[create user] user successfully created (userId returned)': (r) => !!userId,
        '[create user] is status 200': (r) => r.status === 200,
    })

    // Login
    const loginResponse = http.post(LOGIN_URL, JSON.stringify({
        email: newUsersEmail,
        password: 'incorrect'
    }), { headers: { 'Content-Type': 'application/json' } })
    check(loginResponse, {
        '[login] is status 403': (r) => r.status === 403,
    })
  })
};

// TODO test cases:
// Error on timed out token

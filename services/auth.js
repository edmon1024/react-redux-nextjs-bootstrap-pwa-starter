// @flow

// #region imports
import decode     from 'jwt-decode';
import moment     from 'moment';
// #endregion

// #region flow types
type STORES_TYPES =
| 'localStorage'
| 'sessionStorage';

type Storage       = STORES_TYPES
type TokenKey      = string;
type UserInfoKey   = string;
// #endregion

// #region constants
const TOKEN_KEY = 'token';
const USER_INFO = 'userInfo';

const APP_PERSIST_STORES_TYPES: Array<STORES_TYPES> = [
  'localStorage',
  'sessionStorage'
];

const parse     = JSON.parse;
const stringify = JSON.stringify;
// #endregion

/**
 * auth object
 *
 * -> store "TOKEN_KEY"
 * - default storage is "localStorage"
 * - default token key is 'token'
 */
export const auth = {
  // /////////////////////////////////////////////////////////////
  // TOKEN
  // /////////////////////////////////////////////////////////////

  /**
   * get token from localstorage
   *
   * @param {'localStorage' | 'sessionStorage'} [fromStorage='localStorage'] specify storage
   * @param {any} [tokenKey=TOKEN_KEY]  optionnal parameter to specify a token key
   * @returns {string} token value
   */
  getToken(
    fromStorage: Storage  = APP_PERSIST_STORES_TYPES[0],
    tokenKey: TokenKey = TOKEN_KEY
  ): ?string {
    // localStorage:
    if (fromStorage === APP_PERSIST_STORES_TYPES[0]) {
      return (localStorage && localStorage.getItem(tokenKey)) || null;
    }
    // sessionStorage:
    if (fromStorage === APP_PERSIST_STORES_TYPES[1]) {
      return (sessionStorage && sessionStorage.getItem(tokenKey)) || null;
    }
    // default:
    return null;
  },

  /**
  * set the token value into localstorage (managed by localforage)
  *
  * @param {string} [value=''] token value
  * @param {'localStorage' | 'sessionStorage'} [toStorage='localStorage'] specify storage
  * @param {any} [tokenKey='token'] token key
  * @returns {boolean} success/failure flag
  */
  setToken(
    value: string = '',
    toStorage: Storage = APP_PERSIST_STORES_TYPES[0],
    tokenKey: TokenKey = TOKEN_KEY
  ): ?string {
    if (!value || value.length <= 0) {
      return;
    }
    // localStorage:
    if (toStorage === APP_PERSIST_STORES_TYPES[0]) {
      if (localStorage) {
        localStorage.setItem(tokenKey, value);
      }
    }
    // sessionStorage:
    if (toStorage === APP_PERSIST_STORES_TYPES[1]) {
      if (sessionStorage) {
        sessionStorage.setItem(tokenKey, value);
      }
    }
  },


  /**
   * check
   * - if token key contains a valid token value (defined and not an empty value)
   * - if the token expiration date is passed
   *
   *
   * Note: 'isAuthenticated' just checks 'tokenKey' on store (localStorage by default or sessionStorage)
   *
   * You may think: 'ok I just put an empty token key and I have access to protected routes?''
   *    -> answer is:  YES^^
   * BUT
   * -> : your backend will not recognize a wrong token so private data or safe and you protected view could be a bit ugly without any data.
   *
   * => ON CONCLUSION: this aim of 'isAuthenticated'
   *    -> is to help for a better "user experience"  (= better than displaying a view with no data since server did not accept the user).
   *    -> it is not a security purpose (security comes from backend, since frontend is easily hackable => user has access to all your frontend)
   *
   * @param {'localStorage' | 'sessionStorage'} [fromStorage='localStorage'] specify storage
   * @param {any} [tokenKey=TOKEN_KEY] token key
   * @returns {boolean} is authenticed response
   */
  isAuthenticated(
    fromStorage: Storage = APP_PERSIST_STORES_TYPES[0],
    tokenKey: TokenKey = TOKEN_KEY
  ): boolean {
    // localStorage:
    if (fromStorage === APP_PERSIST_STORES_TYPES[0]) {
      if ((localStorage && localStorage.getItem(tokenKey))) {
        return true;
      } else {
        return false;
      }
    }
    // sessionStorage:
    if (fromStorage === APP_PERSIST_STORES_TYPES[1]) {
      if ((sessionStorage && sessionStorage.getItem(tokenKey))) {
        return true;
      } else {
        return false;
      }
    }
    // default:
    return false;
  },

  /**
   * delete token
   *
   * @param {any} [storage=APP_PERSIST_STORES_TYPES[0]] token key
   * @param {any} [tokenKey='token'] token key
   * @returns {boolean} success/failure flag
   */
  clearToken(
    storage: Storage  = APP_PERSIST_STORES_TYPES[0],
    tokenKey: TokenKey = TOKEN_KEY
  ): boolean {
    // localStorage:
    if (storage === APP_PERSIST_STORES_TYPES[0]) {
      localStorage.removeItem(tokenKey);
      return true;
    }
    // sessionStorage:
    if (storage === APP_PERSIST_STORES_TYPES[1]) {
      sessionStorage.removeItem(tokenKey);
      return true;
    }
    return false;
  },

  /**
   * return expiration date from token
   *
   * @param {string} encodedToken - base 64 token received from server and stored in local storage
   * @returns {date | null} returns expiration date or null id expired props not found in decoded token
   */
  getTokenExpirationDate(
    encodedToken: any
  ): Date {
    if (!encodedToken) {
      return new Date(0); // is expired
    }

    const token = decode(encodedToken);
    if (!token.exp) {
      return new Date(0); // is expired
    }

    const expirationDate = new Date(token.exp*1000);
    return expirationDate;
  },

  /**
   * tell is token is expired (compared to now)
   *
   * @param {string} encodedToken - base 64 token received from server and stored in local storage
   * @returns {boolean} returns true if expired else false
   */
  isExpiredToken(
    encodedToken: any
  ): boolean {
    const expirationDate = this.getTokenExpirationDate(encodedToken);
    const rightNow       = moment();
    const isExpiredToken = moment(rightNow).isAfter(moment(expirationDate));

    return isExpiredToken;
  },

  // /////////////////////////////////////////////////////////////
  // USER_INFO
  // /////////////////////////////////////////////////////////////
  /**
   * get user info from localstorage
   *
   * @param {'localStorage' | 'sessionStorage'} [fromStorage='localStorage'] specify storage
   * @param {any} [userInfoKey='userInfo']  optionnal parameter to specify a token key
   * @returns {string} token value
   */
  getUserInfo(
    fromStorage: Storage = APP_PERSIST_STORES_TYPES[0],
    userInfoKey: UserInfoKey = USER_INFO
  ): ?string {
    // localStorage:
    if (fromStorage === APP_PERSIST_STORES_TYPES[0]) {
      return (localStorage && parse(localStorage.getItem(userInfoKey))) || null;
    }
    // sessionStorage:
    if (fromStorage === APP_PERSIST_STORES_TYPES[1]) {
      return (sessionStorage && parse(sessionStorage.getItem(userInfoKey))) || null;
    }
    // default:
    return null;
  },

  /**
   * set the userInfo value into localstorage
   *
   * @param {object} [value=''] token value
   * @param {'localStorage' | 'sessionStorage'} [toStorage='localStorage'] specify storage
   * @param {any} [userInfoKey='userInfo'] token key
   * @returns {boolean} success/failure flag
   */
  setUserInfo(
    value: string = '',
    toStorage: Storage = APP_PERSIST_STORES_TYPES[0],
    userInfoKey: UserInfoKey = USER_INFO
  ): any {
    if (!value || value.length <= 0) {
      return;
    }
    // localStorage:
    if (toStorage === APP_PERSIST_STORES_TYPES[0]) {
      if (localStorage) {
        localStorage.setItem(userInfoKey, stringify(value));
      }
    }
    // sessionStorage:
    if (toStorage === APP_PERSIST_STORES_TYPES[1]) {
      if (sessionStorage) {
        sessionStorage.setItem(userInfoKey, stringify(value));
      }
    }
  },

  /**
   * delete userInfo
   *
   * @param {string} [userInfoKey='userInfo'] token key
   * @returns {boolean} success/failure flag
   */
  clearUserInfo(
    userInfoKey: UserInfoKey = USER_INFO
  ): any {
    // localStorage:
    if (localStorage && localStorage[userInfoKey]) {
      localStorage.removeItem(userInfoKey);
    }
    // sessionStorage:
    if (sessionStorage && sessionStorage[userInfoKey]) {
      sessionStorage.removeItem(userInfoKey);
    }
  },


  // /////////////////////////////////////////////////////////////
  // COMMON
  // /////////////////////////////////////////////////////////////
  /**
   * tells if current browser supports localStorage (as an example: iOS Safari with cookies disabled would not!)
   * @return {boolean} browser supports localStorage flag
   */
  supportsLocalStorage(): boolean {
    if (!window) {
      throw new Error('supportsLocalStorage should be launched on browser (not on server)');
    }

    try {
      const localStorageSupported = ('localStorage' in window) && (window.localStorage !== null);
      return localStorageSupported;
    } catch (error) {
      return false;
    }
  },

  /**
   * tells if current browser supports localStorage (as an example: iOS Safari with cookies disabled would not!)
   * @return {boolean} browser supports localStorage flag
   */
  supportsSessionStorage(): boolean {
    if (!window) {
      throw new Error('supportsSessionStorage should be launched on browser side (not on server side)');
    }

    try {
      const sessionStorageSupported = ('sessionStorage' in window) && (window.sessionStorage !== null);
      return sessionStorageSupported;
    } catch (error) {
      return false;
    }
  },

  /**
   * forget me method: clear all
   * @returns {boolean} success/failure flag
   */
  clearAllAppStorage(): any {
    if (localStorage) {
      localStorage.clear();
    }
    if (sessionStorage) {
      sessionStorage.clear();
    }
  }
};

export default auth;

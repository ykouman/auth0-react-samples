import history from '../history';
import auth0 from 'auth0-js';
import qs from 'qs';
import { AUTH_CONFIG } from './auth0-variables';

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    audience: `https://${AUTH_CONFIG.domain}/userinfo`,
    responseType: 'token id_token',
    scope: 'openid'
  });

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  login() {
    let options = {
      nonce: 'koula',
      state: 'taratata!!!',
      domain: AUTH_CONFIG.domain,
      clientID: AUTH_CONFIG.clientId,
      redirectUri: AUTH_CONFIG.callbackUrl,
      audience: `https://${AUTH_CONFIG.domain}/userinfo`,
      responseType: 'token id_token',
      scope: 'openid'
    }
    let options2 = {
      nonce: 'koula',
      state: 'taratata!!!',
    }
    let rurl = this.auth0.client.buildAuthorizeUrl(options)
    // this.auth0.authorize();
    // this.auth0.authorize({redirectUri: rurl})
    this.auth0.authorize(options2)
  }

  handleAuthentication() {
    let hashStr = global.window.location.hash
    hashStr = hashStr.replace(/^#?\/?/, '');
    let parsedQs = qs.parse(hashStr);
    console.log(`handleAuthentication hashStr: ${hashStr}`)
    console.log(`handleAuthentication qs.state: ${parsedQs.state ? JSON.stringify(parsedQs.state,null,2) : parsedQs.state}`)
    //let options = {state: 'kaka'}
    let options = {}
    this.auth0.parseHash(options, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        console.log(`handleAuthentication options.state: ${JSON.stringify(options.state,null,2)}`)
        this.setSession(authResult);
        history.replace('/home');
      } else if (err) {
        history.replace('/home');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    // navigate to the home route
    history.replace('/home');
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // navigate to the home route
    history.replace('/home');
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }
}

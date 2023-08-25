import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAuthenticated: boolean = false;
  code: any;
  token: any;
  decodedToken: any;

  constructor(
    private _http: HttpClient,
    private router: Router
  ) {
    this.isAuthenticated = false;
    console.log("winloc", window.location.href);

    if (window.location.href.indexOf('code=') > -1) {
      console.log(window.location.href.substring(window.location.href.indexOf('code=') - 10, window.location.href.length));
      if (!this.isAuthenticated) {
        //let reg = /(code=)(.*)(&)/;
        let url = window.location.href;
        let params = new URL(url).searchParams;
        this.code = params.get("code");
        this.isAuthenticated = this.code != null;
      }

      if (this.isAuthenticated) {
        console.log('retrieve token 3');
        let params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', "0e0a0ab3-2fd2-46f5-9fb6-40be4e13c7ee");
        // params.append('client_secret', environment.kcClientSecret);
        params.append('redirect_uri', "http://localhost:2100/");
        params.append('code', this.code);
        params.append('scope', 'openid profile email');

        let headers = new HttpHeaders({
          'Content-type': 'application/x-www-form-urlencoded',
          'Accept': '*/*',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
          // 'Authorization':'Bearer '+environment.kcClientId+':'+environment.kcClientSecret,
          // 'Origin': environment.originURL
        });
        // this._http.post(
        //   "https://login.microsoftonline.com",
        //   params.toString(),
        //   { headers: headers }
        // ).subscribe(
        //   data => this.saveToken(data),
        //   err => alert('Invalid Credentials')
        // );
        this._http.post(
          "https://kc:8443/realms/microbeat/protocol/openid-connect/token",
          params.toString(),
          { headers: headers }
        ).subscribe(
          data => this.saveToken(data),
          err => alert('Invalid Credentials')
        );
      } else {
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 500);
      }

    }
  }

  saveToken(token: any) {
    console.log('token -> ' + token);
    // var expireDate = new Date().getTime() + (1000 * token.expires_in);
    sessionStorage.setItem("access_token", token.access_token);
    this.token = token;
    this.decodedToken = jwt_decode(token.access_token);
    // Cookie.set("access_token", token.access_token, expireDate);
    console.log('Obtained Access token', token);
    //this.getOrganization();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 500);
  }

  login() {
    if (!this.isAuthenticated) {
      let params = new URLSearchParams();
      params.append('client_id', "0e0a0ab3-2fd2-46f5-9fb6-40be4e13c7ee");
      params.append('response_type', 'code');
      params.append('redirect_uri', "http://localhost:2100/");
      params.append('response_mode', 'query');
      params.append('scope', 'openid profile email');
      params.append('state', 'fj8o3n7bdy1op5');
      // params.append('client_id', "0e0a0ab3-2fd2-46f5-9fb6-40be4e13c7ee");
      // params.append('response_type', 'code');
      // params.append('redirect_uri', "http://localhost:2100/");
      // params.append('response_mode', 'query');
      // params.append('scope', 'openid profile email');
      // params.append('state', 'fj8o3n7bdy1op5');
      // // params.append('code_challenge', 'YTFjNjI1OWYzMzA3MTI4ZDY2Njg5M2RkNmVjNDE5YmEyZGRhOGYyM2IzNjdmZWFhMTQ1ODg3NDcxY2Nl');
      // // params.append('code_challenge_method', 'S256');

      console.log("params.toString() -> " + params.toString());

      // window.location.assign(
      //   "https://login.microsoftonline.com/de560f8f-0276-44a0-ad74-400886bd0c3a/oauth2/v2.0/authorize?" + params.toString()
      // );
      window.location.assign(
        "https://kc:8443/realms/microbeat/protocol/openid-connect/auth?" + params.toString()
      );
    }
  }

}

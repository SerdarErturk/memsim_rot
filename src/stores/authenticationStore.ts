

import {  setToken, setProfilPicture, setUserId, setUser } from 'utils/auth'
import http from '../services/httpService';


class AuthenticationStore {

  public async login(model:any) {
    let response = await http.post('user/login', {
      username: model.username,
      password: model.password,
      captcha: true,
    }) as any;
    if (response.errorMessage) {
      return { errorMessage: response.errorMessage };
    }
    var result = response.data.result
    // await setProfilPicture(result.profilePicture);
     await setUser(result);
    //await setUserId(result.id.toString());

    return result;
  }
  public async reCreateToken(model: any) {
    let response = await http.post('user/RecreateToken', model);
    var result = response.data.result
    await setToken(result);
    return true;
  }
  public async register(model: any) {
    let response = await http.post('ExternalUser/ExternalUserRegister', model);
    var result = response.data.result
    return result;
  }
  public async phoneVerification(model: any) {
    let response = await http.post('ExternalUser/ExternalLoginVerification', model);
    var result = response.data.result
    return result;
  }
  public async forgotPassword(model: any) {
    let response = await http.post('ExternalUser/ForgotPassword', model);
    var result = response.data.result
    return result;
  }
  public async replacePassword(model: any) {
    let response = await http.post('ExternalUser/ReplacePassword', model);
    var result = response.data.result
    return result;
  }
  public async getActiveUserAppSetting() {
    let response = await http.get('User/GetActiveUserAppSetting');
    var result = response.data.result
    return result;
  }
  logout() {
    // localStorage.clear();
    // sessionStorage.clear();
  }
}
export default AuthenticationStore;

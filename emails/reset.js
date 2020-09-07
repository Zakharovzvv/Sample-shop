const keys=require('../keys')

module.exports=function (email,token){
  return {
    to: email,
    from:keys.EMAIL_FROM,
    subject:'Reset password',
    html:`
    <p>If you forgot password click <a href="${keys.BASE_URL}/auth/password/${token}">reset password</a></p>
    <hr/>
    <a href="${keys.BASE_URL}">Course magazine</a>
    `
  }
}

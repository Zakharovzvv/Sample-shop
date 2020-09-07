const keys=require('../keys')

module.exports=function (email){
  return {
    to: email,
    from:keys.EMAIL_FROM,
    subject:'Registration complete',
    html:`
    <h1>Welcome to our shop</h1>
    <p>You created account ${email} </p>
    <hr/>
    <a href="${keys.BASE_URL}">Course magazine</a>
    `

  }
}

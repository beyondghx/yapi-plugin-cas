const request = require('request');

module.exports = function (options) {
  const { AUTH_SERVER, emailPostfix } = options
  this.bindHook('third_login', (ctx) => {
    let ticket = ctx.request.body.ticket || ctx.request.query.ticket;
    let requestUrl = ctx.request.protocol + '://' + ctx.request.host + ctx.request.path;
    let validateUrl = AUTH_SERVER + '?service=' + encodeURIComponent(requestUrl) + '&ticket=' + ticket;
    return new Promise((resolve, reject) => {
      request.get(validateUrl, function(error, response, body = '') {
        if (!error && response.statusCode == 200) {
          let result = body.replace(/[\n\r]/g, '|').split('|')
          let status = result[0] === 'yes' ? 1 : 0

          if (status) {
            let username = result[1] || ''
            resolve({
              email: username + emailPostfix,
              username: username
            })
          } else {
            reject('Login error!');
          }
        } else {
          reject(error);
        }
      })
    })
  });
}
if (process.env.NODE_ENV === 'production') {
    module.exports = require('./appConfig.prod');
}
else {
    module.exports = require('./appConfig.dev');
}
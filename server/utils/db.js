const mongoose = require('mongoose')
const Fawn = require("fawn");
import config from '../config';

let dbUrl = `mongodb://${config.dbHost}:${config.dbPort}`;
// if (config.dbUser) {
//     dbUrl = `mongodb://${config.dbUser}:${config.dbPass}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
// }

console.log(dbUrl)
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
        user: config.dbUser,
        pass: config.dbPass,
        dbName: config.dbName,
        retryWrites: true,useUnifiedTopology: true
    }, (err) => {
    if (err) {
        console.log('Mongoose connection error: ' + err.message)
    } else {
        console.log('数据库连接成功')
    }
});

mongoose.connection
    .on('disconnected', function () {
        console.log('Mongoose connection disconnected')
    })
Fawn.init(mongoose);

module.exports = mongoose

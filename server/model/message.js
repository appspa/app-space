const mongoose = require('../utils/db')
const Schema = mongoose.Schema

const messageSchema = new Schema({
    category: {
        type: String,
        required: true //消息类型  //INVITE 邀请
    },
    content: {
        type: String,
        required: true  //消息内容
    },
    sender: String, //发送者的id
    receiver: {
        type: String,  //接受者的id 必填
        required: true
    },
    sendAt: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        default: 'unread',
        enum: ['unread', 'hasread']
    },
    data: String     //消息中带有的data字段

});

module.exports = mongoose.model('Message', messageSchema);

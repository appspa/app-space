'use strict';

import nodemailer from 'nodemailer';
import config from '../config'

module.exports = class Mail {

    /** 
     * @argument emails [Array || String] 支持输入多个邮箱组成的数组或者单个邮箱
     * @argument subject String 邮件主题
     * @argument content String<HTML> 邮件内容
     */
    static async send(emails, subject, content) {
        const email = (emails instanceof Array) ? emails.reduce((pv, cv) => { return pv + "," + cv }) : emails
        let transporter = nodemailer.createTransport({
            host: config.emailService,
            port: config.emailPort,
            auth: {
                user: config.emailUser,
                pass: config.emailPass
            }
        })
        let mailOptions = {
            from: `app-publisher<${config.emailUser}>`,
            to: email,
            subject: subject,
            html: content
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error)
            }
            console.log('e-mail send success')
            console.log('Message sent %s', info.messageId)
        })
    }
}
import config from '../config';
import { AndFilter, EqualityFilter } from 'ldapjs';
var ldap = require('ldapjs')

class Ldap {

    create() {
        this.client = ldap.createClient({
            url: config.ldapServer,
            bindDN: config.ldapUserDn,
            bindCredentials: config.ldapBindCredentials,
            reconnect: true
        })
    }

    auth(username, password) {
        this.create()
        var base = config.ldapBase
        var filters = new AndFilter({
            filters: [
                new EqualityFilter({
                    attribute: 'objectCategory',
                    value: 'Person'
                }),
                new EqualityFilter({
                    attribute: 'sAMAccountName',
                    value: username
                })
            ]
        })

        var opts = {
            filter: filters,
            scope: 'sub'
        }
        var me = this
        return new Promise(function(resolve, rejected) {
            me.search(base, opts, function(error, rows) {
                if (error) {
                    // throws('用户不存在')
                    console.log(error)
                    rejected(new Error())
                }
                if (rows.length == 0) {
                    rejected(new Error('用户不存在'))
                }
                me.client.bind(rows[0].dn, password, function(error) {
                    if (error) {
                        console.log(error)
                            // throws('密码错误')
                        rejected(error)
                    } else {
                        console.log('success')
                        resolve(rows[0])
                    }
                })
            })
        })
    }

    search(base, opts, callback) {
        var rows = []
        this.client.search(base, opts, function(error, res) {
            if (error) {
                console.log(error)
                callback(error, undefined)
            }
            res.on('searchEntry', function(entry) {
                rows.push(entry.object);
                console.log('searchEntry:' + JSON.stringify(entry.object))
            });
            res.on('error', function(error) {
                callback(error, undefined)
            })
            res.on('end', function(result) {
                callback(undefined, rows)
            });
        })

    }

}

module.exports = new Ldap()
import Models  from '../model'

export default class Verify {

    static async auth(key) {
        if (key) {
            let user = await Models.User.findOne({ apiToken: key })
            if (!user) {
                throw new Error('api token is not exist')
            }
            return user
        } else {
            throw new Error('api token is not exist')
        }
    }

    //["root","owner", "manager", "guest"]
    static async checkRole(uid, appid, role) {
        if (!role || role == 'guest') {
            return true;
        }
        let collaborator =  await Models.Collaborator.findOne({uid: uid, appId: appid});
        // console.log('collaborator',uid,collaborator)
        if(!collaborator){
            throw new Error('无该应用权限')
        }
        if (role == 'owner' && collaborator.role == 'owner') {
            return true
        }
        if (role == 'manager' && (collaborator.role == 'manager'||collaborator.role == 'owner')) {
            return true
        }
        throw new Error('无该权限')
    }

    static async checkApp(appId) {
        if (appId) {
            let app = await Models.App.findById(appId)
            if (!app) {
                throw new Error('app is not exist')
            }
            return app
        } else {
            throw new Error('appId is not exist')
        }
    }
}

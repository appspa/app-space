const App = require('../model/app_model')
const Version = require('../model/version')
const Collaborator = require('../model/collaborator')


function isEmail(str){
    let re=/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    if (re.test(str) != true) {
        return false;
    }else{
        return true;
    }
}



// async function appAndUserInTeam(appId,userId) {
//     let team = await Collaborator.findOne({_id:teamId,members:{
//             $elemMatch:{
//                 id:userId
//             }
//         },},"_id")
//     let app = await App.find({_id:appId,ownerId:team._id})
//     if (!app) {
//         throw new Error("应用不存在或您不在该团队中")
//     }else{
//         return app
//     }
// }

// async function userInTeam(appId,teamId,userId) {
//   var team = await Team.findOne({_id:teamId,members:{
//       $elemMatch:{
//            _id:userId
//       }
//   },},"_id")
//   var app = await App.findOne({_id:id,ownerId:team._id})
//   if (!app) {
//       throw new Error("应用不存在或您不在该团队中")
//   }else{
//       return app
//   }
// }

async function userInTeamIsManager(userId,appId) {
    let collaborator = await Collaborator.findOne({
        uid: userId,
        appId:appId,
        role:['owner','manager']
    })
    return collaborator
}

async function userInTeam(userId,teamId) {
    let team = await Team.findOne({_id:teamId,members:{
            $elemMatch:{
                _id:userId
            }
        },},"_id")

    return team
}


module.exports = { isEmail,userInTeamIsManager,userInTeam }

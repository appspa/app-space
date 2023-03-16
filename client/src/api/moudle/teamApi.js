import {getHttp, deleteHttp, postHttp} from '../basehttp'



export function getTeamMembers(appId) {
  let url = `api/collaborator/${appId}/members`
  return getHttp(url)
}

export function inviteMembers(appId, emails) {
  let param = {
    'emailList': emails,
    'role': 'guest'
  }
  let url = `api/collaborator/${appId}/invite`
  return postHttp(url, param)
}

export function deleteMembers(appId, userId) {
  let url = `api/collaborator/${appId}/member/${userId}`
  return deleteHttp(url)
}



export function modifyRole(appId, memberId, role) {
  let url = `api/collaborator/${appId}/role`
  let param = {
    'memberId': memberId,
    'role': role
  }
  return postHttp(url, param)
}

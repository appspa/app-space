<template>
  <div class="teamMgr">
    <div class="header">
      <div class="right">
        <el-button type="primary" @click="addClick">
          添加新成员
        </el-button>
        <el-button v-if="user.permission=='root'" type="primary" plain @click="registerClick">
          注册新账号
        </el-button>
      </div>
    </div>
    <el-tabs class="card" >
      <el-tab-pane>
        <span slot="label">项目成员</span>
        <div class="teamMgr-collection">
          <div class="teamMgr-content">
            <item v-for="(member, index) in members" :is-manager="isOwner" :key="index" :index="index" v-model="members[index]" @select="itemSelected" @roleUpdate="requestMembers"></item>
            <div class="teamMgr-group-footer">
              <div> 共 {{members.length}} 名成员</div>
            </div>
            <div class="teamMgr-group-bottom"></div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane v-if="user.permission=='root'">
        <span slot="label">账号管理</span>
        <div class="teamMgr-collection">
          <div class="teamMgr-content">
            <member-item v-for="(account, index) in accounts"  :key="index" :index="index" :account="account" @deleteAccount="deleteAccount(account)" @resetPassword="resetPassword(account)"></member-item>
            <div class="teamMgr-group-footer">
              <div> 共 {{accounts.length}} 名成员</div>
            </div>
            <div class="teamMgr-group-bottom"></div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="重置密码" :visible.sync="isShowResetPassword" width="30%" :append-to-body="true" center >
      <div >
        <p style="margin-bottom: 20px;font-size: 16px">{{this.account.username}}</p>
        <el-input
          type="text"
          class="user-login-form-input"
          v-model="newPassword"
          placeholder="请输入密码"
          prefix-icon="icon-ic_pswd">
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
              <el-button @click="isShowResetPassword=false">取 消</el-button>
              <el-button :loading="showLoading" type="primary" @click="resetPasswordRequest">确 定</el-button>
        </span>
    </el-dialog>

    <el-dialog class="dialog-register" title="注册新账号" :visible.sync="isShowRegister" width="30%" :append-to-body="true" center >
      <div class="user-register-form">
        <el-input
          type="text"
          class="user-login-form-input"
          v-model="username"
          placeholder="请输入用户名"
          prefix-icon="icon-ic_name">
        </el-input>
        <el-input
          class="user-login-form-input"
          placeholder="请输入邮箱"
          v-model="email"
          style="margin-top: 24px"
          type="email"
          prefix-icon="icon-ic_email">
        </el-input>

        <el-input
          class="user-login-form-input"
          placeholder="请输入密码"
          style="margin-top: 24px"
          v-model="password"
          type="password"
          prefix-icon="icon-ic_pswd">
        </el-input>
      </div>

      <span slot="footer" class="dialog-footer">
              <el-button @click="isShowRegister=false">取 消</el-button>
              <el-button :loading="showLoading" type="primary" @click="sendRegister">确 定</el-button>
        </span>
    </el-dialog>
    <el-dialog title="邀请成员" :visible.sync="isShowInvite" width="30%" :append-to-body="true" center >
      <el-input placeholder="多个邮箱使用空格分开" :rows="10" type="textarea" v-model="invitedEmails">
      </el-input>
      <span slot="footer" class="dialog-footer">
              <el-button @click="isShowInvite=false">取 消</el-button>
              <el-button type="primary" @click="sendInvite">确 定</el-button>
        </span>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="dialogVisible" :append-to-body="true" width="30%">
      <span>{{message}}</span>
      <span slot="footer" v-if="isManager" class="dialog-footer">
          <el-button @click="dialogVisible=false">取 消</el-button>
          <el-button type="primary" @click="deleteMember">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import Item from './teamItem.vue';
import * as TeamApi from '../../api/moudle/teamApi';
import * as useMgr from '../../mgr/userMgr'
import contextMenu from 'vue-context-menu'
import AppMgr from "@/mgr/AppMgr";
import utils from "@/common/js/utils";
import * as LoginApi from "@/api/moudle/loginApi";
import MemberItem from "@Components/team/memberItem";
import * as UserApi from "@/api/moudle/userApi";
export default {
  data() {
    return {
      members: [],
      accounts: [],
      isShowRegister: false,
      isShowResetPassword: false,
      isShowInvite: false,
      dialogVisible: false,
      isManager: false,
      currentIndex: -1,
      message: '',
      invitedEmails: '',
      isOwner: false,
      dissolveShow: false,
      createTeamVisible: false,
      username: '',
      password: '',
      email: '',
      showLoading: false,
      form: {
        name: ''
      },
      account:{},
      newPassword:'',
      curApp:AppMgr.getCurApp(),
      user :useMgr.getUserInfo()
    }
  },
  mounted() {
    this.user = useMgr.getUserInfo();
    this.requestMembers()
    // this.isOwner = useMgr.getUserTeam().role
    this.bus.$on('refreshList', () => {
      this.requestMembers()
    })
    if (this.user.permission=='root') {
      this.requestAccounts();
      // this.isOwner = useMgr.getUserTeam().role
      this.bus.$on('refreshAccounts', () => {
        this.requestAccounts()
      })
    }
  },
  destroyed() {
    this.bus.$off('refreshList')
  },
  computed: {},
  methods: {
    showMenu() {
      this.$refs.ctxMenu.open()
    },
    addClick() {
      this.isShowInvite = true
    },
    registerClick() {
      this.isShowRegister = true
    },
    sendRegister() {
      if (this.username.length === 0) {
        this.$message.error('用户名不能为空')
        return
      }
      if (this.email.length === 0) {
        this.$message.error('邮箱不能为空')
        return
      }
      if (!utils.valideEmail(this.email)) {
        this.$message.error('邮箱格式错误')
        return
      }
      if (this.password.length === 0) {
        this.$message.error('密码不能为空')
        return
      }
      let body = {
        'username': this.username,
        'password': this.password,
        'email': this.email
      }
      this.showLoading = true
      LoginApi.register(body)
        .then(response => {
          this.showLoading = false
          console.log(response)
          this.$message({
            message: '注册成功',
            type: 'success'
          })
          setTimeout(() => {
            this.requestAccounts()
          }, 500)
        }, reject => {
          this.showLoading = false
        })
    },
    sendInvite() {
      this.isShowInvite = false
      let emailList = this.invitedEmails.split(' ')
      let validedEmailList = []
      for (var email of emailList) {
        if (this.checkEmail(email)) {
          var changedEmail = email.replace(/[\r\n]/g, '')
          validedEmailList.push(changedEmail)
        }
      }
      if (validedEmailList.length > 0) {
        this.request(validedEmailList)
      } else {
        this.$message.error('请输入正确的邮箱')
      }
      console.log(validedEmailList)
    },
    itemSelected(index) {
      this.currentIndex = index
      let currentId = useMgr.getUserId()
      let userId = this.members[this.currentIndex].uid
      let owner = this.members.filter(member => {
        return member.uid === useMgr.getUserId()
      })[0].role
      if (currentId !== userId || owner !== 'owner') {
        this.stateUpdate()
        this.dialogVisible = true
      }
    },
    deleteMember() {
      this.dialogVisible = false
      if (this.currentIndex >= 0) {
        let userId = this.members[this.currentIndex].uid
        TeamApi.deleteMembers(this.curApp._id, userId).then(resp => {
          this.$message({
            message: resp.message,
            type: resp.success ? 'success' : 'error'
          })
          if (resp.success) {
            this.requestMembers()
          }
        })
      }
    },
    stateUpdate() {
      if (this.currentIndex >= 0) {
        this.user =useMgr.getUserInfo()
        let owner = this.members.filter(member => {
          return member.uid === this.user._id
        })[0].role
        let name = this.members[this.currentIndex].username
        let isSelf = useMgr.getUserId() === this.members[this.currentIndex].uid
        switch (owner) {
          case 'owner':
            this.message = '确定要移除' + name + '吗?'
            this.isManager = true
            break
          case 'manager':
            this.message = '确定要移除' + name + '吗?'
            this.isManager = true
            break
          default:
            this.message = isSelf
              ? '确定要离开该团队吗?'
              : '围观群众权限无法使用该功能，可联系项目创建者修改权限哦'
            this.isManager = isSelf
            break
        }
      }
    },
    deleteAccount(account){
      this.$confirm(`确认注销${account.username}？`)
        .then(() => {
          UserApi.deleteUser(account._id).then((res) => {
            this.$message.success('注销成功')
            this.requestAccounts()
          }, reject => {
            this.$message.error(reject)
          })
        }).catch(() => {})
    },
    resetPassword(account){
      this.account = account;
      this.isShowResetPassword = true;
    },
    resetPasswordRequest(){
      this.showLoading = true;
      UserApi.resetPassword(this.account._id,this.newPassword).then((res) => {
        this.$message.success('重置成功')
        this.showLoading = false;
        this.isShowResetPassword = false;
        this.requestAccounts()
      }, reject => {
        this.showLoading = false;
        this.$message.error(reject)
      })
    },
    request(emailList) {
      TeamApi.inviteMembers(this.curApp._id, emailList).then(resp => {
        if (resp.success) {
          this.$message({
            message: resp.message,
            type: 'success'
          })
          this.requestMembers()
        }
      })
    },
    requestMembers() {
      TeamApi.getTeamMembers(this.curApp._id).then(resp => {
        this.members = resp.data
      })
    },
    requestAccounts(){
      UserApi.getAccounts().then(resp => {
        this.accounts = resp.data
      })
    },

    checkEmail(email) {
      let re = /\S+@\S+\.\S+/
      return re.test(email)
    }
  },
  components: {
    MemberItem,
    Item,
    contextMenu
  },
  directives: {
    focus: {
      update(el, { value }) {
        if (value) {
          el.focus()
        }
      }
    }
  },
  watch: {
    members() {
      let itemArr = this.members.filter(member => {
        return member.uid === useMgr.getUserId()
      })
      if (itemArr && itemArr.length > 0) {
        this.isOwner = itemArr[0].role === 'owner'
      }
    },

  }
}
</script>

<style lang="scss">
@import '../../common/scss/base';
.teamMgr {
  position: relative;
  user-select: text;
  .header{
    height: 108px;
    background-color: white;
    display: flex;
    flex-direction: row;
    justify-content: right;
    align-items: center;
    .right{
      margin-right: 24px;
      height: 40px;
    }
  }
  .card {
    width: 100%;
    background-color: white;
    margin-top: 12px;
    padding-left: 24px;
    box-sizing: border-box;
    //.el-tabs__header {
    //  padding: 0;
    //  position: relative;
    //  margin: 0 0 15px;
    //  background-color: #2aa198;
    //  //border-bottom: solid 1px #eee;
    //}
    //.el-tabs__nav-scroll {
    //  overflow: hidden;
    //  background-color: #229FFC;
    //}
    //.el-tabs__active-bar {
    //  position: absolute;
    //  bottom: 0;
    //  left: 0;
    //  height: 2px;
    //  background-color: #229FFC;
    //  z-index: 1;
    //  transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    //  list-style: none;
    //}
    .el-tabs__item {
      padding: 0 20px;
      height: 48px;
      box-sizing: border-box;
      line-height: 48px;
      display: inline-block;
      list-style: none;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      position: relative;
    }
    .el-tabs__item:hover {
      color: #229FFC;
      cursor: pointer;
    }
  }
  //.top {
  //  width: 100%;
  //  height: 48px;
  //  background-color: white;
  //  margin-top: 12px;
  //  line-height: 48px;
  //  padding-left: 24px;
  //  box-sizing: border-box;
  //  margin-bottom: 1px;
  //}

  .dialog-register{
    .user-register-form {
      .user-login-form-input {
        margin-top: 48px ;
        //height: 100px;
      }
    }
  }
  //.user-register-form .user-login-form-input {
  //  margin-top: 24px;
  //}

  .el-input--medium {
    font-size: 14px;
    margin-top: 28px;
  }
  .teamMgr-collection {
    padding-top:60px ;
    //margin: 0rem 2rem;
    // min-height: 300px;
    background-color: white;
    height: 100%;
    //border-radius: 20px 20px 0px 0px;
  }
  .teamMgr-content {
    width: 66%;
    margin: auto;
    background-color: white;
    .teamMgr-group-header {
      height: 72px;
      line-height: 100px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      //margin-left: 24px;
      & > img {
        margin-top: -72px;
        margin-right: 24px;
        width: 48px;
        height: 48px;
        z-index: 400;
        border-radius: 24px;
        box-shadow: 0px 2px 12px #cccccc;
      }
    }
    .teamMgr-group-footer {
      height: 72px;
      border-bottom: 1px dashed #d5dfed;
      text-align: center;
      display: flex;
      div {
        background-color: white;
        color: #d5dfed;
        padding-top: 62px;
        padding-left: 10px;
        padding-right: 10px;
        margin: auto;
        line-height: 20px;
      }
    }
    .teamMgr-group-bottom {
      height: 72px;
    }
  }
}
</style>

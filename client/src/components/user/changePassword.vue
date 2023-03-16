<template>
  <div class="changePasswordWrapper">
    <ul class="itemwrapper">
      <li>
        <p>当前密码</p>
        <input v-model="currentpwd" placeholder="输入当前的密码" @keyup.enter="sure" class="borderLine-input" type="password">
      </li>
      <li>
        <p>新密码</p>
        <input v-model="newpwd" placeholder="输入修改后的新密码" @keyup.enter="sure" class="borderLine-input" type="password">
      </li>
      <li>
        <p>确认密码</p> 
        <input v-model="renewpwd" placeholder="确认新密码" @keyup.enter="sure" class="borderLine-input" type="password">
      </li>
    </ul>

    <el-button round class="elbutton-style sureBtn" @click="sure">确认</el-button>
    <el-button round class="elbutton-style cancelBtn" @click="cancel">取消</el-button>
  </div>
</template>

<script type="text/ecmascript-6">
  import * as UserApi from '../../api/moudle/userApi'
  import {removeUserInfo} from '../../mgr/userMgr'
  import TokenMgr from '../../mgr/TokenMgr'

  export default {
    data() {
      return {
        currentpwd: '',
        newpwd: '',
        renewpwd: '',
        errorInfo: ''
      }
    },
    created() {
    },
    methods: {
      clickChangeBtn() {
      },
      sure() {
        if (this.currentpwd === '') {
          this.errorInfo = '请输入当前密码'
          this.$message.error(this.errorInfo)
          return
        }
        if (this.newpwd === '') {
          this.errorInfo = '请输入新密码'
          this.$message.error(this.errorInfo)
          return
        }
        if (this.renewpwd === '') {
          this.errorInfo = '请输入确认密码'
          this.$message.error(this.errorInfo)
          return
        }
        if (this.renewpwd !== this.newpwd) {
          this.errorInfo = '两次输入密码不一致'
          this.$message.error(this.errorInfo)
          return
        }
        let body = {
          'oldpwd': this.currentpwd,
          'newpwd': this.newpwd
        }
        UserApi.updateUserPassword(body).then((res) => {
          this.$message.success('密码修改成功，请重新登录')
          TokenMgr.clearTokens()
          removeUserInfo()
          this.$router.push('/login')
        }, reject => {

        })
      },
      cancel() {
        this.$emit('cancel')
      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";

  .changePasswordWrapper {
    padding-left: 48px;
    box-sizing: border-box;
  }
  .changePasswordWrapper .itemwrapper li {
    margin-top: 24px;
    display: flex;
    flex-direction: row;
  }
  .changePasswordWrapper .itemwrapper p {
    font-size: 14px;
    color: $subTitleColor;
    width: 96px;
    height: 24px;
    line-height: 24px;
  }
  .changePasswordWrapper .itemwrapper input {
    width: 192px;
  }
  .changePasswordWrapper .el-button {
    margin-top: 100px;
    margin-bottom: 100px;
  }
  .changePasswordWrapper .el-button span {
    line-height: 36px !important;
  }
  .changePasswordWrapper .sureBtn {
    background-color: $mainColor !important;
    color: white !important;
    margin-left: calc(100% - 72px - 96px - 96px - 10px);
  }
</style>

<template>
  <div class="teamItem">
    <div>
      <div class="teamItem-circle" :class="color">{{lastName}}</div>
      <label class="teamItem-name">{{account.username}}</label>
      <div class="teamItem-email">| {{account.email}}</div>
    </div>
    <div v-if="account.permission!='root'" class="right" >
      <el-button type="info" plain @click="resetPassword">重置密码</el-button>
      <el-button type="danger" plain @click="deleteAccount">注销账号</el-button>
    </div>
    <div v-if="account.permission =='root'"  class="right" >超级管理员</div>
  </div>
</template>

<script>

export default {
  props: {
    account: Object,
  },
  data() {
    return {
      color: 'header-background-red',
    }
  },

  methods: {
    resetPassword(){
      this.$emit('resetPassword')
    },
    deleteAccount(){
      this.$emit('deleteAccount')
    }
  },
  computed: {
    lastName() {
      let length = this.account.username.length
      return this.account.username.substring(length - 1)
    },

  },
}
</script>

<style lang="scss">
@import '../../common/scss/base.scss';

.teamItem {
  position: relative;
  height: 66px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(10, 10, 10, 0.1);
  .teamItem-circle {
    height: 44px;
    width: 44px;
    line-height: 44px;
    border-radius: 22px;
    display: inline-block;
    text-align: center;
    color: white;
    font-size: 20px;
    margin-left: 24px;
  }
  .teamItem-name {
    margin-left: 1rem;
    color: #354052;
    font-size: 1rem;
  }

  .teamItem-email {
    display: inline-block;
    margin-left: 1rem;
    color: #aabad2;
    font-size: 1rem;
  }
  .right{
    margin-right: 24px;
  }

}

</style>


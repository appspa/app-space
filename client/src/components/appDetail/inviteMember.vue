<template>
  <div class="inviteMember-wrapper" @click="clickVisiteWrapper">
    <div class="inviteWrapper" @click="clickContent">
      <div style="font-size: 25px;font-weight: bold;color: #666">邀请成员</div>
      <div class="emailtextareawrapper">
        <el-input
          class="inviteMember-emailtextarea"
          type="textarea"
          placeholder="多个邮箱使用空格分开"
          v-model="content">
        </el-input>
      </div>
      <button class="inviteMember-inviteBtn" @click="sendInvite">发送邀请</button>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    data() {
      return {
        content: ''
      }
    },
    created() {
    },
    methods: {
      clickVisiteWrapper() {
        this.$emit('clickWrapper')
      },
      clickContent(event) {
        event.stopImmediatePropagation()
      },
      sendInvite () {
        this.$emit('invited')
      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";

  .inviteMember-wrapper {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    background-color: white;
    opacity: 0.9;
  }
  .inviteWrapper {
    position: fixed;
    width: 33%;
    top: 20%;
    left: 33%;
    position: relative;
  }
  .emailtextareawrapper {
    margin-top: 10px;
  }
  .emailtextareawrapper .el-textarea__inner {
    height: 260px;
  }
  .inviteMember-emailtextarea {
    width: 100%;
    height: 100%;
  }
  .inviteMember-inviteBtn {
    background-color: #F8BA0B;
    width: 90px;
    height: 40px;
    color: white;
    border-radius: 3px;
    border-width: 0px;
    margin-top: 10px;
    font-size: 16px;
    position: absolute;
    right: 0px;
  }
</style>

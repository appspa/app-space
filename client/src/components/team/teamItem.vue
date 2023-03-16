<template>
  <div class="teamItem">
    <div>
      <div class="teamItem-circle" :class="color">{{lastName}}</div>
      <label class="teamItem-name">{{value.username}}</label>
      <div class="teamItem-email">| {{value.email}}</div>
    </div>
    <div class="teamItem-owner" @click.stop="roleAction">
      <label>{{ownerString}}</label>
      <img v-show="isRole" class="teamItem-owner-img" :style="iconStyle" src="../../assets/ic_moreqx.png"/>
    </div>
    <context-menu class="ctx-menu" @ctx-cancel="onCtxClose" @ctx-close="onCtxClose" ref="ctxMenu">
        <li class="ctx-item" v-if="(isManager || !isSelf)" @click="setRoleToManager">管理员</li>
        <li class="ctx-item" v-if="(isManager || !isSelf)" @click="setRoleToGuest">围观群众</li>
        <li class="ctx-item menu-item" @click="selected">{{lastItem}}</li>
    </context-menu>
  </div>
</template>

<script>
import * as useMgr from '../../mgr/userMgr'
import * as TeamApi from '../../api/moudle/teamApi'
import contextMenu from 'vue-context-menu'
import AppMgr from "@/mgr/AppMgr";

export default {
  props: {
    value: Object,
    isManager: false,
    index: Number
  },
  data() {
    return {
      color: 'header-background-red',
      isRole: true,
      rotate: false,
      isSelf: false,
      showMenu: false,
      align: 'left'
    }
  },
  created() {
    this.valueChanged()
    // this.itemStyle = isSelf ? 'disable' : ''
  },
  methods: {
    selected() {
      this.$emit('select', this.index)
      this.showMenu = false
    },
    roleAction() {
      if (this.isRole) {
        this.rotate = !this.rotate
        this.$refs.ctxMenu.open()
        this.showMenu = true
      }
    },
    setRoleToManager() {
      this.roleModify('manager')
      this.showMenu = false
    },
    setRoleToGuest() {
      this.roleModify('guest')
      this.showMenu = false
    },
    roleModify(value) {
      let memberId = this.value.uid
      let role = value

      TeamApi.modifyRole(AppMgr.getCurApp()._id, memberId, role).then(resp => {
        this.$message({
          message: resp.message,
          type: resp.success ? 'success' : 'error'
        })
        this.$emit('roleUpdate')
      })
    },
    onCtxClose() {
      this.showMenu = false
    },
    valueChanged() {
      // alert('changed')
      let randomNumber = Math.floor(Math.random() * Math.floor(4))
      console.log(this.value)
      console.log(useMgr.getUserId())
      this.isSelf = useMgr.getUserId() === this.value.uid
      // alert(this.isSelf ? '是自己' : '不是自己')
      // this.isManager = useMgr.getUserTeam().role !== 'guest'
      // alert(this.isManager ? '是管理者' : '不是管理者')
      this.isRole = (this.isManager || this.isSelf) && this.value.role !== 'owner'
      this.color = [
        'header-background-red',
        'header-background-green',
        'header-background-orange',
        'header-background-purple'
      ][randomNumber]
    }
  },
  computed: {
    lastName() {
      let length = this.value.username.length
      return this.value.username.substring(length - 1)
    },
    ownerString() {
      switch (this.value.role) {
        case 'owner':
          return '创建者'
        case 'manager':
          return '管理员'
        default:
          return '围观群众'
      }
    },
    lastItem() {
      return this.isSelf ? '离开该团队' : '移除该队员'
    },
    iconStyle() {
      return this.showMenu
        ? { transform: 'rotate(180deg)' }
        : { transform: 'rotate(0deg)' }
    }
  },
  watch: {
    value() {
      this.valueChanged()
    }
  },
  components: {
    contextMenu
  }
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
  .teamItem-owner {
    margin-right: 24px;
    & > img {
      display: inline-block;
    }
  }
  .teamItem-email {
    display: inline-block;
    margin-left: 1rem;
    color: #aabad2;
    font-size: 1rem;
  }

  .ctx-menu {
    list-style: none;
    background-color: #fff;
    -webkit-background-clip: padding-box;
    background-clip: padding-box;
    border: 0px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.25rem;
    -moz-box-shadow: 0 0 5px #d5dfed;
    -webkit-box-shadow: 0 0 5px #d5dfed;
    box-shadow: 0 0 5px #d5dfed;
    .ctx-menu-container {
      -moz-box-shadow: 0 5px 11px 0 #d5dfed, 0 4px 15px 0 #d5dfed;
      -webkit-box-shadow: 0 5px 11px 0 #d5dfed, 0 4px 15px 0 #d5dfed;
      box-shadow: 0 5px 11px 0 #d5dfed, 0 4px 15px 0 #d5dfed;
    }
  }
  .ctx-item {
    height: 44px;
    line-height: 44px;
  }
  .menu-item {
    color: #ff001f;
  }
}

.teamItem-owner-img {
  transition: all 300ms ease-out;
}

.header-background-red {
  background-color: rgb(226, 81, 65);
}
.header-background-green {
  background-color: rgb(103, 171, 91);
}
.header-background-orange {
  background-color: rgb(242, 115, 56);
}
.header-background-purple {
  background-color: rgb(143, 56, 170);
}
</style>


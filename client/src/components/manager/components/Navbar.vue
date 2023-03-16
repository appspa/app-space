<template>
  <div class="navbar">
    <logo v-if="isHome" class="logo-container" :home-theme="isHome" :collapse="false" />

    <el-dropdown v-if="!isHome" size="medium" class="app-select" placement="bottom-end">
      <div class="content">{{ curApp.name }}<i class="el-icon-arrow-down el-icon--right" />
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="item in apps" :key="item.id" @click.native="onAppItemSelect(item)">{{ item.name }}</el-dropdown-item>
        <el-dropdown-item divided><router-link to="/">全部项目</router-link></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div class="right-menu">
      <template v-if="device!=='mobile'">

        <a target="_blank" href="https://github.com/PanJiaChen/vue-element-admin/" class="right-menu-item action-item-container hover-effect">

          <span>文档中心</span>
        </a>

      </template>

      <el-dropdown class="right-menu-item hover-effect">
        <div class="user-wrapper hover-effect">

          <i class="el-icon-s-custom" />
          <div class="user-name">{{ name }}</div>
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/profile/index">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <router-link to="/">
            <el-dropdown-item>应用首页</el-dropdown-item>
          </router-link>
          <a target="_blank" href="https://github.com/PanJiaChen/vue-element-admin/">
            <el-dropdown-item>常见问题</el-dropdown-item>
          </a>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import Logo from '@Components/manager/components/Sidebar/Logo.vue'
// import { getCacheCurApp, getCacheApps } from '@/utils/auth'

export default {
  components: {
    Logo
  },
  props: {
    hamburgerHide: Boolean,
    breadcrumbHide: Boolean,
    isHome: Boolean
  },
  data() {
    return {
      apps:[],
      curApp:{}
    }
  },
  created() {
    // this.apps = getCacheApps()
    // this.curApp = getCacheCurApp()
  },


  methods: {
    // async onAppItemSelect(e) {
    //   const selectApp = this.apps.filter(app => app.id == e.id)[0]
    //   //  this.curApp = selectApp
    //   await this.$store.dispatch('project/setCurApp', selectApp)
    //   this.$router.go(0)
    // },
    // toggleSideBar() {
    //   this.$store.dispatch('app/toggleSideBar')
    // },
    // async logout() {
    //   await this.$store.dispatch('user/logout')
    //   this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    // }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../common/scss/base";
.navbar {
  height: 50px;
  padding: 0px 0px;
  overflow: hidden;
  background: #ffffff;
  position: relative;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  .app-select{
    height: 100%;
    line-height: 50px;
    color: #fff;
    .content{
      font-size: 15px;
      font-weight: 600;
    }
    .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
    .el-icon-arrow-down {
      font-size: 13px;
    }
  }

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }
  .logo-container{
    width: $sideBarWidth !important;
    float: left;
  }
  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    padding-right: 20px;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 15px;
      font-weight: 500;
      color: #fff;
      vertical-align: text-bottom;
      &.elSelect{
        min-width: 320px;
      }
      &.item-app{
        margin-right: 20px;
      }
      &.action-item-container{
        margin-right: 20px;
        .action-icon{
          width: 12px;
          margin-right: 5px;
          height: 14px;
        }
      }
      .user-wrapper {
        margin-right: 1px;
        display:flex;
        align-items: center;
        flex-direction: row;
        text-align: center;
        .user-avatar {
          cursor: pointer;
          width: 34px;
          border-radius: 10px;
        }
        .user-name{
          margin-left: 10px;
        }
        &.hover-effect {
        //cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025);
          color: #f0f1fe;
        }
      }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }

      }
      &.hover-effect {
        //cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025);
          color:#f0f1fe;
        }
      }

    }

  }
}
</style>

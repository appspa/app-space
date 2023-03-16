<template>
  <div class="sidebar-logo-container">
      <router-link class="sidebar-logo-link" to="/">
        <img  :src='logo' class="sidebar-logo">
        <h1 class="sidebar-title">{{ title }} </h1>
      </router-link>
  </div>
</template>

<script>
import logo from '../../../../assets/logo.png'
export default {
  name: 'SidebarLogo',
  data() {
    return {
      title: 'APPSPACE',
      logo: logo
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../common/scss/base";
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 60px;
  line-height: 60px;
  background: #fff;
  text-align: center;
  overflow: hidden;
  //box-shadow: 0px 0px 1px 0px $lineColor;
  //border-right: solid 1px $lineColor;
  //border-bottom: solid 1px $lineColor;
  .sidebar-logo-link {
    height: 100%;
    width: 100%;
    .sidebar-logo {
      height: 38px;
      //height: 22px;
      vertical-align: middle;
      margin-right: 10px;
    }
    .sidebar-title {
      display: inline-block;
      padding-right: 30px;
      color: $mainTitleColor;
      font-weight: 600;
      line-height: 50px;
      font-size: 16px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }

  }
}
</style>

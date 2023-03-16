<template>
  <div class="app-wrapper">
    <div class="header-wrapper">
      <logo class="logo"/>
      <headerNav :showSwitchApp="false" class="nav-header"/>
    </div>
    <div class="main-container">
      <appList></appList>
    </div>
  </div>
</template>

<script>


import {AppMain, HeaderNav} from "@Components/manager/components";
import Logo from "@Components/manager/components/Sidebar/Logo";
import appList from "@Components/appList/appList";
export default {
  name: 'Layout',
  components: {
    AppMain, HeaderNav,Logo,appList
  },
  data() {
    return {
      showUserInfo: false,
      showUserMessage: false
    }
  },
  created() {

  },
  destroyed() {

  },
}
</script>

<style lang="scss" scoped>
@import "../../common/scss/base";

.app-wrapper {
  //@include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  .header-wrapper{
    width: 100vw;
    display: flex;
    flex-direction: row;
    border-bottom: solid 1px $lineColor;
    .logo{
      width: $sideBarWidth;
    }
    .nav-header{
      flex: 1;
      height: $navBarHeight;
    }
  }
  .main-container {
    position: absolute;
    top: calc($navBarHeight + 2px);
    //width: 100vw;
    //padding:0px 200px;
    right: 200px;
    left: 200px;
    //bottom: 0;
    //min-height: 100%;
    //width: calc(100% - #{$sideBarWidth});
  }
}


</style>

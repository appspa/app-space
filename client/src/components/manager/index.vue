<template>
  <div class="app-wrapper">
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <headerNav :showSwitchApp="true" class="nav-header"/>
      <app-main class="main-body"/>
    </div>

  </div>
</template>

<script>


import {AppMain, HeaderNav, Sidebar} from "@Components/manager/components";
export default {
  name: 'Layout',
  components: {
    AppMain, HeaderNav, Sidebar
  },
  data() {
    return {
    }
  },
  created() {

  },

}
</script>

<style lang="scss" scoped>
@import "../../common/scss/base";

.app-wrapper {
  //@include clearfix;
  //position: relative;
  //height: 100%;
  //width: 100%;
  &:after {
    visibility: hidden;
    display: block;
    font-size: 0;
    content: " ";
    clear: both;
    height: 0;
  }
  .sidebar-container {
    transition: width 0.28s;
    width: $sideBarWidth !important;
    background-color: #ffffff;
    //background-color: #2c3e50;
    height: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1001;
    overflow: hidden;
    box-shadow: 1px 0px 0px 0px $lineColor;

  }
  .main-container {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    //min-height: 100%;
    height: 100vh;
    margin-left: $sideBarWidth;
    width: calc(100% - #{$sideBarWidth});
    .nav-header {
      border-bottom: solid 1px $lineColor;
    }
    .main-body{

    }
  }
}


</style>

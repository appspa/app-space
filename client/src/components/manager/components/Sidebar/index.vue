<template>
  <div class="mainNav-wrapper">
      <logo />
      <el-menu
        class="mainNav-el-menu"
        :default-active="activeMenu"
        :collapse="false"
        :unique-opened="false"
        :collapse-transition="false"
         mode="vertical"
        >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
  </div>
</template>

<script>
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import variables from '../../../../common/scss/base.scss'
import {menuRoutes} from "@/router";

export default {
  components: { SidebarItem, Logo },
  data() {
    return {
      routes: menuRoutes.children,
    }
  },
  created() {
    console.log('routes',this.routes)
  },
  computed: {
    activeMenu() {
      const route = this.$route
      const { meta, path ,name} = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return name
    },
    variables() {
      return variables
    },
  }
}
</script>
<style lang="scss" scoped>
@import "../../../../common/scss/base";

.mainNav-wrapper {
  .mainNav-el-menu {
    border-right-width: 0px;
    border-top: solid 1px $lineColor;
  }
}

</style>

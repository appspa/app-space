<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.name)" :class="{'submenu-title-noDropdown':!isNest}">
          <i class="icon" :class="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)"></i>
          <span slot='title'>{{onlyOneChild.meta.title}}</span>
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :key="resolvePath(item.name)" :index="resolvePath(item.path)" popper-append-to-body>
      <template slot="title">
        <i v-if="item.meta" class="icon" :class="item.meta && item.meta.icon"></i>
        <span v-if="item.meta" slot='title'>{{item.meta.title}}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
// import path from 'path'
import { isExternal } from '@/utils/validate'
import AppLink from './Link'

export default {
  name: 'SidebarItem',
  components: { AppLink },
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null
    return {}
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ... parent, noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return routePath
      // return path.resolve(this.basePath, routePath)
    }
  }
}
</script>

<style lang="scss" scoped>
//@import "../../../common/scss/base";

.el-menu-item{
  //align-items: center;
  padding-left: 20px;
  //border-right: solid 4px #ffffff;
}
.icon{
  margin-left: 20px;
}
.is-active {
  color: #354052;
  font-weight: 500;
  background-color: #F9FAFC;
  border-right: solid 4px #229FFC;
}
i:before  {
  font-size: 19px;
  line-height: 55px;
  margin-right: 8px;
  color: #354052;
  //margin-left: 10px;
}
.is-active i:before  {
  font-size: 19px;
  color: #229FFC;
}
span{
  font-weight: 400;
  font-size: 16px;
  color: #354052;
}
.is-active span {
  font-weight: 500;
  font-size: 16px;
  color: #229FFC;
}

</style>

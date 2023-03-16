<template>
  <div>
    <!--头部-->
    <appDetailHeader
      :appInfo="this.appInfo"
      @updateAppInfoSuccess="updateAppInfoSuccess"
      v-show="this.appInfo._id"
    >
    </appDetailHeader>

    <appVersions
      v-show="!showAppSetting"
      v-if="appInfo._id"
      :appInfo="appInfo"
      :subTitleArr="subTitleArr"
      @updateAppInfoSuccess="updateAppInfoSuccess"
    >
    </appVersions>

    <appSetting
      v-if="showAppSetting"
      :appInfo="appInfo">
    </appSetting>
  </div>
</template>

<script type="text/ecmascript-6">
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import AppDetailHeader from './appDetailHeader.vue'
  import AppVersions from './appVersions.vue'
  import AppSetting from './appSetting.vue'
  import AppMgr from "@/mgr/AppMgr";

  export default {
    data() {
      return {
        subTitleArr: ['', '', ''],
        appInfo: {},
        showAppSetting: false,
        curApp:AppMgr.getCurApp()
      }
    },
    components: {
      AppDetailHeader, AppVersions, AppSetting
    },
    computed: {},
    destroyed() {
      this.bus.$off('appSummary')
      this.bus.$off('appSetting')
    },
    created() {
      this.$nextTick(() => {
        this.getAppDetailData()
      })
      this.bus.$on('appSummary', () => {
        this.showAppSetting = false
      })
      this.bus.$on('appSetting', () => {
        this.showAppSetting = true
      })
    },
    methods: {
      getAppDetailData() {
        this.curApp = AppMgr.getCurApp()
        AppResourceApi.getAppDetail(this.curApp._id).then((res) => {
          console.log(res);
          this.appInfo = res.data;
          this.subTitleArr = [];
          this.subTitleArr.push(this.appInfo.bundleId);
          this.subTitleArr.push( window.location.origin  + '/' + this.appInfo.shortUrl);
          this.subTitleArr.push(this.appInfo._id);
          this.bus.$emit('appdetail', res.data.appName);
        }, reject => {
          // this.$message.error(reject);
        })
      },
      updateAppInfoSuccess() {
        this.getAppDetailData()
      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";


</style>

<template>
  <div class="app-item-wrapper">
    <img class="icon" @error="e=>setIcon(e,item)"   :src="getIconUrl(item)">
    <div class="icon-name-wrapper">
      <div class="app-name">{{item.appName}}</div>
      <div class="app-plat">{{`适用于${item.platform}`}}</div>
    </div>

  </div>
</template>

<script>
import rn from '../../../assets/ic_rn.png'
import android from '../../../assets/ic_android.png'
import ios from '../../../assets/ic_ios.png'
export default {
  name: 'HeaderAppSelect',
  components: {
  },
  props:{
    item:{
      type:Object
    }
  },
  data() {
    return {

    }
  },
  methods: {
    getIconUrl(appInfo) {
      // return `${this.axios.defaults.baseURL}${appInfo.icon}`
      return appInfo.icon || '';
    },
    setIcon(e,item){
      if (item.platform == 'ios') {
        e.target.src = ios
      }else if (item.platform == 'android') {
        e.target.src = android
      }else if (item.platform == 'rn') {
        e.target.src = rn
      }
    },
  },

}
</script>

<style lang="scss" scoped>
@import "../../../common/scss/base";
.app-item-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  .icon{
    height: 45px;
    width: 45px;
    background-size: cover;
    border-radius: 8px;
  }
  .icon-name-wrapper{
    display: flex;
    flex-direction: column;
    justify-content: start;
    margin-left: 10px;
    margin-right: 10px;
    .app-name{
      line-height: 20px;
      margin-top: 2px;
      font-size: 20px;
      font-family: "PingFang SC";
    }
    .app-plat{
      //height: 12px;
      line-height: 12px;
      color: $subTitleColor;
      font-size: 12px;
      font-family: "PingFang SC";
      margin-top: 6px;
    }
  }

}


</style>

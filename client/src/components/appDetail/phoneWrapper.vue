<template>
    <div class="phoneDownLoadWrapper">
      <img class="app-icon"  @error="e=>setIcon(e,this.appBaseData)" :src="getIconUrl()" alt="">
      <p class="title">{{this.appBaseData.appName}}</p>
      <div class="info">
        <p class="desc">版本：{{this.appVersionInfo.versionName}}({{this.appVersionInfo.versionCode}})</p><span>大小：{{(this.appVersionInfo.size/1024/1024).toFixed(1)}}M</span>
      </div>
      <p class="info">发布日期： {{ this.appVersionInfo.creatDateStr }} </p>
      <div v-if="!showDownLoadBtn">
        <div>
          <el-input v-model="pwd" type="password" placeholder="请输入密码" class="pwd"></el-input>
        </div>
        <div>
          <el-button @click="clickSure" type="primary" round class="downloadBtn sureBtn">确定</el-button>
        </div>
      </div>
      <el-button v-if="showDownLoadBtn" @click="clickDownLoadBtn" class="downloadBtn" type="primary" round><i :class="this.platformStr === 'ios' ? 'icon-ic_ios':'icon-ic_andr'"></i>    下载安装</el-button>
    </div>
</template>

<script type="text/ecmascript-6">
  import ios from "@/assets/ic_ios.png";
  import android from "@/assets/ic_android.png";
  import rn from "@/assets/ic_rn.png";

  export default {
    props: {
      appBaseData: {
        type: Object
      },
      appVersionInfo: {
        type: Object
      },
      platformStr: {
        type: String
      }
    },
    computed: {
      showDownLoadBtn() {
        if (this.appBaseData.installWithPwd !== 1 || this.pwd === this.appBaseData.installPwd) {
          return true
        } else {
          return false
        }
      }
    },
    data() {
      return {
        pwd: ''
      }
    },
    created() {},
    methods: {
      getIconUrl() {
        return this.appBaseData.icon || '';
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
      clickSure() {
        if (this.pwd !== this.appBaseData.installPwd) {
          this.$message.error('密码错误')
        }
      },
      clickDownLoadBtn() {
        this.$emit('clickDownLoadBtn')
      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";
  .phoneDownLoadWrapper {
    .app-icon {
      width: 126px;
      height: 126px;
      border-radius: 15px;
      margin-top: 100px;
    }
    .info {
      display: flex;
      flex-direction: row;
      justify-content: center;
      color: #242A34;
      font-size: 14px;
      line-height: 20px;
      margin-top: 12px;
      opacity: 0.5;
    }
    .pwd {
      width: 200px;
      height: 40px;
      //border: solid 1px $mainColor;
      border-radius: 6px;
      margin-top: 12px;
      background-color: transparent;
    }
    .downloadBtn {
      background-color: $mainColor;
      width: 200px;
      height: 44px;
      color: white;
      font-size: 14px;
      margin-top: 20px;
      border-color: transparent;
    }
  }

</style>

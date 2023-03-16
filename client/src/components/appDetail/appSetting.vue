<template>
  <div class="appSetting-wrapper">
    <div class="header">
      <ul>
        <li v-for="(item, index) in this.headerOperationData" :key="index" class="itemWrapper">
          <div class="topWrapper">
            <p class="title">{{item}}</p>
          </div>
          <div class="subWrapper" v-if="curApp._id">
            <p class="subtitle">{{subTitleArr[index]}}</p>
          </div>
        </li>
      </ul>
    </div>
    <div class="top">
      <i class="el-icon-setting"></i>  设置
    </div>
    <div class="content">
      <el-form labelWidth="150px" label-position="left">
        <el-form-item  label="应用名称">
          <el-input v-model="curApp.appName" class="shorturl"></el-input>
        </el-form-item>
        <el-form-item label="应用短链接">
          {{this.getHost()}}<el-input v-model="curApp.shortUrl" class="shorturl"></el-input>
        </el-form-item>
        <el-form-item  label="安装方式">
          <el-radio v-model="installType" label="公开">公开</el-radio>
          <el-radio v-model="installType" label="密码安装">密码安装</el-radio>
          <el-input v-show="installType === '密码安装'" v-model="installPwd" type="password" class="installtype" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item label="发布方式">
          <el-radio v-model="publishType" label="手动发布">手动发布</el-radio>
          <el-radio v-model="publishType" label="自动发布">自动发布</el-radio>
        </el-form-item>
        <el-form-item label="是否展示历史">
          <el-radio v-model="showHistory" label="是">展示</el-radio>
          <el-radio v-model="showHistory" label="否">不展示</el-radio>
        </el-form-item>
        <el-form-item v-if="curApp.platform!='rn'"  label="合并应用">
          <el-dropdown placement="bottom-start" size="medium">
            <div  class="el-dropdown-link merge-select" >
              <header-app-select v-if="curMerge._id" :item="curMerge"/>
              <span v-if="!curMerge._id">请选择合并应用</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="item in mergeList" :key="item._id">
                <div @click="onMergeItemClick(item)">
                <header-app-select :item="item" />
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided >
                <div @click="onMergeItemClick({})">
                  解除合并
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

        </el-form-item>
      </el-form>

      <button type="button" class="bottomBtn button-style-border" @click="clickSure">立即生效</button>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import * as AppResourceApi from '../../api/moudle/appResourceApi'
import AppMgr from "@/mgr/AppMgr";
import HeaderAppSelect from "@Components/manager/components/headerAppSelect";
import appMgr from "@/mgr/AppMgr";
export default {
  components: {HeaderAppSelect},
  data() {
    return {
      curApp: AppMgr.getCurApp(),
      appList:[],
      mergeList:[],
      curMerge: {},
      installType: '公开',
      publishType: '手动发布',
      installPwd: '',
      mergeAppId: '',
      showHistory: '是',
      headerOperationData: ['Bundle ID', 'App Key'],
      subTitleArr:[]
    }
  },
  created() {
    this.$nextTick(() => {
      this.getAppDetailData()
    })
  },
  mounted() {
    this.init()
  },
  methods: {
    init(){
      this.appList = appMgr.getApps()
      this.curApp = AppMgr.getCurApp(),
        this.mergeList = this.appList.filter(value => {
          if (value.platform != 'rn' && value.platform != this.curApp.platform && value._id != this.curApp._id) {
            return true;
          } else {
            return false;
          }
        })
      this.installType = this.curApp.installWithPwd === 1 ? '密码安装' : '公开'
      this.publishType = this.curApp.autoPublish === true ? '自动发布' : '手动发布'
      this.showHistory = this.curApp.showHistory === true ? '是' : '否'
      this.installPwd = this.curApp.installPwd
      this.mergeAppId = this.curApp.mergeAppId
      this.curMerge = (this.mergeList || []).find(v => v._id == this.curApp.mergeAppId)||{};
    },
    clickSure() {
      if (this.installType === '密码安装' && this.installPwd === '') {
        this.$message.error('密码不能为空')
        return
      }
      let body = {
        'shortUrl': this.curApp.shortUrl,
        'appName': this.curApp.appName,
        'installWithPwd': this.installType === '公开' ? 0 : 1,
        'installPwd': this.installPwd,
        'mergeAppId': this.curMerge._id,
        'autoPublish': this.publishType === '手动发布' ? 0 : 1,
        'showHistory': this.showHistory === '是' ? true : false,
      }
      AppResourceApi.updateAppSetting(this.curApp._id, body).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          //主要刷新图标及boundId
          this.bus.$emit('refreshAppList')
          this.bus.$emit('refreshAppInfo')
        }
      }, reject => {

      })
    },
    onMergeItemClick(item){
      this.curMerge = this.mergeList.find(v => v._id == item._id)||{};
      console.log("this.curMerge",this.curMerge)
    },
    getAppDetailData() {
      this.curApp = AppMgr.getCurApp()
      AppResourceApi.getAppDetail(this.curApp._id).then((res) => {
        console.log(res);
        this.curApp = res.data;
        appMgr.setCurApp(this.curApp)
        this.init()
        this.subTitleArr = [];
        this.subTitleArr.push(this.curApp.bundleId);
        this.subTitleArr.push(this.curApp._id);
      }, reject => {
        // this.$message.error(reject);
      })
    },
    updateAppInfoSuccess() {
      this.getAppDetailData()
    },
    getHost(){
      return window.location.origin + "/";
    }
  }
}
</script>

<style lang="scss">
@import "../../common/scss/base";
.appSetting-wrapper {
  .header{
    background-color: white;
    .itemWrapper{
      display: inline-block;
      width: 33%;
      height: 108px;
      vertical-align: top;
      .topWrapper{
        border-left: solid 4px $mainColor;
        //width: 100%;
        height: 24px;
        margin-left: 24px;
        margin-top: 34px;
        .title {
          font-size: 18px;
          line-height: 24px;
          margin-left: 8px;
          font-family: "PingFang SC";
          color: $mainTitleColor;
        }
      }
      .subWrapper {
        margin-left: 36px;
        margin-top: 12px;
        height: 48px;
        width: calc(100% - 36px);
        .subtitle {
          font-size: 14px;
          color: $subTitleColor;
          line-height: 16px;
          word-wrap: break-word;
          word-break: normal;
          user-select: text;
        }
      }
    }
  }
  .top {
    width: 100%;
    height: 48px;
    background-color: white;
    margin-top: 12px;
    line-height: 48px;
    padding-left: 24px;
    box-sizing: border-box;
  }
  .content {
    width: 100%;
    height: 500px;
    background-color: white;
    margin-top: 1px;
    padding-top: 35px;
    .el-form {
      margin-left: 120px;
      .el-form-item{
        label {
          font-size: 14px;
          color: $subTitleColor;
          margin-right: 20px;
        }
        .el-input__inner {
          border-right-width: 0px;
          border-left-width: 0px;
          border-top-width: 0px;
          border-radius: 0px;
          font-size: 14px;
          outline: 0;
          padding-left: 5px;
          height: 24px !important;
          line-height: 24px;
        }
        .shorturl {
          width: 150px;
          display: inline-block;
        }
        .installtype {
          width: 150px;
        }
      }
      .merge-select {
        padding: 0px 0px;
        color: $subTitleColor;
        display: flex;
        align-items: center;
        cursor: pointer;
      }
    }
    .bottomBtn{
      width: 96px;
      height: 36px;
      border-radius: 18px;
      line-height: 36px;
      margin-top: 18px;
      margin-left: calc(50% - 48px);
    }
    .el-form .el-form-item .el-radio span {
      font-size: 14px !important;
    }
    el-radio__input.is-checked .el-radio__inner {
      background-color: $mainColor;
      border-color: $mainColor;
    }
    .el-radio__input.is-checked + .el-radio__label {
      color: $mainColor;
    }
  }
}

</style>

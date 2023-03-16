<template>
  <div class="editorVersion-wrapper" @click="cancel">
    <transition name="fadeRight">
      <div v-show="this.show" class="editorVersion-content" @click.stop="clickContent">
        <div class="top">
          <i class="icon-ic_editor"></i>
          <span>版本编辑</span>
        </div>
        <el-form label-position="left" labelWidth="110px">
          <el-form-item v-if="this.appInfo.platform!='rn'" label="版本信息" required>
            <p class="versionInput">{{this.versionInfo.versionName+` (${this.versionInfo.versionCode})`}}</p>
          </el-form-item>
          <el-form-item v-if="this.appInfo.platform =='rn'" label="版本信息" required>
            <input v-model="appVersion" type="text" style="width: 72px;border-bottom: solid 1px #eee;text-align: center">
            <el-tooltip placement="right-end" style="margin-left:20px">
              <div slot="content"><span style="white-space: pre-wrap;">{{ appVersionDes }}</span></div>
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </el-form-item>
          <el-form-item v-if="this.appInfo.platform!=='rn'" label="BundleId">
            <p class="versionInput">{{this.versionInfo.bundleId}}</p>
          </el-form-item>
          <el-form-item label="文件大小">
            <p class="versionInput">{{(this.versionInfo.size / 1024 / 1024).toFixed(2)}}M</p>
          </el-form-item>
          <el-form-item label="是否发布">
            <el-radio v-model="active" :label="true">是</el-radio>
            <el-radio v-model="active" :label="false">否</el-radio>
          </el-form-item>
          <el-form-item label="下载次数" >
            <el-radio  v-model="grayScaleLimit" :label="false" >不限制</el-radio>
            <el-radio  v-model="grayScaleLimit" :label="true">限制</el-radio>
            <input v-model="grayScaleSize" type="text" style="width: 72px;border-bottom: solid 1px #eee;text-align: center">
            <p style="display: inline-block;color: #354052">次</p>
            <p class="versiondownload" style="display: inline-block;margin-left: 10px;color: #354052">(已下载{{this.versionInfo.downloadCount}}次)</p>

          </el-form-item>
<!--          <el-form-item label="更新安装地址">-->
<!--            <input style="width: calc(100% - 40px)" v-model="downloadUrl" class="borderLine-input" type="text">-->
<!--          </el-form-item>-->
          <el-form-item label="更新方式">
            <el-radio v-model="updateType" label="normal">普通更新</el-radio>
            <el-radio v-model="updateType" label="silent">静默更新</el-radio>
            <el-radio v-model="updateType" label="force">强制更新</el-radio>
          </el-form-item>
          <el-form-item label="更新日志">
            <p class="textareacount">{{this.updateContent.length}}/100</p>
            <el-input
              class="editorVersion-updatatextarea"
              type="textarea"
              placeholder="更新日志"
              :maxlength="100"
              v-model="updateContent">
            </el-input>
          </el-form-item>
        </el-form>

        <el-button round class="elbutton-style sureBtn" @click="sure">确认</el-button>
        <el-button round class="elbutton-style cancelBtn" @click="cancel">取消</el-button>
      </div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import {validatorVersion} from "@/utils/validate";

  export default {
    props: {
      versionInfo: {
        type: Object
      },
      appInfo: {
        type: Object
      }
    },
    data() {
      return {
        show: false,
        updateContent: '',
        downloadUrl: '',
        updateType: 'normal',
        active: false,
        grayScaleLimit:false,
        grayScaleSize: 0,
        appVersion: '',
        appVersionDes: '-  `*` 匹配所有版本 \n-  `1.2.3` 匹配特定版本`1.2.3`\n-  `1.2`/`1.2.*` 匹配所有1.2补丁版本 \n-  `>=1.2.3<1.3.7`\n-  `~1.2.3` 匹配`>=1.2.3<1.3.0`\n-  `^1.2.3` 匹配`>=1.2.3<2.0.0`'
      }
    },
    created() {
      setTimeout(() => {
        console.log(this.versionInfo)
        console.log('this.appInfo',this.appInfo)
        this.show = true
        this.downloadUrl = this.versionInfo.installUrl
        if (this.versionInfo.changeLog) {
          this.updateContent = this.versionInfo.changeLog
        }
        this.updateType = this.versionInfo.updateMode
        this.appVersion = this.versionInfo.appVersion
        this.active = this.versionInfo.active || false;
        this.grayScaleLimit = this.versionInfo.grayScaleLimit||false
        this.grayScaleSize = this.versionInfo.grayScaleSize || 0;
      }, 200)
    },
    methods: {
      cancel() {
        this.show = false
        setTimeout(() => {
          this.$emit('cancel')
        }, 500)
      },
      sure() {
        let body = {
          // 'installUrl': this.installUrl,
          'showOnDownloadPage': this.showOnDownLoadPage,
          'changeLog': this.updateContent,
          'active': this.active,
          'updateMode': this.updateType,
          'grayScaleSize': this.grayScaleSize,
          'grayScaleLimit': this.grayScaleLimit,
        }
        if (this.appInfo.platform == 'rn') {
          if (!this.appVersion) {
            this.$message.error('请输入版本信息')
            return
          }
          if (!validatorVersion(this.appVersion)) {
            this.$message.error('版本信息格式不正确')
            return;
          }
          body.appVersion = this.appVersion;
        }
        AppResourceApi.updateNote(this.appInfo._id, this.versionInfo._id, body).then((res) => {
          console.log(res)
          this.$message.success(res.message)
          this.$emit('updateSuccess')
        }, reject => {

        });
      },
      clickContent() {

      },
      getDownLoadCount(count) {
        if (count) {
          return count
        } else {
          return 0
        }
      },
      getAllowDownLoadCount(strategy) {
        if (strategy && strategy.downloadCountLimit) {
          return strategy.downloadCountLimit
        } else {
          return '不限'
        }
      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";

  .fadeRight-enter-active {
    transition: all .5s ease;
  }
  .fadeRight-leave-active {
    transition: all .5s ease;
  }
  .fadeRight-enter, .fadeRight-leave-to {
    transform: translateX(100%);
  }
  .editorVersion-wrapper {
    position: absolute;
    top: 2px;
    left: 0px;
    bottom: 0px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: 100;
  }
  .editorVersion-content {
    float: right;
    width: 880px;
    height: 100%;
    margin-right: 0;
    background-color: white;
    box-shadow: 0 2px 6px rgba(120, 120, 120, 0.5);
    overflow: scroll;
    overflow-x: hidden;
    overflow-y: hidden;
  }
  .editorVersion-content .top {
    padding-left: 41px;
    padding-top: 22px;
    position: relative;
  }
  .editorVersion-content .top span {
    color: $mainTitleColor;
    font-size: 14px;
    line-height: 24px;
  }
  .editorVersion-content .top p {
    position: absolute;
    top: 22px;
    right: 24px;
    font-size: 12px;
    color: #354052;
    line-height: 24px;
  }
  .editorVersion-content .top .el-switch {
    position: absolute;
    right: 104px;
    top: 24px;
  }
  .editorVersion-content .el-form {
    margin-top: 24px;
    margin-left: 60px;
  }
  .editorVersion-content .el-form .el-form-item {
    margin-bottom: 5px;
  }
  .editorVersion-content .el-form .el-form-item label {
    font-size: 14px;
    color: $subTitleColor;
  }
  .editorVersion-content .el-form .el-form-item .versionInput {
    width: calc(100% - 40px);
    font-size: 14px;
    color: $mainTitleColor;
  }
  .editorVersion-content .el-form .el-form-item .versiondownload {
    font-size: 14px;
    color: $mainTitleColor;
  }
  .editorVersion-content .el-form .el-form-item .textareacount {
    text-align: right;
    padding-right: 40px;
  }
  .editorVersion-content .el-form .el-form-item .el-radio {
    margin-right: 15px;
  }
  .editorVersion-content .editorVersion-updatatextarea {
    width: calc(100% - 40px);
    font-size: 14px;
    color: $mainTitleColor;
  }
  .editorVersion-content .editorVersion-updatatextarea textarea {
    height: 168px !important;
    outline: 0;
    padding-left: 5px;
  }
  .editorVersion-content .el-button {
    margin-top: 48px;
  }
  .editorVersion-content .el-button span {
    line-height: 36px !important;
  }
  .editorVersion-content .sureBtn {
    background-color: $mainColor !important;
    color: white !important;
    margin-left: calc(100% - 40px - 96px - 96px - 10px);
  }
</style>

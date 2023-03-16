<template>
    <div>
      <div class="detail-header">
        <div class="detail-header-top">
          <div class="leftWrapper">
            <vue-qr :autoColor="false" colorDark="#354052"  class="qrcodeImg" :text="getDownLoadUrl()" :margin="20"></vue-qr>
            <div class="title">下载地址</div>
            <a target="_blank" :href="getDownLoadUrl()">
              <span class="url">{{this.getDownLoadUrl()}}</span>
            </a>
          </div>
          <div class="rightWrapper" style="z-index: 1">
            <el-button class="uploadWrapper button-style-main"><i class="icon-ic_upload"></i>上传新版本</el-button>
            <input
              title="上传应用"
              ref="referenceUpload"
              :accept="this.acceptType"
              @change="referenceUpload"
              type="file" style="position: absolute;top: 36px;left: 0px;width: 144px;height: 48px;opacity: 0;cursor:pointer">
            <button class="preview button-style-border" @click="clickPreviewBtn">预览</button>
            <button class="delete button-style-border" @click="deleteApp">删除</button>

            <div style="width: 120px;height: 16px;background-color: #229FFC;position: absolute;top: 68px;left: 36px;border-radius: 10px;filter: blur(10px);z-index: -1"></div>

          </div>
        </div>
      </div>

      <uploadApp v-if="this.showUploadView"
                 :appInfo="this.appInfo"
                 :appFile="this.file"
                 @closeUpload="closeUploadMethod"
                 @uploadSuccess="uploadSuccessMethod"></uploadApp>

      <editorVersion
        v-if="this.showEditorVersion"
        @cancel="cancel"
        :versionInfo="this.versionInfo"
        :appInfo="this.appInfo"
        @updateSuccess="updateSuccess"
      ></editorVersion>
    </div>
</template>

<script type="text/ecmascript-6">
import rn from '../../assets/ic_rn.png'
import android from '../../assets/ic_android.png'
import ios from '../../assets/ic_ios.png'
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import UploadApp from '../appList/uploadApp.vue'
  import editorVersion from './editorVersion'
  import VueQr from 'vue-qr'
  import * as useMgr from "@/mgr/userMgr";
  export default {
    props: {
      appInfo: {
        type: Object
      }
    },
    data() {
      return {
        showUploadView: false,
        file: FileList,
        showEditorVersion:false,
        versionInfo:{},
        acceptType:''
      }
    },
    components: {
      VueQr,editorVersion,
      UploadApp
    },
    watch:{
      appInfo(val) {
        if (val.platform == 'ios') {
          this.acceptType = '.ipa'
        }else if (val.platform == 'android') {
          this.acceptType = '.apk'
        }else if (val.platform == 'rn') {
          this.acceptType = '.zip'
        }
        console.log('acceptType',this.acceptType)
      },
    },
    created() {
      this.$nextTick(() => {

      })
    },
    methods: {
      getDownLoadUrl(){
        // return this.axios.defaults.baseURL + this.appInfo.shortUrl
        // console.log(this.$route)
        return window.location.origin  + '/' + this.appInfo.shortUrl;
      },
      clickPreviewBtn() {
        const {href} = this.$router.resolve({
          name: 'AppPreView',
          path: '/',
          params: { 'id': this.appInfo.shortUrl }
        })
        window.open(href, '_blank')
      },
      getIconUrl() {
        if (this.appInfo.icon) {
          return this.appInfo.icon
        }else if (this.appInfo.platform == 'ios') {
          return  ios
        }else if (this.appInfo.platform == 'android') {
          return   android
        }else if (this.appInfo.platform == 'rn') {
          return   rn
        }else {
          return ''
        }
      },

      getAppType() {
        if (this.appInfo.appLevel === 'enterprise') {
          return '企业版'
        } else if (this.appInfo.appLevel === 'develop') {
          return '内测版'
        } else if (this.appInfo.appLevel === 'appstore') {
          return 'AppStore版'
        } else {
          return ''
        }
      },
      updateSuccess() {
        this.showEditorVersion = false
        this.$emit('updateAppInfoSuccess')
        this.bus.$emit('uploadSuccess')
      },
      cancel() {
        this.showEditorVersion = false
      },
      referenceUpload(e) {
        this.file = e.target.files
        console.log(this.file)
        if (e.target.files.length > 0) {
          this.showUploadView = true
        }
      },
      deleteApp(item) {
        this.$confirm('确认删除？')
          .then(_ => {
            AppResourceApi.deleteApp( this.appInfo._id).then((res) => {
              this.$message.success('删除成功')
              this.$router.go(-1)
            }, reject => {
              this.$message.error(reject)
            })
          })
          .catch(_ => {})
      },
      closeUploadMethod() {
        this.showUploadView = false
        // 置空，input file 如果第二次选择的文件跟上一次是同一个文件，则不会触发onchange事件，需要将value置空
        this.$refs.referenceUpload.value = ''
      },
      uploadSuccessMethod(e) {
        // 上传成功
        this.showUploadView = false
        this.showEditorVersion = true
        this.$refs.referenceUpload.value = ''
        this.versionInfo = e.data
        this.bus.$emit('uploadSuccess')
        //主要刷新图标及boundId
        this.bus.$emit('refreshAppList')
        this.bus.$emit('refreshAppInfo')

      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";

  .detail-header {
    width: 100%;
    background-color: $paleGrey;
    //margin-top: 24px;
    .detail-header-top {
      width: 100%;
      height: 108px;
      margin-bottom: 1px;
      background-color: white;
      position: relative;
      .leftWrapper{
        float: left;
        position: relative;
        margin-left: 16px;
        margin-top: 14px;
        .qrcodeImg{
          width: 90px;
        }
        .title{
          font-size: 18px;
          line-height: 24px;
          font-family: "PingFang SC";
          color: $mainTitleColor;
          width: 200px;
          position: absolute;
          top: 20px;
          left: 98px;
        }
        .url{
          position: absolute;
          top: 54px;
          left: 100px;
          font-size: 14px;
          color: $subTitleColor;
          line-height: 16px;
          word-wrap: break-word;
          word-break: normal;
          user-select: text;
        }
      }
      .appicon {
        position: absolute;
        top: 24px;
        left: 24px;
        width: 72px;
        height: 72px;
        background-size: cover;
        border-radius: 8px;
      }
      .appname {
        position: absolute;
        top: 24px;
        left: 120px;
        line-height: 24px;
        font-size: 24px;
        font-family: "PingFang SC";
      }
      .appType-platform-wrapper {
        position: absolute;
        top: 75px;
        left: 120px;
        font-size: 0px;
        .appType {
          display: inline-block;
          line-height: 12px;
          font-size: 12px;
          padding: 3px 6px;
          background-color: $originOne;
          border-radius: 2px;
          color: white;
          margin-right: 24px;
        }
        .platform {
          display: inline-block;
          font-size: 14px;
          color: $subTitleColor;
        }
      }
      .rightWrapper {
        float: right;
        margin-right: 0px;
        padding: 36px 24px;
        position: relative;
        .delete {
          width: 48px;
          border-color: $warmRed;
          color: $warmRed;
        }
        .preview {
          width: 48px;
          margin-right: 8px;
        }
        .uploadWrapper {
          width: 144px;
          float: left;
          margin-right: 12px;
          i {
            margin-right: 5px;
          }
        }

      }
    }
  }

</style>

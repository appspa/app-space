

<template>
    <div class="preview-app-wrapper">
      <el-popconfirm
        confirm-button-text="确认"
        cancel-button-text="取消"
        icon="el-icon-info"
        icon-color="red"
        title="确认要删除该条记录？"
      >
        <el-button style="margin-top: 100px" type="text" slot="reference">
          <i class="el-icon-delete" />
        </el-button>
      </el-popconfirm>
      <div v-if="dataInfo.length>0" class="phoneDownLoadWrapper">
        <img class="app-icon"  @error="e=>setDefaultIcon(e,this.curInfo.appInfo)" :src="this.curInfo.appInfo.icon || ''" alt="">
        <p class="title">{{this.curInfo.appInfo.appName}}</p>
        <div class="info" v-if="this.curInfo.appInfo.platform!='rn'">
          <p class="desc">版本：{{this.curInfo.versionInfo.versionName}}({{this.curInfo.versionInfo.versionCode}})</p><span>大小：{{(this.curInfo.versionInfo.size/1024/1024).toFixed(1)}}M</span>
        </div>
        <div class="info" v-if="this.curInfo.appInfo.platform=='rn'">
          <p class="desc">版本：{{this.curInfo.versionInfo.appVersion}}</p><span>大小：{{(this.curInfo.versionInfo.size/1024/1024).toFixed(2)}}M</span>
        </div>
        <p class="info">发布日期： {{formatDate(this.curInfo.versionInfo.uploadAt)}} </p>
        <div class="qrcode">
          <vue-qr class="qrcodeImg"  colorDark="#585F69" :text="qrCodeUrl" :margin="15"></vue-qr>
          <p class="tips">用手机扫描二维码{{this.curInfo.appInfo.platform =='rn'?'下载':'安装'}}</p>
        </div>
        <div v-if="showPasswordInput">
          <div>
            <el-input v-model="pwd" type="password" placeholder="请输入密码" class="pwd"></el-input>
          </div>
          <div>
            <el-button :loading="loading" @click="clickSure" type="primary" round class="downloadBtn sureBtn">确定</el-button>
          </div>
        </div>
        <el-button v-if="curInfo.appInfo.platform!='rn' &&showDownLoadBtn" @click="clickDownLoadBtn(curInfo)" class="downloadBtn" type="primary" round><i :class="this.curInfo.appInfo.platform === 'ios' ? 'icon-ic_ios':'icon-ic_andr'"></i>    下载安装</el-button>
        <el-button v-if="curInfo.appInfo.platform=='rn' &&showDownLoadBtn" @click="clickDownLoadBtn(curInfo)" class="downloadBtn" type="primary" round>下载</el-button>
      </div>
      <div v-if="showMergeBtn" class="merge-wrapper">
        <div class="left">
          <div class="info">
            <p class="desc">版本：{{dataInfo[0].versionInfo.versionName}}({{dataInfo[0].versionInfo.versionCode}})</p><span>大小：{{(dataInfo[0].versionInfo.size/1024/1024).toFixed(1)}}M</span>
          </div>
          <p class="info">发布日期： {{formatDate(dataInfo[0].versionInfo.uploadAt)}} </p>
          <el-button @click="clickDownLoadBtn(dataInfo[0])" class="downloadBtn mergeDown" type="primary" round>{{`下载 ${dataInfo[0].appInfo.platform} 版`}}</el-button>
        </div>
        <div class="line"></div>
        <div class="right">
          <div class="info">
            <p class="desc">版本：{{dataInfo[1].versionInfo.versionName}}({{dataInfo[1].versionInfo.versionCode}})</p><span>大小：{{(dataInfo[1].versionInfo.size/1024/1024).toFixed(1)}}M</span>
          </div>
          <p class="info">发布日期： {{formatDate(dataInfo[1].versionInfo.uploadAt)}} </p>
          <el-button @click="clickDownLoadBtn(dataInfo[1])" class="downloadBtn mergeDown" type="primary" round>{{`下载 ${dataInfo[1].appInfo.platform} 版`}}</el-button>
        </div>
      </div>
      <div v-if="showHistoryList" class="history-wrapper">
        <ul>
          <li v-for="(item, index) in this.curInfo.history" :key="index" @click="historyClickDownLoadBtn(item)">
            <div v-if="curInfo.appInfo.platform!='rn'" >V{{item.versionName}}(build {{item.versionCode}})</div>
            <div v-if="curInfo.appInfo.platform=='rn'">V{{item.appVersion}}</div>
            <div>{{formatTime(item.uploadAt)}}</div>
          </li>
        </ul>
      </div>

    </div>
</template>

<script type="text/ecmascript-6">
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import VueQr from 'vue-qr'
  import ios from "@/assets/ic_ios.png";
  import android from "@/assets/ic_android.png";
  import rn from "@/assets/ic_rn.png";

  export default {
    components: {
      VueQr
    },
    data() {
      return {
        dataInfo:[],
        curInfo:{
          appInfo:{},
          versionInfo:{},
          history:[]
        },
        qrCodeUrl: '',
        pwd: '',
        installWithPwd: false,
        isPhone: false,
        loading:false
      }
    },
    computed: {
      isIos() {
        let u = navigator.userAgent
        let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
        return isiOS
      },
      isAndroid() {
        let u = navigator.userAgent
        let isAndroid = !!(u.match(/(Android)\s+([\d.]+)/))
        return isAndroid
      },

      showDownLoadBtn() {
        return !this.showPasswordInput && (this.isPhone || this.dataInfo.length == 1)
      },
      showMergeBtn() {
        return !this.showPasswordInput && !this.isPhone && this.dataInfo.length > 1
      },
      showPasswordInput() {
         return this.installWithPwd
      },
      showHistoryList(){
        return !this.showPasswordInput && this.curInfo.history.length > 0
      }
    },
    mounted() {
      this.getAppInfo(this.$route.params.id,this.pwd)
      // 判断是否是手机设备
      if (this.isIos || this.isAndroid) {
        this.isPhone = true
      } else {
        this.isPhone = false
      }
    },
    created() {
      this.$nextTick(() => {
      })

    },
    methods: {
      formatTime(time) {
        return new Date(time).toFormat()
      },
      getTableBackground(index) {
        if (index % 2 === 0) {
          return `backgroundColor: rgb(244, 245, 247)`
        } else {
          return `backgroundColor: white`
        }
      },
      getAppInfo(shortUrl,password) {
        AppResourceApi.getAppInfoByShortUrl(shortUrl,password).then((res) => {
          console.log(res)
          if (res.data == null) {
              this.$message.error('未检测到版本信息')
              return
          }
          this.installWithPwd = res.data.needAuth
          this.dataInfo = res.data.list;
          if (this.isPhone && this.dataInfo.length > 1) {
            if (this.isAndroid && this.dataInfo[0].appInfo.platform == 'android') {
              this.curInfo = this.dataInfo[0]
            }else {
              this.curInfo = this.dataInfo[1]
            }
          } else {
            this.curInfo = this.dataInfo[0];
          }
          this.qrCodeUrl = `${window.origin}${this.$route.fullPath}`
          this.loading = false
        }, e => {
          this.loading = false
          this.pwd = '';
          // this.$message.error(e)
        })
      },
      setDefaultIcon(e,item){
        if (item.platform == 'ios') {
          e.target.src = ios
        }else if (item.platform == 'android') {
          e.target.src = android
        }else if (item.platform == 'rn') {
          e.target.src = rn
        }
      },
      historyClickDownLoadBtn(item) {
        if (item.grayScaleLimit && item.grayScaleSize <= item.downloadCount) {
          this.$message.error('已达到灰度上限')
          this.getAppInfo(this.$route.params.id,this.pwd)
          return
        }
        if (this.isIos) {
          const a = document.createElement('a');
          a.setAttribute('href', item.installUrl);
          a.click();
        } else {
          const a = document.createElement('a');
          let url = item.downloadUrl;
          a.setAttribute('href', url);
          a.click();
          fetch(url).then(response => {
            let reader = response.body.getReader()
            let headers = response.headers
            let totalLength = headers.get('Content-Length')
            let bytesReceived = 0
            reader.read().then(function processResult(result) {
              if (result.done) {
                AppResourceApi.downloadedCount(item._id).then(() => {
                }, reject => {})
                return
              }
              bytesReceived += result.value.length
              console.log(`progress: ${bytesReceived / totalLength * 100}%`)
              return reader.read().then(processResult)
            })
          });
        }
      },

      clickDownLoadBtn(item) {
        if (item.versionInfo.grayScaleLimit && item.versionInfo.grayScaleSize <= item.versionInfo.downloadCount) {
          this.$message.error('已达到灰度上限')
          this.getAppInfo(this.$route.params.id,this.pwd)
          return
        }
        if (this.isIos) {
          const a = document.createElement('a')
//            `itms-services://?action=download-manifest&url=${this.axios.defaults.baseURL}api/plist/${item.appInfo._id}/${item.versionInfo._id}`
          a.setAttribute('href', item.versionInfo.installUrl)
          // a.setAttribute('href', 'itms-services://?action=download-manifest&url=https://10.151.100.79:443/api/plist/63edf001d638db7592259ae1/63f2de2f92deb0feb812766f')
          a.click()
        } else {
          const a = document.createElement('a')
          let url = item.versionInfo.downloadUrl;
          a.setAttribute('href', url)
          a.click()
          let _this = this
          fetch(url).then(response => {
            let reader = response.body.getReader()
            let headers = response.headers
            let totalLength = headers.get('Content-Length')
            let bytesReceived = 0
            reader.read().then(function processResult(result) {
              if (result.done) {
                console.log('下载完成')
                AppResourceApi.downloadedCount(item.versionInfo._id).then(() => {
                }, reject => {

                })
                return
              }
              bytesReceived += result.value.length
              console.log(`progress: ${bytesReceived / totalLength * 100}%`)
              return reader.read().then(processResult)
            })
          })
        }
      },
      formatDate(date) {
        if (!date) {
          return ''
        }
        return new Date(date).toFormat();
      },
      clickSure() {
        if(!this.pwd){
          this.$message.info('请输入密码')
          return
        }
        this.loading = true;
        this.getAppInfo(this.$route.params.id,this.pwd)
      }
    }
  }
</script>

<style lang="scss">
@import "../../common/scss/base";
  body{
    background-color: white;
  }
  /*网页样式*/
  .preview-app-wrapper {
    background-color: white;
    width: 100vw;
    height: 100%;
    position: absolute;
    //background-image: url("../../common/assets/bg_pre.png");
    background-size: cover;
    display: flex;
    align-items: center;
    flex-direction: column;
    .phoneDownLoadWrapper {
      max-width: 800px;
      text-align: center;
      .app-icon {
        width: 126px;
        height: 126px;
        border-radius: 15px;
        margin-top: 100px;
      }
      .title {
        color: #354052;
        font-weight: bold;
        font-size: 26px;
        height: 37px;
        line-height: 37px;
        margin-top: 13px;
      }
      .info {
        display: flex;
        flex-direction: row;
        justify-content: center;
        color: #242A34;
        font-size: 14px;
        line-height: 20px;
        margin-top: 5px;
        opacity: 0.5;
        .desc {
          margin-right: 12px;
        }
      }
      .qrcode{
        //margin-top: 10px;
        .tips {
          color: #585F69;
          font-size: 14px;
          text-align: center;
        }
        .qrcodeImg {

          margin: 10px 0px;
          width: 150px;
          height: auto;
        }
      }
      .pwd {
        width: 200px;
        height: 40px;
        //border: solid 1px $mainColor;
        border-radius: 6px;
        margin-top: 20px;
        background-color: transparent;
      }

      .downloadBtn {
        background-color: $mainColor;
        width: 200px;
        height: 44px;
        color: white;
        font-size: 15px;
        margin-top: 15px;
        font-weight: 500;
        border-color: transparent;
      }
      .downloadBtn i:before {
        color: white;
        font-size: 16px;
      }
    }
    .merge-wrapper{
      width: 820px;
      display: flex;
      margin-top: 20px;
      border-top: solid 1px $lineColor;
      padding: 20px 0px 20px 0px;
      .left{
        flex: 1;
        text-align: center;
      }
      .line{
        height: 100px;
        width: 1px;
        background-color: $lineColor;;
      }
      .right{
        flex: 1;
        text-align: center;
      }
      .info {
        display: flex;
        flex-direction: row;
        justify-content: center;
        color: #242A34;
        font-size: 14px;
        line-height: 20px;
        margin-top: 5px;
        opacity: 0.5;
        .desc {
          margin-right: 12px;
        }
      }
      .mergeDown{
        margin-top: 20px;
      }
    }
    .history-wrapper{
      width: 100%;
      margin-top: 16px;
      ul  {
        //background: #fff;
        padding: 16px 32px;
        li {
          padding: 12px 0;
          display: flex;
          justify-content: space-around;
          font-size: 12px;
          //&:nth-child(2n - 1) {
            background: #f2f5fb;
          //}
        }
      }
    }
  }
</style>

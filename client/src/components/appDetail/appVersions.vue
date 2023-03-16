<template>
  <div class="appVersion-wrapper" >

    <div v-if="this.dataArr.length>0">
      <!--头部-->
      <div class="header-content-top">
        <div class="top-left" >
          <span style="margin-right: 6px" class="el-icon-tickets"></span>版本信息
        </div>
      </div>
      <!--内容-->
      <el-table
        :data="dataArr"
        style="width: 100%;box-sizing: border-box "
        stripe
        :border="false"
        class="version-table"
      >
        <el-table-column
          width="120"
          label="激活"
          align="center"
          class="version-table-one"
        >
          <template slot-scope="scope">
            <span :class="getIconClass(scope.row)"></span>

          </template>
        </el-table-column>
        <el-table-column width="200" align="center" label="版本">
          <template slot-scope="scope">
            <el-dropdown>
              <div>
                <span >{{getVersion(scope.row)}}</span>
                <i style="color: #606266;margin-left: 5px" class="el-icon-arrow-down"></i>
              </div>
              <el-dropdown-menu slot="dropdown">
                <vue-qr :autoColor="false" colorDark="#354052"  :text="scope.row.installUrl" :margin="20"></vue-qr>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column align="center"
          label="更新时间"
          width="170"
        >
          <template slot-scope="scope">
            <p v-html="getCreatTime(scope.row.uploadAt)"></p>
          </template>
        </el-table-column>
        <el-table-column align="center"
                         label="更新方式"
                         width="170"
        >
          <template slot-scope="scope">
            <span style="color: #9B9B9B;display: inline-block" v-html="getUpdateMode(scope.row.updateMode)"></span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="文件大小"
          width="120"
        >
          <template slot-scope="scope">
            <p v-html="getAppSize(scope.row.size)"></p>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="下载次数"
          width="120"
        >
          <template slot-scope="scope">
            <span style="color: #9B9B9B;display: inline-block" v-html="getAllowDownLoadCount(scope.row)"></span>
          </template>
        </el-table-column>

        <el-table-column

          prop="changeLog"
          label="更新日志">
        </el-table-column>
        <el-table-column label="发布人" width="120px" align="center">
          <template slot-scope="{row}">
            <div>{{ row.uploader }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
        >
          <template slot-scope="scope">
            <button class="appversion-elButton" @click="releaseApp(scope.row)"><i class="icon-ic_overview"></i></button>
            <button class="appversion-elButton" @click="clickDownLoad(scope.row)"><i class="icon-ic_download"></i></button>
            <button class="appversion-elButton" @click="clickEditor(scope.row)"><i class="icon-ic_edit"></i></button>
            <button class="appversion-elButton" @click="clickDelete(scope.row)"><i class="icon-ic_delete"></i></button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="appVersion-footerWrapper">
      <div class="totalWrapper">
        <div class="downloadWrapper">
          <i class="icon-ic_download_s"></i>
        </div>
        <p>总下载次数  {{this.appInfo.totalDownloadCount || 0}}</p>
        <div class="downloadCount"></div>
      </div>
      <div class="todayWrapper">
        <div class="downloadWrapper">
          <i class="icon-ic_download_s"></i>
        </div>
        <p v-html="getTodayCount()"></p>
        <div class="downloadCount"></div>
      </div>
    </div>

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
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import EditorVersion from './editorVersion.vue'
  import VueQr from 'vue-qr'

  export default {
    props: {
      appInfo: {
        type: Object
      },
      subTitleArr: {
        type: Array
      }
    },
    components: {
      EditorVersion,VueQr
    },
    data() {
      return {
        headerOperationData: ['Bundle ID', '下载地址', 'App Key'],
        dataArr: [],
        showEditorVersion: false,
        versionInfo: {}
      }
    },
    computed: {
    },
    created() {
      this.$nextTick(() => {
        this.getAppVersionListData()
      })

      this.bus.$on('uploadSuccess', () => {
        this.getAppVersionListData()
      })
    },
    destroyed() {
      this.bus.$off('uploadSuccess')
    },
    methods: {
      getAppVersionListData() {
        AppResourceApi.getAppVersionList(this.appInfo._id, this.currentPage).then((res) => {
          console.log('VersionList',res.data)
          this.dataArr = res.data
        }, reject => {

        })
      },
      // 下载应用
      clickDownLoad(item) {
        const a = document.createElement('a')
        // let url = `${this.axios.defaults.baseURL}${item.downloadPath}`
        let url = item.downloadUrl
        a.setAttribute('href', url)
        a.click()
        fetch(url).then(response => {
          let reader = response.body.getReader()
          let headers = response.headers
          let totalLength = headers.get('Content-Length')
          let bytesReceived = 0
          let _this = this
          reader.read().then(function processResult(result) {
            if (result.done) {
              console.log('下载完成')
              AppResourceApi.downloadedCount( item._id).then(() => {
              }, reject => {
              })
              return
            }
            bytesReceived += result.value.length
            console.log(`progress: ${bytesReceived / totalLength * 100}%`)
            return reader.read().then(processResult)
          })
        })
      },
      clickEditor(item) {
        this.showEditorVersion = true
        item.appName = this.appInfo.appName
        this.versionInfo = item
      },
      clickPreview(item) {
        const {href} = this.$router.resolve({
          name: 'AppPreView',
          path: '/',
          params: { 'id': this.appInfo.shortUrl }
        })
        window.open(href, '_blank')
      },
      clickDelete(item) {
        this.$confirm('确认删除？')
          .then(() => {
            AppResourceApi.delectAppVersion( this.appInfo._id, item._id).then((res) => {
              this.$message.success('删除成功')
              let index = this.dataArr.indexOf(item)
              this.dataArr.splice(index, 1)
              console.log(this.dataArr)
            }, reject => {
              this.$message.error(reject)
            })
          }).catch(() => {})
      },
      // 发布应用
      releaseApp(item) {
        if (!item.versionName && !item.appVersion) {
          this.clickEditor(item)
          return
        }
        AppResourceApi.releaseApp(this.appInfo._id, item._id, true).then((res) => {
          this.$message.success(res.message)
          this.appInfo.releaseVersionId = item._id
          this.getAppVersionListData()
        }, reject => {

        });
      },
      getCreatTime(date) {
        return new Date(date).toFormat()
      },
      getUpdateMode(updateMode) {
        if(updateMode =='normal'){
          return '普通更新'
        }else if(updateMode =='silent'){
          return '静默更新'
        }
        return '强制更新'
      },
      getAppSize(size) {
        return `${(size / 1024 / 1024).toFixed(2)}M`
      },
      getDownLoadCount(count) {
        if (count) {
          return count
        } else {
          return 0
        }
      },
      getAllowDownLoadCount(item) {
        if (item.grayScaleLimit) {
          return `${item.downloadCount}/${item.grayScaleSize}`
        } else {
          return `${item.downloadCount}/不限`
        }
      },
      cancel() {
        this.showEditorVersion = false
      },
      updateSuccess() {
        this.$emit('updateAppInfoSuccess')
        this.showEditorVersion = false
        this.getAppVersionListData()
      },

      getIconClass(item) {
        if (item.active) {
          if (item.grayScaleLimit && item.downloadCount >= item.grayScaleSize) {
            return 'version-table-one-gray'
          }
          return 'version-table-one-lighting'
        }else {
          return 'version-table-one-gray'
        }
      },
      getTodayCount() {
        if (this.appInfo.todayDownloadCount && new Date(this.appInfo.todayDownloadCount.date).toDateString() === new Date().toDateString()) {
          return `今日下载次数  ${this.appInfo.todayDownloadCount.count}`
        } else {
          return '今日下载次数  0'
        }
      },
      getVersion(item) {
        if (item.versionName) {
          return `${item.versionName}(${item.versionCode})`;
        }else {
          return item.appVersion || '-';
        }
      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";
  .popper-class{
    margin-top: 200px;
    margin-left: 600px;
  }
  .appVersion-wrapper {
    //position: absolute;
    .header-content-top {
      width: 100%;
      height: 48px;
      background-color: white;
      color: $mainTitleColor;
      font-size: 16px;
      line-height: 48px;
      margin-top: 10px;
      padding-left: 24px;
      box-sizing: border-box;
      border-bottom: solid 1px #eee;
      display: flex;
      justify-content: space-between;
      .top-left{
      }
      .topRight {
        //background-color: #2aa198;
        cursor: pointer;
        float: right;
        margin-right: 36px;
        font-size: 12px;
        color: $mainColor;
      }
    }

    .appversion-elButton {
      width: 30px;
      height: 30px;
      font-size: 12px;
      border: solid 1px #aaa;
      color: #D5DFED;
      border-radius: 15px;
      margin-right: 6px;
      padding: 0;
      background-color: transparent;
    }
    .appversion-elButton:hover {
      border-color: $mainColor;
    }
    .appversion-elButton:hover i:before {
      color: $mainColor;
    }
    .appversion-elButton i {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }
    .appversion-elButton i:before {
      color: #aaa;
    }
    .appVersion-wrapper .version-table {
    }
    .version-table-one-gray {
      display: inline-block;
      width: 18px;
      height: 16px;
      background-size: 18px 18px;
      background-image: url("../../assets/sign_grey.png");
    }
    .version-table-one-lighting {
      display: inline-block;
      width: 18px;
      height: 16px;
      background-size: 18px 18px;
      background-image: url("../../assets/sign_now.png");
    }
    .appVersion-wrapper .version-table .cell {
      text-align: center;
    }
    .appVersion-footerWrapper {
      width: 100%;
      padding: 24px;
      background-color: white;
      font-size: 0px;
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
      margin-top: 12px;
      .totalWrapper {
        width: 50%;
        height: 48px;
        &:after {
          content: '';
          display: inline-block;
          width: 1px;
          height: 72px;
          background-color: #eee;
          float: right;
          margin-top: -13px;
        }
      }
      .downloadWrapper {
        width: 48px;
        height: 48px;
        text-align: center;
        display: inline-block;
        background-color: #97DFF9;
        i {
          font-size: 15px;
          line-height: 48px;
        }
      }
      p {
        display: inline-block;
        font-size: 16px;
        color: $mainTitleColor;
        margin-left: 24px;
        line-height: 48px;
      }
      .downloadCount {
        font-size: 16px;
        color: $mainTitleColor;
        display: inline-block;
        margin-left: 80px;
      }
      .todayWrapper {
        display: inline-block;
        width: 50%;
        height: 48px;
        padding-left: 24px;
        .downloadWrapper {
          background-color: #D5DFED;
        }
      }
    }

  }
</style>

<template>
  <div class="app-list-wrapper">
    <!--内容头部-->
    <div class="app-list-header">
      <div class="app-list-header-left" style="position: relative">
        <el-button class="uploadWrapper" @click="addNewApp"><i class="icon-ic_add"></i>新建应用</el-button>
        <div style="width: 120px;height: 16px;background-color: #229FFC;position: absolute;top: 30px;left: 12px;border-radius: 10px;filter: blur(10px);z-index: -1"></div>
      </div>

      <div class="app-list-header-right">
        <div class="platform-wrapper">
          <div class="platform-ios" :class="getActiveClass('ios')" @click="clickIosPlatform">
            <span class="platformImg icon-ic_ios"></span>
          </div>
          <div class="platform-android" :class="getActiveClass('android')" @click="clickAndroidPlatform">
            <span class="platformImg icon-ic_andr"></span>
          </div>
          <div class="platform-rn" :class="getActiveClass('rn')" @click="clickRnPlatform">
            <span class="platformImg icon-ic_rn"></span>
          </div>
        </div>
        <div class="search-wrapper">
          <i class="el-icon-search"></i>
          <input class="app-list-header-search" v-model="queryText" type="text" placeholder="输入名称搜索">
        </div>
      </div>
    </div>
    <!--应用列表-->
    <collectionView
        :dataArr="this.dataList"
        @gotoAppDetail="gotoAppDetail"
    >
    </collectionView>

<!--    <uploadApp v-if="this.showUploadView" :teamId="this.currentTeam._id" :appFile="this.file"-->
<!--               @closeUpload="closeUploadMethod"-->
<!--               @uploadSuccess="uploadSuccessMethod"></uploadApp>-->

    <emptyView v-if="this.showEmpty"></emptyView>
    <el-dialog title="添加项目" :visible.sync="addAppVisible" center width="30%"  @close="closeAddAppDialog">
      <el-form ref="form" :model="form" label-width="80px"  :rules="rules">
        <el-form-item required label="名称" size="mini" prop="name">
          <el-input v-model="form.name"  placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item required size="mini" label="平台">
          <el-radio-group v-model="form.platform">
            <el-radio label="android">Android</el-radio>
            <el-radio label="ios">iOS</el-radio>
            <el-radio label="rn">ReactNaive</el-radio>
<!--            <el-radio label="unknown">其他</el-radio>-->
          </el-radio-group>
        </el-form-item>
       <el-form-item label="描述" >
           <el-input type="textarea" v-model="form.describe"
                     :clearable="true"
                     rows="5"
                     placeholder=""
                     maxlength="500"
                     show-word-limit ></el-input>
       </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeAddAppDialog">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm('form')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import UploadApp from './uploadApp.vue'
  import CollectionView from '../base/collectionView.vue'
  import EmptyView from './emptyView.vue'
  import appMgr from "@/mgr/AppMgr";

export default {
  name: 'Apps',
  data() {
    return {
      currentPlatform: '',
      dataList: [],
      originDataList: [],
      queryText: '',
      showUploadView: false,
      file: FileList,
      currentPage: 0,
      currentTeam: {},
      showEmpty: false,
      addAppVisible: false,
      loading:false,
      form: {
        name: '',
        platform: 'android',
        describe: ''
      },
      rules: {
        name: [{
          required: true,
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (value == null || value.length < 1) {
              callback(new Error('请输入项目名称'))
            } else {
              callback()
            }
          }
        }], platform: [{
          required: true,
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (value == null || value.length < 1) {
              callback(new Error('请选择平台'))
            } else {
              callback()
            }
          }
        }]
      }
      }
  },
  components: {
    UploadApp, CollectionView, EmptyView
  },
  computed: {},
  methods: {
    loadAppList() {
      AppResourceApi.getAppList()
        .then(response => {
          this.dataList = []
          this.dataList = response.data.reverse()
          this.originDataList = this.dataList
          appMgr.setApps(this.dataList)
          if (this.dataList.length === 0) {
            this.showEmpty = true
          } else {
            this.showEmpty = false
          }
          console.log(this.dataList)
        }, reject => {
          this.$message.error(reject)
          this.showEmpty = true
        })
    },
    submitForm(formName) {
      this.loading = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const data = {
            appName: this.form.name,
            platform: this.form.platform,
            describe: this.form.describe
          }
          AppResourceApi.createApp(data).then(response => {
            this.loading = false
            this.$message({
              message: '成功',
              type: 'success'
            })
            this.loadAppList()
            this.closeAddAppDialog()
          }).catch(e => {
            this.loading = false
            this.$message.error(e)
          })
        } else {
          console.log('error submit!!')
        }
      })
    },
    addNewApp() {
      this.addAppVisible = true
    },

    closeAddAppDialog() {
      this.addAppVisible = false
    },
    referenceUpload(e) {
      this.file = e.target.files
      if (e.target.files.length > 0) {
        this.showUploadView = true
      }
    },
    closeUploadMethod() {
      this.showUploadView = false
      this.$refs.referenceUpload.value = ''
    },
    uploadSuccessMethod() {
      this.showUploadView = false
      this.$refs.referenceUpload.value = ''
      this.loadAppList()
    },
    clickIosPlatform() {
      if (this.currentPlatform === 'ios') {
        this.currentPlatform = ''
      } else {
        this.currentPlatform = 'ios'
      }
    },
    clickAndroidPlatform() {
      if (this.currentPlatform === 'android') {
        this.currentPlatform = ''
      } else {
        this.currentPlatform = 'android'
      }
    },
    clickRnPlatform() {
      if (this.currentPlatform === 'rn') {
        this.currentPlatform = ''
      } else {
        this.currentPlatform = 'rn'
      }
    },
    getActiveClass(flag) {
      if (flag === this.currentPlatform) {
        return 'platformActive'
      }
    },
    gotoAppDetail(item) {
      appMgr.setCurApp(item)
      this.$router.push('/distribute')
      // this.bus.$emit('appdetail')
    },
    appItemHovered() {
    },
    appItemUnhovered() {
    },
    clickEditorBtn() {
    },
    clickPreview() {
    },
    deleteApp(item) {
      this.$confirm('确认删除？')
        .then(_ => {
          AppResourceApi.deleteApp(item._id).then((res) => {
            this.loadAppList()
          }, reject => {
            this.$message.error(reject)
          })
        })
        .catch(_ => {
        })
    }
  },
    destroyed() {
      this.bus.$off('refreshList')
    },
    mounted() {
      // this.bus.$emit('applist')
      this.bus.$on('refreshList', () => {
        this.loadAppList()
      })
      this.$watch('queryText', () => {
        let newArr = []
        this.dataList.forEach((item) => {
          if (item.appName.search(this.queryText) !== -1) {
            newArr.push(item)
          }
        })
        this.dataList = newArr

        if (this.queryText.length === 0) {
          this.dataList = this.originDataList
        }
      })

      this.loadAppList()
    },
    created () {
      this.$nextTick(() => {
      })
    },
    watch: {
      currentPlatform(val) {
        this.dataList = this.originDataList
        if (val === '') {
          if (this.dataList.length === 0) {
            this.showEmpty = true
          } else {
            this.showEmpty = false
          }
          return
        }
        let newArr = []
        this.dataList.forEach((item) => {
          if (item.platform === val) {
            newArr.push(item)
          }
        })
        this.dataList = newArr
        if (this.dataList.length === 0) {
          this.showEmpty = true
        } else {
          this.showEmpty = false
        }
      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";
  .app-list-wrapper {
    padding-left: 20px;
    padding-right: 20px;
    min-width: 660px;
  }
  .app-list-header {
    height: 75px;
    padding-top: 50px;
    .app-list-header-left{
      float: left;
      z-index: 1;
      .uploadWrapper {
        width: 144px;
        //cursor: pointer;
        padding: 0px;
        background-color: $mainColor;
        border-width: 0px;
        outline: 0;
        font-size: 14px;
        color: white;
        height: 48px;
        border-radius: 24px;
        i {
          font-size: 16px;
          margin-top: 5px;
          margin-right: 5px;
        }
      }
    }
    .app-list-header-right {
      float: right;
      .search-wrapper {
        width: 312px;
        height: 48px;
        border-radius: 24px;
        border: solid 1px $mainColor;
        position: relative;
        display: inline-block;
        .el-icon-search {
          position: absolute;
          left: 15px;
          top: 17px;
          color: $mainColor;
        }

        .app-list-header-search {
          position: absolute;
          left: 45px;
          top: 0px;
          width: 235px;
          height: 50px;
          background-color: rgba(0, 0, 0, 0);
          outline: 0;
          color: $mainColor;
        }

        .app-list-header-search::-webkit-input-placeholder {
          color: $mainColor;
        }

        .app-list-header-search:-moz-placeholder {
          color: $mainColor;
        }
        .app-list-header-search:-ms-input-placeholder {
          color: $mainColor;
        }
      }


    }


    .platform-wrapper {
      display: inline-block;
      width: 216px;
      height: 48px;
      border-radius: 24px;
      overflow: hidden;
      font-size: 0px;
      border: solid 1px $mainColor;
      margin-right: 22px;
      vertical-align: top;
      .platform-rn {
        display: inline-block;
        width: 72px;
        height: 100%;
        text-align: center;
      }
      .platform-ios {
        display: inline-block;
        width: 72px;
        height: 100%;
        text-align: center;
        border-right: solid 1px $mainColor;
        box-sizing: border-box;
        vertical-align: top;
      }
      .platform-android {
        display: inline-block;
        width: 72px;
        height: 100%;
        border-right: solid 1px $mainColor;
        box-sizing: border-box;
        text-align: center;
      }
    }
  }

  .platformImg {
    line-height: 48px;
    font-size: 26px;
  }

  .platformActive {
    background-color: #e0e4fc;
  }

</style>

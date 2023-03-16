<template >
  <div class="header-nav-wrapper">
    <div v-show="showSwitchApp" class="leftWrapper">
      <div class="app">
        <el-popover
          placement="bottom-start"
          width="220"
          left="220"
          @show="popoverShow"
          @hide="popoverHide"
          trigger="click"
          :visible-arrow="false">

          <ul>
            <li class="leftWrapper-item" v-for="(item, index) in this.appList" :key="index" @click="changeApp(item)">
              <header-app-select :item="item"></header-app-select>
            </li>
            <router-link to="/">
             <div class="all-label">查看全部</div>
            </router-link>
          </ul>
          <div class="appBtn" slot="reference" @click="clickAppBtn">
            <header-app-select :item="curApp"></header-app-select> <i  class="el-icon-arrow-down" ref="arrow"></i>
          </div>
        </el-popover>

      </div>

    </div>
    <div style="flex:1"></div>
    <div class="rightWrapper">
      <span class="doc" @click="clickHelp">文档 <i class="el-icon-info" ></i></span>
      <el-badge is-dot class="item" :hidden="this.redDocHidden">
        <i class="icon-ic_notice" @click="clickMessage"></i>
      </el-badge>
      <div class="userWrapper" @click="clickUserIcon" @mouseover="userInfoHovered" @mouseout="userInfoUnHovered">
        <img src="../../../assets/ic_touxiang.jpeg" alt="" class="userIcon">
        <p >{{this.userInfo.userName}}</p>
      </div>

      <ul class="userInfoSubWrapper" v-show="this.userHover" @mouseover="userInfoHovered" @mouseout="userInfoUnHovered">
        <li class="userInfoSub" @click="clickUserInfoWrapper">
          <span>个人设置</span>
        </li>
        <li class="userInfoSub" @click="logout">
          <span>退出</span>
        </li>
      </ul>
    </div>
    <!--用户信息-->
    <userInfo v-if="this.showUserInfo"></userInfo>
    <!--消息列表-->
    <userMessage v-if="this.showUserMessage"></userMessage>
  </div>

</template>

<script type="text/ecmascript-6">
  import { getUserInfo, removeUserInfo } from '../../../mgr/userMgr'
  import TokenMgr from '../../../mgr/TokenMgr'
  import * as UserApi from '../../../api/moudle/userApi'
  import * as AppResourceApi from "@/api/moudle/appResourceApi";
  import appMgr from "@/mgr/AppMgr";
  import AppMgr from "@/mgr/AppMgr";
  import HeaderAppSelect from "@Components/manager/components/headerAppSelect";
  import UserInfo from '../../user/userInfo.vue'
  import UserMessage from '../../user/userMessage.vue'
  export default {
    components: {HeaderAppSelect,UserInfo,UserMessage},
    props:{
      showSwitchApp:true
    },
    data() {
      return {
        showUserInfo: false,
        showUserMessage: false,
        userInfo: {},
        userHover: false,
        redDocHidden: true,
        isAppList: true,
        appList:[],
        curApp:{},
        appName: '',
        dialogFormVisible: false,
        form: {
          'name': ''
        },
        teamArr: []
      }
    },

    mounted() {
      this.bus.$on('showUserInfo', () => {
        this.showUserInfo = true
      })
      this.bus.$on('hiddenUserInfo', () => {
        this.showUserInfo = false
      })
      this.bus.$on('showUserMessage', () => {
        this.showUserMessage = true
      })
      this.bus.$on('hiddenUserMessage', () => {
        this.showUserMessage = false
      })
      this.bus.$on('refreshAppList', () => {
        this.loadAppList()
      })
      this.bus.$on('refreshAppInfo', () => {
        this.getAppDetailData()
      })
      // this.bus.$on('applist', () => {
      //   this.isAppList = true
      //   this.$refs.arrow.style.transform = `rotate(0deg)`
      // })

      // this.bus.$on('miniApplist', () => {
      //   this.isAppList = true
      //   this.$refs.arrow.style.transform = `rotate(0deg)`
      // })

      // this.bus.$on('appdetail', (appName) => {
      //   this.isAppList = false
      //   this.appName = appName
      //   this.$refs.arrow.style.transform = `rotate(-90deg)`
      // })
      // this.bus.$on('miniAppDetail', (appName) => {
      //   this.isAppList = false
      //   this.appName = appName
      //   this.$refs.arrow.style.transform = `rotate(-90deg)`
      // })
      this.bus.$on('allreadMessage', () => {
        this.redDocHidden = true
      })

      this.userInfo = getUserInfo()
      this.teamArr = this.userInfo.teamArr
      this.curApp = appMgr.getCurApp()
      this.appList = appMgr.getApps()
      this.loadMessage()
      if(this.showSwitchApp){
        this.loadAppList()
        this.updateUserInfo()
      }
    },
    created() {

    },
    destroyed() {
      // this.bus.$off('applist')
      this.bus.$off('appdetail')
      this.bus.$off('allreadMessage')
      // this.bus.$off('miniAppDetail')
      // this.bus.$off('miniApplist')
    },
    methods: {
      loadAppList() {
        AppResourceApi.getAppList()
          .then(response => {
            this.appList = []
            this.appList = response.data.reverse()
            appMgr.setApps(this.appList)
            console.log(this.appList)
          }, reject => {
            console.log(reject)
          })
      },
      getAppDetailData() {
        this.curApp = AppMgr.getCurApp()
        AppResourceApi.getAppDetail(this.curApp._id).then((res) => {
          this.curApp = res.data;
          console.log(res);
          appMgr.setCurApp(this.curApp)
        }, reject => {
          // this.$message.error(reject);
        })
      },
      updateUserInfo(dissolve = false) {
        this.userInfo = getUserInfo()
      },
      clickUserIcon() {
        this.userHover = true
      },
      userInfoHovered() {
        this.userHover = true
      },
      userInfoUnHovered() {
        this.userHover = false
      },
      clickUserInfoWrapper() {
        this.userHover = false
        this.bus.$emit('showUserInfo')
      },
      logout() {
        TokenMgr.clearTokens()
        AppMgr.clearApps()
        AppMgr.clearCurApp()
        removeUserInfo()
        this.$router.replace('/login')
      },
      clickMessage() {
        this.bus.$emit('showUserMessage')
      },
      loadMessage() {
        UserApi.getMessageCount().then((res) => {
          if (res.data.unread > 0) {
            this.redDocHidden = false
          } else {
            this.redDocHidden = true
          }
        }, reject => {

        })
      },
      changeApp(item) {
        // 模拟点击，取消弹框
        document.querySelector('#app').click()
        // 更新当前app
        AppMgr.setCurApp(item)
        // 更新app
        this.curApp = item
        // 刷新页面
        this.$router.go(0)
        // 刷新app列表
        this.bus.$emit('refreshList')
      },
      clickAppBtn() {
        if (this.isAppList) {
        } else {
        }
      },
      // 点击我的团队，返回
      clickFlagBtn() {
        console.log(this.$route.fullPath)
        if (this.$route.fullPath.indexOf('/app/') !== -1) {
          this.$router.push('/apps')
        }
        if (this.$route.fullPath.indexOf('/miniApp/') !== -1) {
          this.$router.push('/miniAppList')
        }
      },
      popoverShow() {
        this.$refs.arrow.style.transform = `rotate(-180deg)`
      },
      popoverHide() {
        this.$refs.arrow.style.transform = `rotate(0deg)`
      },
      clickHelp(){
        window.open('https://appspa.github.io/', '_blank')
      }
    },

  }
</script>

<style lang="scss">
  @import "../../../common/scss/base";
  .el-popover {
    top: 50px !important;
    left: 225px !important;
    padding: 0px !important;
    cursor: pointer;
    .all-label{
      color: $mainTitleColor;
      font-size: 14px;
      padding: 10px;
      &:hover {
        background-color: #f0f1fe;
      }
    }
    .leftWrapper-item {
      padding: 6px 10px;
      //height 48px;
      color: $mainTitleColor;
      //line-height: 48px;
      border-bottom: solid 1px #eee;
      box-sizing: border-box;
      p {
        margin-left: 12px;
        margin-right: 12px;
      }
      &:hover {
        background-color: #f0f1fe;
      }
    }
  }

  .header-nav-wrapper {
    display: flex;
    align-items: center;
    background-color: #ffffff;
    justify-content: space-between;
    //box-shadow: 0 1px 2px $lineColor;
    border-bottom: solid 1px $lineColor;
    height: $navBarHeight;
    .leftWrapper {
      display: flex;
      .app{
        margin-left: 14px;
        .appBtn {
          padding: 0px 10px;
          color: $mainTitleColor;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .flagBtn {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          border-color: transparent;
          background-color: transparent;
        }
      }
      .detail{
        p {
          height: 72px;
          line-height: 72px;
          font-family: "PingFang SC";
          font-size: 20px;
          color: $mainTitleColor;
        }
      }
    }

    .rightWrapper {
      height: 100%;
      display: flex;
      align-items: center;
      color: $subTitleColor;
      font-size: 18px;
      .doc {
        cursor: pointer;
        i {
          font-size: 16px;
        }
      }
      .item {
        cursor: pointer;
        display: inline-block;
        vertical-align: middle;
        //width: 15px;
        margin: 0 26px;
        i {
          font-size: 18px;
        }
      }
      .userWrapper {
        cursor: pointer;
        height: 100%;
        //width: 120px;
        display: flex;
        margin-right: 30px;
        border-right: solid 1px #ffffffff;
        box-sizing: border-box;
        color: $mainTitleColor;
        align-items: center;
        .userIcon {
          border-radius: 30px;
          width: 30px;
          vertical-align: middle;
        }
        p {
          line-height: 24px;
          height: 24px;
          font-size: 16px;
          max-width: 160px;
          margin-left: 5px;
        }
        &:hover {
          background-color: $paleGrey;
          border: solid 1px #eee;
          box-sizing: border-box;
        }
      }

      .userInfoSubWrapper {
        position: absolute;
        width: 120px;
        //left: 27px;
        top: $navBarHeight;
        right: 20px;
        z-index: 100;
        border-right: solid 1px #eee;
        box-sizing: border-box;

        .userInfoSub {
          width: 100%;
          height: 44px;
          text-align: center;
          line-height: 44px;
          background-color: white;
          border-bottom: solid 1px #eee;
          box-sizing: border-box;
          font-size: 14px;
        }
        & :hover {
          background-color: #eee;
        }
      }

    }
  }

</style>

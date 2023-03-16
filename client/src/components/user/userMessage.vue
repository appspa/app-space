<template>
  <div class="userMessage-wrapper" @click="cancel">
    <transition name="fadeRight">
      <div v-show="this.show" class="userMessage-wrapper-body" @click.stop="clickcontent">
        <div style="position: relative;width: 100%;height: 100%">
          <div class="top">
            <button @click="clearMessage">清空消息</button>
            <button @click="allread">全部标记已读</button>
            <div style="width: 100%;height: 1px;background-color: #eee;margin-top: 10px"></div>
          </div>
          <ul class="messageListWrapper">
            <li class="messageItem" v-for="(item, index) in this.dataArr" :key="index">
              <el-badge is-dot class="item" :hidden="item.status !== 'unread'">
                <span class="el-icon-message"></span>
              </el-badge>
              <p class="canwrap content">{{item.content}}</p>
              <p class="timer" v-html="getTimer(item.sendAt)"></p>
            </li>
          </ul>

          <el-pagination
            v-show="this.totalCount > 0"
            style="margin: 0 auto;text-align: center;margin-top: 20px"
            layout="prev, pager, next"
            @handleCurrentChange="handleCurrentChange()"
            :total="this.totalCount">
          </el-pagination>

          <div class="nomessage" v-show="this.dataArr.length === 0">
            <img src="../../assets/box.png" alt="">
            <p>暂无消息</p>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script type="text/ecmascript-6">

  import {getUserInfo} from '../../mgr/userMgr'
  import * as UserApi from '../../api/moudle/userApi'

  export default {
    components: {
    },
    data() {
      return {
        show: false,
        userInfo: {},
        dataArr: [],
        currentPage: 0,
        totalCount: 0
      }
    },
    created() {
      setTimeout(() => {
        this.show = true

        this.loadMessageCount()
        this.loadData()
      }, 100)
      this.userInfo = getUserInfo()
    },
    computed: {
    },
    methods: {
      loadMessageCount() {
        UserApi.getMessageCount().then((res) => {
          this.totalCount = res.data.total
        }, reject => {

        })
      },
      loadData() {
        UserApi.getUserMessage(this.currentPage).then((res) => {
          console.log(res)
          this.dataArr = res.data
        }, reject => {

        })
      },
      clickItem(item) {
        this.currentItem = item
      },
      cancel() {
        this.show = false
        setTimeout(() => {
          this.bus.$emit('hiddenUserMessage')
        }, 500)
      },
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`)
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`)
        this.currentPage = val
      },
      getTimer(timer) {
        let dateTimer = new Date(timer)
        // 今天显示时分，昨天显示昨天时分，其余显示日期
        if (this.isToday(dateTimer)) {
          return `${dateTimer.getHours()}:${dateTimer.getMinutes()}`
        } else if (this.isYestday(dateTimer)) {
          return `昨天 ${dateTimer.getHours()}:${dateTimer.getMinutes()}`
        } else {
          return `${dateTimer.getFullYear()}-${dateTimer.getMonth() + 1}-${dateTimer.getDay()} ${dateTimer.getHours()}:${dateTimer.getMinutes()}`
        }
      },
      isToday(theDate) {
        let today = new Date()
       return theDate.getFullYear() === today.getFullYear() && theDate.getMonth() === today.getMonth() && theDate.getDay() === today.getDay()
      },
      isYestday(theDate) {
        // 当前时间
        var date = (new Date())
        // 今天凌晨
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
        var yestday = new Date(today - 24 * 3600 * 1000).getTime()
        return theDate.getTime() < today && yestday <= theDate.getTime()
      },
      clickcontent() {},
      clearMessage() {
        UserApi.clearMessage().then((res) => {
          this.$message.success(res.message)
          this.loadData()
        }, reject => {

        })
      },
      allread() {
        UserApi.allRead().then((res) => {
          this.$message.success(res.message)
          this.loadData()
          this.bus.$emit('allreadMessage')
        }, reject => {

        })
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
  .userMessage-wrapper {
    position: fixed;
    top: 62px;
    left: 0px;
    bottom: 0px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: 1000;
  }
  .userMessage-wrapper-body {
    float: right;
    width: 480px;
    height: 100%;
    margin-right: 0;
    background-color: white;
    box-shadow: 0 2px 6px rgba(120, 120, 120, 0.5);
    overflow: scroll;
    overflow-x: hidden;
    overflow-y: hidden;
  }
  .userMessage-wrapper-body .top {
    width: 100%;
    height: 60px;
    text-align: left;
  }
  .userMessage-wrapper-body .top button {
    margin-top: 10px;
    height: 30px;
    line-height: 30px;
    padding: 0px 10px;
    margin-left: 10px;
    background-color: transparent;
    border-color:  $mainColor;
    color: $mainColor;
    border-radius: 15px;
  }
  .userMessage-wrapper-body .messageListWrapper {
    width: 100%;
    height: calc(100% - 60px - 80px);
    overflow: scroll;
  }
  .userMessage-wrapper-body .messageItem {
    display: flex;
    padding: 20px 10px;
  }
  .userMessage-wrapper-body .messageItem .content {
    font-size: 15px;
    color: $mainTitleColor;
    width: 480px - 20px - 80px - 25px - 10px;
    margin-left: 8px;
  }
  .userMessage-wrapper-body .messageItem .timer {
    text-align: right;
    font-size: 13px;
    color: $subTitleColor;
    width: 80px;
  }
  .userMessage-wrapper-body .nomessage {
    position: absolute;
    top: 0px;
    width: 100%;
    height: 100%;
    background-color: white;
    text-align: center;
  }
  .userMessage-wrapper-body .nomessage img {
    width: 100px;
    height: 100px;
    margin-top: 30%;
  }
  .userMessage-wrapper-body .nomessage p {
    margin-top: 20px;
  }
</style>

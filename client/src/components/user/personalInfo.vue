<template>
  <div class="personalInfo-wrapper">
    <ul>
      <li class="emailWrapper">
        <i class="far fa-envelope"></i>
        <p class="emailTitle">邮箱</p>
        <span class="email">{{this.userInfo.email}}</span>
      </li>
      <li class="personalInfoItem" v-for="(item, index) in dataArr" :key="index">
        <i :class="getIcon(index)"></i>
        <p v-html="item.title"></p>
        <input v-model="item.subTitle" class="borderLine-input" type="text" :placeholder="item.placeHoder">
      </li>
    </ul>

    <el-button round class="elbutton-style sureBtn" @click="sure">确认</el-button>
    <el-button round class="elbutton-style cancelBtn" @click="cancel">取消</el-button>
  </div>
</template>

<script type="text/ecmascript-6">
  import * as UserApi from '../../api/moudle/userApi'
  import utils from '../../common/js/utils'

  export default {
    props: {
      userInfo: {
        type: Object
      }
    },
    data() {
      return {
        dataArr: [
          {'title': '手机', 'subTitle': '', 'placeHoder': '输入手机号'},
          {'title': 'QQ', 'subTitle': '', 'placeHoder': '输入QQ号'},
          {'title': '公司', 'subTitle': '', 'placeHoder': '输入您的公司名称'},
          {'title': '职位', 'subTitle': '', 'placeHoder': '输入您的职位'}
        ]
      }
    },
    created() {
      this.$nextTick(() => {
        this.loadData()
      })
    },
    methods: {
      loadData() {
        UserApi.getUserInfo().then((res) => {
          if (res.data.mobile) {
            this.dataArr[0].subTitle = res.data.mobile
          }
          if (res.data.qq) {
            this.dataArr[1].subTitle = res.data.qq
          }
          if (res.data.company) {
            this.dataArr[2].subTitle = res.data.company
          }
          if (res.data.career) {
            this.dataArr[3].subTitle = res.data.career
          }
        }, reject => {
        })
      },
      getIcon(index) {
        if (index === 0) {
          return 'icon-ic_phone_s'
        } else if (index === 1) {
          return 'icon-ic_qq'
        } else if (index === 2) {
          return 'icon-ic_company_s'
        } else {
          return 'icon-ic_position_s'
        }
      },
      cancel() {
        this.$emit('cancel')
      },
      sure() {
        if (this.dataArr[0].subTitle && this.dataArr[0].subTitle.length > 0) {
          if (!utils.validePhone(this.dataArr[0].subTitle)) {
            this.$message.error('手机号码格式错误')
            return
          }
        }
        let body = {
          'mobile': this.dataArr[0].subTitle,
          'qq': this.dataArr[1].subTitle,
          'company': this.dataArr[2].subTitle,
          'career': this.dataArr[3].subTitle
        }
        UserApi.updateUserInfo(body).then((res) => {
          this.$message.success(res.message)
          this.loadData()
        }, reject => {

        })
      }
    }
  }
</script>

<style lang="scss">
  @import "../../common/scss/base";

  .personalInfo-wrapper {
    width: 100%;
    margin: 0 auto;
    padding-bottom: 100px;
    padding-left: 48px;
    box-sizing: border-box;
  }
  .personalInfo-wrapper .email {
    display: inline-block;
    font-size: 14px;
    color: $mainTitleColor;
  }
  .personalInfo-wrapper .emailTitle {
    display: inline-block;
    width: 60px;
    font-size: 14px;
    color: $subTitleColor;
    margin-left: 8px;
  }
  .emailWrapper {
    margin-top: 24px;
    text-align: left;
  }
  .emailWrapper i {
    width: 24px;
    height: 24px;
    text-align: center;
  }
  .emailWrapper i:before {
    color: $mainColor;
  }
  .personalInfoItem {
    margin-top: 24px;
    display: flex;
    flex-direction: row;
    height: 24px;
    line-height: 24px;
  }
  .personalInfoItem i {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
  }
  .personalInfoItem i:before {
    color: $mainColor;
  }
  .personalInfoItem p {
    font-size: 14px;
    color: $subTitleColor;
    width: 60px;
    margin-left: 6px;
  }
  .personalInfoItem input {
    width: 216px;
  }
  .personalInfo-wrapper .el-button {
    margin-top: 100px;
    margin-bottom: 100px;
  }
  .personalInfo-wrapper .el-button span {
    line-height: 36px !important;
  }
  .personalInfo-wrapper .sureBtn {
    background-color: $mainColor !important;
    color: white !important;
    margin-left: calc(100% - 72px - 96px - 96px - 10px);
  }
</style>

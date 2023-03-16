<template>
  <div class="userInfo-wrapper" @click="cancel">
    <transition name="fadeRight">
      <div v-show="this.show" class="userInfo-wrapper-body" @click.stop="clickContent">
        <div class="userWrapper">
            <div class="imgwrapper">
                <img src="../../assets/ic_touxiang.jpeg" alt="">
            </div>
            <div class="userInfo-name-token">
                <p class="userInfo-name">{{this.userInfo.userName}}</p>
                <div v-show="hasApiToken" class="userInfo-apiToken-contain">
                    <label class="userInfo-apiToken-text"> {{ apiToken }} </label>
                    <button class="reset-button" @click="apiTokenAction" title='点击重置ApiToken'>
                        <img style="{width: 24px; height: 24px;}" src="../../assets/btn_redraw@2x.png">
                    </button>
                </div>
            </div>
            <div v-show="!hasApiToken">
                     <el-button class= "userInfo-apiToken-initButton" type="primary" @click="apiTokenAction" round>生成ApiToken</el-button>
            </div>
        </div>

        <ul class="userInfo-wrapper-nav">
          <li v-for="item in navArr" :style="getactiveClass(item)" :key="item" class="userInfo-wrapper-nav-sub" @click="clickItem(item)">
            {{item}}
          </li>
        </ul>

        <personalInfo :userInfo="this.userInfo" v-if="this.currentItem === '个人资料'" @cancel="cancel"></personalInfo>
        <changePassword v-if="this.currentItem === '修改密码'" @cancel="cancel"></changePassword>
      </div>
    </transition>

  </div>
</template>

<script type="text/ecmascript-6">
    import ChangePassword from './changePassword.vue'
    import PersonalInfo from './personalInfo.vue'
    import {
        getUserInfo, saveUserInfo
    } from '../../mgr/userMgr'
    import {
        apiTokenActive
    } from '../../api/moudle/userApi'

    export default {
        components: {
            ChangePassword,
            PersonalInfo
        },
        data() {
            return {
                show: false,
                navArr: ['个人资料', '修改密码'],
                currentItem: '个人资料',
                userInfo: {},
                apiToken: undefined
            }
        },
        created() {
            setTimeout(() => {
                this.show = true
            }, 100)
            this.userInfo = getUserInfo()
            this.apiToken = this.userInfo.apiToken
        },
        computed: {
            hasApiToken: function() {
                return this.apiToken !== undefined
            }
        },
        methods: {
            clickItem(item) {
                this.currentItem = item
            },
            getactiveClass(item) {
                if (item === this.currentItem) {
                    return `color: #229FFC;borderBottomColor: #229FFC`
                }
            },
            cancel() {
                this.show = false
                setTimeout(() => {
                    this.bus.$emit('hiddenUserInfo')
                }, 500)
            },
            clickContent() {},
            onCopy() {
              this.$message.success('复制成功')
            },
            apiTokenAction() {
                apiTokenActive().then(resp => {
                    this.$message({
                        type: resp.success ? 'success' : 'error',
                        message: resp.message || (!this.hasApiToken) ? '生成apiToken成功' : '重置apiToken成功'
                    })
                    this.userInfo.apiToken = resp.data
                    this.apiToken = resp.data
                    saveUserInfo(this.userInfo)
                }).catch(error => {
                    this.$message({
                        type: 'error',
                        message: error
                    })
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

    .fadeRight-enter,
    .fadeRight-leave-to {
        transform: translateX(100%);
    }

    .userInfo-wrapper {
        position: fixed;
        top: 62px;
        left: 0px;
        bottom: 0px;
        width: 100%;
        background-color: rgba(255, 255, 255, 0.5);
        z-index: 1000;
    }

    .userInfo-wrapper-body {
        float: right;
        width: 480px;
        height: 100%;
        margin-right: 0;
        background-color: white;
        box-shadow: 0 2px 6px rgba(120, 120, 120, 0.5);
        overflow: scroll;
    }

    .userInfo-wrapper-body .userWrapper {
        font-size: 0px;
        padding-top: 22px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    .userWrapper .imgwrapper {
        width: 72px;
        height: 72px;
        border-radius: 36px;
        margin-left: 48px;
        display: inline-block;
        vertical-align: middle;
    }

    .userWrapper .imgwrapper img {
        width:  72px;
        height: 72px;
        border-radius: 26px;
        background-size: 72px 72px;
    }

    .userInfo-wrapper-nav {
        margin-top: 24px;
        width: 100%;
        height: 48px;
        border-bottom: solid 1px #eee;
    }

    .userInfo-wrapper-nav-sub {
        width: 96px;
        height: 48px;
        display: inline-block;
        color: $subTitleColor;
        margin-left: 48px;
        line-height: 48px;
        text-align: center;
        border-bottom: solid 1px transparent;
    }

    .userInfo-name-token {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 72px;
        margin-left: 12px;
        .userInfo-name {
            font-size: 24px;
            font-weight: bold;
            color: $mainColor;
        }
        .userInfo-apiToken-contain {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .userInfo-apiToken-text {
                height: 24px;
                font-size: 14px;
                font-family: PingFangSC-Regular;
                font-weight: 400;
                color: rgba(170, 186, 210, 1);
                line-height: 24px;
                user-select: text;
            }
            .reset-button {
                height: 26px;
                border: none;
                line-height: 26px;
                background-color: rgba(0,0,0,0);
            }

        }

    }

    .userInfo-apiToken-initButton {
        margin-left: 12px;
    }


</style>

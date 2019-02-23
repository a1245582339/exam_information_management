<style lang="less">
@import "./login.less";
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" :bordered="false">
        <p slot="title">欢迎使用考试预约系统</p>
        <Button
          type="text"
          slot="extra"
          size="small"
          @click="changeLoginRegStatus"
          :style="{boxShadow: 'none'}"
        >{{changeButton}}</Button>
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit" v-show="LoginReg"></login-form>
          <reg-form @on-success-valid="handleReg" v-show="!LoginReg" class="reg-form"></reg-form>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import RegForm from '_c/reg-form'
import { mapActions } from 'vuex'
import { userReg } from '@/api/user'
export default {
  components: {
    LoginForm,
    RegForm
  },
  data () {
    return {
      LoginReg: 1,
      changeButton: '注册新用户'
    }
  },
  methods: {
    ...mapActions([
      'handleUserLogin',
      'getUserInfo',
      'getUserRealNameAuthStatus'
    ]),
    changeLoginRegStatus () {
      this.LoginReg = !this.LoginReg
      this.changeButton = this.LoginReg ? '注册新用户' : '立即登录'
    },
    handleSubmit ({ userName, password }) {
      this.handleUserLogin({ userName, password })
        .then(res => {
          return this.getUserInfo()
            .then(res => {
              return this.getUserRealNameAuthStatus()
            })
            .then(res => {
              this.$router.push({
                name: this.$config.homeName
              })
            })
        })
        .catch(err => {
          this.$Message.error(err.response.data.message || '登录出错，请联系管理员。')
        })
    },
    handleReg ({ userName, password1, password2 }) {
      userReg({ login_name: userName, password: password1 })
        .then(res => {
          this.$Message.success('注册成功！')
          this.changeLoginRegStatus()
        })
        .catch(err => {
          this.$Message.error(err.response.data.message)
        })
    }
  }
}
</script>

<style>
</style>

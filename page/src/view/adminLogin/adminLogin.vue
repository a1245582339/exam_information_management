<style lang="less">
@import "./adminLogin.less";
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎管理员登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions(['handleAdminLogin', 'getUserInfo']),
    handleSubmit ({ userName, password }) {
      this.handleAdminLogin({ userName, password })
        .then(res => {
          this.getUserInfo().then(res => {
            this.$router.push({
              name: this.$config.homeName
            })
          })
        })
        .catch(err => {
          this.$Message.error(
            err.response.data.message || '登录出错，请联系系统管理员。'
          )
        })
    }
  }
}
</script>

<style>
</style>

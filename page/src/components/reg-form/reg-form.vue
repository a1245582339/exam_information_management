<template>
  <Form ref="regForm" :model="form" :rules="rules">
    <FormItem prop="userName">
      <Input v-model="form.userName" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password1">
      <Input type="password" v-model="form.password1" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password2">
      <Input type="password" v-model="form.password2" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" type="primary" long>注册</Button>
    </FormItem>
  </Form>
</template>
<script>
export default {
  name: 'RegForm',
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [{ required: true, message: '账号不能为空', trigger: 'blur' }]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          {
            required: true,
            message: '密码长度不得小于8位',
            trigger: 'blur',
            min: 8
          }
        ]
      }
    }
  },
  data () {
    return {
      form: {
        userName: 'user',
        password1: '11111111',
        password2: '11111111'
      }
    }
  },
  computed: {
    rules () {
      return {
        userName: this.userNameRules,
        password1: this.passwordRules,
        password2: this.passwordRules
      }
    }
  },
  methods: {
    handleSubmit () {
      if (this.form.password1 !== this.form.password2) {
        this.$Message.error('两次输入的密码不同，请进行修改！')
        return
      }
      this.$refs.regForm.validate(valid => {
        if (valid) {
          this.$emit('on-success-valid', {
            userName: this.form.userName,
            password1: this.form.password1,
            password2: this.form.password2
          })
        }
      })
    }
  }
}
</script>

<template>
  <div>
    <Card shadow>
      <Form
        ref="userInfo"
        :model="userInfo"
        :rules="rule"
        label-position="right"
        :label-width="100"
        style="width: 400px"
      >
        <FormItem label="姓名" prop="name">
          <Input type="text" v-model="userInfo.name" :readonly="!!CurrentUserNameAuthStatus"></Input>
        </FormItem>
        <FormItem label="性别" prop="sex">
          <RadioGroup v-model="userInfo.sex">
            <Radio label="1" :disabled="!!CurrentUserNameAuthStatus">
              <span>男</span>
            </Radio>
            <Radio label="2" :disabled="!!CurrentUserNameAuthStatus">
              <span>女</span>
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="手机号" prop="tel">
          <Input type="text" v-model="userInfo.tel"></Input>
        </FormItem>
        <FormItem label="email" prop="email">
          <Input type="text" v-model="userInfo.email"></Input>
        </FormItem>
        <FormItem label="身份证号" prop="id_card">
          <Input type="text" v-model="userInfo.id_card" :readonly="!!CurrentUserNameAuthStatus"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="saveUserInfo('userInfo')">保存</Button>
          <Button type="warning" style="margin-left: 10px" @click="changePassword">修改密码</Button>
          <Button
            type="error"
            style="margin-left: 10px"
            :disabled="!!CurrentUserNameAuthStatus"
            @click="readNameAuth"
          >实名认证</Button>
        </FormItem>
      </Form>
    </Card>
    <!-- 修改密码模态框 -->
    <Modal v-model="changePassModel" title="修改密码">
      <Form :model="passwordInfo" label-position="right" :label-width="100" :rules="passrule">
        <FormItem label="原密码" prop="oldPassword">
          <Input v-model="passwordInfo.oldPassword" type="password"></Input>
        </FormItem>
        <FormItem label="新密码" prop="password1">
          <Input v-model="passwordInfo.password1" type="password"></Input>
        </FormItem>
        <FormItem label="重复密码" prop="password2">
          <Input v-model="passwordInfo.password2" type="password"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="closeChangePassModal">取消</Button>
        <Button type="primary" @click="changePassOk">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getUserInfo,
  submitUserInfo,
  submitRealNameAuth,
  editUserPassword
} from '@/api/data'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'personal_info_child',
  data () {
    return {
      userInfo: {
        name: null,
        sex: null,
        tel: null,
        email: null,
        id_card: null,
        status: 0
      },
      rule: {
        name: [{ required: true, message: '请填输入姓名', trigger: 'blur' }],
        sex: [{ required: true, message: '请选择性别', trigger: 'blur' }],
        tel: [
          {
            required: true,
            message: '请输入正确的手机号',
            trigger: 'blur',
            max: 11,
            min: 11
          }
        ],
        email: [{ required: true, message: '请输入邮箱地址', trigger: 'blur' }],
        id_card: [
          {
            required: true,
            message: '请输入正确的身份证号',
            trigger: 'blur',
            max: 18,
            min: 18
          }
        ]
      },
      changePassModel: false,
      passwordInfo: {
        oldPassword: null,
        password1: null,
        password2: null
      },
      passrule: {
        oldPassword: [
          {
            required: true,
            message: '请输入原密码',
            trigger: 'blur'
          }
        ],
        password1: [
          {
            required: true,
            message: '请输入新密码',
            trigger: 'blur'
          },
          {
            type: 'string',
            min: 8,
            message: '密码长度不得小于8个字符。',
            trigger: 'blur'
          }
        ],
        password2: [
          {
            required: true,
            message: '请输入新密码',
            trigger: 'blur'
          },
          {
            type: 'string',
            min: 8,
            message: '密码长度不得小于8个字符。',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    ...mapActions(['setUserRealNameAuth', 'handleLogOut']),
    saveUserInfo (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.SubmitUserInfo()
        } else {
          this.$Message.error('信息验证失败!')
        }
      })
    },
    SubmitUserInfo () {
      submitUserInfo(this.userInfo)
        .then(res => {
          this.$Message.success('保存成功!')
        })
        .catch(() => {
          this.$Message.error('保存失败!')
        })
    },
    readNameAuth () {
      submitRealNameAuth(this.userInfo)
        .then(res => {
          this.$Message.success('实名认证成功!')
          this.setUserRealNameAuth({ authStatus: 1 })
        })
        .catch(err => {
          this.$Message.error('实名认证失败!')
          console.log('err => ', err)
        })
    },
    changePassword () {
      this.changePassModel = true
    },
    closeChangePassModal () {
      this.changePassModel = false
    },
    changePassOk () {
      if (
        !(
          this.passwordInfo.oldPassword &&
          this.passwordInfo.password1 &&
          this.passwordInfo.password2
        )
      ) {
        this.$Message.error('信息填写不完整！')
      }
      if (this.passwordInfo.password1 !== this.passwordInfo.password2) {
        this.$Message.error('输入的两次密码不同，请重新输入')
      } else {
        const changePassObj = {
          uid: this.CurrentUserId,
          oldPassword: this.passwordInfo.oldPassword,
          password: this.passwordInfo.password1
        }
        editUserPassword(changePassObj)
          .then(res => {
            this.$Message.success('密码修改成功！')
            this.handleLogOut().then(() => {
              this.$router.push({
                name: 'login'
              })
            })
            this.passwordInfo = {
              oldPassword: null,
              password1: null,
              password2: null
            }
          })
          .catch(err => {
            console.log('err => ', err)
            this.$Message.error(err.response.data.message || '密码修改失败')
          })
      }
    }
  },
  created () {
    const vm = this
    getUserInfo()
      .then(res => {
        vm.userInfo = Object.assign(vm.userInfo, res.data.data.userInfo)
        vm.userInfo.sex = String(vm.userInfo.sex) // 性别改成字符串的，处理iview的坑
        vm.realNameAuthStatus = !!Number(res.data.data.userInfo.status)
        vm.setUserRealNameAuth({ authStatus: Number(res.data.data.userInfo.status) })
        if (!vm.realNameAuthStatus) vm.$Message.error('使用考试预约功能，必须进行实名认证！')
      })
      .catch(err => {
        console.log('err => ', err)
      })
  },
  computed: {
    ...mapGetters(['CurrentUserNameAuthStatus', 'CurrentUserId'])
  }
}
</script>

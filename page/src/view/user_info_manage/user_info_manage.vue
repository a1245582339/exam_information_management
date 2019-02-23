<template>
  <div>
    <Card shadow>
      <!-- 用户列表 -->
      <Table stripe :columns="userListTitle" :data="userList"></Table>
      <!-- 分页组件 -->
      <Page
        :total="totalNum"
        :page-size="pagesize"
        :style="{margin:'20px 0'}"
        @on-change="getUserList"
      />

      <!-- 编辑用户模态框 -->
      <Modal v-model="editUserModel" title="编辑信息" @on-ok="editUserOk(userInfo)">
        <Form :model="userInfo" label-position="right" :label-width="100">
          <FormItem label="姓名">
            <Input v-model="userInfo.name"></Input>
          </FormItem>
          <FormItem label="性别">
            <RadioGroup v-model="userInfo.sex">
              <Radio label="1">
                <span>男</span>
              </Radio>
              <Radio label="2">
                <span>女</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="手机号">
            <Input v-model="userInfo.tel"></Input>
          </FormItem>
          <FormItem label="身份证">
            <Input v-model="userInfo.id_card"></Input>
          </FormItem>
          <FormItem label="邮箱">
            <Input v-model="userInfo.email"></Input>
          </FormItem>
          <FormItem label="实名认证">
            <RadioGroup v-model="userInfo.status">
              <Radio label="0">
                <span>未通过</span>
              </Radio>
              <Radio label="1">
                <span>通过</span>
              </Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </Modal>

      <!-- 修改密码模态框 -->
      <Modal v-model="changePassModel" title="修改密码" @on-ok="changePassOk">
        <Form :model="passwordInfo" label-position="right" :label-width="100">
          <FormItem label="新密码">
            <Input v-model="passwordInfo.password" type="text"></Input>
          </FormItem>
        </Form>
      </Modal>

      <!-- 删除用户操作 -->
      <Modal v-model="deleteUserModel" width="360">
        <p slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle"></Icon>
          <span>删除确认</span>
        </p>
        <div style="text-align:center">
          <p>删除改用户后，用户无法登录和预约报名。</p>
          <p>是否继续删除</p>
        </div>
        <div slot="footer">
          <Button type="error" size="large" long @click="deleteUserOk">删除</Button>
        </div>
      </Modal>
    </Card>
  </div>
</template>

<script>
import { getUserList, submitUserInfo, editUserPassword, deleteUser } from '@/api/data'
export default {
  name: 'user_info_manage_child',
  data () {
    return {
      pagesize: 10,
      totalNum: 0,
      userList: [],
      userListTitle: [
        {
          title: '用户ID',
          key: 'uid'
        },
        {
          title: '登录名',
          key: 'login_name'
        },
        {
          title: '操作',
          key: 'action',
          render: (h, params) => {
            let renderArr = [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.editInfo(params.index)
                    }
                  }
                },
                '编辑信息'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'warning',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.changePass(params.row.uid)
                    }
                  }
                },
                '生成新密码'
              )
            ]
            if (params.row.role !== 1) {
              renderArr.push(
                h(
                  'Button',
                  {
                    props: {
                      type: 'error',
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.deleteUser(params.row.uid)
                      }
                    }
                  },
                  '删除'
                )
              )
            }
            return h('div', renderArr)
          }
        }
      ],
      userInfo: {},
      editUserModel: false,
      passwordInfo: {
        uid: null,
        password: null
      },
      changePassModel: false,
      deleteUserModel: false,
      deleteUserId: null
    }
  },
  methods: {
    showList (info) {
      const vm = this
      vm.totalNum = info.userCountTotal
      vm.userList = info.userList.map(item => {
        item.login_name = item.UserInfo.login_name
        item.sex = String(item.sex)
        item.status = String(item.status)
        delete item.UserInfo
        return item
      })
    },
    getUserList (pageNum) {
      const vm = this
      return getUserList(pageNum, vm.pagesize).then(res => {
        vm.showList(res.data.data)
      })
    },
    editInfo (idx) {
      const vm = this
      vm.editUserModel = true
      vm.userInfo = Object.assign({}, vm.userList[idx])
    },
    editUserOk (userInfo) {
      const vm = this
      submitUserInfo(userInfo)
        .then(res => {
          vm.$Message.success(res.data.message)
          vm.userList = vm.userList.map(item => {
            return item.id === userInfo.id ? userInfo : item
          })
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message || '修改失败！')
        })
    },
    changePass (uid) {
      const vm = this
      vm.passwordInfo.uid = uid
      vm.passwordInfo.password = Math.random()
        .toString(36)
        .substr(2)
      vm.changePassModel = true
    },
    changePassOk () {
      const vm = this
      editUserPassword(vm.passwordInfo)
        .then(res => {
          vm.$Message.success('修改成功！')
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message || '修改失败！')
        })
    },
    deleteUser (uid) {
      const vm = this
      vm.deleteUserModel = true
      vm.deleteUserId = uid
    },
    deleteUserOk () {
      const vm = this
      deleteUser(vm.deleteUserId)
        .then(res => {
          vm.$Message.success(res.data.message)
          vm.getUserList(1)
        })
        .caech(err => {
          vm.$Message.error(err.response.data.message || '删除失败！')
        })
      vm.deleteUserModel = false
    }
  },
  created () {
    this.getUserList(1)
  }
}
</script>

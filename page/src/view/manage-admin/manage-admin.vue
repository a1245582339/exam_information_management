<template>
  <div>
    <Card shadow>
      <Button type="primary" @click="addAdmin">新增管理员</Button>
      <!--  管理员列表，表格  -->
      <Table stripe :columns="adminsListTitle" :data="adminList" :style="{margin:'20px 0'}"></Table>
      <!-- 分页组件 -->
      <Page
        :total="totalNum"
        :page-size="pagesize"
        :style="{margin:'20px 0'}"
        @on-change="getAdminMenuList"
      />
      <!-- 添加管理员模态框 -->
      <Modal v-model="addAdminModel" title="编辑信息" :loading="loading" @on-ok="addAdminOk(adminInfo)">
        <Form :model="addAdminInfo" label-position="right" :label-width="100">
          <FormItem label="登录名">
            <Input v-model="addAdminInfo.login_name"></Input>
          </FormItem>
          <FormItem label="管理员名">
            <Input v-model="addAdminInfo.name"></Input>
          </FormItem>
          <FormItem label="密码">
            <Input v-model="addAdminInfo.password"></Input>
          </FormItem>
        </Form>
      </Modal>
      <!-- 编辑管理员模态框 -->
      <Modal
        v-model="editAdminModel"
        title="编辑信息"
        :loading="loading"
        @on-ok="editAdminOk(adminInfo)"
      >
        <Form :model="adminInfo" label-position="right" :label-width="100">
          <FormItem label="登录名">
            <Input v-model="adminInfo.login_name"></Input>
          </FormItem>
          <FormItem label="管理员名">
            <Input v-model="adminInfo.name"></Input>
          </FormItem>
        </Form>
      </Modal>
      <!-- 修改密码模态框 -->
      <Modal v-model="changePassModel" title="修改密码" :loading="loading" @on-ok="changePassOk">
        <Form :model="passwordInfo" label-position="right" :label-width="100">
          <FormItem label="新密码">
            <Input v-model="passwordInfo.password1" type="password"></Input>
          </FormItem>
          <FormItem label="重复密码">
            <Input v-model="passwordInfo.password2" type="password"></Input>
          </FormItem>
        </Form>
      </Modal>
      <!-- 删除用户操作 -->
      <Modal v-model="deleteAdminModel" width="360">
        <p slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle"></Icon>
          <span>删除确认</span>
        </p>
        <div style="text-align:center">
          <p>删除该管理员后，该管理员无法进行登录和管理操作。</p>
          <p>是否继续删除</p>
        </div>
        <div slot="footer">
          <Button type="error" size="large" long @click="deleteAdminOk">删除</Button>
        </div>
      </Modal>
    </Card>
  </div>
</template>

<script>
import {
  getAdminList,
  editAdmin,
  changePassWord,
  deleteAdmin,
  addAdmin
} from '@/api/data'
import { mapActions } from 'vuex'
export default {
  name: 'manage_admin',
  data () {
    return {
      modalVisible: false,
      pagesize: 10,
      totalNum: 0,
      loading: true,
      adminList: [],
      adminsListTitle: [
        {
          title: '管理员ID',
          key: 'id'
        },
        {
          title: '登录名',
          key: 'login_name'
        },
        {
          title: '管理员名',
          key: 'name'
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
                      this.changePass(params.row.id)
                    }
                  }
                },
                '修改密码'
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
                        this.deleteAdmin(params.row.id)
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
      addAdminModel: false,
      addAdminInfo: {
        login_name: null,
        name: null,
        password: null
      },
      editAdminModel: false,
      adminInfo: {
        id: null,
        login_name: null,
        name: null
      },
      changePassModel: false,
      passwordInfo: {
        aid: null,
        password1: null,
        password2: null
      },
      deleteAdminModel: false,
      deleteAid: null
    }
  },
  methods: {
    ...mapActions(['handleLogOut']),
    getAdminMenuList (pageNum) {
      const vm = this
      return getAdminList(pageNum, vm.pagesize).then(res => {
        vm.showList(res.data.data)
      })
    },
    showList (info) {
      const vm = this
      vm.totalNum = info.adminCountTotal
      vm.adminList = info.adminList
    },
    addAdmin () {
      const vm = this
      vm.addAdminModel = true
    },
    addAdminOk () {
      const vm = this

      if (vm.addAdminInfo.login_name && vm.addAdminInfo.login_name.length < 6) {
        vm.$Message.error('登录名长度不得小于6位！')
        vm.addUserSetNull()
        return false
      }
      if (
        !(
          vm.addAdminInfo.name &&
          (vm.addAdminInfo.name.length > 2 || vm.addAdminInfo.name.length < 10)
        )
      ) {
        vm.$Message.error('管理员名长度范围2-10位！')
        vm.addUserSetNull()
        return false
      }
      if (!/^\w{8,}$/.test(vm.addAdminInfo.password)) {
        vm.$Message.error('密码长度不得小于8位！')
        vm.addUserSetNull()
        return false
      }

      addAdmin(vm.addAdminInfo)
        .then(res => {
          vm.$Message.success(res.data.message)
          this.getAdminMenuList(1)
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message || '添加失败！')
        })

      vm.addUserSetNull()
    },
    addUserSetNull () {
      const vm = this
      vm.addAdminInfo = {
        login_name: null,
        name: null,
        password: null
      }
      vm.addAdminModel = false
    },
    editInfo (idx) {
      const vm = this
      vm.editAdminModel = true
      vm.adminInfo = Object.assign({}, vm.adminList[idx])
    },
    editAdminOk (adminInfo) {
      const vm = this
      editAdmin(adminInfo)
        .then(res => {
          vm.$Message.success(res.data.message)
          vm.adminList = vm.adminList.map(item => {
            return item.id === adminInfo.id ? adminInfo : item
          })
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message || '修改失败！')
        })
      vm.editAdminModel = false
    },
    changePass (changePassId) {
      const vm = this
      vm.passwordInfo.aid = changePassId
      vm.changePassModel = true
    },
    changePassOk () {
      const vm = this
      if (
        !(
          vm.passwordInfo.password1 === vm.passwordInfo.password2 &&
          /^\w{8,}$/.test(vm.passwordInfo.password1)
        )
      ) {
        vm.changePassModel = false
        vm.$Notice.error({
          title: '密码长度不足8位或两次输入的密码不同！'
        })
        vm.passwordInfo.password1 = null
        vm.passwordInfo.password2 = null
        return false
      }
      const changePassObj = {
        aid: vm.passwordInfo.aid,
        password: vm.passwordInfo.password1
      }
      changePassWord(changePassObj)
        .then(res => {
          vm.editAdminModel = false
          vm.$Message.success(res.data.message)
          if (changePassObj.aid === vm.$store.getters.CurrentUserId) {
            vm.handleLogOut().then(() => {
              vm.$router.push({
                name: 'login'
              })
            })
          }
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message || '修改失败！')
        })
      vm.changePassModel = false
      vm.passwordInfo.password1 = null
      vm.passwordInfo.password2 = null
    },
    deleteAdmin (aid) {
      const vm = this
      vm.deleteAdminModel = true
      vm.deleteAid = aid
    },
    deleteAdminOk () {
      const vm = this
      deleteAdmin(vm.deleteAid)
        .then(res => {
          vm.$Message.success(res.data.message)
          vm.getAdminMenuList(1)
        })
        .catch(err => {
          vm.$Message.error(err.response.data.message || '删除失败！')
        })
      vm.deleteAdminModel = false
    }
  },
  created () {
    this.getAdminMenuList(1)
  }
}
</script>

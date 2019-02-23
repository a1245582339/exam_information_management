import {
  adminLogin,
  userLogin,
  logout
} from '@/api/user'
import { setToken, getToken, removeTagNavListFromLocalstorage } from '@/libs/util'
import { Base64 } from 'js-base64'

export default {
  state: {
    userName: '',
    userId: '',
    token: getToken(),
    access: '',
    realNameAuth: null
  },
  mutations: {
    setUserId (state, id) {
      state.userId = id
    },
    setUserName (state, name) {
      state.userName = name
    },
    setAccess (state, access) {
      state.access = access
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setRealNameAuth (state, realNameAuth) {
      state.realNameAuth = realNameAuth
    }
  },
  getters: {
    CurrentUserId: state => state.userId,
    CurrentUserNameAuthStatus: state => state.realNameAuth
  },
  actions: {
    // 管理员登录
    handleAdminLogin ({ commit }, { userName, password }) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        adminLogin({
          userName,
          password
        }).then(res => {
          const data = res.data
          commit('setToken', data.data.token)
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 用户登录
    handleUserLogin ({ commit }, { userName, password }) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        userLogin({
          userName,
          password
        }).then(res => {
          const data = res.data
          commit('setToken', data.data.token)
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('setToken', '')
          commit('setUserName', '')
          commit('setUserId', '')
          commit('setAccess', [])
          commit('setRealNameAuth', null)
          removeTagNavListFromLocalstorage()
          resolve()
        }).catch(err => {
          reject(err)
        })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          const data = JSON.parse(Base64.decode(state.token.split('.')[1]))
          commit('setUserName', data.name)
          commit('setUserId', data.id)
          commit('setAccess', [data.role])
          resolve(data)
        } catch (error) {
          reject(error)
        }
      })
    },
    getUserRealNameAuthStatus ({ state, commit }) {
      return new Promise((resolve, reject) => {
        const data = JSON.parse(Base64.decode(state.token.split('.')[1]))
        commit('setRealNameAuth', data.realNameAuth)
        resolve()
      })
    },
    // 修改用户实名认证状态
    setUserRealNameAuth ({ commit }, { authStatus }) {
      return new Promise((resolve, reject) => {
        commit('setRealNameAuth', authStatus)
        resolve()
      })
    }
  }
}

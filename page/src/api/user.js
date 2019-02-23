import axios from '@/libs/api.request'

// 注销
export const logout = () => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}

// 普通用户登录
export const userLogin = ({ userName, password }) => {
  const data = {
    login_name: userName,
    password: password
  }
  return axios.request({
    url: 'userLogin',
    data,
    method: 'post'
  })
}

// 管理员登录
export const adminLogin = ({ userName, password }) => {
  const data = {
    login_name: userName,
    password: password
  }
  return axios.request({
    url: 'adminLogin',
    data,
    method: 'post'
  })
}

// 注册新用户
export const userReg = (regObj) => {
  return axios.request({
    url: 'regUser',
    method: 'put',
    data: regObj
  })
}

export const getUnreadCount = () => {
  return axios.request({
    url: 'message/count',
    method: 'get'
  })
}

export const getMessage = () => {
  return axios.request({
    url: 'message/init',
    method: 'get'
  })
}

export const getContentByMsgId = msg_id => {
  return axios.request({
    url: 'message/content',
    method: 'get',
    params: {
      msg_id
    }
  })
}

export const hasRead = msg_id => {
  return axios.request({
    url: 'message/has_read',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const removeReaded = msg_id => {
  return axios.request({
    url: 'message/remove_readed',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const restoreTrash = msg_id => {
  return axios.request({
    url: 'message/restore',
    method: 'post',
    data: {
      msg_id
    }
  })
}

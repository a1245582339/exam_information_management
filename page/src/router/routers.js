import Main from '@/components/main'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/adminLogin',
    name: 'adminLogin',
    meta: {
      title: 'adminLogin - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/adminLogin/adminLogin.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      // hideInMenu: true,
      // notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          // hideInMenu: true,
          title: '首页',
          // notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
  {
    path: '/manage_admin',
    name: 'manage_admin',
    meta: {
      access: [1],
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'manage_admin',
        name: 'manage_admin_child',
        meta: {
          icon: 'md-settings',
          title: '管理员操作'
        },
        component: () => import('@/view/manage-admin/manage-admin.vue')
      }
    ]
  },
  {
    path: '/manage_exam_category',
    name: 'manage_exam_category',
    meta: {
      access: [1, 2],
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'manage_exam_category',
        name: 'manage_exam_category_child',
        meta: {
          icon: 'md-paper',
          title: '考试分类管理'
        },
        component: () => import('@/view/manage_exam_category/manage_exam_category.vue')
      }
    ]
  },
  {
    path: '/exam_info_manage',
    name: 'exam_info_manage',
    meta: {
      access: [1, 2],
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'exam_info_manage_child',
        name: 'exam_info_manage_child',
        meta: {
          icon: 'md-paper',
          title: '考试信息管理'
        },
        component: () => import('@/view/exam_info_manage/exam_info_manage.vue')
      }
    ]
  },
  {
    path: '/user_info_manage',
    name: 'user_info_manage',
    meta: {
      access: [1, 2],
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'user_info_manage_child',
        name: 'user_info_manage_child',
        meta: {
          icon: 'md-paper',
          title: '用户信息管理'
        },
        component: () => import('@/view/user_info_manage/user_info_manage.vue')
      }
    ]
  },
  {
    path: '/sign_exam',
    name: 'sign_exam',
    meta: {
      access: ['common_user'],
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'sign_exam_child',
        name: 'sign_exam_child',
        meta: {
          icon: 'md-paper',
          title: '预约考试'
        },
        component: () => import('@/view/sign_exam/sign_exam.vue')
      }
    ]
  },
  {
    path: '/my_sign_exam',
    name: 'my_sign_exam',
    meta: {
      access: ['common_user'],
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'my_sign_exam_child',
        name: 'my_sign_exam_child',
        meta: {
          icon: 'md-paper',
          title: '我的预约'
        },
        component: () => import('@/view/my_sign_exam/my_sign_exam.vue')
      }
    ]
  },
  {
    path: '/personal_info',
    name: 'personal_info',
    meta: {
      access: ['common_user'],
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'personal_info_child',
        name: 'personal_info_child',
        meta: {
          icon: 'md-paper',
          title: '我的资料'
        },
        component: () => import('@/view/personal_info/personal_info.vue')
      }
    ]
  },
  {
    path: '/argu',
    name: 'argu',
    meta: {
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'params/:id',
        name: 'params',
        meta: {
          icon: 'md-flower',
          title: route => `{{ params }}-${route.params.id}`,
          notCache: true,
          beforeCloseName: 'before_close_normal'
        },
        component: () => import('@/view/argu-page/params.vue')
      },
      {
        path: 'query',
        name: 'query',
        meta: {
          icon: 'md-flower',
          title: route => `{{ query }}-${route.query.id}`,
          notCache: true
        },
        component: () => import('@/view/argu-page/query.vue')
      }
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]

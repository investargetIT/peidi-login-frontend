import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: $t("menus.pureLogin"),
      showLink: false,
      rank: 101
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: $t("status.pureLoad"),
      showLink: false,
      rank: 102
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  },
  // 下面是一个无layout菜单的例子（一个全屏空白页面），因为这种情况极少发生，所以只需要在前端配置即可（配置路径：src/router/modules/remaining.ts）
  {
    path: "/empty",
    name: "Empty",
    component: () => import("@/views/empty/index.vue"),
    meta: {
      title: $t("menus.pureEmpty"),
      showLink: false,
      rank: 103
    }
  },
  {
    path: "/account-settings",
    name: "AccountSettings",
    component: () => import("@/views/account-settings/index.vue"),
    meta: {
      title: $t("buttons.pureAccountSettings"),
      showLink: false,
      rank: 104
    }
  },
  // 招聘
  {
    path: "/recruitment",
    name: "Recruitment",
    component: () => import("@/views/recruitment/index.vue"),
    meta: {
      title: "招聘",
      showLink: false,
      rank: 105
    }
  },
  {
    path: "/recruitment-list",
    name: "RecruitmentList",
    component: () => import("@/views/recruitment-list/index.vue"),
    meta: {
      title: "招聘列表",
      showLink: false,
      rank: 106
    }
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: () => import("@/views/resetPassword/index.vue"),
    meta: {
      title: "重置密码",
      showLink: false,
      rank: 107
    }
  }
] satisfies Array<RouteConfigsTable>;

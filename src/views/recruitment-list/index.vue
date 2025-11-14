<script lang="ts" setup>
//@ts-ignore
import { ref, watch } from "vue";
import { getAertxInfoPage, downloadFile } from "@/api/recruitment";
import { ElMessage } from "element-plus";

interface User {
  name: string;
  phone: string;
  blobData: string;
}

// const tableData: User[] = [
//   {
//     name: "张三",
//     phone: "13800000000",
//     blobData: new Blob(["12345678901234567890123456789012"], {
//       type: "text/plain"
//     })
//   }
// ];
const tableData = ref<User[]>([]);
const sourceTableData = ref<User[]>([]);

getAertxInfoPage({
  pageNo: 1,
  pageSize: 9999
}).then(res => {
  if (res?.code === 200) {
    console.log("getAertxInfoPage:", res?.data);
    const tableTemp = [];
    res?.data?.records?.forEach(item => {
      tableTemp.push({
        name: item.userName || "",
        phone: item.mobile || "",
        blobData: item.content || ""
      });
    });
    sourceTableData.value = tableTemp.reverse();
    tableData.value = sourceTableData.value;
  } else {
    ElMessage.error(res?.msg || "获取文件失败");
  }
});

const handleDownload = (index: number, row: User) => {
  console.log(index, row);
  // downloadFile({
  //   objectName: row.blobData
  // }).then(res => {
  //   if (res) {
  //     console.log("downloadFile:", res);
  //     const blob = new Blob([res], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `${row.name}-${row.phone}.xlsx`;

  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   } else {
  //     ElMessage.error(res?.msg || "下载文件失败");
  //   }
  // });
  try {
    const a = document.createElement("a");
    a.href = `https://api.peidigroup.cn/ui/common/download?objectName=${row.blobData}`;
    a.download = `${row.name}-${row.phone}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    ElMessage.error(err?.msg || "下载文件失败");
  }
};

//#region 搜索逻辑
const searchText = ref("");
//监听搜索文本变化
watch(
  searchText,
  (newVal, oldVal) => {
    // 空值代表全部
    if (!newVal) {
      tableData.value = sourceTableData.value;
      return;
    }
    if (newVal !== oldVal) {
      // 过滤表格数据
      tableData.value = sourceTableData.value.filter(
        item => item.name.includes(newVal) || item.phone.includes(newVal)
      );
    }
  },
  { immediate: true, deep: true }
);
//#endregion
</script>

<template>
  <div class="p-[20px]">
    <el-card>
      <!-- 搜索栏 -->
      <div class="mb-[20px]">
        <el-input
          v-model="searchText"
          style="width: 240px"
          placeholder="输入姓名或手机号搜索"
        />
        <span class="ml-[10px] text-[14px]"
          >共 {{ tableData.length }} 条记录</span
        >
      </div>
      <el-table
        :data="tableData"
        style="width: 100%"
        border
        stripe
        :header-row-style="{ color: '#000' }"
        :height="800"
      >
        <!-- <el-table-column type="index" label="序号" width="55" /> -->
        <el-table-column
          prop="name"
          label="姓名"
          width="180"
          :resizable="false"
        />
        <el-table-column
          prop="phone"
          label="手机"
          width="180"
          :resizable="false"
        />
        <el-table-column label="操作" :resizable="false">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleDownload(scope.$index, scope.row)"
            >
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

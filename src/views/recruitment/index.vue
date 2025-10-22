<script lang="ts" setup>
//@ts-ignore
import { reactive, ref } from "vue";
import { ElMessage, type FormInstance } from "element-plus";
import { PFLIST } from "./constants";
import {
  processFormAndDownloadExcel,
  moveToErr,
  isDevEnv,
  modifyExcel
} from "./utils";
import type { TabsPaneContext } from "element-plus";
import { setAertxInfo, uploadFile } from "@/api/recruitment";

const activeName = ref("first");
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event);
};

const form = reactive({
  name: "",
  phone: ""
});
const formRef = ref<FormInstance>();
const rules = reactive({
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  phone: [{ required: true, message: "请输入手机号", trigger: "blur" }]
});
const isSubmit = ref(false);

PFLIST.forEach((item, index) => {
  form[index] = "";
  rules[index] = [{ required: true, message: "请选择", trigger: "change" }];
});

const submitForm = async (formEl: FormInstance | undefined) => {
  // mockButtonClick();

  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log("submit!");
      console.log("form:", form);
      // activeName.value = "second";
      isSubmit.value = true;
      // processFormAndDownloadExcel(form);

      modifyExcel(form).then(res => {
        if (res) {
          // console.log("blobData:", res);
          let formData = new FormData();
          formData.append(
            "file",
            res,
            "_" + form.name + "-" + form.phone + ".xlsx"
          );
          // console.log("formData:", formData.get("file"));
          uploadFile({
            file: formData.get("file")
          }).then(res => {
            if (res?.code === 200) {
              // ElMessage.success("文件上传成功");
              setAertxInfo({
                userName: form.name,
                mobile: form.phone,
                content: res?.data || ""
              }).then(res => {
                if (res?.code === 200) {
                  ElMessage.success("提交成功");
                } else {
                  ElMessage.error(res?.msg || "提交失败");
                }
              });
            } else {
              ElMessage.error(res?.msg || "文件上传失败");
            }
          });
        }
      });
    } else {
      console.log("error submit!", fields);
      moveToErr();
    }
  });
};

const mockButtonClick = () => {
  Object.keys(form).forEach(key => {
    // 随机生成1,2,3
    form[key] = Math.floor(Math.random() * 3 + 1);
    // form[key] = 1;
  });
};
</script>

<template>
  <div class="flex justify-center items-center">
    <el-card style="width: 480px">
      <el-tabs
        v-model="activeName"
        type="card"
        class="demo-tabs"
        @tab-click="handleClick"
      >
        <el-tab-pane label="问卷" name="first">
          <div>
            <div>16PF人格测评分析表</div>
            <div class="test-instructions">
              <p>答题要求</p>

              <p>
                本测验共有187道题目，都是有关个人的兴趣和态度等问题。每个人对这些问题是会有不同的看法的，回答也是不同的，因而对问题的如何回答，并没有"对"与"不对"之分，只是表明你对这些问题的态度，请你尽量表达个人的意见，不要有所顾忌。
              </p>

              <p>
                本测验每一题都有三个可供选择的答案（A、B、C），请在蓝色方格内填写你所选择的答案并用"
                1 "表示。
              </p>

              <p>应当记住的是：</p>

              <div class="instructions-list">
                <div class="instruction-item">
                  1. 每一题只能选择一个答案，填写只能填" ";
                </div>
                <div class="instruction-item">2. 不可漏掉任何题;</div>
                <div class="instruction-item">3. 尽量不选折中性答案;</div>
                <div class="instruction-item">
                  4.
                  本测验不计时间，但应当凭自己的直觉反应进行作答，不要迟疑不决，拖延时间。一定要在一个小时内完成整个测验;
                </div>
                <div class="instruction-item">
                  5.
                  有些题目你可能从未思考过，或者感到不太容易回答。对于这样的题目，同样要求你作出一种倾向性的选择。
                </div>
              </div>
            </div>
            <el-button v-if="isDevEnv()" type="primary" @click="mockButtonClick"
              >随机填写</el-button
            >
            <el-form-item>
              <el-button
                v-if="isDevEnv()"
                type="primary"
                style="margin-top: 5px"
                @click="submitForm(formRef)"
                >提交</el-button
              >
            </el-form-item>
            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              :disabled="isSubmit"
              label-width="auto"
              style="max-width: 600px"
              label-position="top"
            >
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" />
              </el-form-item>
              <el-form-item label="手机" prop="phone">
                <el-input
                  v-model="form.phone"
                  oninput="value=value.replace(/[^\d.]/g,'')"
                />
              </el-form-item>
              <el-form-item
                v-for="(pfItem, index) in PFLIST"
                :key="pfItem.q"
                :label="`${index + 1}、${pfItem.q}`"
                :prop="index.toString()"
              >
                <el-radio-group v-model="form[index]">
                  <el-radio
                    v-for="(value, index) in pfItem.a"
                    :key="value"
                    :value="index + 1"
                    >{{ value }}</el-radio
                  >
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitForm(formRef)"
                  >提交</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="isDevEnv()" label="结果" name="second">
          <el-button
            type="primary"
            :disabled="!isSubmit"
            @click="processFormAndDownloadExcel(form)"
            >点击下载</el-button
          >
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.test-instructions {
  padding: 20px;
  margin: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.test-instructions p {
  margin-bottom: 15px;
}

.instructions-list {
  margin-left: 20px;
}

.instruction-item {
  margin-bottom: 10px;
}
</style>

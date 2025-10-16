// 根据答案修改Excel文件内容
import * as ExcelJS from "exceljs";
import { nextTick } from "vue";

/**
 * 根据表单数据修改Excel文件中的答案
 * @param form 表单数据对象，格式为：{0: '1', 1: '2', ...}，其中1代表A选项，2代表B选项，3代表C选项
 * @returns Promise<Blob> 修改后的Excel文件Blob对象
 */
export const modifyExcel = async (
  form: Record<string, string>
): Promise<Blob> => {
  try {
    // 读取本地Excel文件
    const response = await fetch(
      process.env.NODE_ENV === "development"
        ? "/src/views/recruitment/constants/16PF.xlsx"
        : "http://login.peidigroup.cn/16PF.xlsx"
    );
    if (!response.ok) {
      throw new Error("无法加载Excel文件");
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // 获取"电子填表"工作表
    const worksheet = workbook.getWorksheet("电子填表");
    if (!worksheet) {
      throw new Error('未找到"电子填表"工作表');
    }

    // 遍历表单数据，处理每个问题的答案
    Object.keys(form).forEach(key => {
      // 获取题号和答案
      const questionIndex = parseInt(key);
      const answer = form[key].toString();

      // 验证数据有效性
      if (
        isNaN(questionIndex) ||
        (!["1", "2", "3"].includes(answer) && answer !== "")
      ) {
        console.warn(`无效的表单数据: key=${key}, value=${answer}`);
        return;
      }

      // 计算题目在Excel中的行号
      // 根据Excel结构，第1题在第17行，第2题在第19行，以此类推
      // 行号 = 17 + (题号 - 1) * 2
      const rowNumber = 17 + questionIndex * 2;

      // 获取题目行
      const row = worksheet.getRow(rowNumber);

      if (!row) {
        console.warn(`未找到题号 ${questionIndex + 1} 的行`);
        return;
      }

      // 清除该题目所有选项的答案（设为空）
      // row.getCell(3).value = ""; // C列 - A选项答案位置
      // row.getCell(5).value = ""; // E列 - B选项答案位置
      // row.getCell(7).value = ""; // G列 - C选项答案位置

      // 根据答案在对应位置填写1
      if (answer === "1") {
        // A选项 - 在C列填写1
        row.getCell(3).value = 1;
      } else if (answer === "2") {
        // B选项 - 在E列填写1
        row.getCell(5).value = 1;
      } else if (answer === "3") {
        // C选项 - 在G列填写1
        row.getCell(7).value = 1;
      }

      // 填充姓名
      worksheet.getCell(3, 3).value = form.name;

      // workbook.calcProperties.fullCalcOnLoad = true;

      // console.log(
      //   `第${questionIndex + 1}题答案设置为: ${answer}, 行号: ${rowNumber}`
      // );
    });

    // 生成修改后的Excel文件
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    return blob;
  } catch (error) {
    console.error("处理Excel文件时出错:", error);
    throw error;
  }
};

/**
 * 下载Excel文件
 * @param blob Excel文件的Blob对象
 * @param filename 下载的文件名
 */
export const downloadExcel = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 处理表单数据并下载Excel文件
 * @param form 表单数据对象
 * @returns Promise<void>
 */
export const processFormAndDownloadExcel = async (
  form: Record<string, string>
): Promise<void> => {
  try {
    const blob = await modifyExcel(form);
    downloadExcel(blob, "16PF_已填写.xlsx");
  } catch (error) {
    console.error("处理和下载Excel文件失败:", error);
    throw error;
  }
};

/**
 * 解析16PF剖图2工作表
 * @param data workbook对象，包含Excel文件内容
 * @returns Promise<object> 解析后的结果对象
 */
export async function parse16PFSheet2(data: ExcelJS.Workbook) {
  const workbook = data;

  const sheet = workbook.getWorksheet("剖图2");
  const result = {
    basicInfo: {},
    personalityFactors: [],
    secondaryFactors: {},
    applicationFactors: {},
    personalitySummary: {},
    factorDetails: []
  };

  // 解析基本信息
  result.basicInfo = {
    name: sheet.getCell("E5").value,
    gender: sheet.getCell("I5").value,
    age: sheet.getCell("M5").value,
    education: sheet.getCell("R5").value,
    maritalStatus: sheet.getCell("V5").value,
    position: sheet.getCell("E6").value,
    unit: sheet.getCell("I8").value,
    testDate: sheet.getCell("E7").value
  };

  // 解析人格因素得分
  const factors = [
    { factor: "乐群性", code: "A", row: 9 },
    { factor: "聪慧性", code: "B", row: 10 },
    { factor: "稳定性", code: "C", row: 11 },
    { factor: "恃强性", code: "E", row: 12 },
    { factor: "兴奋性", code: "F", row: 13 },
    { factor: "有恒性", code: "G", row: 14 },
    { factor: "敢为性", code: "H", row: 15 },
    { factor: "敏感性", code: "I", row: 16 },
    { factor: "怀疑性", code: "L", row: 17 },
    { factor: "幻想性", code: "M", row: 18 },
    { factor: "世故性", code: "N", row: 19 },
    { factor: "忧虑性", code: "O", row: 20 },
    { factor: "实验性", code: "Q1", row: 21 },
    { factor: "独立性", code: "Q2", row: 22 },
    { factor: "自律性", code: "Q3", row: 23 },
    { factor: "紧张性", code: "Q4", row: 24 }
  ];

  factors.forEach(f => {
    result.personalityFactors.push({
      factor: f.factor,
      code: f.code,
      rawScore: sheet.getCell(`D${f.row}`).value,
      standardScore: sheet.getCell(`E${f.row}`).value
    });
  });

  // 解析次级人格因素
  result.secondaryFactors = {
    emotionalAlertness: sheet.getCell("AB10").value,
    introvertExtrovert: sheet.getCell("AG10").value,
    adaptationAnxiety: sheet.getCell("AB13").value,
    timidityDecisiveness: sheet.getCell("AG13").value
  };

  // 解析应用因素
  result.applicationFactors = {
    mentalHealth: {
      score: sheet.getCell("AG16").value,
      description: "总分在4-40之间，平均为22分，低于12分者仅占10%"
    },
    professionalAchievement: {
      score: sheet.getCell("AG18").value,
      description: "总分在10-100之间，平均为55分，67分以上者应有其成就"
    },
    creativity: {
      score: sheet.getCell("AG20").value,
      description: "总分在15-150之间,平均83,88以上创造力强，应有其成就"
    },
    growthPotential: {
      score: sheet.getCell("AG22").value,
      description: "总分在4-40之间，平均为22，27以上者，则有成功的希望"
    }
  };

  // 解析性格总结
  result.personalitySummary = {
    characteristics: sheet.getCell("E30").value,
    typicalOccupation: sheet.getCell("E31").value
  };

  // 解析因子详情（需要根据实际表格结构调整行号）
  for (let i = 36; i <= 51; i++) {
    const factorName = sheet.getCell(`B${i}`).value;
    if (factorName) {
      result.factorDetails.push({
        factor: factorName,
        scoreLevel: sheet.getCell(`E${i}`).value,
        typicalCharacteristics: sheet.getCell(`F${i}`).value
      });
    }
  }

  return result;
}

/**
 * 自动定位到表单报错项
 */
export const moveToErr = () => {
  nextTick(() => {
    let isError = document.getElementsByClassName("is-error");
    if (isError.length) {
      isError[0].scrollIntoView({
        block: "center",
        behavior: "smooth"
      });
      // 这个当滑动到报错项之后自动获取输入框的焦点，方便用户直接进行输入，延迟 800ms 是因为需要都能到定位成功后在进行获取焦点体验更好一些
      setTimeout(() => {
        if (isError[0].previousElementSibling.querySelector("input")) {
          isError[0].previousElementSibling.querySelector("input").focus();
        }
      }, 800);
    }
  });
};

/**
 * 判断是否是开发环境
 */
export const isDevEnv = () => {
  return process.env.NODE_ENV === "development";
};

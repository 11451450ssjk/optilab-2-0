"use strict";

(function () {
  const catalog = [
  {
    "id": "hust-exact-course-01",
    "year": 1,
    "term": 1,
    "termLabel": "大一上 2026秋",
    "title": "专业认知实验",
    "focus": "光路的调试、传感器认知（Arduino 超声测距：SR04 测距 + LCD1602 显示 + 蜂鸣器/LED 报警）、光学仪器的认知等",
    "scope": "hust",
    "catalogCode": "HUST-UG-01",
    "officialCredits": "1",
    "officialHours": "1周",
    "creditHours": "1周 / 1学分",
    "location": "A406、A402、东九B503、东十二F201",
    "evidenceGrades": [
      "A 官网原文"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "experiments": [
      {
        "id": "hust-exact-01-01",
        "name": "光路的调试",
        "sim": "optics",
        "formula": "L = Σnᵢlᵢ",
        "description": "完成光源、透镜、反射镜和观察面的共轴调节，使光斑位置、方向和像面满足后续测量要求。",
        "note": "必做",
        "requirement": "必做",
        "location": "A406、A402、东九B503、东十二F201",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 2,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-02",
        "name": "传感器认知（Arduino 超声测距：SR04 测距 + LCD1602 显示 + 蜂鸣器/LED 报警）",
        "sim": "embedded",
        "formula": "d = cΔt/2",
        "description": "使用 Arduino、超声测距模块、LCD 和报警电路完成距离采样、显示与阈值判断。",
        "note": "必做",
        "requirement": "必做",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 3,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-03",
        "name": "光学仪器的认知",
        "sim": "optics",
        "formula": "M = fₒ/fₑ",
        "description": "认识望远镜、显微镜、分光计、功率计等光学仪器的结构、量程和使用边界。",
        "note": "必做",
        "requirement": "必做",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 4,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-04",
        "name": "数字建模及制造",
        "sim": "integrated",
        "formula": "CAD → 切片 → 制造",
        "description": "完成三维建模、切片参数设置、增材制造和尺寸复核。",
        "note": "选做（官方写“7 选 2”，但列表只有 6 个不重名，第 7 个待核）",
        "requirement": "选做",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 5,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-05",
        "name": "立体视频拍摄与显示",
        "sim": "imaging",
        "formula": "I = I(x,y,θ)",
        "description": "完成立体图像采集、视差控制和显示效果评价。",
        "note": "选做（官方写“7 选 2”，但列表只有 6 个不重名，第 7 个待核）",
        "requirement": "选做",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 6,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-06",
        "name": "语音光信号传输",
        "sim": "communication",
        "formula": "m(t)=A[1+km(t)]cos(ωt)",
        "description": "将语音调制到光载波上，完成光电接收、解调与音质评价。",
        "note": "选做（官方写“7 选 2”，但列表只有 6 个不重名，第 7 个待核）",
        "requirement": "选做",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 7,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-07",
        "name": "红外成像",
        "sim": "imaging",
        "formula": "L = εσT⁴",
        "description": "使用红外相机观察物体温度分布并分析发射率、背景和环境反射影响。",
        "note": "选做（官方写“7 选 2”，但列表只有 6 个不重名，第 7 个待核）",
        "requirement": "选做",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 8,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-08",
        "name": "电子元器件及 LED 认识",
        "sim": "circuit",
        "formula": "U = IR",
        "description": "识别电阻、电容、二极管和 LED 等元件，测量基本伏安关系与极性。",
        "note": "选做（官方写“7 选 2”，但列表只有 6 个不重名，第 7 个待核）",
        "requirement": "选做",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 9,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-09",
        "name": "太阳能与光学仪器的使用",
        "sim": "solar",
        "formula": "P = VI",
        "description": "测量太阳能电池输出特性和光学仪器读数，比较光强、距离与输出关系。",
        "note": "选做（官方写“7 选 2”，但列表只有 6 个不重名，第 7 个待核）",
        "requirement": "选做",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 10,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-10",
        "name": "门禁报警器",
        "sim": "embedded",
        "formula": "Alarm = 1[V_sensor > V_th]",
        "description": "综合传感器、控制器、显示和报警执行器，完成门禁逻辑与阈值测试。",
        "note": "综合大作业（3 选 1）",
        "requirement": "综合大作业",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 11,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-11",
        "name": "炫彩流水呼吸灯",
        "sim": "embedded",
        "formula": "D = T_on / T",
        "description": "利用 GPIO、延时或 PWM 控制多路 LED 的流水与呼吸效果。",
        "note": "综合大作业（3 选 1）",
        "requirement": "综合大作业",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 12,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-01-12",
        "name": "基于智能平台的机器人/小车",
        "sim": "embedded",
        "formula": "u(t) = Kp e(t)",
        "description": "完成智能平台的运动控制、循迹或避障任务并记录传感器响应。",
        "note": "综合大作业（3 选 1）",
        "requirement": "综合大作业",
        "location": "",
        "evidenceGrade": "A 官网原文",
        "officialCourseName": "专业认知实验",
        "catalogCode": "HUST-UG-01",
        "creditHours": "1周 / 1学分",
        "sourceRow": 13,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-02",
    "year": 1,
    "term": 2,
    "termLabel": "大一下 2027春",
    "title": "物理实验（上）",
    "focus": "电子元件伏安特性、转动惯量与杨氏模量的测量、示波器的使用等",
    "scope": "hust",
    "catalogCode": "HUST-UG-02",
    "officialCredits": "2",
    "officialHours": "32学时",
    "creditHours": "32学时 / 2学分",
    "location": "科技楼北楼物理实验教学中心（第1周：东十二F301）",
    "evidenceGrades": [
      "A 总课表原件"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "experiments": [
      {
        "id": "hust-exact-02-01",
        "name": "电子元件伏安特性",
        "sim": "semiconductor",
        "formula": "I = Is(e^(qU/kT) − 1)",
        "description": "测量电阻、二极管等元件的伏安曲线，判断线性和非线性工作区。",
        "note": "选课制，每学期只开一批；本表为总课表2（11-17周）实开项目，全池更大",
        "requirement": "课程实开项目",
        "location": "科技楼北楼物理实验教学中心（第1周：东十二F301）",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 14,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-02",
        "name": "转动惯量与杨氏模量的测量",
        "sim": "measurement",
        "formula": "I=Σmr²；E=FL/(SΔL)",
        "description": "测量转动惯量和材料弹性模量，分析质量分布、形变和测量不确定度。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 15,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-03",
        "name": "示波器的使用",
        "sim": "oscilloscope",
        "formula": "f = 1/T",
        "description": "学习探头补偿、触发、时基、垂直档位和周期信号参数测量。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 16,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-04",
        "name": "比热容和热导率的测量",
        "sim": "measurement",
        "formula": "c=Q/(mΔT)；Φ=-kA(dT/dx)",
        "description": "测量材料吸热和传热过程，提取比热容与热导率。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 17,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-05",
        "name": "人体生物信号测量",
        "sim": "measurement",
        "formula": "SNR = 20log(Vs/Vn)",
        "description": "采集脉搏、心电或肌电等生物信号，分析噪声、滤波和电极接触影响。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 18,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-06",
        "name": "分光计的使用",
        "sim": "grating",
        "formula": "d sinθ = kλ",
        "description": "完成分光计调平、准直和读数，测量棱镜角或光栅衍射角。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 19,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-07",
        "name": "密立根油滴实验",
        "sim": "measurement",
        "formula": "q = mgd/U",
        "description": "通过油滴平衡电压和运动速度测量基本电荷量。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 20,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-08",
        "name": "光的干涉与衍射",
        "sim": "double-slit",
        "formula": "Δx = λL/d",
        "description": "观察双缝、单缝或圆孔图样，测量条纹间距或衍射角并验证波动关系。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 21,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-09",
        "name": "单摆与三线摆",
        "sim": "measurement",
        "formula": "T = 2π√(I/mgd)",
        "description": "测量周期与摆长关系，验证单摆或三线摆动力学模型。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 22,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-10",
        "name": "音叉与弦的受迫振动",
        "sim": "oscilloscope",
        "formula": "f=(1/2L)√(T/μ)",
        "description": "测量受迫振动频率、驻波节点和共振响应。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 23,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-02-11",
        "name": "波尔共振与混沌摆",
        "sim": "oscillator",
        "formula": "θ″+γθ′+ω₀²sinθ=Fcosωt",
        "description": "观察受迫振动、共振曲线和非线性混沌现象。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（上）",
        "catalogCode": "HUST-UG-02",
        "creditHours": "32学时 / 2学分",
        "sourceRow": 24,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-03",
    "year": 2,
    "term": 1,
    "termLabel": "大二上 2027秋",
    "title": "物理实验（下）",
    "focus": "交直流电桥的应用、声速与光速测量、稳态法测量导热系数等",
    "scope": "hust",
    "catalogCode": "HUST-UG-03",
    "officialCredits": "1.5",
    "officialHours": "24学时",
    "creditHours": "24学时 / 1.5学分",
    "location": "科技楼北楼物理实验教学中心",
    "evidenceGrades": [
      "A 总课表原件"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "experiments": [
      {
        "id": "hust-exact-03-01",
        "name": "交直流电桥的应用",
        "sim": "circuit",
        "formula": "Rx = R1R3/R2",
        "description": "使用直流和交流电桥测量电阻、电感或电容，分析平衡条件和灵敏度。",
        "note": "总课表2（11-16周）实开 6 项；学生帖另提到“多功能太阳能电池特性”“万用表组装”，说明池子更大",
        "requirement": "课程实开项目",
        "location": "科技楼北楼物理实验教学中心",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（下）",
        "catalogCode": "HUST-UG-03",
        "creditHours": "24学时 / 1.5学分",
        "sourceRow": 25,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-03-02",
        "name": "声速与光速测量",
        "sim": "measurement",
        "formula": "v=Δx/Δt；c=fλ",
        "description": "通过相位差、传播时间或调制频率测量声速和光速。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（下）",
        "catalogCode": "HUST-UG-03",
        "creditHours": "24学时 / 1.5学分",
        "sourceRow": 26,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-03-03",
        "name": "稳态法测量导热系数",
        "sim": "measurement",
        "formula": "λ=Qd/(AΔT)",
        "description": "建立稳态温度梯度并测量热流、厚度和温差，计算热导率。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（下）",
        "catalogCode": "HUST-UG-03",
        "creditHours": "24学时 / 1.5学分",
        "sourceRow": 27,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-03-04",
        "name": "光电效应与弗兰克-赫兹实验",
        "sim": "photoelectric",
        "formula": "hν=eUₐ+W",
        "description": "测量截止电压或弗兰克-赫兹电流峰，验证量子化能量交换。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（下）",
        "catalogCode": "HUST-UG-03",
        "creditHours": "24学时 / 1.5学分",
        "sourceRow": 28,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-03-05",
        "name": "核磁共振实验",
        "sim": "measurement",
        "formula": "ω = γB",
        "description": "观察核磁共振信号，测量共振频率与磁感应强度关系。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（下）",
        "catalogCode": "HUST-UG-03",
        "creditHours": "24学时 / 1.5学分",
        "sourceRow": 29,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-03-06",
        "name": "巨磁电阻效应及应用",
        "sim": "semiconductor",
        "formula": "ΔR/R = f(H)",
        "description": "测量磁场对器件电阻的影响，分析磁电阻响应和饱和特性。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 总课表原件",
        "officialCourseName": "物理实验（下）",
        "catalogCode": "HUST-UG-03",
        "creditHours": "24学时 / 1.5学分",
        "sourceRow": 30,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-04",
    "year": 2,
    "term": 1,
    "termLabel": "大二上 2027秋",
    "title": "电路测试实验",
    "focus": "直流试验单元的基本操作、故障检查、线性有源一端口网络等效参数的测定等",
    "scope": "hust",
    "catalogCode": "HUST-UG-04",
    "officialCredits": "1",
    "officialHours": "32学时",
    "creditHours": "32学时 / 1学分",
    "location": "西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X",
    "evidenceGrades": [
      "B 学生帖（三条互证）"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "experiments": [
      {
        "id": "hust-exact-04-01",
        "name": "直流试验单元的基本操作",
        "sim": "circuit",
        "formula": "U=IR",
        "description": "完成直流电源、电阻网络、仪表和安全接线的基本操作。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 31,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-02",
        "name": "故障检查",
        "sim": "circuit",
        "formula": "ΣI=0；ΣU=0",
        "description": "根据电压、电流和通断检查电路故障，定位开路、短路和接触不良。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 32,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-03",
        "name": "线性有源一端口网络等效参数的测定",
        "sim": "circuit",
        "formula": "Uoc = IscRth",
        "description": "测量开路电压和短路电流，建立戴维南或诺顿等效电路。",
        "note": "另有独立学生帖同名，互证",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 33,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-04",
        "name": "交流参数与互感的测量——三表法",
        "sim": "circuit",
        "formula": "Z=R+jX",
        "description": "使用三表法测量交流参数、互感和相位关系。",
        "note": "另有“华科电测实验四”帖标题同名，互证",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 34,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-05",
        "name": "日光灯电路与功率因数的提高",
        "sim": "circuit",
        "formula": "P=UIcosφ",
        "description": "测量日光灯电路功率因数并通过并联电容提高功率因数。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 35,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-06",
        "name": "三相电路中的电压、电流关系",
        "sim": "circuit",
        "formula": "U_L=√3U_P",
        "description": "测量三相星形和三角形连接的线电压、相电压与电流关系。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 36,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-07",
        "name": "示波器和函数发生器的使用",
        "sim": "oscilloscope",
        "formula": "f=1/T",
        "description": "设置函数发生器和示波器，测量频率、幅值、相位和波形。",
        "note": "另有“实验七”帖打“示波器使用”标签，互证",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 37,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-08",
        "name": "元件特性的示波器测量法",
        "sim": "oscilloscope",
        "formula": "i=u/R",
        "description": "利用示波器观察元件动态伏安特性，分析相位和频率影响。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 38,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-09",
        "name": "一阶电路的响应",
        "sim": "rc",
        "formula": "uC(t)=U₀e^(−t/RC)",
        "description": "记录RC电路充放电曲线并提取时间常数。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 39,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-10",
        "name": "二阶电路的响应",
        "sim": "rc",
        "formula": "s²+2αs+ω₀²=0",
        "description": "观察过阻尼、临界和欠阻尼响应，分析阻尼比和振荡频率。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 40,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-11",
        "name": "串联谐振电路",
        "sim": "frequency",
        "formula": "f₀=1/(2π√LC)",
        "description": "测量串联谐振频率、带宽和品质因数。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "B 学生帖（三条互证）",
        "officialCourseName": "电路测试实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "32学时 / 1学分",
        "sourceRow": 41,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-05",
    "year": 2,
    "term": 2,
    "termLabel": "大二下 2028春",
    "title": "电子测试与实验技术",
    "focus": "常用电子仪器的使用（示波器自检、正弦/方波参数、万用表、稳压电源、面包板）、半波整流电路输入输出波形观测、RC 移相网络 / 一阶高通网络相频特性测量等",
    "scope": "hust",
    "catalogCode": "HUST-UG-05",
    "officialCredits": "1.5",
    "officialHours": "48学时",
    "creditHours": "48学时 / 1.5学分",
    "location": "东十七楼 F303；教师 张大卫",
    "evidenceGrades": [
      "C 慕课+外系课件"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "experiments": [
      {
        "id": "hust-exact-05-01",
        "name": "常用电子仪器的使用（示波器自检、正弦/方波参数、万用表、稳压电源、面包板）",
        "sim": "oscilloscope",
        "formula": "f=1/T",
        "description": "完成示波器自检、信号参数测量、万用表、电源和面包板的基本训练。",
        "note": "前 3 项来自电信系汪小燕课件；后 6 项来自华科该课慕课章节，非光电专业口径",
        "requirement": "课程实开项目",
        "location": "东十七楼 F303；教师 张大卫",
        "evidenceGrade": "C 慕课+外系课件",
        "officialCourseName": "电子测试与实验技术",
        "catalogCode": "HUST-UG-05",
        "creditHours": "48学时 / 1.5学分",
        "sourceRow": 42,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-02",
        "name": "半波整流电路输入输出波形观测",
        "sim": "semiconductor",
        "formula": "Udc≈0.318Um",
        "description": "观察半波整流输入输出波形，分析导通角、纹波和负载影响。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 慕课+外系课件",
        "officialCourseName": "电子测试与实验技术",
        "catalogCode": "HUST-UG-05",
        "creditHours": "48学时 / 1.5学分",
        "sourceRow": 43,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-03",
        "name": "RC 移相网络 / 一阶高通网络相频特性测量",
        "sim": "rc",
        "formula": "φ=-arctan(ωRC)",
        "description": "测量一阶高通网络的幅频和相频特性。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 慕课+外系课件",
        "officialCourseName": "电子测试与实验技术",
        "catalogCode": "HUST-UG-05",
        "creditHours": "48学时 / 1.5学分",
        "sourceRow": 44,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-04",
        "name": "逻辑门电路参数与功能测试（TTL/CMOS 电平、三态门、OC 门线与、扇出）",
        "sim": "digital",
        "formula": "Y=f(A,B)",
        "description": "测量TTL/CMOS门电路逻辑电平、扇出、三态和线与特性。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 慕课+外系课件",
        "officialCourseName": "电子测试与实验技术",
        "catalogCode": "HUST-UG-05",
        "creditHours": "48学时 / 1.5学分",
        "sourceRow": 45,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-05",
        "name": "组合逻辑电路实验（与非门、或非门、表决电路、全加器）",
        "sim": "digital",
        "formula": "Y=f(A,B,C)",
        "description": "使用与非门、或非门等器件实现表决和全加器逻辑。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 慕课+外系课件",
        "officialCourseName": "电子测试与实验技术",
        "catalogCode": "HUST-UG-05",
        "creditHours": "48学时 / 1.5学分",
        "sourceRow": 46,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-06",
        "name": "触发器实验（CC4027、74LS74）",
        "sim": "digital",
        "formula": "Q(n+1)=f(Qn,X)",
        "description": "测量RS、JK或D触发器的状态转换和时序约束。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 慕课+外系课件",
        "officialCourseName": "电子测试与实验技术",
        "catalogCode": "HUST-UG-05",
        "creditHours": "48学时 / 1.5学分",
        "sourceRow": 47,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-07",
        "name": "MSI 计数器实验（74LS161/74LS191、模 N、50% 占空比 10 分频）",
        "sim": "digital",
        "formula": "fout=fin/N",
        "description": "使用74LS161/191实现模N计数和指定占空比分频。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 慕课+外系课件",
        "officialCourseName": "电子测试与实验技术",
        "catalogCode": "HUST-UG-05",
        "creditHours": "48学时 / 1.5学分",
        "sourceRow": 48,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-08",
        "name": "Verilog HDL 入门",
        "sim": "fpga",
        "formula": "always @(posedge clk)",
        "description": "完成组合和时序逻辑的Verilog描述、仿真与下载验证。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 慕课+外系课件",
        "officialCourseName": "电子测试与实验技术",
        "catalogCode": "HUST-UG-05",
        "creditHours": "48学时 / 1.5学分",
        "sourceRow": 49,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-09",
        "name": "FPGA 小型数字系统（Nexys4：数字频率计、数字钟 + 7 段数码管动态扫描）",
        "sim": "fpga",
        "formula": "fmeas=N/(Tgate)",
        "description": "在FPGA板上实现数字频率计、数字钟和数码管动态扫描。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 慕课+外系课件",
        "officialCourseName": "电子测试与实验技术",
        "catalogCode": "HUST-UG-05",
        "creditHours": "48学时 / 1.5学分",
        "sourceRow": 50,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-06",
    "year": 2,
    "term": 2,
    "termLabel": "大二下 2028春",
    "title": "微机实验",
    "focus": "EMU8086 软件安装与使用、汇编语言实例讲解与程序编写、基于 Proteus 软件的 8086 最小系统硬件设计等",
    "scope": "hust",
    "catalogCode": "HUST-UG-06",
    "officialCredits": "1",
    "officialHours": "16学时",
    "creditHours": "16学时 / 1学分",
    "location": "计算机开放实验室（工程实践创新中心A座）；教师 徐刚",
    "evidenceGrades": [
      "C 跨学院学生报告"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "下载和接线前确认接口电平与电源状态，禁止带电插拔核心板卡，保留程序版本和实验配置。",
    "experiments": [
      {
        "id": "hust-exact-06-01",
        "name": "EMU8086 软件安装与使用",
        "sim": "embedded",
        "formula": "PC ← PC+1",
        "description": "完成8086汇编开发环境配置、程序编写与仿真。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "计算机开放实验室（工程实践创新中心A座）；教师 徐刚",
        "evidenceGrade": "C 跨学院学生报告",
        "officialCourseName": "微机实验",
        "catalogCode": "HUST-UG-06",
        "creditHours": "16学时 / 1学分",
        "sourceRow": 51,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-06-02",
        "name": "汇编语言实例讲解与程序编写",
        "sim": "embedded",
        "formula": "AX,BX,CX,DX",
        "description": "分析并编写基本8086汇编程序，观察寄存器、内存和标志位。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 跨学院学生报告",
        "officialCourseName": "微机实验",
        "catalogCode": "HUST-UG-06",
        "creditHours": "16学时 / 1学分",
        "sourceRow": 52,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-06-03",
        "name": "基于 Proteus 软件的 8086 最小系统硬件设计",
        "sim": "embedded",
        "formula": "CPU + ROM + RAM + I/O",
        "description": "在Proteus中搭建8086最小系统并完成硬件连线。",
        "note": "",
        "requirement": "设计性项目",
        "location": "",
        "evidenceGrade": "C 跨学院学生报告",
        "officialCourseName": "微机实验",
        "catalogCode": "HUST-UG-06",
        "creditHours": "16学时 / 1学分",
        "sourceRow": 53,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-06-04",
        "name": "基于 8086 最小系统的汇编程序设计（4×4 矩阵键盘→BCD 数码管）",
        "sim": "embedded",
        "formula": "Key → Scan → BCD",
        "description": "完成矩阵键盘扫描、键值编码和数码管显示。",
        "note": "来源为电气学院 6 实验版报告；你只有 16 学时，大概只做前 3-4 个 + 8255",
        "requirement": "设计性项目",
        "location": "",
        "evidenceGrade": "C 跨学院学生报告",
        "officialCourseName": "微机实验",
        "catalogCode": "HUST-UG-06",
        "creditHours": "16学时 / 1学分",
        "sourceRow": 54,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-06-05",
        "name": "8255 并行接口实验",
        "sim": "embedded",
        "formula": "PA/PB/PC ← 控制字",
        "description": "配置8255工作方式，完成并行输入输出实验。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 跨学院学生报告",
        "officialCourseName": "微机实验",
        "catalogCode": "HUST-UG-06",
        "creditHours": "16学时 / 1学分",
        "sourceRow": 55,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-06-06",
        "name": "工频测频接口电路设计与实现（设计性）",
        "sim": "embedded",
        "formula": "f=N/Δt",
        "description": "设计工频频率测量接口和程序，完成采样、计数与显示。",
        "note": "",
        "requirement": "设计性项目",
        "location": "",
        "evidenceGrade": "C 跨学院学生报告",
        "officialCourseName": "微机实验",
        "catalogCode": "HUST-UG-06",
        "creditHours": "16学时 / 1学分",
        "sourceRow": 56,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-07",
    "year": 2,
    "term": 2,
    "termLabel": "大二下 2028春",
    "title": "光学系统设计",
    "focus": "项目式设计（具体题目未公开）",
    "scope": "hust",
    "catalogCode": "HUST-UG-07",
    "officialCredits": "1",
    "officialHours": "2周",
    "creditHours": "2周 / 1学分",
    "location": "计算机开放实验室（工程实践创新中心A座）",
    "evidenceGrades": [
      "无项目清单"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "按课程指导书和实验平台要求完成安全检查，保留原始数据、仪器参数和异常记录。",
    "experiments": [
      {
        "id": "hust-exact-07-01",
        "name": "项目式设计（具体题目未公开）",
        "sim": "integrated",
        "formula": "y = f(x)",
        "description": "按课程要求完成“项目式设计（具体题目未公开）”的仪器准备、测量、数据处理和结果分析。",
        "note": "",
        "requirement": "设计性项目",
        "location": "计算机开放实验室（工程实践创新中心A座）",
        "evidenceGrade": "无项目清单",
        "officialCourseName": "光学系统设计",
        "catalogCode": "HUST-UG-07",
        "creditHours": "2周 / 1学分",
        "sourceRow": 57,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-08",
    "year": 2,
    "term": 2,
    "termLabel": "大二下 2028春",
    "title": "工程训练（七）",
    "focus": "金工实习（工种未核实）",
    "scope": "hust",
    "catalogCode": "HUST-UG-08",
    "officialCredits": "1",
    "officialHours": "2周",
    "creditHours": "2周 / 1学分",
    "location": "工程实践创新中心",
    "evidenceGrades": [
      "无项目清单"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "遵守工程训练中心的机械加工、用电、防火和劳动保护规定。",
    "experiments": [
      {
        "id": "hust-exact-08-01",
        "name": "金工实习（工种未核实）",
        "sim": "integrated",
        "formula": "Process → Part",
        "description": "完成机械加工基本工种训练，记录工艺、尺寸和安全操作。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "工程实践创新中心",
        "evidenceGrade": "无项目清单",
        "officialCourseName": "工程训练（七）",
        "catalogCode": "HUST-UG-08",
        "creditHours": "2周 / 1学分",
        "sourceRow": 58,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-09",
    "year": 3,
    "term": 2,
    "termLabel": "大三下 2029春",
    "title": "光纤技术实验",
    "focus": "光纤的切割与熔接、EDFA、EDFL 参数测量、光纤数值孔径测量等",
    "scope": "hust",
    "catalogCode": "HUST-UG-09",
    "officialCredits": "0.5",
    "officialHours": "16学时",
    "creditHours": "16学时 / 0.5学分",
    "location": "光电信息大楼 A417，第 9-12 周",
    "evidenceGrades": [
      "C 2021年新闻"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "遵守激光安全要求，处理裸光纤时佩戴护目镜和防割手套，废弃光纤应集中回收。",
    "experiments": [
      {
        "id": "hust-exact-09-01",
        "name": "光纤的切割与熔接",
        "sim": "fiber",
        "formula": "L=τc/(2n)",
        "description": "完成光纤剥除、切割、熔接和损耗检查。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "光电信息大楼 A417，第 9-12 周",
        "evidenceGrade": "C 2021年新闻",
        "officialCourseName": "光纤技术实验",
        "catalogCode": "HUST-UG-09",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 60,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-09-02",
        "name": "EDFA、EDFL 参数测量",
        "sim": "fiber",
        "formula": "G=10log(Pout/Pin)",
        "description": "测量掺铒光纤放大器和激光器的增益、功率、波长和噪声特性。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 2021年新闻",
        "officialCourseName": "光纤技术实验",
        "catalogCode": "HUST-UG-09",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 61,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-09-03",
        "name": "光纤数值孔径测量",
        "sim": "fiber",
        "formula": "NA=√(n₁²−n₂²)",
        "description": "测量光纤出射光锥角并计算数值孔径。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 2021年新闻",
        "officialCourseName": "光纤技术实验",
        "catalogCode": "HUST-UG-09",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 62,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-09-04",
        "name": "光纤损耗测量",
        "sim": "fiber",
        "formula": "α=-10log(Pout/Pin)/L",
        "description": "使用截断法或插入法测量光纤衰减系数。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 2021年新闻",
        "officialCourseName": "光纤技术实验",
        "catalogCode": "HUST-UG-09",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 63,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-09-05",
        "name": "光纤通信模块实验",
        "sim": "communication",
        "formula": "BER=f(SNR)",
        "description": "完成光发射、光纤传输和接收解调，测量眼图或误码性能。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 2021年新闻",
        "officialCourseName": "光纤技术实验",
        "catalogCode": "HUST-UG-09",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 64,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-09-06",
        "name": "半导体激光器输出波长与温度的关系——红移现象",
        "sim": "laser",
        "formula": "dλ/dT=C",
        "description": "测量半导体激光器波长随温度和驱动电流的变化。",
        "note": "2021 年起新增，取代原“LD 与 LED 的光谱测量”",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "C 2021年新闻",
        "officialCourseName": "光纤技术实验",
        "catalogCode": "HUST-UG-09",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 65,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-10",
    "year": 3,
    "term": 2,
    "termLabel": "大三下 2029春",
    "title": "激光实验",
    "focus": "半导体端面泵浦固体激光器（Nd:YVO4 工作特性）、He-Ne 激光模式测量、谐振腔调试等",
    "scope": "hust",
    "catalogCode": "HUST-UG-10",
    "officialCredits": "0.5",
    "officialHours": "16学时",
    "creditHours": "16学时 / 0.5学分",
    "location": "光电信息大楼 A404，第 13-16 周",
    "evidenceGrades": [
      "A 官网表格"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "必须使用与波长匹配的激光防护镜，控制光路高度，禁止直视直射光、反射光和调Q脉冲。",
    "experiments": [
      {
        "id": "hust-exact-10-01",
        "name": "半导体端面泵浦固体激光器（Nd:YVO4 工作特性）",
        "sim": "laser",
        "formula": "G≥L",
        "description": "测量端面泵浦固体激光器的阈值、输出功率和模式。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "光电信息大楼 A404，第 13-16 周",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-10",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 66,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-10-02",
        "name": "He-Ne 激光模式测量",
        "sim": "laser",
        "formula": "TEMmn",
        "description": "观察并测量He-Ne激光的横模结构。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-10",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 67,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-10-03",
        "name": "谐振腔调试",
        "sim": "laser",
        "formula": "g₁g₂ stability",
        "description": "调整腔镜位置与角度，使激光器满足稳定腔条件并起振。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-10",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 68,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-10-04",
        "name": "电光调 Q",
        "sim": "laser",
        "formula": "Ppeak≈E/τp",
        "description": "利用电光器件控制腔内损耗，产生短脉冲并测量峰值功率。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-10",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 69,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-10-05",
        "name": "声光调 Q",
        "sim": "laser",
        "formula": "Ppeak≈E/τp",
        "description": "利用声光调制控制腔内损耗，比较重复频率和脉冲宽度。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-10",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 70,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-10-06",
        "name": "临界腔法测量热透镜焦距",
        "sim": "laser",
        "formula": "1/fth=1/R1+1/R2",
        "description": "通过谐振腔稳定区边界测量热透镜焦距。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-10",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 71,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-11",
    "year": 3,
    "term": 2,
    "termLabel": "大三下 2029春",
    "title": "光电子器件实验",
    "focus": "（清单未知，未查到任何官方或学生来源）",
    "scope": "hust",
    "catalogCode": "HUST-UG-11",
    "officialCredits": "0.5",
    "officialHours": "16学时",
    "creditHours": "16学时 / 0.5学分",
    "location": "",
    "evidenceGrades": [
      "无依据"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "按课程指导书和实验平台要求完成安全检查，保留原始数据、仪器参数和异常记录。",
    "experiments": [
      {
        "id": "hust-exact-11-01",
        "name": "（清单未知，未查到任何官方或学生来源）",
        "sim": "measurement",
        "formula": "y = f(x)",
        "description": "按课程要求完成“（清单未知，未查到任何官方或学生来源）”的仪器准备、测量、数据处理和结果分析。",
        "note": "此前我推测它等于某些器件实验，已撤回该说法",
        "requirement": "待核实",
        "location": "",
        "evidenceGrade": "无依据",
        "officialCourseName": "光电子器件实验",
        "catalogCode": "HUST-UG-11",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 72,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-12",
    "year": 3,
    "term": 2,
    "termLabel": "大三下 2029春",
    "title": "专业方向课程设计",
    "focus": "五选一：光电系统与信息处理 / 光电子器件与集成 / 光通信与光网络技术 / 激光科学与工程 / 微波与光电集成",
    "scope": "hust",
    "catalogCode": "HUST-UG-12",
    "officialCredits": "1",
    "officialHours": "2周",
    "creditHours": "2周 / 1学分",
    "location": "计算机开放实验室（工程实践创新中心A座）",
    "evidenceGrades": [
      "A 真实课表（题目未公开）"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "按课程指导书和实验平台要求完成安全检查，保留原始数据、仪器参数和异常记录。",
    "experiments": [
      {
        "id": "hust-exact-12-01",
        "name": "五选一：光电系统与信息处理 / 光电子器件与集成 / 光通信与光网络技术 / 激光科学与工程 / 微波与光电集成",
        "sim": "integrated",
        "formula": "S=f(需求,方案,性能)",
        "description": "从五个专业方向中选择一个完成课程设计、系统集成和答辩。",
        "note": "",
        "requirement": "专业方向项目",
        "location": "计算机开放实验室（工程实践创新中心A座）",
        "evidenceGrade": "A 真实课表（题目未公开）",
        "officialCourseName": "专业方向课程设计",
        "catalogCode": "HUST-UG-12",
        "creditHours": "2周 / 1学分",
        "sourceRow": 73,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-13",
    "year": 4,
    "term": 1,
    "termLabel": "大四上 2029秋",
    "title": "现代光学实验",
    "focus": "相移干涉实验（四步相移测光学面型）、傅里叶变换光谱实验（时间调制 FT 测 LD 光谱）、激光外差实验（移频 + 光外差测微位移）等",
    "scope": "hust",
    "catalogCode": "HUST-UG-13",
    "officialCredits": "0.75",
    "officialHours": "24学时",
    "creditHours": "24学时 / 0.75学分",
    "location": "光电信息大楼",
    "evidenceGrades": [
      "A 官网表格"
    ],
    "sourceRef": "华科光电本科实验清单.xlsx · 实验清单",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "experiments": [
      {
        "id": "hust-exact-13-01",
        "name": "相移干涉实验（四步相移测光学面型）",
        "sim": "michelson",
        "formula": "φ=arctan[(I4−I2)/(I1−I3)]",
        "description": "采集多步相移干涉图，恢复光学面形相位。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "光电信息大楼",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 74,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-02",
        "name": "傅里叶变换光谱实验（时间调制 FT 测 LD 光谱）",
        "sim": "fourier",
        "formula": "X(f)=∫x(t)e^(−j2πft)dt",
        "description": "通过干涉图傅里叶变换测量激光光谱。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 75,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-03",
        "name": "激光外差实验（移频 + 光外差测微位移）",
        "sim": "frequency",
        "formula": "Δf=2v/λ",
        "description": "利用移频和外差拍信号测量微小位移或速度。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 76,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-04",
        "name": "超窄线宽光谱实验（延迟自外差法测线宽）",
        "sim": "laser",
        "formula": "Δν=1/(πτd)",
        "description": "使用延迟自外差法测量超窄激光线宽。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 77,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-05",
        "name": "光源调制带宽实验（半导体激光器调制带宽）",
        "sim": "frequency",
        "formula": "H(f)=P(f)/P(0)",
        "description": "测量半导体激光器小信号调制响应和3 dB带宽。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 78,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-06",
        "name": "激光脉冲剪裁实验（声光调制）",
        "sim": "laser",
        "formula": "Eout(t)=Ein(t)H(t)",
        "description": "通过声光调制改变脉冲时域形状并测量输出。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 79,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-07",
        "name": "涡旋光束实验（相息图产生 LG 涡旋光）",
        "sim": "diffraction",
        "formula": "E=E₀exp(ilφ)",
        "description": "加载相位全息图产生涡旋光束并测量拓扑荷。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 80,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-08",
        "name": "焦点附近的光场研究（焦前/中/后光强与 π 相位）",
        "sim": "optics",
        "formula": "I=I(r,z)",
        "description": "测量焦前、焦中和焦后光强与相位变化。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 81,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-09",
        "name": "超分辨率成像实验（像素超分辨 PSR 重构）",
        "sim": "imaging",
        "formula": "Iout=PSR(Iin)",
        "description": "利用像素超分辨重构提高图像空间细节。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 82,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-10",
        "name": "数字图像处理实验（Hough 变换检测圆形）",
        "sim": "imaging",
        "formula": "ρ=xcosθ+ysinθ",
        "description": "实现Hough变换并检测图像中的圆形目标。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 83,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-11",
        "name": "剪切干涉实验（剪切干涉图测准直性）",
        "sim": "michelson",
        "formula": "ΔW=s∂W/∂x",
        "description": "利用剪切干涉图评价波前斜率与准直性。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 84,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-13-12",
        "name": "莫尔条纹实验（泰伯效应测准直性）",
        "sim": "diffraction",
        "formula": "p=pd/(d+z tanθ)",
        "description": "利用泰伯效应和莫尔条纹评价光束准直性。",
        "note": "另有综合类“光电技术综合实验：数字干涉测量/衍射测量/点扩散函数测量”",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-13",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 85,
        "sourceSheet": "实验清单"
      }
    ]
  }
];
  const principles = {
  "hust-exact-01-01": {
    "intro": "完成光源、透镜、反射镜和观察面的共轴调节，使光斑位置、方向和像面满足后续测量要求。",
    "theory": "本实验属于“专业认知实验”，以 L = Σnᵢlᵢ 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光源、透镜、反射镜、光阑、精密位移台、观察屏和光斑测量工具。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“光路的调试”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 L = Σnᵢlᵢ 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "L = Σnᵢlᵢ。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 L = Σnᵢlᵢ 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-02": {
    "intro": "使用 Arduino、超声测距模块、LCD 和报警电路完成距离采样、显示与阈值判断。",
    "theory": "本实验属于“专业认知实验”，以 d = cΔt/2 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“传感器认知（Arduino 超声测距：SR04 测距 + LCD1602 显示 + 蜂鸣器/LED 报警）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 d = cΔt/2 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "d = cΔt/2。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 d = cΔt/2 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-03": {
    "intro": "认识望远镜、显微镜、分光计、功率计等光学仪器的结构、量程和使用边界。",
    "theory": "本实验属于“专业认知实验”，以 M = fₒ/fₑ 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光源、透镜、反射镜、光阑、精密位移台、观察屏和光斑测量工具。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“光学仪器的认知”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 M = fₒ/fₑ 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "M = fₒ/fₑ。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 M = fₒ/fₑ 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-04": {
    "intro": "完成三维建模、切片参数设置、增材制造和尺寸复核。",
    "theory": "本实验属于“专业认知实验”，以 CAD → 切片 → 制造 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "课程指定的光源、电子模块、机械结构、控制器、数据采集软件和安全防护用品。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“数字建模及制造”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 CAD → 切片 → 制造 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "CAD → 切片 → 制造。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 CAD → 切片 → 制造 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-05": {
    "intro": "完成立体图像采集、视差控制和显示效果评价。",
    "theory": "本实验属于“专业认知实验”，以 I = I(x,y,θ) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "相机、镜头、光源、标定靶、图像采集卡和图像处理软件。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“立体视频拍摄与显示”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 I = I(x,y,θ) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "I = I(x,y,θ)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 I = I(x,y,θ) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-06": {
    "intro": "将语音调制到光载波上，完成光电接收、解调与音质评价。",
    "theory": "本实验属于“专业认知实验”，以 m(t)=A[1+km(t)]cos(ωt) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光发射端、调制器、光纤链路、接收端、信号源和误码或眼图测量设备。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“语音光信号传输”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 m(t)=A[1+km(t)]cos(ωt) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "m(t)=A[1+km(t)]cos(ωt)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 m(t)=A[1+km(t)]cos(ωt) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-07": {
    "intro": "使用红外相机观察物体温度分布并分析发射率、背景和环境反射影响。",
    "theory": "本实验属于“专业认知实验”，以 L = εσT⁴ 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "相机、镜头、光源、标定靶、图像采集卡和图像处理软件。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“红外成像”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 L = εσT⁴ 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "L = εσT⁴。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 L = εσT⁴ 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-08": {
    "intro": "识别电阻、电容、二极管和 LED 等元件，测量基本伏安关系与极性。",
    "theory": "本实验属于“专业认知实验”，以 U = IR 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "直流或交流电源、电阻与储能元件、万用表、示波器、信号源和连接导线。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“电子元器件及 LED 认识”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 U = IR 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "U = IR。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 U = IR 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-09": {
    "intro": "测量太阳能电池输出特性和光学仪器读数，比较光强、距离与输出关系。",
    "theory": "本实验属于“专业认知实验”，以 P = VI 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "太阳模拟器或光源、光伏器件、电子负载、电压电流表和温度测量工具。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“太阳能与光学仪器的使用”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 P = VI 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "P = VI。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 P = VI 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-10": {
    "intro": "综合传感器、控制器、显示和报警执行器，完成门禁逻辑与阈值测试。",
    "theory": "本实验属于“专业认知实验”，以 Alarm = 1[V_sensor > V_th] 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“门禁报警器”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Alarm = 1[V_sensor > V_th] 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Alarm = 1[V_sensor > V_th]。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 Alarm = 1[V_sensor > V_th] 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-11": {
    "intro": "利用 GPIO、延时或 PWM 控制多路 LED 的流水与呼吸效果。",
    "theory": "本实验属于“专业认知实验”，以 D = T_on / T 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“炫彩流水呼吸灯”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 D = T_on / T 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "D = T_on / T。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 D = T_on / T 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-01-12": {
    "intro": "完成智能平台的运动控制、循迹或避障任务并记录传感器响应。",
    "theory": "本实验属于“专业认知实验”，以 u(t) = Kp e(t) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：A406、A402、东九B503、东十二F201。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“基于智能平台的机器人/小车”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 u(t) = Kp e(t) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "u(t) = Kp e(t)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "进入实验室必须遵守激光、用电、机械和工具安全规定；认知项目以观察、记录和规范操作为主。",
    "observations": "重点判断观测结果是否满足 u(t) = Kp e(t) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网原文”。"
  },
  "hust-exact-02-01": {
    "intro": "测量电阻、二极管等元件的伏安曲线，判断线性和非线性工作区。",
    "theory": "本实验属于“物理实验（上）”，以 I = Is(e^(qU/kT) − 1) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "器件样品、可调电源、电压表、电流表、限流保护和温度记录工具。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“电子元件伏安特性”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 I = Is(e^(qU/kT) − 1) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "I = Is(e^(qU/kT) − 1)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 I = Is(e^(qU/kT) − 1) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-02": {
    "intro": "测量转动惯量和材料弹性模量，分析质量分布、形变和测量不确定度。",
    "theory": "本实验属于“物理实验（上）”，以 I=Σmr²；E=FL/(SΔL) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "长度或质量基准、读数仪器、数据采集工具和不确定度记录表。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“转动惯量与杨氏模量的测量”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 I=Σmr²；E=FL/(SΔL) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "I=Σmr²；E=FL/(SΔL)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 I=Σmr²；E=FL/(SΔL) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-03": {
    "intro": "学习探头补偿、触发、时基、垂直档位和周期信号参数测量。",
    "theory": "本实验属于“物理实验（上）”，以 f = 1/T 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "示波器、探头、函数发生器、万用表和待测电路。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“示波器的使用”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 f = 1/T 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "f = 1/T。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 f = 1/T 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-04": {
    "intro": "测量材料吸热和传热过程，提取比热容与热导率。",
    "theory": "本实验属于“物理实验（上）”，以 c=Q/(mΔT)；Φ=-kA(dT/dx) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "长度或质量基准、读数仪器、数据采集工具和不确定度记录表。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“比热容和热导率的测量”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 c=Q/(mΔT)；Φ=-kA(dT/dx) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "c=Q/(mΔT)；Φ=-kA(dT/dx)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 c=Q/(mΔT)；Φ=-kA(dT/dx) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-05": {
    "intro": "采集脉搏、心电或肌电等生物信号，分析噪声、滤波和电极接触影响。",
    "theory": "本实验属于“物理实验（上）”，以 SNR = 20log(Vs/Vn) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "长度或质量基准、读数仪器、数据采集工具和不确定度记录表。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“人体生物信号测量”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 SNR = 20log(Vs/Vn) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "SNR = 20log(Vs/Vn)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 SNR = 20log(Vs/Vn) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-06": {
    "intro": "完成分光计调平、准直和读数，测量棱镜角或光栅衍射角。",
    "theory": "本实验属于“物理实验（上）”，以 d sinθ = kλ 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光源、分光计、光栅或棱镜、准直系统、角度读数和光谱探测器。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“分光计的使用”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 d sinθ = kλ 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "d sinθ = kλ。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 d sinθ = kλ 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-07": {
    "intro": "通过油滴平衡电压和运动速度测量基本电荷量。",
    "theory": "本实验属于“物理实验（上）”，以 q = mgd/U 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "长度或质量基准、读数仪器、数据采集工具和不确定度记录表。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“密立根油滴实验”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 q = mgd/U 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "q = mgd/U。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 q = mgd/U 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-08": {
    "intro": "观察双缝、单缝或圆孔图样，测量条纹间距或衍射角并验证波动关系。",
    "theory": "本实验属于“物理实验（上）”，以 Δx = λL/d 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "相干光源、缝屏、透镜、观察屏、光强探测器或成像相机。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“光的干涉与衍射”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Δx = λL/d 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Δx = λL/d。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 Δx = λL/d 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-09": {
    "intro": "测量周期与摆长关系，验证单摆或三线摆动力学模型。",
    "theory": "本实验属于“物理实验（上）”，以 T = 2π√(I/mgd) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "长度或质量基准、读数仪器、数据采集工具和不确定度记录表。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“单摆与三线摆”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 T = 2π√(I/mgd) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "T = 2π√(I/mgd)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 T = 2π√(I/mgd) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-10": {
    "intro": "测量受迫振动频率、驻波节点和共振响应。",
    "theory": "本实验属于“物理实验（上）”，以 f=(1/2L)√(T/μ) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "示波器、探头、函数发生器、万用表和待测电路。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“音叉与弦的受迫振动”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 f=(1/2L)√(T/μ) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "f=(1/2L)√(T/μ)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 f=(1/2L)√(T/μ) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-02-11": {
    "intro": "观察受迫振动、共振曲线和非线性混沌现象。",
    "theory": "本实验属于“物理实验（上）”，以 θ″+γθ′+ω₀²sinθ=Fcosωt 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "课程指导书列出的仪器、标准件、数据采集工具和安全防护用品。课程记录地点：科技楼北楼物理实验教学中心（第1周：东十二F301）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“波尔共振与混沌摆”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 θ″+γθ′+ω₀²sinθ=Fcosωt 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "θ″+γθ′+ω₀²sinθ=Fcosωt。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 θ″+γθ′+ω₀²sinθ=Fcosωt 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-03-01": {
    "intro": "使用直流和交流电桥测量电阻、电感或电容，分析平衡条件和灵敏度。",
    "theory": "本实验属于“物理实验（下）”，以 Rx = R1R3/R2 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "直流或交流电源、电阻与储能元件、万用表、示波器、信号源和连接导线。课程记录地点：科技楼北楼物理实验教学中心。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“交直流电桥的应用”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Rx = R1R3/R2 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Rx = R1R3/R2。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 Rx = R1R3/R2 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-03-02": {
    "intro": "通过相位差、传播时间或调制频率测量声速和光速。",
    "theory": "本实验属于“物理实验（下）”，以 v=Δx/Δt；c=fλ 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "长度或质量基准、读数仪器、数据采集工具和不确定度记录表。课程记录地点：科技楼北楼物理实验教学中心。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“声速与光速测量”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 v=Δx/Δt；c=fλ 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "v=Δx/Δt；c=fλ。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 v=Δx/Δt；c=fλ 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-03-03": {
    "intro": "建立稳态温度梯度并测量热流、厚度和温差，计算热导率。",
    "theory": "本实验属于“物理实验（下）”，以 λ=Qd/(AΔT) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "长度或质量基准、读数仪器、数据采集工具和不确定度记录表。课程记录地点：科技楼北楼物理实验教学中心。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“稳态法测量导热系数”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 λ=Qd/(AΔT) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "λ=Qd/(AΔT)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 λ=Qd/(AΔT) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-03-04": {
    "intro": "测量截止电压或弗兰克-赫兹电流峰，验证量子化能量交换。",
    "theory": "本实验属于“物理实验（下）”，以 hν=eUₐ+W 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "可调光源、光电管或弗兰克-赫兹管、偏置电源、微电流计和温控或滤波装置。课程记录地点：科技楼北楼物理实验教学中心。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“光电效应与弗兰克-赫兹实验”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 hν=eUₐ+W 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "hν=eUₐ+W。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 hν=eUₐ+W 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-03-05": {
    "intro": "观察核磁共振信号，测量共振频率与磁感应强度关系。",
    "theory": "本实验属于“物理实验（下）”，以 ω = γB 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "长度或质量基准、读数仪器、数据采集工具和不确定度记录表。课程记录地点：科技楼北楼物理实验教学中心。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“核磁共振实验”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 ω = γB 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "ω = γB。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 ω = γB 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-03-06": {
    "intro": "测量磁场对器件电阻的影响，分析磁电阻响应和饱和特性。",
    "theory": "本实验属于“物理实验（下）”，以 ΔR/R = f(H) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "器件样品、可调电源、电压表、电流表、限流保护和温度记录工具。课程记录地点：科技楼北楼物理实验教学中心。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“巨磁电阻效应及应用”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 ΔR/R = f(H) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "ΔR/R = f(H)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "使用高压源、激光、加热装置和精密仪器时必须遵守量程与防护要求；不得带电接线或直视激光。",
    "observations": "重点判断观测结果是否满足 ΔR/R = f(H) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 总课表原件”。"
  },
  "hust-exact-04-01": {
    "intro": "完成直流电源、电阻网络、仪表和安全接线的基本操作。",
    "theory": "本实验属于“电路测试实验”，以 U=IR 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "直流或交流电源、电阻与储能元件、万用表、示波器、信号源和连接导线。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“直流试验单元的基本操作”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 U=IR 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "U=IR。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 U=IR 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-02": {
    "intro": "根据电压、电流和通断检查电路故障，定位开路、短路和接触不良。",
    "theory": "本实验属于“电路测试实验”，以 ΣI=0；ΣU=0 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "直流或交流电源、电阻与储能元件、万用表、示波器、信号源和连接导线。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“故障检查”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 ΣI=0；ΣU=0 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "ΣI=0；ΣU=0。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 ΣI=0；ΣU=0 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-03": {
    "intro": "测量开路电压和短路电流，建立戴维南或诺顿等效电路。",
    "theory": "本实验属于“电路测试实验”，以 Uoc = IscRth 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "直流或交流电源、电阻与储能元件、万用表、示波器、信号源和连接导线。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“线性有源一端口网络等效参数的测定”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Uoc = IscRth 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Uoc = IscRth。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 Uoc = IscRth 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-04": {
    "intro": "使用三表法测量交流参数、互感和相位关系。",
    "theory": "本实验属于“电路测试实验”，以 Z=R+jX 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "直流或交流电源、电阻与储能元件、万用表、示波器、信号源和连接导线。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“交流参数与互感的测量——三表法”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Z=R+jX 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Z=R+jX。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 Z=R+jX 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-05": {
    "intro": "测量日光灯电路功率因数并通过并联电容提高功率因数。",
    "theory": "本实验属于“电路测试实验”，以 P=UIcosφ 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "直流或交流电源、电阻与储能元件、万用表、示波器、信号源和连接导线。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“日光灯电路与功率因数的提高”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 P=UIcosφ 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "P=UIcosφ。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 P=UIcosφ 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-06": {
    "intro": "测量三相星形和三角形连接的线电压、相电压与电流关系。",
    "theory": "本实验属于“电路测试实验”，以 U_L=√3U_P 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "直流或交流电源、电阻与储能元件、万用表、示波器、信号源和连接导线。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“三相电路中的电压、电流关系”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 U_L=√3U_P 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "U_L=√3U_P。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 U_L=√3U_P 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-07": {
    "intro": "设置函数发生器和示波器，测量频率、幅值、相位和波形。",
    "theory": "本实验属于“电路测试实验”，以 f=1/T 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "示波器、探头、函数发生器、万用表和待测电路。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“示波器和函数发生器的使用”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 f=1/T 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "f=1/T。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 f=1/T 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-08": {
    "intro": "利用示波器观察元件动态伏安特性，分析相位和频率影响。",
    "theory": "本实验属于“电路测试实验”，以 i=u/R 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "示波器、探头、函数发生器、万用表和待测电路。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“元件特性的示波器测量法”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 i=u/R 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "i=u/R。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 i=u/R 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-09": {
    "intro": "记录RC电路充放电曲线并提取时间常数。",
    "theory": "本实验属于“电路测试实验”，以 uC(t)=U₀e^(−t/RC) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "信号源、示波器、电阻、电容或电感、开关和面包板。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“一阶电路的响应”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 uC(t)=U₀e^(−t/RC) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "uC(t)=U₀e^(−t/RC)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 uC(t)=U₀e^(−t/RC) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-10": {
    "intro": "观察过阻尼、临界和欠阻尼响应，分析阻尼比和振荡频率。",
    "theory": "本实验属于“电路测试实验”，以 s²+2αs+ω₀²=0 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "信号源、示波器、电阻、电容或电感、开关和面包板。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“二阶电路的响应”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 s²+2αs+ω₀²=0 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "s²+2αs+ω₀²=0。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 s²+2αs+ω₀²=0 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-04-11": {
    "intro": "测量串联谐振频率、带宽和品质因数。",
    "theory": "本实验属于“电路测试实验”，以 f₀=1/(2π√LC) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "信号源、被测网络、示波器或频谱仪、探头和匹配负载。课程记录地点：西二楼 207A；教师 谢荣军 / 沈成林；仪器 示波器 MSO3034HD、信号源 SDG1062X。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“串联谐振电路”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 f₀=1/(2π√LC) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "f₀=1/(2π√LC)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "接线和改线前必须断电，确认电源、仪表量程和共地关系；出现异常发热或报警时立即停止实验。",
    "observations": "重点判断观测结果是否满足 f₀=1/(2π√LC) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“B 学生帖（三条互证）”。"
  },
  "hust-exact-05-01": {
    "intro": "完成示波器自检、信号参数测量、万用表、电源和面包板的基本训练。",
    "theory": "本实验属于“电子测试与实验技术”，以 f=1/T 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "示波器、探头、函数发生器、万用表和待测电路。课程记录地点：东十七楼 F303；教师 张大卫。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“常用电子仪器的使用（示波器自检、正弦/方波参数、万用表、稳压电源、面包板）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 f=1/T 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "f=1/T。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "observations": "重点判断观测结果是否满足 f=1/T 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 慕课+外系课件”。"
  },
  "hust-exact-05-02": {
    "intro": "观察半波整流输入输出波形，分析导通角、纹波和负载影响。",
    "theory": "本实验属于“电子测试与实验技术”，以 Udc≈0.318Um 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "器件样品、可调电源、电压表、电流表、限流保护和温度记录工具。课程记录地点：东十七楼 F303；教师 张大卫。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“半波整流电路输入输出波形观测”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Udc≈0.318Um 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Udc≈0.318Um。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "observations": "重点判断观测结果是否满足 Udc≈0.318Um 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 慕课+外系课件”。"
  },
  "hust-exact-05-03": {
    "intro": "测量一阶高通网络的幅频和相频特性。",
    "theory": "本实验属于“电子测试与实验技术”，以 φ=-arctan(ωRC) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "信号源、示波器、电阻、电容或电感、开关和面包板。课程记录地点：东十七楼 F303；教师 张大卫。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“RC 移相网络 / 一阶高通网络相频特性测量”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 φ=-arctan(ωRC) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "φ=-arctan(ωRC)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "observations": "重点判断观测结果是否满足 φ=-arctan(ωRC) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 慕课+外系课件”。"
  },
  "hust-exact-05-04": {
    "intro": "测量TTL/CMOS门电路逻辑电平、扇出、三态和线与特性。",
    "theory": "本实验属于“电子测试与实验技术”，以 Y=f(A,B) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "逻辑门或数字芯片、逻辑电平源、示波器、面包板和FPGA开发环境。课程记录地点：东十七楼 F303；教师 张大卫。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“逻辑门电路参数与功能测试（TTL/CMOS 电平、三态门、OC 门线与、扇出）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Y=f(A,B) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Y=f(A,B)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "observations": "重点判断观测结果是否满足 Y=f(A,B) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 慕课+外系课件”。"
  },
  "hust-exact-05-05": {
    "intro": "使用与非门、或非门等器件实现表决和全加器逻辑。",
    "theory": "本实验属于“电子测试与实验技术”，以 Y=f(A,B,C) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "逻辑门或数字芯片、逻辑电平源、示波器、面包板和FPGA开发环境。课程记录地点：东十七楼 F303；教师 张大卫。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“组合逻辑电路实验（与非门、或非门、表决电路、全加器）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Y=f(A,B,C) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Y=f(A,B,C)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "observations": "重点判断观测结果是否满足 Y=f(A,B,C) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 慕课+外系课件”。"
  },
  "hust-exact-05-06": {
    "intro": "测量RS、JK或D触发器的状态转换和时序约束。",
    "theory": "本实验属于“电子测试与实验技术”，以 Q(n+1)=f(Qn,X) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "逻辑门或数字芯片、逻辑电平源、示波器、面包板和FPGA开发环境。课程记录地点：东十七楼 F303；教师 张大卫。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“触发器实验（CC4027、74LS74）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Q(n+1)=f(Qn,X) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Q(n+1)=f(Qn,X)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "observations": "重点判断观测结果是否满足 Q(n+1)=f(Qn,X) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 慕课+外系课件”。"
  },
  "hust-exact-05-07": {
    "intro": "使用74LS161/191实现模N计数和指定占空比分频。",
    "theory": "本实验属于“电子测试与实验技术”，以 fout=fin/N 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "逻辑门或数字芯片、逻辑电平源、示波器、面包板和FPGA开发环境。课程记录地点：东十七楼 F303；教师 张大卫。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“MSI 计数器实验（74LS161/74LS191、模 N、50% 占空比 10 分频）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 fout=fin/N 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "fout=fin/N。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "observations": "重点判断观测结果是否满足 fout=fin/N 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 慕课+外系课件”。"
  },
  "hust-exact-05-08": {
    "intro": "完成组合和时序逻辑的Verilog描述、仿真与下载验证。",
    "theory": "本实验属于“电子测试与实验技术”，以 always @(posedge clk) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "FPGA开发板、下载器、时钟源、逻辑分析仪和数码管或外设。课程记录地点：东十七楼 F303；教师 张大卫。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“Verilog HDL 入门”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 always @(posedge clk) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "always @(posedge clk)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "observations": "重点判断观测结果是否满足 always @(posedge clk) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 慕课+外系课件”。"
  },
  "hust-exact-05-09": {
    "intro": "在FPGA板上实现数字频率计、数字钟和数码管动态扫描。",
    "theory": "本实验属于“电子测试与实验技术”，以 fmeas=N/(Tgate) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "FPGA开发板、下载器、时钟源、逻辑分析仪和数码管或外设。课程记录地点：东十七楼 F303；教师 张大卫。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“FPGA 小型数字系统（Nexys4：数字频率计、数字钟 + 7 段数码管动态扫描）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 fmeas=N/(Tgate) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "fmeas=N/(Tgate)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "检查逻辑电平和电源极性，避免输出短接；使用示波器时注意探头衰减比和共地。",
    "observations": "重点判断观测结果是否满足 fmeas=N/(Tgate) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 慕课+外系课件”。"
  },
  "hust-exact-06-01": {
    "intro": "完成8086汇编开发环境配置、程序编写与仿真。",
    "theory": "本实验属于“微机实验”，以 PC ← PC+1 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：计算机开放实验室（工程实践创新中心A座）；教师 徐刚。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“EMU8086 软件安装与使用”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 PC ← PC+1 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "PC ← PC+1。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "下载和接线前确认接口电平与电源状态，禁止带电插拔核心板卡，保留程序版本和实验配置。",
    "observations": "重点判断观测结果是否满足 PC ← PC+1 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 跨学院学生报告”。"
  },
  "hust-exact-06-02": {
    "intro": "分析并编写基本8086汇编程序，观察寄存器、内存和标志位。",
    "theory": "本实验属于“微机实验”，以 AX,BX,CX,DX 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：计算机开放实验室（工程实践创新中心A座）；教师 徐刚。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“汇编语言实例讲解与程序编写”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 AX,BX,CX,DX 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "AX,BX,CX,DX。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "下载和接线前确认接口电平与电源状态，禁止带电插拔核心板卡，保留程序版本和实验配置。",
    "observations": "重点判断观测结果是否满足 AX,BX,CX,DX 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 跨学院学生报告”。"
  },
  "hust-exact-06-03": {
    "intro": "在Proteus中搭建8086最小系统并完成硬件连线。",
    "theory": "本实验属于“微机实验”，以 CPU + ROM + RAM + I/O 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：计算机开放实验室（工程实践创新中心A座）；教师 徐刚。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“基于 Proteus 软件的 8086 最小系统硬件设计”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 CPU + ROM + RAM + I/O 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "CPU + ROM + RAM + I/O。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "下载和接线前确认接口电平与电源状态，禁止带电插拔核心板卡，保留程序版本和实验配置。",
    "observations": "重点判断观测结果是否满足 CPU + ROM + RAM + I/O 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 跨学院学生报告”。"
  },
  "hust-exact-06-04": {
    "intro": "完成矩阵键盘扫描、键值编码和数码管显示。",
    "theory": "本实验属于“微机实验”，以 Key → Scan → BCD 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：计算机开放实验室（工程实践创新中心A座）；教师 徐刚。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“基于 8086 最小系统的汇编程序设计（4×4 矩阵键盘→BCD 数码管）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Key → Scan → BCD 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Key → Scan → BCD。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "下载和接线前确认接口电平与电源状态，禁止带电插拔核心板卡，保留程序版本和实验配置。",
    "observations": "重点判断观测结果是否满足 Key → Scan → BCD 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 跨学院学生报告”。"
  },
  "hust-exact-06-05": {
    "intro": "配置8255工作方式，完成并行输入输出实验。",
    "theory": "本实验属于“微机实验”，以 PA/PB/PC ← 控制字 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：计算机开放实验室（工程实践创新中心A座）；教师 徐刚。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“8255 并行接口实验”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 PA/PB/PC ← 控制字 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "PA/PB/PC ← 控制字。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "下载和接线前确认接口电平与电源状态，禁止带电插拔核心板卡，保留程序版本和实验配置。",
    "observations": "重点判断观测结果是否满足 PA/PB/PC ← 控制字 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 跨学院学生报告”。"
  },
  "hust-exact-06-06": {
    "intro": "设计工频频率测量接口和程序，完成采样、计数与显示。",
    "theory": "本实验属于“微机实验”，以 f=N/Δt 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "单片机或微机平台、传感器、执行器、显示模块、下载器和逻辑分析工具。课程记录地点：计算机开放实验室（工程实践创新中心A座）；教师 徐刚。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“工频测频接口电路设计与实现（设计性）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 f=N/Δt 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "f=N/Δt。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "下载和接线前确认接口电平与电源状态，禁止带电插拔核心板卡，保留程序版本和实验配置。",
    "observations": "重点判断观测结果是否满足 f=N/Δt 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 跨学院学生报告”。"
  },
  "hust-exact-07-01": {
    "intro": "按课程要求完成“项目式设计（具体题目未公开）”的仪器准备、测量、数据处理和结果分析。",
    "theory": "本实验属于“光学系统设计”，以 y = f(x) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "课程指定的光源、电子模块、机械结构、控制器、数据采集软件和安全防护用品。课程记录地点：计算机开放实验室（工程实践创新中心A座）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“项目式设计（具体题目未公开）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 y = f(x) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "y = f(x)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "按课程指导书和实验平台要求完成安全检查，保留原始数据、仪器参数和异常记录。",
    "observations": "重点判断观测结果是否满足 y = f(x) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“无项目清单”。"
  },
  "hust-exact-08-01": {
    "intro": "完成机械加工基本工种训练，记录工艺、尺寸和安全操作。",
    "theory": "本实验属于“工程训练（七）”，以 Process → Part 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "课程指定的光源、电子模块、机械结构、控制器、数据采集软件和安全防护用品。课程记录地点：工程实践创新中心。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“金工实习（工种未核实）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Process → Part 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Process → Part。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "遵守工程训练中心的机械加工、用电、防火和劳动保护规定。",
    "observations": "重点判断观测结果是否满足 Process → Part 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“无项目清单”。"
  },
  "hust-exact-09-01": {
    "intro": "完成光纤剥除、切割、熔接和损耗检查。",
    "theory": "本实验属于“光纤技术实验”，以 L=τc/(2n) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光纤、切割熔接工具、光源、光功率计、光谱仪和光纤连接器。课程记录地点：光电信息大楼 A417，第 9-12 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“光纤的切割与熔接”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 L=τc/(2n) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "L=τc/(2n)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "遵守激光安全要求，处理裸光纤时佩戴护目镜和防割手套，废弃光纤应集中回收。",
    "observations": "重点判断观测结果是否满足 L=τc/(2n) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 2021年新闻”。"
  },
  "hust-exact-09-02": {
    "intro": "测量掺铒光纤放大器和激光器的增益、功率、波长和噪声特性。",
    "theory": "本实验属于“光纤技术实验”，以 G=10log(Pout/Pin) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光纤、切割熔接工具、光源、光功率计、光谱仪和光纤连接器。课程记录地点：光电信息大楼 A417，第 9-12 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“EDFA、EDFL 参数测量”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 G=10log(Pout/Pin) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "G=10log(Pout/Pin)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "遵守激光安全要求，处理裸光纤时佩戴护目镜和防割手套，废弃光纤应集中回收。",
    "observations": "重点判断观测结果是否满足 G=10log(Pout/Pin) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 2021年新闻”。"
  },
  "hust-exact-09-03": {
    "intro": "测量光纤出射光锥角并计算数值孔径。",
    "theory": "本实验属于“光纤技术实验”，以 NA=√(n₁²−n₂²) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光纤、切割熔接工具、光源、光功率计、光谱仪和光纤连接器。课程记录地点：光电信息大楼 A417，第 9-12 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“光纤数值孔径测量”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 NA=√(n₁²−n₂²) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "NA=√(n₁²−n₂²)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "遵守激光安全要求，处理裸光纤时佩戴护目镜和防割手套，废弃光纤应集中回收。",
    "observations": "重点判断观测结果是否满足 NA=√(n₁²−n₂²) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 2021年新闻”。"
  },
  "hust-exact-09-04": {
    "intro": "使用截断法或插入法测量光纤衰减系数。",
    "theory": "本实验属于“光纤技术实验”，以 α=-10log(Pout/Pin)/L 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光纤、切割熔接工具、光源、光功率计、光谱仪和光纤连接器。课程记录地点：光电信息大楼 A417，第 9-12 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“光纤损耗测量”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 α=-10log(Pout/Pin)/L 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "α=-10log(Pout/Pin)/L。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "遵守激光安全要求，处理裸光纤时佩戴护目镜和防割手套，废弃光纤应集中回收。",
    "observations": "重点判断观测结果是否满足 α=-10log(Pout/Pin)/L 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 2021年新闻”。"
  },
  "hust-exact-09-05": {
    "intro": "完成光发射、光纤传输和接收解调，测量眼图或误码性能。",
    "theory": "本实验属于“光纤技术实验”，以 BER=f(SNR) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光发射端、调制器、光纤链路、接收端、信号源和误码或眼图测量设备。课程记录地点：光电信息大楼 A417，第 9-12 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“光纤通信模块实验”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 BER=f(SNR) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "BER=f(SNR)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "遵守激光安全要求，处理裸光纤时佩戴护目镜和防割手套，废弃光纤应集中回收。",
    "observations": "重点判断观测结果是否满足 BER=f(SNR) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 2021年新闻”。"
  },
  "hust-exact-09-06": {
    "intro": "测量半导体激光器波长随温度和驱动电流的变化。",
    "theory": "本实验属于“光纤技术实验”，以 dλ/dT=C 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "激光器、泵浦源、谐振腔、功率计、光谱仪、探测器、示波器和激光防护用品。课程记录地点：光电信息大楼 A417，第 9-12 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“半导体激光器输出波长与温度的关系——红移现象”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 dλ/dT=C 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "dλ/dT=C。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "遵守激光安全要求，处理裸光纤时佩戴护目镜和防割手套，废弃光纤应集中回收。",
    "observations": "重点判断观测结果是否满足 dλ/dT=C 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“C 2021年新闻”。"
  },
  "hust-exact-10-01": {
    "intro": "测量端面泵浦固体激光器的阈值、输出功率和模式。",
    "theory": "本实验属于“激光实验”，以 G≥L 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "激光器、泵浦源、谐振腔、功率计、光谱仪、探测器、示波器和激光防护用品。课程记录地点：光电信息大楼 A404，第 13-16 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“半导体端面泵浦固体激光器（Nd:YVO4 工作特性）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 G≥L 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "G≥L。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "必须使用与波长匹配的激光防护镜，控制光路高度，禁止直视直射光、反射光和调Q脉冲。",
    "observations": "重点判断观测结果是否满足 G≥L 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-10-02": {
    "intro": "观察并测量He-Ne激光的横模结构。",
    "theory": "本实验属于“激光实验”，以 TEMmn 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "激光器、泵浦源、谐振腔、功率计、光谱仪、探测器、示波器和激光防护用品。课程记录地点：光电信息大楼 A404，第 13-16 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“He-Ne 激光模式测量”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 TEMmn 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "TEMmn。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "必须使用与波长匹配的激光防护镜，控制光路高度，禁止直视直射光、反射光和调Q脉冲。",
    "observations": "重点判断观测结果是否满足 TEMmn 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-10-03": {
    "intro": "调整腔镜位置与角度，使激光器满足稳定腔条件并起振。",
    "theory": "本实验属于“激光实验”，以 g₁g₂ stability 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "激光器、泵浦源、谐振腔、功率计、光谱仪、探测器、示波器和激光防护用品。课程记录地点：光电信息大楼 A404，第 13-16 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“谐振腔调试”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 g₁g₂ stability 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "g₁g₂ stability。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "必须使用与波长匹配的激光防护镜，控制光路高度，禁止直视直射光、反射光和调Q脉冲。",
    "observations": "重点判断观测结果是否满足 g₁g₂ stability 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-10-04": {
    "intro": "利用电光器件控制腔内损耗，产生短脉冲并测量峰值功率。",
    "theory": "本实验属于“激光实验”，以 Ppeak≈E/τp 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "激光器、泵浦源、谐振腔、功率计、光谱仪、探测器、示波器和激光防护用品。课程记录地点：光电信息大楼 A404，第 13-16 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“电光调 Q”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Ppeak≈E/τp 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Ppeak≈E/τp。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "必须使用与波长匹配的激光防护镜，控制光路高度，禁止直视直射光、反射光和调Q脉冲。",
    "observations": "重点判断观测结果是否满足 Ppeak≈E/τp 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-10-05": {
    "intro": "利用声光调制控制腔内损耗，比较重复频率和脉冲宽度。",
    "theory": "本实验属于“激光实验”，以 Ppeak≈E/τp 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "激光器、泵浦源、谐振腔、功率计、光谱仪、探测器、示波器和激光防护用品。课程记录地点：光电信息大楼 A404，第 13-16 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“声光调 Q”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Ppeak≈E/τp 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Ppeak≈E/τp。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "必须使用与波长匹配的激光防护镜，控制光路高度，禁止直视直射光、反射光和调Q脉冲。",
    "observations": "重点判断观测结果是否满足 Ppeak≈E/τp 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-10-06": {
    "intro": "通过谐振腔稳定区边界测量热透镜焦距。",
    "theory": "本实验属于“激光实验”，以 1/fth=1/R1+1/R2 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "激光器、泵浦源、谐振腔、功率计、光谱仪、探测器、示波器和激光防护用品。课程记录地点：光电信息大楼 A404，第 13-16 周。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“临界腔法测量热透镜焦距”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 1/fth=1/R1+1/R2 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "1/fth=1/R1+1/R2。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "必须使用与波长匹配的激光防护镜，控制光路高度，禁止直视直射光、反射光和调Q脉冲。",
    "observations": "重点判断观测结果是否满足 1/fth=1/R1+1/R2 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-11-01": {
    "intro": "按课程要求完成“（清单未知，未查到任何官方或学生来源）”的仪器准备、测量、数据处理和结果分析。",
    "theory": "本实验属于“光电子器件实验”，以 y = f(x) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "长度或质量基准、读数仪器、数据采集工具和不确定度记录表。课程记录地点：以课程安排为准。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“（清单未知，未查到任何官方或学生来源）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 y = f(x) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "y = f(x)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "按课程指导书和实验平台要求完成安全检查，保留原始数据、仪器参数和异常记录。",
    "observations": "重点判断观测结果是否满足 y = f(x) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“无依据”。"
  },
  "hust-exact-12-01": {
    "intro": "从五个专业方向中选择一个完成课程设计、系统集成和答辩。",
    "theory": "本实验属于“专业方向课程设计”，以 S=f(需求,方案,性能) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "课程指定的光源、电子模块、机械结构、控制器、数据采集软件和安全防护用品。课程记录地点：计算机开放实验室（工程实践创新中心A座）。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“五选一：光电系统与信息处理 / 光电子器件与集成 / 光通信与光网络技术 / 激光科学与工程 / 微波与光电集成”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 S=f(需求,方案,性能) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "S=f(需求,方案,性能)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "按课程指导书和实验平台要求完成安全检查，保留原始数据、仪器参数和异常记录。",
    "observations": "重点判断观测结果是否满足 S=f(需求,方案,性能) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 真实课表（题目未公开）”。"
  },
  "hust-exact-13-01": {
    "intro": "采集多步相移干涉图，恢复光学面形相位。",
    "theory": "本实验属于“现代光学实验”，以 φ=arctan[(I4−I2)/(I1−I3)] 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "干涉仪、相干光源、分束镜、反射镜、精密位移台、观察屏和探测器。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“相移干涉实验（四步相移测光学面型）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 φ=arctan[(I4−I2)/(I1−I3)] 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "φ=arctan[(I4−I2)/(I1−I3)]。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 φ=arctan[(I4−I2)/(I1−I3)] 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-02": {
    "intro": "通过干涉图傅里叶变换测量激光光谱。",
    "theory": "本实验属于“现代光学实验”，以 X(f)=∫x(t)e^(−j2πft)dt 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光源或信号源、干涉或调制模块、探测器、采集卡和频谱分析软件。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“傅里叶变换光谱实验（时间调制 FT 测 LD 光谱）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 X(f)=∫x(t)e^(−j2πft)dt 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "X(f)=∫x(t)e^(−j2πft)dt。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 X(f)=∫x(t)e^(−j2πft)dt 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-03": {
    "intro": "利用移频和外差拍信号测量微小位移或速度。",
    "theory": "本实验属于“现代光学实验”，以 Δf=2v/λ 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "信号源、被测网络、示波器或频谱仪、探头和匹配负载。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“激光外差实验（移频 + 光外差测微位移）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Δf=2v/λ 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Δf=2v/λ。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 Δf=2v/λ 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-04": {
    "intro": "使用延迟自外差法测量超窄激光线宽。",
    "theory": "本实验属于“现代光学实验”，以 Δν=1/(πτd) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "激光器、泵浦源、谐振腔、功率计、光谱仪、探测器、示波器和激光防护用品。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“超窄线宽光谱实验（延迟自外差法测线宽）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Δν=1/(πτd) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Δν=1/(πτd)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 Δν=1/(πτd) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-05": {
    "intro": "测量半导体激光器小信号调制响应和3 dB带宽。",
    "theory": "本实验属于“现代光学实验”，以 H(f)=P(f)/P(0) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "信号源、被测网络、示波器或频谱仪、探头和匹配负载。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“光源调制带宽实验（半导体激光器调制带宽）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 H(f)=P(f)/P(0) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "H(f)=P(f)/P(0)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 H(f)=P(f)/P(0) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-06": {
    "intro": "通过声光调制改变脉冲时域形状并测量输出。",
    "theory": "本实验属于“现代光学实验”，以 Eout(t)=Ein(t)H(t) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "激光器、泵浦源、谐振腔、功率计、光谱仪、探测器、示波器和激光防护用品。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“激光脉冲剪裁实验（声光调制）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Eout(t)=Ein(t)H(t) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Eout(t)=Ein(t)H(t)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 Eout(t)=Ein(t)H(t) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-07": {
    "intro": "加载相位全息图产生涡旋光束并测量拓扑荷。",
    "theory": "本实验属于“现代光学实验”，以 E=E₀exp(ilφ) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "课程指导书列出的仪器、标准件、数据采集工具和安全防护用品。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“涡旋光束实验（相息图产生 LG 涡旋光）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 E=E₀exp(ilφ) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "E=E₀exp(ilφ)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 E=E₀exp(ilφ) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-08": {
    "intro": "测量焦前、焦中和焦后光强与相位变化。",
    "theory": "本实验属于“现代光学实验”，以 I=I(r,z) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "光源、透镜、反射镜、光阑、精密位移台、观察屏和光斑测量工具。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“焦点附近的光场研究（焦前/中/后光强与 π 相位）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 I=I(r,z) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "I=I(r,z)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 I=I(r,z) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-09": {
    "intro": "利用像素超分辨重构提高图像空间细节。",
    "theory": "本实验属于“现代光学实验”，以 Iout=PSR(Iin) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "相机、镜头、光源、标定靶、图像采集卡和图像处理软件。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“超分辨率成像实验（像素超分辨 PSR 重构）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 Iout=PSR(Iin) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "Iout=PSR(Iin)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 Iout=PSR(Iin) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-10": {
    "intro": "实现Hough变换并检测图像中的圆形目标。",
    "theory": "本实验属于“现代光学实验”，以 ρ=xcosθ+ysinθ 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "相机、镜头、光源、标定靶、图像采集卡和图像处理软件。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“数字图像处理实验（Hough 变换检测圆形）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 ρ=xcosθ+ysinθ 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "ρ=xcosθ+ysinθ。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 ρ=xcosθ+ysinθ 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-11": {
    "intro": "利用剪切干涉图评价波前斜率与准直性。",
    "theory": "本实验属于“现代光学实验”，以 ΔW=s∂W/∂x 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "干涉仪、相干光源、分束镜、反射镜、精密位移台、观察屏和探测器。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“剪切干涉实验（剪切干涉图测准直性）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 ΔW=s∂W/∂x 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "ΔW=s∂W/∂x。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 ΔW=s∂W/∂x 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  },
  "hust-exact-13-12": {
    "intro": "利用泰伯效应和莫尔条纹评价光束准直性。",
    "theory": "本实验属于“现代光学实验”，以 p=pd/(d+z tanθ) 为核心关系。测量时需要说明变量含义、仪器工作区间、单位、重复性和误差来源，并用原始数据检验理论模型是否适用。",
    "apparatus": "课程指导书列出的仪器、标准件、数据采集工具和安全防护用品。课程记录地点：光电信息大楼。",
    "steps": [
      "按课程指导书核对实验项目、仪器量程、接线或光路和安全要求。",
      "完成“莫尔条纹实验（泰伯效应测准直性）”的初始设置，记录仪器型号、环境条件和原始读数。",
      "改变关键变量并按 p=pd/(d+z tanθ) 采集重复数据，保留异常点和设置条件。",
      "完成数据处理、图表、误差讨论与结论，注明数据来源和证据等级。"
    ],
    "variables": "p=pd/(d+z tanθ)。报告中应逐个说明符号、单位、测量方法、理论条件和适用区间。",
    "caution": "调光路时使用低功率指示光并避免镜面反射进入眼睛，精密位移台和探测器需在量程内使用。",
    "observations": "重点判断观测结果是否满足 p=pd/(d+z tanθ) 描述的关系，并比较重复测量、异常点和仪器工作区间。该条目来自《华科光电本科实验清单》，证据等级为“A 官网表格”。"
  }
};
  const noLabTerms = [
  {
    "term": "大三上 2028秋",
    "course": "（无实验课）",
    "note": "整学期纯理论：物理光学 64/4、激光原理与技术(Ⅰ) 48/3、光电探测与信号处理 48/3、通信原理(一) 48/3 等",
    "sourceRow": 59,
    "evidence": "A 真实课表"
  },
  {
    "term": "大四下 2030春",
    "course": "毕业设计",
    "note": "（无实验课）",
    "sourceRow": 86,
    "evidence": "A 真实课表"
  }
];

  window.HUST_UNDERGRADUATE_SOURCE = {
    title: "华科光电本科实验清单",
    fileName: "华科光电本科实验清单.xlsx",
    sheet: "实验清单",
    sourceRows: 85,
    experimentRows: 83,
    experimentCount: 83,
    courseCount: 13,
    noLabTermCount: 2,
    evidenceGrades: ["A 官网原文", "A 官网表格", "A 总课表原件", "A 真实课表（题目未公开）", "B 学生帖（三条互证）", "C 2021年新闻", "C 慕课+外系课件", "C 跨学院学生报告", "无依据", "无项目清单"]
  };

  window.LAB_CATALOG = catalog;
  window.LAB_EXPERIMENTS = catalog.flatMap((semester) =>
    semester.experiments.map((experiment, index) => ({
      ...experiment,
      year: semester.year,
      term: semester.term,
      semesterTitle: semester.title,
      semesterId: semester.id,
      semesterTermLabel: semester.termLabel,
      scope: semester.scope,
      officialCode: semester.catalogCode,
      officialCredits: semester.officialCredits,
      officialHours: semester.officialHours,
      sourceUrl: "华科光电本科实验清单.xlsx",
      index: index + 1
    }))
  );
  Object.assign(window.LAB_PRINCIPLES, principles);
  window.HUST_EXACT_NO_LAB_TERMS = noLabTerms;
})();

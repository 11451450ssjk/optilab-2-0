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
    "scope": "hust-exact",
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
    "scope": "hust-exact",
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
    "scope": "hust-exact",
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
    "year": 3,
    "term": 2,
    "termLabel": "大三下 2029春",
    "title": "激光实验",
    "focus": "半导体端面泵浦固体激光器（Nd:YVO4 工作特性）、He-Ne 激光模式测量、谐振腔调试等",
    "scope": "hust-exact",
    "catalogCode": "HUST-UG-04",
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
        "id": "hust-exact-04-01",
        "name": "半导体端面泵浦固体激光器（Nd:YVO4 工作特性）",
        "sim": "laser",
        "formula": "G≥L",
        "description": "测量端面泵浦固体激光器的阈值、输出功率和模式。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "光电信息大楼 A404，第 13-16 周",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 66,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-02",
        "name": "He-Ne 激光模式测量",
        "sim": "laser",
        "formula": "TEMmn",
        "description": "观察并测量He-Ne激光的横模结构。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 67,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-03",
        "name": "谐振腔调试",
        "sim": "laser",
        "formula": "g₁g₂ stability",
        "description": "调整腔镜位置与角度，使激光器满足稳定腔条件并起振。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 68,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-04",
        "name": "电光调 Q",
        "sim": "laser",
        "formula": "Ppeak≈E/τp",
        "description": "利用电光器件控制腔内损耗，产生短脉冲并测量峰值功率。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 69,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-05",
        "name": "声光调 Q",
        "sim": "laser",
        "formula": "Ppeak≈E/τp",
        "description": "利用声光调制控制腔内损耗，比较重复频率和脉冲宽度。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 70,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-04-06",
        "name": "临界腔法测量热透镜焦距",
        "sim": "laser",
        "formula": "1/fth=1/R1+1/R2",
        "description": "通过谐振腔稳定区边界测量热透镜焦距。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "激光实验",
        "catalogCode": "HUST-UG-04",
        "creditHours": "16学时 / 0.5学分",
        "sourceRow": 71,
        "sourceSheet": "实验清单"
      }
    ]
  },
  {
    "id": "hust-exact-course-05",
    "year": 4,
    "term": 1,
    "termLabel": "大四上 2029秋",
    "title": "现代光学实验",
    "focus": "相移干涉实验（四步相移测光学面型）、傅里叶变换光谱实验（时间调制 FT 测 LD 光谱）、激光外差实验（移频 + 光外差测微位移）等",
    "scope": "hust-exact",
    "catalogCode": "HUST-UG-05",
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
        "id": "hust-exact-05-01",
        "name": "相移干涉实验（四步相移测光学面型）",
        "sim": "michelson",
        "formula": "φ=arctan[(I4−I2)/(I1−I3)]",
        "description": "采集多步相移干涉图，恢复光学面形相位。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "光电信息大楼",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 74,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-02",
        "name": "傅里叶变换光谱实验（时间调制 FT 测 LD 光谱）",
        "sim": "fourier",
        "formula": "X(f)=∫x(t)e^(−j2πft)dt",
        "description": "通过干涉图傅里叶变换测量激光光谱。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 75,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-03",
        "name": "激光外差实验（移频 + 光外差测微位移）",
        "sim": "frequency",
        "formula": "Δf=2v/λ",
        "description": "利用移频和外差拍信号测量微小位移或速度。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 76,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-04",
        "name": "超窄线宽光谱实验（延迟自外差法测线宽）",
        "sim": "laser",
        "formula": "Δν=1/(πτd)",
        "description": "使用延迟自外差法测量超窄激光线宽。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 77,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-05",
        "name": "光源调制带宽实验（半导体激光器调制带宽）",
        "sim": "frequency",
        "formula": "H(f)=P(f)/P(0)",
        "description": "测量半导体激光器小信号调制响应和3 dB带宽。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 78,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-06",
        "name": "激光脉冲剪裁实验（声光调制）",
        "sim": "laser",
        "formula": "Eout(t)=Ein(t)H(t)",
        "description": "通过声光调制改变脉冲时域形状并测量输出。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 79,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-07",
        "name": "涡旋光束实验（相息图产生 LG 涡旋光）",
        "sim": "diffraction",
        "formula": "E=E₀exp(ilφ)",
        "description": "加载相位全息图产生涡旋光束并测量拓扑荷。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 80,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-08",
        "name": "焦点附近的光场研究（焦前/中/后光强与 π 相位）",
        "sim": "optics",
        "formula": "I=I(r,z)",
        "description": "测量焦前、焦中和焦后光强与相位变化。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 81,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-09",
        "name": "超分辨率成像实验（像素超分辨 PSR 重构）",
        "sim": "imaging",
        "formula": "Iout=PSR(Iin)",
        "description": "利用像素超分辨重构提高图像空间细节。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 82,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-10",
        "name": "数字图像处理实验（Hough 变换检测圆形）",
        "sim": "imaging",
        "formula": "ρ=xcosθ+ysinθ",
        "description": "实现Hough变换并检测图像中的圆形目标。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 83,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-11",
        "name": "剪切干涉实验（剪切干涉图测准直性）",
        "sim": "michelson",
        "formula": "ΔW=s∂W/∂x",
        "description": "利用剪切干涉图评价波前斜率与准直性。",
        "note": "",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
        "creditHours": "24学时 / 0.75学分",
        "sourceRow": 84,
        "sourceSheet": "实验清单"
      },
      {
        "id": "hust-exact-05-12",
        "name": "莫尔条纹实验（泰伯效应测准直性）",
        "sim": "diffraction",
        "formula": "p=pd/(d+z tanθ)",
        "description": "利用泰伯效应和莫尔条纹评价光束准直性。",
        "note": "另有综合类“光电技术综合实验：数字干涉测量/衍射测量/点扩散函数测量”",
        "requirement": "课程实开项目",
        "location": "",
        "evidenceGrade": "A 官网表格",
        "officialCourseName": "现代光学实验",
        "catalogCode": "HUST-UG-05",
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
  "hust-exact-04-02": {
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
  "hust-exact-04-03": {
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
  "hust-exact-04-04": {
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
  "hust-exact-04-05": {
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
  "hust-exact-04-06": {
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
  "hust-exact-05-01": {
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
  "hust-exact-05-02": {
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
  "hust-exact-05-03": {
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
  "hust-exact-05-04": {
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
  "hust-exact-05-05": {
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
  "hust-exact-05-06": {
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
  "hust-exact-05-07": {
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
  "hust-exact-05-08": {
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
  "hust-exact-05-09": {
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
  "hust-exact-05-10": {
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
  "hust-exact-05-11": {
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
  "hust-exact-05-12": {
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
  const excludedUnclear = [
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "直流试验单元的基本操作",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 31,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "故障检查",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 32,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "线性有源一端口网络等效参数的测定",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 33,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "交流参数与互感的测量——三表法",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 34,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "日光灯电路与功率因数的提高",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 35,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "三相电路中的电压、电流关系",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 36,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "示波器和函数发生器的使用",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 37,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "元件特性的示波器测量法",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 38,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "一阶电路的响应",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 39,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "二阶电路的响应",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 40,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二上 2027秋",
    "course": "电路测试实验",
    "name": "串联谐振电路",
    "evidence": "B 学生帖（三条互证）",
    "sourceRow": 41,
    "reason": "证据等级为 B 学生帖（三条互证），不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "电子测试与实验技术",
    "name": "常用电子仪器的使用（示波器自检、正弦/方波参数、万用表、稳压电源、面包板）",
    "evidence": "C 慕课+外系课件",
    "sourceRow": 42,
    "reason": "证据等级为 C 慕课+外系课件，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "电子测试与实验技术",
    "name": "半波整流电路输入输出波形观测",
    "evidence": "C 慕课+外系课件",
    "sourceRow": 43,
    "reason": "证据等级为 C 慕课+外系课件，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "电子测试与实验技术",
    "name": "RC 移相网络 / 一阶高通网络相频特性测量",
    "evidence": "C 慕课+外系课件",
    "sourceRow": 44,
    "reason": "证据等级为 C 慕课+外系课件，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "电子测试与实验技术",
    "name": "逻辑门电路参数与功能测试（TTL/CMOS 电平、三态门、OC 门线与、扇出）",
    "evidence": "C 慕课+外系课件",
    "sourceRow": 45,
    "reason": "证据等级为 C 慕课+外系课件，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "电子测试与实验技术",
    "name": "组合逻辑电路实验（与非门、或非门、表决电路、全加器）",
    "evidence": "C 慕课+外系课件",
    "sourceRow": 46,
    "reason": "证据等级为 C 慕课+外系课件，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "电子测试与实验技术",
    "name": "触发器实验（CC4027、74LS74）",
    "evidence": "C 慕课+外系课件",
    "sourceRow": 47,
    "reason": "证据等级为 C 慕课+外系课件，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "电子测试与实验技术",
    "name": "MSI 计数器实验（74LS161/74LS191、模 N、50% 占空比 10 分频）",
    "evidence": "C 慕课+外系课件",
    "sourceRow": 48,
    "reason": "证据等级为 C 慕课+外系课件，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "电子测试与实验技术",
    "name": "Verilog HDL 入门",
    "evidence": "C 慕课+外系课件",
    "sourceRow": 49,
    "reason": "证据等级为 C 慕课+外系课件，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "电子测试与实验技术",
    "name": "FPGA 小型数字系统（Nexys4：数字频率计、数字钟 + 7 段数码管动态扫描）",
    "evidence": "C 慕课+外系课件",
    "sourceRow": 50,
    "reason": "证据等级为 C 慕课+外系课件，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "微机实验",
    "name": "EMU8086 软件安装与使用",
    "evidence": "C 跨学院学生报告",
    "sourceRow": 51,
    "reason": "证据等级为 C 跨学院学生报告，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "微机实验",
    "name": "汇编语言实例讲解与程序编写",
    "evidence": "C 跨学院学生报告",
    "sourceRow": 52,
    "reason": "证据等级为 C 跨学院学生报告，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "微机实验",
    "name": "基于 Proteus 软件的 8086 最小系统硬件设计",
    "evidence": "C 跨学院学生报告",
    "sourceRow": 53,
    "reason": "证据等级为 C 跨学院学生报告，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "微机实验",
    "name": "基于 8086 最小系统的汇编程序设计（4×4 矩阵键盘→BCD 数码管）",
    "evidence": "C 跨学院学生报告",
    "sourceRow": 54,
    "reason": "证据等级为 C 跨学院学生报告，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "微机实验",
    "name": "8255 并行接口实验",
    "evidence": "C 跨学院学生报告",
    "sourceRow": 55,
    "reason": "证据等级为 C 跨学院学生报告，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "微机实验",
    "name": "工频测频接口电路设计与实现（设计性）",
    "evidence": "C 跨学院学生报告",
    "sourceRow": 56,
    "reason": "证据等级为 C 跨学院学生报告，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "光学系统设计",
    "name": "项目式设计（具体题目未公开）",
    "evidence": "无项目清单",
    "sourceRow": 57,
    "reason": "证据等级为 无项目清单，不是 A 级明确来源"
  },
  {
    "term": "大二下 2028春",
    "course": "工程训练（七）",
    "name": "金工实习（工种未核实）",
    "evidence": "无项目清单",
    "sourceRow": 58,
    "reason": "证据等级为 无项目清单，不是 A 级明确来源"
  },
  {
    "term": "大三下 2029春",
    "course": "光纤技术实验",
    "name": "光纤的切割与熔接",
    "evidence": "C 2021年新闻",
    "sourceRow": 60,
    "reason": "证据等级为 C 2021年新闻，不是 A 级明确来源"
  },
  {
    "term": "大三下 2029春",
    "course": "光纤技术实验",
    "name": "EDFA、EDFL 参数测量",
    "evidence": "C 2021年新闻",
    "sourceRow": 61,
    "reason": "证据等级为 C 2021年新闻，不是 A 级明确来源"
  },
  {
    "term": "大三下 2029春",
    "course": "光纤技术实验",
    "name": "光纤数值孔径测量",
    "evidence": "C 2021年新闻",
    "sourceRow": 62,
    "reason": "证据等级为 C 2021年新闻，不是 A 级明确来源"
  },
  {
    "term": "大三下 2029春",
    "course": "光纤技术实验",
    "name": "光纤损耗测量",
    "evidence": "C 2021年新闻",
    "sourceRow": 63,
    "reason": "证据等级为 C 2021年新闻，不是 A 级明确来源"
  },
  {
    "term": "大三下 2029春",
    "course": "光纤技术实验",
    "name": "光纤通信模块实验",
    "evidence": "C 2021年新闻",
    "sourceRow": 64,
    "reason": "证据等级为 C 2021年新闻，不是 A 级明确来源"
  },
  {
    "term": "大三下 2029春",
    "course": "光纤技术实验",
    "name": "半导体激光器输出波长与温度的关系——红移现象",
    "evidence": "C 2021年新闻",
    "sourceRow": 65,
    "reason": "证据等级为 C 2021年新闻，不是 A 级明确来源"
  },
  {
    "term": "大三下 2029春",
    "course": "光电子器件实验",
    "name": "（清单未知，未查到任何官方或学生来源）",
    "evidence": "无依据",
    "sourceRow": 72,
    "reason": "证据等级为 无依据，不是 A 级明确来源"
  },
  {
    "term": "大三下 2029春",
    "course": "专业方向课程设计",
    "name": "五选一：光电系统与信息处理 / 光电子器件与集成 / 光通信与光网络技术 / 激光科学与工程 / 微波与光电集成",
    "evidence": "A 真实课表（题目未公开）",
    "sourceRow": 73,
    "reason": "课程存在，但实验题目未公开"
  }
];

  window.HUST_UNDERGRADUATE_SOURCE = {
    title: "华科光电本科实验清单",
    fileName: "华科光电本科实验清单.xlsx",
    sheet: "实验清单",
    sourceRows: 85,
    experimentRows: 83,
    experimentCount: 47,
    excludedUnclearCount: 36,
    courseCount: 5,
    noLabTermCount: 2,
    evidenceGrades: ["A"]
  };

  window.LAB_CATALOG = [...catalog, ...(window.LAB_CATALOG || [])];
  window.LAB_EXPERIMENTS = window.LAB_CATALOG.flatMap((semester) =>
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
  window.HUST_EXACT_EXCLUDED_UNCLEAR = excludedUnclear;
})();

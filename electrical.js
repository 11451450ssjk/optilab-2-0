"use strict";

(function () {
  const SOURCE_URL = "https://oei.hust.edu.cn/info/1041/9935.htm";
  const makeExperiment = (id, name, sim, formula, description, theory) => ({
    id: `elec-${id}`,
    name,
    sim,
    formula,
    description,
    theory
  });
  const makeCourse = (id, year, term, title, focus, code, credits, hours, caution, experiments) => ({
    id: `electrical-course-${id}`,
    year,
    term,
    title,
    focus,
    scope: "electrical",
    officialCode: code,
    officialCredits: credits,
    officialHours: hours,
    sourceUrl: SOURCE_URL,
    caution,
    experiments: experiments.map((experiment) => ({
      ...experiment,
      electricalCourseCode: code,
      electricalCourseName: title,
      officialSourceUrl: SOURCE_URL
    }))
  });

  const COURSES = [
    makeCourse(
      "circuit-theory",
      1,
      2,
      "电路理论与测试实验扩展",
      "网络方程、暂态、谐振、互感、端口和功率",
      "EEE0721 / EEE0671",
      "4 + 1",
      "64 + 32",
      "接线前断电；电压源不得短路，电流源不得开路，仪表量程和极性必须预先确认。",
      [
        makeExperiment("nodal-mesh", "节点电压法与网孔电流法验证", "circuit", "YVU = J", "搭建多节点、多回路网络，测量节点电压和网孔电流并验证矩阵方程。", "节点电压法和网孔电流法把复杂电路转化为线性方程，测量结果应在参考方向和单位统一后满足网络方程。"),
        makeExperiment("superposition", "叠加定理与齐次定理", "circuit", "y=Σyi", "分别启用多个独立源，测量单源响应和总响应，检查线性叠加和比例缩放。", "线性网络的响应是各独立源单独作用响应的代数和，激励按比例变化时响应也应同比例变化。"),
        makeExperiment("three-element", "一阶电路三要素法", "rc", "x(t)=x(∞)+[x(0+)-x(∞)]e^(-t/τ)", "测量RC/RL电路初值、稳态值和时间常数，验证三要素法。", "一阶电路任意响应都可由初值、稳态值和指数衰减项描述，时间常数决定过渡过程速度。"),
        makeExperiment("series-resonance", "串联RLC谐振与品质因数", "frequency", "Q=(1/R)√(L/C)", "测量谐振频率、半功率带宽和品质因数，分析选频特性。", "串联谐振时感抗和容抗相互抵消，电流达到峰值，品质因数决定带宽和储能与耗能之比。"),
        makeExperiment("mutual-transformer", "互感与理想变压器", "circuit", "U2≈nU1", "测量互感电动势、同名端和变压器电压电流比。", "时变磁通在相邻线圈产生感应电动势，互感系数和匝数比决定耦合电压关系。"),
        makeExperiment("two-port-network", "二端口网络参数测量", "circuit", "Z=[Z11 Z12; Z21 Z22]", "测量开路、短路条件下的端口电压电流，提取Z/Y/ABCD参数。", "线性二端口网络用端口变量之间的矩阵关系描述，不同参数适合级联、匹配或传输分析。")
      ]
    ),
    makeCourse(
      "analog-electronics",
      1,
      3,
      "模拟电子技术实验扩展",
      "晶体管、放大器、运放、滤波与电源",
      "EIC0591",
      "3.5",
      "56",
      "晶体管和运放电源极性不得接反；示波器探头地线只能连接电路参考地。",
      [
        makeExperiment("bjt-curve", "晶体管输入输出特性", "semiconductor", "IC=βIB", "测量BJT输入、输出特性曲线，提取电流增益和工作区边界。", "晶体管集电极电流受基极电流和集射电压控制，特性曲线用于判断截止、放大和饱和区。"),
        makeExperiment("ce-output", "共射放大器频率与失真", "amplifier", "Au=-βRL'/rbe", "测量共射电路增益、输入输出电阻、频响和削顶失真。", "偏置决定静态工作点，交流小信号增益由跨导和负载决定，输出摆幅受截止和饱和边界限制。"),
        makeExperiment("cc-cb", "共集与共基放大电路", "amplifier", "Av≈1（共集）", "比较共集高输入阻抗、低输出阻抗和共基宽带低输入阻抗特性。", "不同晶体管组态改变输入输出节点，因此形成不同的增益、阻抗和频率响应。"),
        makeExperiment("differential-pair", "差分放大与共模抑制", "amplifier", "Adm=gmRD", "测量差模增益、共模增益和共模抑制比。", "差分对通过对称结构和恒流尾电流放大差模信号并抑制共同模干扰。"),
        makeExperiment("opamp-nonideal", "运放非理想特性", "amplifier", "Vout=G(V+-V-)", "测量失调、偏置电流、摆率、共模范围和输出电压摆幅。", "真实运放的开环增益、带宽、输入失调和输出摆率有限，会影响高精度和高频应用。"),
        makeExperiment("linear-regulator", "串联稳压与纹波抑制", "circuit", "Vout≈Vref(1+R1/R2)", "测量稳压器负载调整率、线性调整率和输出纹波。", "反馈稳压环路根据输出误差调整调整管，使输出电压在输入和负载变化时保持稳定。")
      ]
    ),
    makeCourse(
      "digital-logic",
      2,
      2,
      "数字电路与逻辑设计实验扩展",
      "组合逻辑、时序逻辑、转换器与数字系统",
      "EIC0751",
      "3.5",
      "56",
      "CMOS输入不得悬空，芯片电源与地必须确认；插拔芯片前先断电。",
      [
        makeExperiment("logic-family", "逻辑门电气特性与电平标准", "digital", "VIH/VIL/VOH/VOL", "测量逻辑门输入阈值、输出高低电平和噪声容限。", "数字逻辑通过电压区间定义0和1，噪声容限描述输入干扰下仍能正确识别逻辑值的范围。"),
        makeExperiment("combinational-design", "组合逻辑综合与译码", "digital", "Y=Σminterm", "根据真值表设计组合逻辑，使用译码器和逻辑门实现并验证。", "任何组合逻辑都可写成最小项表达式，经布尔化简和器件映射形成数字电路。"),
        makeExperiment("arithmetic-circuit", "比较器、加法器与ALU", "digital", "S=A+B+Ci", "搭建半加、全加、比较和简单ALU电路，验证算术功能。", "数字算术电路把多比特运算拆为进位、和值与比较逻辑，模块级联可扩展位宽。"),
        makeExperiment("sequential-basics", "触发器、寄存器与时序约束", "digital", "Qnext=D", "测量D触发器状态转换、时钟边沿和建立保持时间。", "触发器在有效时钟边沿保存输入，数据必须在建立保持窗口内稳定。"),
        makeExperiment("digital-counter", "计数器与分频器设计", "digital", "fout=fin/2^N", "设计同步和异步计数，观察状态序列、分频和毛刺。", "计数器由状态寄存器和次态逻辑构成，同步设计可减少级联延迟和毛刺。"),
        makeExperiment("data-converter", "ADC/DAC与量化误差", "sampling", "LSB=Vref/2^N", "测量ADC转换码值、DAC输出阶梯和有效位数。", "ADC把模拟量量化成离散码，DAC再将码值重建为模拟电压，分辨率由位数和参考电压决定。")
      ]
    ),
    makeCourse(
      "signals-systems",
      2,
      1,
      "信号与线性系统实验扩展",
      "卷积、采样、频谱、滤波、失真与相关检测",
      "OEI0000",
      "3",
      "48",
      "采样前确认信号幅度不超过采集设备量程，并避免输入超过奈奎斯特频率。",
      [
        makeExperiment("convolution", "线性时不变系统与卷积", "dsp", "y(t)=x(t)*h(t)", "测量冲激响应和任意输入响应，验证卷积关系。", "线性时不变系统完全由冲激响应描述，输出是输入与冲激响应的卷积。"),
        makeExperiment("sampling-alias", "采样定理与混叠观察", "sampling", "fs>2fmax", "改变采样率观察重构波形和频谱折叠。", "采样频谱会按采样频率周期复制，采样率不足时高频分量折叠到低频。"),
        makeExperiment("dft-window", "DFT、频谱泄漏与窗函数", "fourier", "X[k]=Σx[n]e^(-j2πkn/N)", "比较不同窗函数和采样长度对谱峰宽度与泄漏的影响。", "有限时长截断相当于乘窗，频域卷积造成泄漏；窗函数在旁瓣和主瓣宽度间折中。"),
        makeExperiment("analog-filter-response", "模拟滤波器幅频与群延迟", "frequency", "H(jω)=Y(jω)/X(jω)", "测量低通、高通、带通滤波器的幅频和群延迟。", "线性系统对每个频率分量产生幅度缩放和相位延迟，群延迟描述包络传播时间。"),
        makeExperiment("distortion-analysis", "谐波失真与互调", "fourier", "THD=√(ΣVn²)/V1", "测量放大或采集系统的谐波和互调分量。", "非线性使输出产生输入频率之外的谐波与组合频率，失真指标反映系统线性程度。"),
        makeExperiment("lock-in-detection", "锁相检测与相关分析", "measurement", "Vout∝Vscosφ", "利用参考信号提取掩埋在噪声中的微弱周期信号。", "锁相放大把输入与参考相乘并低通，只保留与参考相关的分量。")
      ]
    ),
    makeCourse(
      "electromagnetics",
      2,
      2,
      "电磁场、射频与电磁兼容实验扩展",
      "传输线、驻波、匹配、天线、功率与屏蔽",
      "OEI2061",
      "3",
      "48",
      "射频源开启前连接匹配负载，禁止空载或短路；天线测试避免人员进入辐射区。",
      [
        makeExperiment("coax-field", "同轴电缆电场与电容", "measurement", "C=2πεL/ln(b/a)", "测量同轴结构单位长度电容和介质参数。", "同轴电缆电场沿径向分布，内导体电压和几何尺寸决定单位长度电容。"),
        makeExperiment("transmission-standing-wave", "传输线驻波与反射系数", "communication", "Γ=ZL-Z0/ZL+Z0", "测量开路、短路和匹配负载下的驻波比与反射系数。", "负载与传输线阻抗不匹配时形成反射波，入射波和反射波叠加形成驻波。"),
        makeExperiment("smith-matching", "Smith圆图与阻抗匹配", "communication", "Zin=Z0(1+Γ)/(1-Γ)", "使用短截线或L网络完成单频匹配并测量回波损耗。", "匹配网络通过改变输入阻抗使反射系数接近零，Smith圆图用于直观设计。"),
        makeExperiment("antenna-pattern", "天线方向图与增益", "communication", "D=4πUmax/Prad", "测量天线方向图、半功率波束宽度和增益。", "天线方向图描述辐射强度随角度分布，方向性由最大辐射强度与平均辐射强度之比定义。"),
        makeExperiment("rf-power", "射频功率与衰减测量", "measurement", "dBm=10log(P/1mW)", "测量射频源功率、衰减器误差和传输线插损。", "射频功率常用dBm表示，链路中串联器件的分贝损耗可直接相加。"),
        makeExperiment("emc-shielding", "电磁兼容与屏蔽效能", "measurement", "SE=20log(E0/E1)", "测量屏蔽材料对近场或远场干扰的抑制能力。", "导电或磁性屏蔽层通过反射和吸收降低电磁场透射，接缝和孔洞会显著削弱屏蔽效能。")
      ]
    ),
    makeCourse(
      "mcu-electrical",
      2,
      2,
      "单片机原理与电气接口实验扩展",
      "GPIO、定时器、ADC、总线、存储与电机接口",
      "OEI0002 / OEI0066",
      "2.5 + 1",
      "40 + 16",
      "外设供电与IO电压必须匹配；电机负载需隔离并加入续流保护。",
      [
        makeExperiment("mcu-io", "GPIO、中断与电气隔离", "embedded", "VOH/VOL=逻辑电平", "使用按键中断驱动指示灯，并比较直接连接和光耦隔离。", "微控制器IO逻辑电平与外部负载电气特性需要匹配，光耦可提供隔离但增加延迟。"),
        makeExperiment("mcu-timer-pwm", "定时器、PWM与占空比", "embedded", "D=tHIGH/T", "测量PWM频率、占空比和电机或LED响应。", "定时器比较寄存器决定PWM边沿，占空比影响负载平均功率。"),
        makeExperiment("mcu-adc-electrical", "ADC采集与传感器前端", "embedded", "Code=Vin/Vref·2^N", "连接电位器或传感器完成采样、滤波和显示。", "传感器信号经过调理、采样、量化后进入算法，输入阻抗和参考源影响精度。"),
        makeExperiment("mcu-bus-electrical", "UART、I2C、SPI电气时序", "embedded", "Baud=1/Tbit", "测量串行总线电平和协议时序，定位应答或同步错误。", "不同串行总线使用不同电平和时序，上拉、片选、时钟极性和接地质量决定通信可靠性。"),
        makeExperiment("mcu-memory-display", "存储器与显示接口", "embedded", "Address → Data", "访问外部存储器并驱动OLED/LCD，观察地址、数据和刷新时序。", "存储器按地址读写数据，显示接口通过并行或串行时序更新像素。"),
        makeExperiment("mcu-motor-drive", "步进电机与功率驱动", "embedded", "θ=Npulse·step_angle", "驱动步进电机或直流电机，测量方向、转速和电流波形。", "功率驱动把弱电控制信号转换为电机电流，续流和限流保护用于抑制感性尖峰。")
      ]
    ),
    makeCourse(
      "engineering-training",
      2,
      2,
      "工程训练（七）电学实践扩展",
      "PCB、焊接、供配电、传感、FPGA和系统联调",
      "ENG3551",
      "1",
      "2w",
      "焊接和用电设备按训练中心规范使用；首次上电前完成短路、极性和绝缘检查。",
      [
        makeExperiment("pcb-workflow", "电路原理图与PCB设计", "circuit", "Netlist → Layout", "完成原理图、网络表、布局布线和Gerber输出。", "PCB把电路拓扑落实到实际导体和器件封装，布局布线会影响噪声、散热和可制造性。"),
        makeExperiment("soldering-test", "焊接、装配与连续性测试", "circuit", "Rcontact<<Rload", "完成通孔或贴片焊接，检查虚焊、短路和接触电阻。", "可靠焊接需要合适的温度、助焊剂和热容量，润湿良好的焊点具有低接触电阻。"),
        makeExperiment("power-distribution", "供配电与保护电路", "circuit", "I=P/U", "设计保险、反接、过流和浪涌保护，测试上电时序。", "供配电系统需要根据负载电流和浪涌选择导线、保险与保护器件。"),
        makeExperiment("sensor-interface", "传感器信号调理与校准", "measurement", "Vout=GVs+b", "完成传感器驱动、放大、滤波和两点校准。", "传感器前端把物理量转换为可测电压，增益和偏置校准减小系统误差。"),
        makeExperiment("fpga-electrical", "FPGA逻辑与I/O时序", "fpga", "fmax=1/Tcritical", "用FPGA实现分频、计数和接口，测量IO电平和时序。", "FPGA逻辑在时钟边沿更新，最长组合路径限制最高频率，IO标准影响电平兼容。"),
        makeExperiment("system-integration", "电子系统联调与故障定位", "integrated", "Input → Processing → Output", "连接电源、控制、传感、显示和执行模块，完成端到端联调。", "系统联调需要按模块验证电源、信号、时序和通信，再逐级缩小故障范围。")
      ]
    ),
    makeCourse(
      "electrical-integration",
      2,
      2,
      "电学综合设计与先进测量扩展",
      "微弱信号、反馈控制、电力电子、诊断和嵌入式综合",
      "EEE/EIC/ENG综合",
      "4",
      "64",
      "综合系统必须设置急停、限流和隔离；高压和功率器件区域不得直接触碰。",
      [
        makeExperiment("weak-electrical-signal", "微弱电信号与低噪声放大", "measurement", "Vn=√(4kTRB)", "测量热电偶、应变片或光电二极管的微弱信号并分析噪声。", "微弱信号检测受到热噪声、散粒噪声和放大器噪声限制，低噪声前端和窄带检测可提高信噪比。"),
        makeExperiment("precision-source-measure", "精密源表与四线测量", "measurement", "R=V/I", "使用四线法测量小电阻和接触电阻，评估源表精度。", "四线开尔文测量让激励电流和电压检测分离，从而消除引线电阻影响。"),
        makeExperiment("feedback-control", "反馈控制与PID调节", "integrated", "u=Kpe+Ki∫e+Kdde/dt", "控制加热器、电机或光功率，观察比例、积分和微分作用。", "反馈控制根据误差调整执行量，PID分别处理当前误差、累计误差和变化趋势。"),
        makeExperiment("power-electronics", "开关电源与DC-DC变换", "circuit", "Vout=D·Vin", "测量Buck/Boost变换器效率、纹波和开关波形。", "开关器件通过改变占空比控制能量传递，效率和纹波受频率、电感、电容与开关损耗影响。"),
        makeExperiment("electrical-fault", "电路故障诊断与信号追踪", "integrated", "Fault = Location + Cause", "设置开路、短路、器件失效和虚焊，使用仪表逐级定位。", "故障诊断依据电压、电流、阻抗和波形偏离正常基线，通过分区分割缩小范围。"),
        makeExperiment("embedded-electrical", "嵌入式电学系统综合设计", "integrated", "Sense → Control → Actuate", "完成采集、处理、显示、通信和执行闭环，形成可测试系统。", "嵌入式系统把模拟前端、数字控制、实时软件和执行器组合为目标明确的闭环。")
      ]
    )
  ];

  const PRINCIPLES = {};
  COURSES.forEach((course) => {
    course.experiments.forEach((experiment) => {
      PRINCIPLES[experiment.id] = {
        intro: experiment.description,
        theory: `${experiment.theory} 实验应围绕 ${experiment.formula} 检查理论关系，并记录电源、量程、负载和环境条件。对偏离理论的数据，应先验证接线、仪器内阻、器件工作区和参考地，再分析模型误差。`,
        apparatus: `华中科技大学2025级培养方案相关课程“${course.title}”对应实验平台，包括电源、信号源、示波器或数据采集卡、万用表、电子器件、传感器、控制板及配套软件。`,
        steps: [
          "完成断电检查和器件识别，确认电源、极性、参考地与仪表量程。",
          `按 ${experiment.name} 的电路或系统方案接线，上电前测量端口短路与关键阻抗。`,
          "分级上电并记录原始波形、码值或电压电流，改变一个变量后重复测量至少三次。"
        ],
        variables: `${experiment.formula}。所有符号应标注物理意义、单位与测量方法，并对理论值和实测值进行误差比较。`,
        caution: course.caution,
        observations: `重点检查 ${experiment.formula} 是否在器件工作范围内成立，同时观察波形畸变、温升、噪声、延迟和接触可靠性。该模块为华科培养方案对应课程的电学扩展实验，具体项目以学院当年实验安排为准。`
      };
    });
  });

  window.ELECTRICAL_2025_SOURCE = {
    title: "华中科技大学2025级光电信息科学与工程专业电学实验扩展",
    url: SOURCE_URL,
    courseCount: COURSES.length,
    experimentCount: COURSES.reduce((total, course) => total + course.experiments.length, 0)
  };
  window.LAB_CATALOG.push(...COURSES);
  window.LAB_EXPERIMENTS = window.LAB_CATALOG.flatMap((semester) =>
    semester.experiments.map((experiment, index) => ({
      ...experiment,
      year: semester.year,
      term: semester.term,
      semesterTitle: semester.title,
      semesterId: semester.id,
      scope: semester.scope || "general",
      officialCode: semester.officialCode || "",
      officialCredits: semester.officialCredits || "",
      officialHours: semester.officialHours || "",
      sourceUrl: semester.sourceUrl || "",
      optional: Boolean(semester.optional),
      index: index + 1
    }))
  );
  Object.assign(window.LAB_PRINCIPLES, PRINCIPLES);
})();

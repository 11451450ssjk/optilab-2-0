"use strict";

const EXPERIMENTS = window.LAB_EXPERIMENTS;
const CATALOG = window.LAB_CATALOG;
const REPORT_STORAGE_KEY = "optilab_advanced_reports_v2";
const REPORT_CLEANUP_BACKUP_KEY = "optilab_reports_cleanup_backup_v1";
const MAX_REPORTS = 30;

const SIM_INFO = {
  measurement: {
    domain: "基础测量",
    xLabel: "测量次数",
    yLabel: "测量值",
    principle: "通过多次重复测量获得样本，结合平均值、标准差、异常点和线性拟合评价测量系统的稳定性与系统误差。",
    errors: "仪器零位偏差、读数估读误差、环境变化和操作者习惯都会使重复测量产生离散。",
    improvements: "实验前完成仪器调零和校准，保持相同测量方向，增加样本量，并用统计图检查异常点。"
  },
  circuit: {
    domain: "电路基础",
    xLabel: "输入电压 (V)",
    yLabel: "支路电流 (mA)",
    principle: "线性电阻网络中的电压、电流满足欧姆定律和基尔霍夫定律，通过扫描输入电压可以观察电路的线性响应。",
    errors: "仪表内阻、导线接触电阻、电源内阻和元件温漂会造成测量偏差。",
    improvements: "使用高输入阻抗电压表，缩短引线，固定接触位置，并在稳定温度下完成重复测量。"
  },
  oscilloscope: {
    domain: "信号与示波器",
    xLabel: "时间 (ms)",
    yLabel: "电压 (V)",
    principle: "示波器按时间展开周期信号，利用触发同步显示幅值、周期、频率和相位信息。",
    errors: "探头衰减比设置错误、触发不稳定、带宽不足和接地回路噪声会影响波形读数。",
    improvements: "检查探头校准和衰减比，使用合适时基与垂直档位，并缩短地线以降低高频噪声。"
  },
  rc: {
    domain: "瞬态电路",
    xLabel: "时间 (ms)",
    yLabel: "电容电压 (V)",
    principle: "电容或电感储能元件使电路响应具有时间常数，一阶响应可用指数函数描述。",
    errors: "元件标称误差、内阻、示波器采样间隔和开关抖动会影响时间常数提取。",
    improvements: "提高采样率并记录完整起止过程，使用多个周期拟合时间常数，同时实测元件参数。"
  },
  semiconductor: {
    domain: "半导体器件",
    xLabel: "偏置电压 (V)",
    yLabel: "电流 (mA)",
    principle: "PN结和霍尔器件表现为明显的非线性或磁电耦合特性，偏置范围直接影响器件工作状态。",
    errors: "器件发热、接触电阻、仪表量程切换和温度漂移会导致曲线偏离理想模型。",
    improvements: "限制导通电流以减小温升，四线测量关键电阻，记录环境温度并分段拟合。"
  },
  "double-slit": {
    domain: "波动光学",
    xLabel: "屏幕位置 (mm)",
    yLabel: "相对光强",
    principle: "两束相干光在观察屏上叠加，光程差为波长整数倍的位置形成明纹，为半波长奇数倍的位置形成暗纹。",
    errors: "缝面与屏幕不平行、杂散光、缝间距偏差以及条纹中心定位误差是主要来源。",
    improvements: "增加遮光并记录多组条纹间距取平均，校准屏距与缝间距，避免使用过曝图像测量中心。"
  },
  diffraction: {
    domain: "衍射光学",
    xLabel: "衍射角 (mrad)",
    yLabel: "相对光强",
    principle: "孔径或障碍物限制波前后产生衍射，单缝和圆孔图样的中央亮纹宽度与波长、孔径和距离相关。",
    errors: "缝宽不均匀、边缘毛刺、光束未垂直入射和曝光非线性会造成图样畸变。",
    improvements: "使用高质量狭缝并调平光路，采用线性响应探测器，避免中央亮纹饱和。"
  },
  grating: {
    domain: "光谱与光栅",
    xLabel: "衍射角 (°)",
    yLabel: "相对光强",
    principle: "多缝衍射在满足光栅方程的方向形成尖锐主极大，不同波长对应不同衍射角。",
    errors: "光栅常数误差、入射角偏差、级次重叠和探测器非均匀响应会影响波长标定。",
    improvements: "使用多条标准谱线开展线性标定，控制入射角，并选择无级次重叠的光谱区间。"
  },
  optics: {
    domain: "应用光学",
    xLabel: "物距 (cm)",
    yLabel: "像距 (cm)",
    principle: "透镜成像满足高斯物像关系，系统焦距、物距和像距共同决定像的位置与放大率。",
    errors: "光心位置估计、景深、镜头标称焦距偏差和测量尺对齐误差会影响结果。",
    improvements: "增加物像位置测量次数，使用平行光法或自准直法互检焦距，并保持光轴共线。"
  },
  polarization: {
    domain: "偏振光学",
    xLabel: "检偏角 (°)",
    yLabel: "相对光强",
    principle: "线偏振光穿过检偏器后，透射光强随夹角按余弦平方规律变化。",
    errors: "偏振片消光比有限、入射光并非完全线偏振、背景光和角度零位偏差都会影响结果。",
    improvements: "扣除暗背景，校准偏振片零位，并使用消光比更高的偏振元件。"
  },
  michelson: {
    domain: "干涉测量",
    xLabel: "镜面位移 (μm)",
    yLabel: "相对光强",
    principle: "两臂光程差变化使观察屏条纹产生周期性明暗变化，可通过条纹数估算镜面位移或波长。",
    errors: "镜面不垂直、平台回程差、环境振动和条纹中心计数偏差是主要误差来源。",
    improvements: "沿同一方向移动镜架，增加条纹计数范围并多次取平均，同时缩短采集时间降低振动影响。"
  },
  newton: {
    domain: "干涉测量",
    xLabel: "暗环半径 (mm)",
    yLabel: "相对光强",
    principle: "平凸透镜与平板玻璃之间的空气楔形成等厚干涉，暗环半径平方与环序数近似线性。",
    errors: "接触压力导致透镜形变、表面灰尘、条纹中心偏移和读数显微镜标定误差会影响曲率半径。",
    improvements: "清洁接触面，避免过度加压，先用标准样板校验读数系统，并用多级暗环拟合。"
  },
  amplifier: {
    domain: "模拟电子",
    xLabel: "输入幅值 (mV)",
    yLabel: "输出幅值 (V)",
    principle: "放大器在合适静态工作点下近似线性放大输入信号，负反馈可稳定增益、扩展带宽并降低失真。",
    errors: "静态工作点漂移、运放失调、负载变化、电源噪声和示波器探头负载会导致增益误差。",
    improvements: "先检查静态工作点，使用低电容探头，保持输出远离削顶区，并在测试频率范围内比较增益。"
  },
  frequency: {
    domain: "频率响应",
    xLabel: "频率 (Hz)",
    yLabel: "增益 (dB)",
    principle: "滤波器或放大器的幅频响应决定不同频率信号的通过程度，截止频率和阶数描述其选择能力。",
    errors: "信号源输出阻抗、负载效应、寄生电容和测试点位置会影响频率响应。",
    improvements: "校准信号源幅值，固定探头连接方式，并覆盖足够宽的频段进行对数扫描。"
  },
  oscillator: {
    domain: "信号发生",
    xLabel: "时间 (ms)",
    yLabel: "输出电压 (V)",
    principle: "正反馈系统在满足幅值和相位条件时产生自激振荡，RC或LC网络决定主要振荡频率。",
    errors: "元件容差、电源波动、温漂和负载变化会使频率漂移或波形失真。",
    improvements: "记录起振过程，实测定时元件参数，在稳定输出后测量频率和占空比。"
  },
  digital: {
    domain: "数字逻辑",
    xLabel: "时间 (μs)",
    yLabel: "逻辑电平",
    principle: "组合与时序逻辑电路按照布尔函数和时钟节拍处理数字信号，建立保持时间决定可靠采样。",
    errors: "竞争冒险、毛刺、传播延迟、时钟抖动和探头接地不良会造成错误时序。",
    improvements: "使用逻辑分析仪多通道同步采集，缩短地线，并检查关键信号的建立保持窗口。"
  },
  sampling: {
    domain: "信号采样",
    xLabel: "采样点",
    yLabel: "信号幅值",
    principle: "采样率不足会造成频谱混叠，采样定理要求采样频率高于信号最高频率的两倍。",
    errors: "采样时钟抖动、抗混叠滤波不足和量化位数有限会造成频谱展宽与幅值误差。",
    improvements: "在ADC前加入合适的抗混叠滤波，提高采样率并记录实际时钟频率。"
  },
  fourier: {
    domain: "频谱分析",
    xLabel: "频率 (Hz)",
    yLabel: "幅度",
    principle: "任何满足条件的信号都可以分解为不同频率的简谐分量，时域周期和频域谱线位置相互对应。",
    errors: "频谱泄漏、窗函数选择、采样长度和噪声会改变频率分辨率与幅值。",
    improvements: "选择与信号周期匹配的采样长度，说明所用窗函数，并使用平均频谱降低随机噪声。"
  },
  dsp: {
    domain: "数字信号处理",
    xLabel: "采样点",
    yLabel: "信号幅值",
    principle: "数字滤波器按照离散差分方程处理采样序列，可在时域抑制噪声并在频域塑造响应。",
    errors: "滤波器阶数不足、群延迟、定点和舍入误差会影响实时处理结果。",
    improvements: "根据噪声频段选择滤波器，检查通带纹波与群延迟，并对多组数据采用相同流水线。"
  },
  photoelectric: {
    domain: "量子光电",
    xLabel: "入射光频率 (THz)",
    yLabel: "光电流 (nA)",
    principle: "当光子能量大于材料逸出功时产生光电子，截止电压与入射频率呈线性关系。",
    errors: "暗电流、接触电位差、光源波长漂移和阴极表面污染会影响截止电压。",
    improvements: "测量并扣除暗电流，稳定光源预热，保持阴极清洁，并对多组波长结果线性拟合。"
  },
  photodiode: {
    domain: "光电探测",
    xLabel: "反向偏压 (V)",
    yLabel: "光电流 (μA)",
    principle: "光电二极管把入射光功率转换为电流，响应度、暗电流和结电容共同决定灵敏度和带宽。",
    errors: "背景光、温度漂移、跨阻放大器增益误差和接触电阻会造成响应度偏差。",
    improvements: "遮挡背景光并测量暗电流，校准光功率，固定温度并选择合适反馈电阻。"
  },
  solar: {
    domain: "光伏器件",
    xLabel: "输出电压 (V)",
    yLabel: "输出电流 (mA)",
    principle: "太阳能电池的伏安曲线给出短路电流、开路电压和最大功率点，填充因子表示曲线质量。",
    errors: "光照不均匀、温度变化、接触电阻和负载扫描速度会影响填充因子。",
    improvements: "稳定光强与电池温度，使用四线测量并放慢扫描速度，取多组曲线平均。"
  },
  laser: {
    domain: "激光技术",
    xLabel: "传播距离 (mm)",
    yLabel: "光束半径 (px)",
    principle: "激光束近似服从高斯传播，光斑尺寸随传播距离增加，发散角与腰斑尺寸成反比。",
    errors: "相机曝光饱和、像素尺寸标定、光束截断和环境气流会造成光斑测量偏差。",
    improvements: "降低曝光避免饱和，扣除背景，使用二阶矩法计算半径，并在稳定环境中测量。"
  },
  imaging: {
    domain: "数字成像",
    xLabel: "像素位置",
    yLabel: "灰度值",
    principle: "相机把空间光强转换为离散像素灰度，通过标定、滤波和边缘检测实现尺寸测量与目标识别。",
    errors: "镜头畸变、曝光不均、像素标定误差和算法阈值选择会造成检测误差。",
    improvements: "使用标准靶标完成相机标定，控制均匀照明，并用多组样件评价算法稳定性。"
  },
  fiber: {
    domain: "光纤与光通信",
    xLabel: "传输距离 (km)",
    yLabel: "归一化光功率",
    principle: "光纤模式和损耗决定传输特性，衰减、色散、非线性以及环境应变会改变输出光信号。",
    errors: "连接器污染、熔接损耗、弯曲损耗和功率计零位会影响测量。",
    improvements: "测量前清洁连接器，记录参考功率，保持固定绕线半径，并完成双向损耗测量。"
  },
  holography: {
    domain: "全息光学",
    xLabel: "空间位置",
    yLabel: "干涉强度",
    principle: "物光与参考光干涉，将振幅与相位信息编码在记录介质中，再用参考光重现物体波前。",
    errors: "平台振动、光程差不匹配、曝光不足、显影偏差和参考光角度变化会降低重现质量。",
    improvements: "使用防振平台，等待系统稳定后曝光，严格控制光程差并记录显影条件。"
  },
  embedded: {
    domain: "嵌入式系统",
    xLabel: "时间 (μs)",
    yLabel: "逻辑电平",
    principle: "微控制器通过GPIO、定时器、ADC和通信外设完成采样与控制，软件时序决定系统实时性。",
    errors: "中断抖动、时钟偏差、总线负载和电源噪声会造成采样或通信错误。",
    improvements: "使用硬件定时器触发采样，记录中断延迟，并用逻辑分析仪检查总线时序。"
  },
  communication: {
    domain: "通信系统",
    xLabel: "信噪比 (dB)",
    yLabel: "误码率",
    principle: "接收信号在噪声影响下可能发生判决错误，眼图张开度、信噪比和误码率共同描述链路质量。",
    errors: "光源啁啾、链路损耗、时钟恢复抖动和接收机噪声会影响误码率。",
    improvements: "控制发射功率避免非线性，校准接收端，测量足够多的误码以降低统计不确定性。"
  },
  fpga: {
    domain: "数字硬件",
    xLabel: "时钟周期",
    yLabel: "逻辑状态",
    principle: "FPGA通过并行硬件逻辑实现计数、状态机和接口协议，时序约束决定稳定运行的最高频率。",
    errors: "跨时钟域、组合逻辑毛刺、时序违例和引脚约束缺失会导致功能错误。",
    improvements: "增加同步器，完成时序分析，使用片上逻辑分析仪观察关键状态，并固定IO标准。"
  },
  integrated: {
    domain: "综合系统",
    xLabel: "测试条件",
    yLabel: "系统响应",
    principle: "综合光电系统把光源、器件、采集电路、通信链路与算法组合起来，通过端到端指标评价整体性能。",
    errors: "模块间阻抗失配、同步误差、算法阈值和误差传递会造成系统级偏差。",
    improvements: "先分模块校准再联调，建立测试基线，保留原始数据并记录每次参数变更。"
  }
};

const CONTROL_DEFS = {
  measurement: [["测量次数", "次", 3, 20, 8, 1], ["标准值", "单位", 1, 12, 7.85, 0.01]],
  circuit: [["电源电压", "V", 0, 12, 5, 0.1], ["负载电阻", "Ω", 100, 2000, 1000, 10]],
  oscilloscope: [["信号频率", "kHz", 0.1, 20, 5, 0.1], ["信号幅值", "V", 0.1, 5, 2, 0.1]],
  rc: [["电阻", "kΩ", 1, 100, 10, 1], ["电容", "μF", 0.1, 100, 4.7, 0.1]],
  semiconductor: [["偏置电压", "V", 0, 1.2, 0.65, 0.01], ["环境温度", "K", 280, 340, 300, 1]],
  "double-slit": [["波长", "nm", 400, 750, 632, 1], ["缝间距", "mm", 0.10, 0.60, 0.25, 0.01]],
  diffraction: [["波长", "nm", 400, 750, 532, 1], ["缝宽", "μm", 10, 120, 50, 1]],
  grating: [["波长", "nm", 400, 750, 589, 1], ["光栅常数", "μm", 1, 10, 2.5, 0.1]],
  optics: [["物距", "cm", 5, 50, 20, 0.5], ["透镜焦距", "cm", 5, 30, 10, 0.5]],
  polarization: [["入射功率", "mW", 0.1, 10, 3, 0.1], ["检偏角", "°", 0, 360, 45, 1]],
  michelson: [["波长", "nm", 400, 750, 632, 1], ["镜面位移", "μm", 0, 4, 1.6, 0.01]],
  newton: [["波长", "nm", 400, 750, 589, 1], ["曲率半径", "cm", 10, 100, 50, 1]],
  amplifier: [["输入幅值", "mV", 1, 500, 40, 1], ["反馈系数", "β", 0, 0.5, 0.1, 0.01]],
  frequency: [["截止频率", "kHz", 10, 1000, 100, 1], ["滤波阶数", "阶", 1, 6, 2, 1]],
  oscillator: [["定时电阻", "kΩ", 1, 100, 10, 1], ["定时电容", "nF", 1, 1000, 100, 1]],
  digital: [["位速率", "Mbps", 0.1, 20, 2, 0.1], ["逻辑电压", "V", 1.8, 5, 3.3, 0.1]],
  sampling: [["信号频率", "Hz", 10, 1000, 120, 1], ["采样频率", "Hz", 20, 2000, 800, 1]],
  fourier: [["基频", "Hz", 10, 1000, 100, 1], ["谐波数", "个", 1, 12, 5, 1]],
  dsp: [["噪声强度", "%", 0, 100, 35, 1], ["滤波阶数", "阶", 2, 32, 12, 1]],
  photoelectric: [["光波长", "nm", 300, 700, 450, 1], ["光强", "%", 10, 100, 60, 1]],
  photodiode: [["反向偏压", "V", 0, 12, 5, 0.1], ["入射功率", "μW", 1, 500, 100, 1]],
  solar: [["光照强度", "%", 10, 100, 80, 1], ["电池温度", "°C", 15, 70, 25, 1]],
  laser: [["波长", "nm", 400, 750, 650, 1], ["驱动电流", "mA", 0, 100, 55, 1]],
  imaging: [["曝光时间", "ms", 0.1, 30, 5, 0.1], ["镜头光圈", "F", 1.4, 16, 4, 0.1]],
  fiber: [["工作波长", "nm", 850, 1650, 1550, 1], ["传输距离", "km", 0, 80, 25, 1]],
  holography: [["曝光时间", "s", 0.1, 20, 4, 0.1], ["参考光夹角", "°", 5, 60, 30, 1]],
  embedded: [["波特率", "kbps", 1, 1000, 115.2, 0.1], ["ADC位数", "bit", 8, 16, 12, 1]],
  communication: [["发射功率", "dBm", -10, 10, 0, 0.1], ["链路损耗", "dB", 0, 40, 18, 0.1]],
  fpga: [["时钟频率", "MHz", 1, 200, 50, 1], ["计数位宽", "bit", 4, 24, 12, 1]],
  integrated: [["系统增益", "dB", 0, 80, 35, 1], ["阈值水平", "%", 0, 100, 50, 1]]
};

const SCENE_GUIDES = {
  measurement: {
    action: "系统对同一物理量进行重复采样并形成测量序列",
    attention: "观察散点围绕趋势线的离散程度以及明显的离群点",
    effect: "样本量增加会降低随机误差，但不会自动消除系统误差"
  },
  circuit: {
    action: "可调电源驱动电阻网络，仪表读取端口电压与支路电流",
    attention: "观察电压、电流是否满足欧姆定律和节点守恒",
    effect: "负载电阻增大时电流减小，功率和温升也会随之变化"
  },
  oscilloscope: {
    action: "示波器按时间展开输入信号并利用触发稳定波形",
    attention: "重点看周期、峰峰值、相位和上升沿是否清晰",
    effect: "频率改变时水平周期变化，幅值改变时垂直高度变化"
  },
  rc: {
    action: "电容通过电阻充电或放电，电压按指数规律趋近稳态",
    attention: "观察曲线在 τ 时刻完成约 63.2% 的变化",
    effect: "增大 R 或 C 会延长时间常数，使充放电过程变慢"
  },
  semiconductor: {
    action: "半导体器件在偏置作用下形成非线性电流响应",
    attention: "关注开启电压、曲线斜率、反向漏电和温度漂移",
    effect: "温度升高通常使相同电流对应的正向电压降低"
  },
  "double-slit": {
    action: "相干光束通过两条狭缝后在观察屏叠加",
    attention: "观察中央明纹、左右对称性和相邻明纹间距",
    effect: "缝间距增大时条纹变密，波长增大时条纹变疏"
  },
  diffraction: {
    action: "受限波前通过孔径后发生扩散和相互叠加",
    attention: "中央亮纹最宽最亮，两侧旁瓣强度快速下降",
    effect: "缝宽减小时中央亮纹变宽，衍射扩展更明显"
  },
  grating: {
    action: "多缝衍射把复色光按波长分离到不同衍射角",
    attention: "观察零级中心、彩色光谱顺序和高阶级次展宽",
    effect: "光栅常数减小或波长增大时，衍射角增大"
  },
  optics: {
    action: "物体发出的光经薄透镜折射后在像面重新会聚",
    attention: "关注物体、透镜、像面的位置关系和清晰度",
    effect: "物距接近焦距时像距快速增大，放大率也显著变化"
  },
  polarization: {
    action: "线偏振光通过旋转检偏器，透射振幅沿透振方向投影",
    attention: "观察光强随检偏角呈 180° 周期的余弦平方变化",
    effect: "两偏振片正交时光强最小，平行时光强最大"
  },
  michelson: {
    action: "激光经分束镜分为两束，经反射后重新叠加形成干涉",
    attention: "观察同心圆条纹、中心吞吐和左右对称性",
    effect: "镜面位移改变往返光程，条纹随光程差发生周期性变化"
  },
  newton: {
    action: "空气楔上下表面的反射光发生等厚干涉",
    attention: "暗环应同心、中心稳定，环半径平方随级次近似线性",
    effect: "曲率半径越大，同级暗环半径越大，条纹越疏"
  },
  amplifier: {
    action: "晶体管或运放把微小输入信号放大并输出到负载",
    attention: "比较输入输出幅值、相位和是否出现削顶",
    effect: "负反馈降低增益但提高稳定性和线性范围"
  },
  frequency: {
    action: "扫描频率测试系统在不同频段下的增益与相位",
    attention: "寻找通带、截止频率、滚降斜率和异常谐振峰",
    effect: "截止频率升高时高频响应展宽，阶数增加时带外衰减更陡"
  },
  oscillator: {
    action: "正反馈网络形成自激振荡并由非线性环节稳定幅值",
    attention: "观察起振过程、稳定频率、占空比和波形失真",
    effect: "RC 参数改变振荡频率，反馈增益影响起振与稳幅"
  },
  digital: {
    action: "多路数字信号按时钟节拍在逻辑门和触发器间传播",
    attention: "重点看高低电平、边沿对齐、毛刺和建立保持关系",
    effect: "位速率提高后时序余量缩小，传输延迟与抖动更明显"
  },
  sampling: {
    action: "连续信号在离散时刻被采样并转换为数字序列",
    attention: "观察采样点密度、混叠频率和量化台阶",
    effect: "采样率低于两倍最高频率时会出现频率折叠和伪信号"
  },
  fourier: {
    action: "时域信号被分解为基频、谐波和噪声分量",
    attention: "观察谱峰位置、谐波幅度和频谱泄漏",
    effect: "基频决定谱线位置，信号脉宽和采样长度影响频谱包络"
  },
  dsp: {
    action: "数字滤波器对采样序列进行加权运算并抑制目标频段",
    attention: "比较滤波前后的噪声、信号幅值、振铃和群延迟",
    effect: "阶数增加通常提高抑制能力，但会带来更多延迟和计算量"
  },
  photoelectric: {
    action: "光子照射阴极，能量足够时激发电子并形成光电流",
    attention: "观察入射波长、逸出电子数量和截止电压",
    effect: "波长缩短提高单光子能量；光强增加主要提高光电流"
  },
  photodiode: {
    action: "入射光在 PN 结耗尽区产生载流子并形成光电流",
    attention: "关注暗电流、线性响应、饱和点和响应速度",
    effect: "反向偏压增大通常提高速度，但也会增加暗电流"
  },
  solar: {
    action: "光伏材料把光能转换为电能，负载决定工作点",
    attention: "观察 I–V 曲线的膝点、最大功率点和填充因子",
    effect: "光照增强提高短路电流，温度升高通常降低开路电压"
  },
  laser: {
    action: "激光束沿光轴传播，横向能量呈近高斯分布",
    attention: "观察束腰、光斑半径随距离扩展以及光束边缘衰减",
    effect: "腰斑越小，衍射发散角越大；驱动功率影响亮度"
  },
  imaging: {
    action: "相机把空间光强转换为像素灰度，算法提取边缘与目标",
    attention: "关注像素灰度阶梯、目标轮廓和噪声纹理",
    effect: "曝光提高会增强信号，但过曝会让高亮区域失去细节"
  },
  fiber: {
    action: "光脉冲被约束在纤芯中传播，同时因吸收和散射而衰减",
    attention: "观察脉冲亮度随距离下降、包层内模式以及色散展宽",
    effect: "距离或损耗系数增加时输出功率按指数下降"
  },
  holography: {
    action: "物光与参考光在记录面形成稳定干涉条纹",
    attention: "观察条纹周期、局部对比度和重现像的空间视差",
    effect: "参考光夹角改变条纹密度，振动与曝光不当会降低重现质量"
  },
  embedded: {
    action: "微控制器通过 GPIO、定时器和串行总线处理数字信号",
    attention: "观察时钟、数据、片选和应答信号的时序关系",
    effect: "通信速率提高时每位时间缩短，对采样和同步要求更高"
  },
  communication: {
    action: "接收光信号在噪声与码间干扰下形成眼图并参与判决",
    attention: "观察眼图张开度、交叉点抖动和判决门限",
    effect: "信噪比或链路损耗变差时眼图闭合，误码率上升"
  },
  fpga: {
    action: "FPGA 内部的并行逻辑按全局时钟同步更新寄存器",
    attention: "重点看时钟边沿、状态转换、计数分频和毛刺",
    effect: "时钟频率升高会压缩时序裕量，跨时钟域需要同步"
  },
  integrated: {
    action: "光信号依次经过探测、采集、处理、通信和决策模块",
    attention: "观察各模块响应、端到端延迟和误差传递",
    effect: "任一模块的增益、噪声或阈值变化都会影响最终检测结果"
  }
};

const state = {
  experimentId: EXPERIMENTS[0]?.id || "",
  primary: 632,
  secondary: 1.6,
  paused: false,
  autoScan: false,
  phase: 0,
  lastFrame: 0,
  labMode: "overall",
  speed: 1,
  annotations: true,
  parsed: null,
  data: null,
  reports: [],
  activeReportId: null,
  photoInfo: null,
  filterYear: "all",
  search: "",
  labInView: true
};

let catalogSearchTimer = 0;

const labCanvas = document.getElementById("lab-canvas");
const lab3dCanvas = document.getElementById("lab-3d-canvas");
const labContext = labCanvas.getContext("2d");
const chartCanvas = document.getElementById("advanced-chart");
const chartContext = chartCanvas.getContext("2d");
const primaryControl = document.getElementById("primary-control");
const secondaryControl = document.getElementById("secondary-control");
const reportPreview = document.getElementById("advanced-report-preview");
const toast = document.getElementById("toast");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

function compactNumber(value) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1000000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(2);
  }
  return formatNumber(value, Math.abs(value) < 10 ? 3 : 2);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let motionObserver = null;

function refreshMotionTargets() {
  if (!motionObserver) return;
  const selector = [
    ".section-heading",
    ".year-overview-card",
    ".semester-group",
    ".lab-stage-panel",
    ".lab-info-panel",
    ".principle-dossier",
    ".data-card",
    ".data-summary-card",
    ".literature-search-panel",
    ".citation-library-panel",
    ".literature-results-wrap",
    ".advanced-report-panel",
    ".report-history-panel",
    ".paper-config-panel",
    ".paper-preview-panel"
  ].join(",");
  document.querySelectorAll(selector).forEach((element) => {
    if (element.dataset.motionRegistered) return;
    element.dataset.motionRegistered = "true";
    element.classList.add("motion-reveal");
    motionObserver.observe(element);
  });
}

function setupMotionObserver() {
  if (reducedMotion) return;
  motionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("motion-visible");
        motionObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -35px 0px"
  });
  refreshMotionTargets();
}

function pulseMotion(element, className) {
  if (!element || reducedMotion) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), 520);
}

function animateMetric(element, target, formatter = (value) => compactNumber(value), duration = 650) {
  if (!element) return;
  if (element._metricFrame) cancelAnimationFrame(element._metricFrame);
  if (reducedMotion) {
    element.textContent = formatter(target);
    return;
  }
  const start = performance.now();
  element.classList.add("metric-animating");
  const tick = (now) => {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatter(target * eased);
    if (progress < 1) {
      element._metricFrame = requestAnimationFrame(tick);
    } else {
      element.textContent = formatter(target);
      element.classList.remove("metric-animating");
      element._metricFrame = null;
    }
  };
  element._metricFrame = requestAnimationFrame(tick);
}

function currentExperiment() {
  return EXPERIMENTS.find((experiment) => experiment.id === state.experimentId) || EXPERIMENTS[0];
}

function simInfo(experiment = currentExperiment()) {
  return SIM_INFO[experiment.sim] || SIM_INFO.measurement;
}

function principleInfo(experiment = currentExperiment()) {
  return (window.LAB_PRINCIPLES && window.LAB_PRINCIPLES[experiment.id]) || {
    intro: experiment.description,
    theory: simInfo(experiment).principle,
    apparatus: "按照实验指导书准备对应光学、电子或数据采集设备。",
    steps: ["确认仪器状态和安全条件。", "设置实验参数并采集数据。", "保存原始记录并完成数据复核。"],
    variables: experiment.formula,
    caution: "遵守实验室安全规范和仪器额定参数。",
    observations: "关注响应趋势、重复性和异常值，并与理论关系对照。"
  };
}

function equipmentProfile(experiment = currentExperiment()) {
  return window.OptilabEquipmentStore?.getProfile(experiment.sim)
    || window.OPTILAB_EQUIPMENT_PROFILES?.[experiment.sim] || {
    instruments: [
      { name: "实验仪器与数据采集设备", spec: "量程、精度和校准状态满足课程要求", use: "完成测量和数据采集" }
    ],
    conditions: [
      { label: "环境温度", value: "20±5 ℃" },
      { label: "相对湿度", value: "30%–70%" },
      { label: "供电", value: "符合仪器铭牌要求并可靠接地" }
    ],
    tips: ["先阅读仪器操作说明", "记录仪器编号和参数", "保留原始数据"],
    safety: "遵守课程实验室安全规定，设备异常时立即断电并报告指导教师。"
  };
}

function renderEquipmentProfile(experiment = currentExperiment()) {
  const profile = equipmentProfile(experiment);
  document.getElementById("equipment-subtitle").textContent =
    `${experiment.name} · ${profile.instruments.length} 类建议器材`;
  document.getElementById("equipment-instruments").innerHTML = profile.instruments.map((item, index) => `
    <div class="equipment-item">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.spec)}</small>
        <em>${escapeHtml(item.use)}</em>
      </div>
    </div>
  `).join("");
  document.getElementById("equipment-conditions").innerHTML = profile.conditions.map((item) => `
    <div class="condition-item">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </div>
  `).join("");
  document.getElementById("equipment-tips").innerHTML = profile.tips
    .map((tip) => `<li>${escapeHtml(tip)}</li>`)
    .join("");
  document.getElementById("equipment-safety").textContent = profile.safety;
}

function setupWelcomeScreen() {
  const welcome = document.getElementById("welcome-screen");
  const button = document.getElementById("enter-optilab");
  if (!welcome || !button) {
    document.body.classList.remove("welcome-locked");
    return;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("entered") === "1") {
    welcome.hidden = true;
    document.body.classList.remove("welcome-locked");
    const nextTarget = params.get("next");
    window.setTimeout(() => {
      const destination = nextTarget ? document.getElementById(nextTarget) : document.getElementById("top");
      destination?.scrollIntoView({ behavior: "instant", block: "start" });
    }, 80);
    return;
  }
  let autoEntry = false;
  try {
    const checkins = JSON.parse(localStorage.getItem("optilab_morning_checkins_v1") || "[]");
    autoEntry = localStorage.getItem("optilab_checkin_auto_entry_v1") === "1"
      || (Array.isArray(checkins) && checkins.length > 0);
  } catch {
    autoEntry = false;
  }
  if (autoEntry) {
    const overlay = document.createElement("div");
    overlay.className = "auto-entry-overlay is-visible";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.innerHTML = `
      <div class="auto-entry-card">
        <span class="auto-entry-kicker">OPTILAB · READY</span>
        <strong>晨光记录已完成</strong>
        <p>系统正在恢复实验工作台，无需再次点击打卡。</p>
        <div class="auto-entry-loader" aria-hidden="true"><i></i></div>
        <small>约 1 秒后自动进入</small>
      </div>`;
    document.body.appendChild(overlay);
    window.setTimeout(() => {
      welcome.hidden = true;
      welcome.classList.remove("leaving");
      document.body.classList.remove("welcome-locked");
      const nextTarget = params.get("next") || "catalog-section";
      document.getElementById(nextTarget)?.scrollIntoView({ behavior: "instant", block: "start" });
      overlay.classList.add("leaving");
      window.setTimeout(() => overlay.remove(), 260);
    }, 1000);
    return;
  }
  const openCheckinPage = (targetId = "catalog-section") => {
    if (welcome.hidden) return;
    welcome.classList.add("leaving");
    document.body.classList.remove("welcome-locked");
    window.setTimeout(() => {
      window.location.href = `checkin.html?next=${encodeURIComponent(targetId || "catalog-section")}`;
    }, 260);
  };
  button.addEventListener("click", () => openCheckinPage("catalog-section"));
  document.querySelectorAll("[data-welcome-target]").forEach((targetButton) => {
    targetButton.addEventListener("click", () => openCheckinPage(targetButton.dataset.welcomeTarget));
  });
  window.setTimeout(() => button.focus(), 100);
}

function sceneGuide(experiment = currentExperiment()) {
  return SCENE_GUIDES[experiment.sim] || {
    action: "实验模型根据当前参数实时计算并显示响应",
    attention: "观察响应趋势、对称性、极值和噪声",
    effect: "改变输入参数并比较输出变化，建立参数与现象的对应关系"
  };
}

function updateSimulationStory() {
  const guide = sceneGuide();
  const derived = calculateDerivedReading();
  document.getElementById("sim-action").textContent = guide.action;
  document.getElementById("sim-attention").textContent = guide.attention;
  document.getElementById("sim-effect").textContent = `${guide.effect}。当前：${derived.value}`;
  pulseMotion(document.querySelector(".simulation-story"), "story-refresh");
}

function controlConfig(experiment = currentExperiment()) {
  const defs = CONTROL_DEFS[experiment.sim] || CONTROL_DEFS.measurement;
  return {
    primary: {
      label: experiment.primaryLabel || defs[0][0],
      unit: experiment.primaryUnit || defs[0][1],
      min: experiment.primaryMin ?? defs[0][2],
      max: experiment.primaryMax ?? defs[0][3],
      value: experiment.primaryValue ?? defs[0][4],
      step: experiment.primaryStep ?? defs[0][5]
    },
    secondary: {
      label: experiment.secondaryLabel || defs[1][0],
      unit: experiment.secondaryUnit || defs[1][1],
      min: experiment.secondaryMin ?? defs[1][2],
      max: experiment.secondaryMax ?? defs[1][3],
      value: experiment.secondaryValue ?? defs[1][4],
      step: experiment.secondaryStep ?? defs[1][5]
    }
  };
}

function formatControlValue(value, config) {
  const digits = config.step < 0.1 ? 2 : config.step < 1 ? 1 : 0;
  return `${formatNumber(value, digits)} ${config.unit}`;
}

function setCanvasResolution(canvasElement) {
  const rect = canvasElement.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvasElement.width !== width || canvasElement.height !== height) {
    canvasElement.width = width;
    canvasElement.height = height;
  }
  const context = canvasElement.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width: rect.width, height: rect.height };
}

function wavelengthToRgb(wavelength) {
  let red = 0;
  let green = 0;
  let blue = 0;
  if (wavelength >= 380 && wavelength < 440) {
    red = -(wavelength - 440) / 60;
    blue = 1;
  } else if (wavelength < 490) {
    green = (wavelength - 440) / 50;
    blue = 1;
  } else if (wavelength < 510) {
    green = 1;
    blue = -(wavelength - 510) / 20;
  } else if (wavelength < 580) {
    red = (wavelength - 510) / 70;
    green = 1;
  } else if (wavelength < 645) {
    red = 1;
    green = -(wavelength - 645) / 65;
  } else if (wavelength <= 780) {
    red = 1;
  }
  const factor = wavelength > 700 ? 0.3 + (0.7 * (780 - wavelength)) / 80 : 1;
  return [
    Math.round(255 * clamp(red * factor, 0, 1)),
    Math.round(255 * clamp(green * factor, 0, 1)),
    Math.round(255 * clamp(blue * factor, 0, 1))
  ];
}

function signalColor() {
  const experiment = currentExperiment();
  if (experiment.sim === "michelson" || experiment.sim === "newton" || experiment.sim === "double-slit" || experiment.sim === "diffraction" || experiment.sim === "grating") {
    return wavelengthToRgb(state.primary);
  }
  return [103, 229, 154];
}

function rgba(color, alpha = 1) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function drawGrid(context, width, height) {
  context.save();
  context.strokeStyle = "rgba(206, 247, 217, 0.045)";
  context.lineWidth = 1;
  for (let x = 24; x < width; x += 32) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 24; y < height; y += 32) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();
}

function drawCanvasAxes(context, width, height, options = {}) {
  const left = options.left || 54;
  const right = options.right || width - 28;
  const top = options.top || 28;
  const bottom = options.bottom || height - 36;
  context.save();
  context.strokeStyle = "rgba(208, 242, 216, 0.25)";
  context.fillStyle = "rgba(208, 242, 216, 0.44)";
  context.lineWidth = 1;
  context.font = '9.5px "Microsoft YaHei UI", sans-serif';
  context.beginPath();
  context.moveTo(left, top);
  context.lineTo(left, bottom);
  context.lineTo(right, bottom);
  context.stroke();
  for (let index = 0; index <= 4; index += 1) {
    const x = left + ((right - left) * index) / 4;
    const y = top + ((bottom - top) * index) / 4;
    context.beginPath();
    context.moveTo(x, bottom);
    context.lineTo(x, bottom + 4);
    context.moveTo(left, y);
    context.lineTo(left - 4, y);
    context.stroke();
  }
  return { left, right, top, bottom };
}

function drawLabel(context, text, x, y, color = "rgba(214, 245, 220, 0.55)", align = "left") {
  if (!state.annotations) return;
  const safeY = y < 32 && (x < 150 || align === "right") ? y + 20 : y;
  context.save();
  context.fillStyle = color;
  context.font = '10.5px "Microsoft YaHei UI", sans-serif';
  context.textAlign = align;
  context.fillText(text, x, safeY);
  context.restore();
}

function drawBeam(context, x1, y1, x2, y2, color, time, alpha = 1, dotted = true) {
  context.save();
  context.strokeStyle = rgba(color, alpha);
  context.lineWidth = 1.8;
  if (dotted) context.setLineDash([7, 6]);
  context.lineDashOffset = -time * 0.035;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
}

function drawLabFrame(time) {
  const experiment = currentExperiment();
  const control = controlConfig(experiment);
  const beamColor = control.primary.unit === "nm"
    ? wavelengthToRgb(clamp(state.primary, 380, 780))
    : wavelengthToRgb(632);
  const panoramaConfig = {
    primary: state.primary,
    secondary: state.secondary,
    primaryLabel: control.primary.label,
    primaryUnit: control.primary.unit,
    secondaryLabel: control.secondary.label,
    secondaryUnit: control.secondary.unit,
    experimentId: experiment.id,
    experimentName: experiment.name,
    sim: experiment.sim,
    experiment,
    annotations: state.annotations,
    beamColor
  };
  if (state.labMode === "3d" && window.OptilabPanorama3D) {
    window.OptilabPanorama3D.render(time, {
      ...panoramaConfig,
      experiment
    });
    return;
  }
  const { width, height } = setCanvasResolution(labCanvas);
  labContext.clearRect(0, 0, width, height);
  if (state.labMode === "overall" && window.OptilabPanorama) {
    window.OptilabPanorama.init(labCanvas);
    window.OptilabPanorama.draw(labContext, width, height, time, panoramaConfig);
    return;
  }
  const gradient = labContext.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0c1e16");
  gradient.addColorStop(0.58, "#0e2118");
  gradient.addColorStop(1, "#10291d");
  labContext.fillStyle = gradient;
  labContext.fillRect(0, 0, width, height);
  drawPerspectiveBench(labContext, width, height, time);
  drawGrid(labContext, width, height);
  if (state.labMode === "measure") {
    drawMeasurementOverlay(width, height);
  }
  switch (experiment.sim) {
    case "measurement":
      drawMeasurementModel(width, height, time);
      break;
    case "circuit":
      drawCircuitModel(width, height, time);
      break;
    case "oscilloscope":
      drawOscilloscopeModel(width, height, time);
      break;
    case "rc":
      drawRCModel(width, height, time);
      break;
    case "semiconductor":
      drawSemiconductorModel(width, height, time);
      break;
    case "double-slit":
      drawDoubleSlitModel(width, height, time);
      break;
    case "diffraction":
      drawDiffractionModel(width, height, time);
      break;
    case "grating":
      drawGratingModel(width, height, time);
      break;
    case "optics":
      drawOpticsModel(width, height, time);
      break;
    case "polarization":
      drawPolarizationModel(width, height, time);
      break;
    case "michelson":
      drawMichelsonModel(width, height, time);
      break;
    case "newton":
      drawNewtonModel(width, height, time);
      break;
    case "amplifier":
      drawAmplifierModel(width, height, time);
      break;
    case "frequency":
      drawFrequencyModel(width, height, time);
      break;
    case "oscillator":
      drawOscillatorModel(width, height, time);
      break;
    case "digital":
    case "fpga":
      drawDigitalModel(width, height, time);
      break;
    case "sampling":
    case "fourier":
    case "dsp":
      drawSpectrumModel(width, height, time);
      break;
    case "photoelectric":
      drawPhotoelectricModel(width, height, time);
      break;
    case "photodiode":
    case "solar":
      drawDeviceIVModel(width, height, time);
      break;
    case "laser":
      drawLaserModel(width, height, time);
      break;
    case "imaging":
      drawImagingModel(width, height, time);
      break;
    case "fiber":
      drawFiberModel(width, height, time);
      break;
    case "holography":
      drawHolographyModel(width, height, time);
      break;
    case "embedded":
      drawEmbeddedModel(width, height, time);
      break;
    case "communication":
      drawCommunicationModel(width, height, time);
      break;
    case "integrated":
      drawIntegratedModel(width, height, time);
      break;
    default:
      drawGenericModel(width, height, time);
  }
  if (state.labMode === "principle") {
    drawPrincipleCanvasOverlay(width, height);
  }
  drawCanvasVignette(labContext, width, height);
  drawTechnicalOverlay(width, height, time);
}

function drawTechnicalOverlay(width, height, time) {
  labContext.save();
  labContext.strokeStyle = "rgba(218, 181, 117, 0.43)";
  labContext.lineWidth = 1;
  const inset = 12;
  const length = 18;
  const corners = [
    [inset, inset, 1, 1],
    [width - inset, inset, -1, 1],
    [inset, height - inset, 1, -1],
    [width - inset, height - inset, -1, -1]
  ];
  corners.forEach(([x, y, dx, dy]) => {
    labContext.beginPath();
    labContext.moveTo(x + dx * length, y);
    labContext.lineTo(x, y);
    labContext.lineTo(x, y + dy * length);
    labContext.stroke();
  });
  const scanY = 62 + ((Math.sin(time * 0.00034) + 1) / 2) * (height - 110);
  const scan = labContext.createLinearGradient(0, scanY - 20, 0, scanY + 20);
  scan.addColorStop(0, "rgba(201, 160, 96, 0)");
  scan.addColorStop(0.48, "rgba(201, 160, 96, 0.045)");
  scan.addColorStop(0.5, "rgba(226, 190, 127, 0.12)");
  scan.addColorStop(0.52, "rgba(201, 160, 96, 0.045)");
  scan.addColorStop(1, "rgba(201, 160, 96, 0)");
  labContext.fillStyle = scan;
  labContext.fillRect(20, scanY - 20, width - 40, 40);
  if (state.annotations) {
    const scaleX = width - 108;
    const scaleY = height - 19;
    labContext.strokeStyle = "rgba(198, 230, 213, 0.34)";
    labContext.beginPath();
    labContext.moveTo(scaleX, scaleY);
    labContext.lineTo(scaleX + 58, scaleY);
    for (let index = 0; index <= 4; index += 1) {
      const x = scaleX + index * 14.5;
      labContext.moveTo(x, scaleY - 3);
      labContext.lineTo(x, scaleY + 2);
    }
    labContext.stroke();
    labContext.fillStyle = "rgba(198, 230, 213, 0.34)";
    labContext.font = '8px "Cascadia Code", Consolas, monospace';
    labContext.fillText("CAL", scaleX + 61, scaleY + 3);
  }
  labContext.restore();
}

function drawPerspectiveBench(context, width, height, time) {
  context.save();
  const floorTop = height * 0.62;
  const horizonX = width * 0.5;
  context.strokeStyle = "rgba(205, 231, 217, 0.035)";
  context.lineWidth = 1;
  for (let index = -8; index <= 8; index += 1) {
    context.beginPath();
    context.moveTo(horizonX + index * 12, floorTop);
    context.lineTo(horizonX + index * 92, height);
    context.stroke();
  }
  for (let index = 0; index < 8; index += 1) {
    const progress = index / 8;
    const y = floorTop + Math.pow(progress, 1.55) * (height - floorTop);
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.fillStyle = "rgba(226, 190, 126, 0.09)";
  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column < 18; column += 1) {
      const x = width * 0.04 + column * width * 0.053;
      const y = floorTop + 22 + row * 18 + Math.pow(row / 5, 1.5) * 65;
      context.beginPath();
      context.arc(x, y, 0.8, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();
}

function drawCanvasVignette(context, width, height) {
  context.save();
  const vignette = context.createRadialGradient(width * 0.5, height * 0.47, Math.min(width, height) * 0.18, width * 0.5, height * 0.5, Math.max(width, height) * 0.72);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.68, "rgba(0, 0, 0, 0.03)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.33)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
  context.restore();
}

function drawPrincipleCanvasOverlay(width, height) {
  const experiment = currentExperiment();
  const principle = principleInfo(experiment);
  const panelWidth = Math.min(390, width * 0.45);
  const panelHeight = 92;
  const x = width - panelWidth - 18;
  const y = height - panelHeight - 45;
  labContext.save();
  labContext.fillStyle = "rgba(8, 25, 16, 0.86)";
  labContext.strokeStyle = "rgba(183, 240, 195, 0.2)";
  labContext.lineWidth = 1;
  labContext.beginPath();
  labContext.roundRect(x, y, panelWidth, panelHeight, 9);
  labContext.fill();
  labContext.stroke();
  labContext.fillStyle = "rgba(216, 249, 222, 0.55)";
  labContext.font = '9px "Microsoft YaHei UI", sans-serif';
  labContext.fillText("关键关系与变量", x + 13, y + 18);
  labContext.fillStyle = "rgba(190, 250, 199, 0.96)";
  labContext.font = '16px Georgia, "Times New Roman", serif';
  labContext.fillText(experiment.formula, x + 13, y + 41);
  labContext.fillStyle = "rgba(216, 249, 222, 0.62)";
  labContext.font = '9px "Microsoft YaHei UI", sans-serif';
  const clipped = principle.variables.length > 62 ? `${principle.variables.slice(0, 62)}…` : principle.variables;
  labContext.fillText(clipped, x + 13, y + 62, panelWidth - 26);
  labContext.fillStyle = "rgba(216, 249, 222, 0.38)";
  labContext.fillText("PRINCIPLE VIEW · 参数变化会实时改变模型", x + 13, y + 79);
  labContext.restore();
}

function drawMeasurementOverlay(width, height) {
  labContext.save();
  labContext.strokeStyle = "rgba(104, 229, 153, 0.16)";
  labContext.setLineDash([3, 7]);
  for (let index = 1; index < 5; index += 1) {
    const x = (width * index) / 5;
    labContext.beginPath();
    labContext.moveTo(x, 65);
    labContext.lineTo(x, height - 35);
    labContext.stroke();
  }
  labContext.restore();
}

function drawMeasurementModel(width, height, time) {
  const axes = drawCanvasAxes(labContext, width, height);
  const color = signalColor();
  const center = (axes.top + axes.bottom) / 2;
  const amplitude = Math.min(80, Math.max(25, state.secondary * 8));
  labContext.save();
  labContext.beginPath();
  for (let index = 0; index <= 120; index += 1) {
    const progress = index / 120;
    const x = axes.left + progress * (axes.right - axes.left);
    const noise = Math.sin(index * 1.7 + time * 0.0007) * 4;
    const y = center - amplitude * (progress - 0.5) - noise;
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.9);
  labContext.lineWidth = 2;
  labContext.stroke();
  labContext.fillStyle = rgba(color, 0.85);
  for (let index = 0; index < 18; index += 1) {
    const progress = index / 17;
    const x = axes.left + progress * (axes.right - axes.left);
    const y = center - amplitude * (progress - 0.5) - Math.sin(index * 1.7 + time * 0.0007) * 4;
    labContext.beginPath();
    labContext.arc(x, y, 2.4, 0, Math.PI * 2);
    labContext.fill();
  }
  labContext.restore();
  drawLabel(labContext, "重复测量与线性趋势", axes.left, 18);
  drawLabel(labContext, `样本 n = ${Math.round(state.primary)}`, width - 26, 18, rgba(color, 1), "right");
}

function drawCircuitModel(width, height, time) {
  const color = signalColor();
  const left = width * 0.15;
  const right = width * 0.46;
  const top = height * 0.26;
  const bottom = height * 0.7;
  labContext.save();
  const board = labContext.createLinearGradient(left - 40, top - 30, right + 50, bottom + 50);
  board.addColorStop(0, "rgba(15, 45, 35, 0.72)");
  board.addColorStop(0.5, "rgba(10, 34, 26, 0.84)");
  board.addColorStop(1, "rgba(8, 24, 20, 0.9)");
  labContext.fillStyle = board;
  labContext.strokeStyle = "rgba(218, 184, 115, 0.2)";
  labContext.beginPath();
  labContext.roundRect(left - 35, top - 28, right - left + 82, bottom - top + 75, 12);
  labContext.fill();
  labContext.stroke();
  labContext.strokeStyle = "rgba(193, 153, 85, 0.14)";
  labContext.lineWidth = 1;
  for (let offset = 0; offset < 5; offset += 1) {
    labContext.beginPath();
    labContext.moveTo(left - 18, top + 18 + offset * 17);
    labContext.lineTo(left + 18, top + 18 + offset * 17);
    labContext.lineTo(left + 45, top + 45 + offset * 17);
    labContext.stroke();
  }
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      const viaX = right - 30 - column * 15;
      const viaY = bottom - 18 - row * 13;
      labContext.fillStyle = "rgba(207, 168, 102, 0.16)";
      labContext.beginPath();
      labContext.arc(viaX, viaY, 2.2, 0, Math.PI * 2);
      labContext.fill();
    }
  }
  labContext.strokeStyle = "rgba(214, 242, 220, 0.72)";
  labContext.lineWidth = 2.5;
  labContext.shadowColor = "rgba(0, 0, 0, 0.45)";
  labContext.shadowBlur = 5;
  labContext.strokeRect(left, top, right - left, bottom - top);
  labContext.shadowBlur = 0;
  labContext.beginPath();
  labContext.moveTo(left, top + 55);
  labContext.lineTo(left, bottom - 50);
  labContext.moveTo(left + 8, top + 65);
  labContext.lineTo(left + 18, top + 65);
  labContext.moveTo(left + 9, top + 56);
  labContext.lineTo(left + 18, top + 56);
  labContext.stroke();
  const resistorX = right - 70;
  const resistorY = top + 45;
  labContext.fillStyle = "#d7cbb5";
  labContext.strokeStyle = "#f2ead8";
  labContext.beginPath();
  labContext.roundRect(resistorX, resistorY, 46, 24, 9);
  labContext.fill();
  labContext.stroke();
  const stripes = ["#785247", "#282e2b", "#b08a4f", "#d5c59a"];
  stripes.forEach((stripe, index) => {
    labContext.fillStyle = stripe;
    labContext.fillRect(resistorX + 8 + index * 8, resistorY, 4, 24);
  });
  labContext.strokeStyle = "#9fb1a7";
  labContext.beginPath();
  labContext.moveTo(resistorX - 18, resistorY + 12);
  labContext.lineTo(resistorX, resistorY + 12);
  labContext.moveTo(resistorX + 46, resistorY + 12);
  labContext.lineTo(resistorX + 74, resistorY + 12);
  labContext.stroke();
  labContext.restore();
  for (let index = 0; index < 8; index += 1) {
    const progress = ((time * 0.025 * state.speed + index / 8) % 1);
    const perimeter = 2 * ((right - left) + (bottom - top));
    let distance = progress * perimeter;
    let x;
    let y;
    if (distance < right - left) {
      x = left + distance;
      y = top;
    } else if ((distance -= right - left) < bottom - top) {
      x = right;
      y = top + distance;
    } else if ((distance -= bottom - top) < right - left) {
      x = right - distance;
      y = bottom;
    } else {
      distance -= right - left;
      x = left;
      y = bottom - distance;
    }
    drawGlow(labContext, x, y, 5, color, 0.55);
  }
  drawAnalogMeter(right + 20, top + 85, 24, clamp((state.primary / Math.max(1, state.secondary)) / 0.01, 0, 1), "电流");
  drawLabel(labContext, "直流可调电源", left - 22, top - 13);
  drawLabel(labContext, `R = ${formatNumber(state.secondary, 0)} Ω`, right - 67, top + 85);
  drawLabel(labContext, `U = ${formatNumber(state.primary, 2)} V`, left + 20, top + 22);

  const graphLeft = width * 0.57;
  const graphRight = width * 0.92;
  const graphTop = height * 0.25;
  const graphBottom = height * 0.75;
  labContext.save();
  labContext.fillStyle = "rgba(5, 18, 10, 0.54)";
  labContext.strokeStyle = "rgba(214, 242, 220, 0.25)";
  labContext.beginPath();
  labContext.roundRect(graphLeft, graphTop, graphRight - graphLeft, graphBottom - graphTop, 8);
  labContext.fill();
  labContext.stroke();
  labContext.strokeRect(graphLeft, graphTop, graphRight - graphLeft, graphBottom - graphTop);
  labContext.beginPath();
  for (let index = 0; index <= 90; index += 1) {
    const progress = index / 90;
    const x = graphLeft + progress * (graphRight - graphLeft);
    const current = state.primary / Math.max(1, state.secondary) * 1000;
    const y = graphBottom - clamp(current / 12, 0, 1) * (graphBottom - graphTop);
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.95);
  labContext.lineWidth = 2.5;
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, `I = ${formatNumber((state.primary / state.secondary) * 1000, 2)} mA`, graphRight - 4, graphTop - 11, rgba(color, 1), "right");
  drawLabel(labContext, "输入电压 / V", (graphLeft + graphRight) / 2, height - 16, undefined, "center");
}

function drawOscilloscopeModel(width, height, time) {
  labContext.save();
  labContext.fillStyle = "rgba(5, 18, 10, 0.78)";
  labContext.strokeStyle = "rgba(220, 237, 226, 0.24)";
  labContext.lineWidth = 1.5;
  labContext.shadowColor = "rgba(0, 0, 0, 0.42)";
  labContext.shadowBlur = 13;
  labContext.beginPath();
  labContext.roundRect(30, 18, width - 60, height - 52, 12);
  labContext.fill();
  labContext.stroke();
  labContext.shadowBlur = 0;
  labContext.restore();
  const axes = drawCanvasAxes(labContext, width, height);
  const color = signalColor();
  const frequency = 1 + state.primary / 4;
  const amplitude = clamp(state.secondary * 32, 15, 100);
  labContext.save();
  labContext.beginPath();
  for (let x = axes.left; x <= axes.right; x += 1) {
    const t = (x - axes.left) / (axes.right - axes.left);
    const value = Math.sin(t * Math.PI * 2 * frequency + time * 0.002);
    const y = (axes.top + axes.bottom) / 2 - value * amplitude / 2;
    if (x === axes.left) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 1);
  labContext.shadowColor = rgba(color, 0.75);
  labContext.shadowBlur = 11;
  labContext.lineWidth = 1.8;
  labContext.stroke();
  labContext.restore();
  const cursorX1 = axes.left + (axes.right - axes.left) * 0.34;
  const cursorX2 = axes.left + (axes.right - axes.left) * 0.68;
  labContext.save();
  labContext.strokeStyle = "rgba(225, 188, 125, 0.58)";
  labContext.setLineDash([4, 5]);
  labContext.beginPath();
  labContext.moveTo(cursorX1, axes.top);
  labContext.lineTo(cursorX1, axes.bottom);
  labContext.moveTo(cursorX2, axes.top);
  labContext.lineTo(cursorX2, axes.bottom);
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, `CH1  ${formatNumber(state.primary, 1)} kHz`, axes.left, 18);
  drawLabel(labContext, `${formatNumber(state.secondary, 1)} Vpp`, axes.right, 18, rgba(color, 1), "right");
  drawLabel(labContext, "T1", cursorX1 - 5, axes.bottom + 15, "rgba(225, 188, 125, 0.72)");
  drawLabel(labContext, "T2", cursorX2 - 5, axes.bottom + 15, "rgba(225, 188, 125, 0.72)");
  drawLabel(labContext, "时间 / ms", (axes.left + axes.right) / 2, height - 14, undefined, "center");
}

function drawRCModel(width, height, time) {
  const axes = drawCanvasAxes(labContext, width, height);
  const color = signalColor();
  const tau = state.primary * state.secondary / 1000;
  labContext.save();
  labContext.fillStyle = "rgba(5, 18, 10, 0.5)";
  labContext.strokeStyle = "rgba(214, 242, 220, 0.16)";
  labContext.beginPath();
  labContext.roundRect(axes.left - 5, axes.top - 15, axes.right - axes.left + 10, axes.bottom - axes.top + 28, 8);
  labContext.fill();
  labContext.stroke();
  labContext.restore();
  labContext.save();
  for (let curve = 0; curve < 2; curve += 1) {
    labContext.beginPath();
    for (let index = 0; index <= 160; index += 1) {
      const progress = index / 160;
      const t = progress * 5;
      const value = curve === 0 ? 1 - Math.exp(-t / Math.max(0.05, tau)) : Math.exp(-t / Math.max(0.05, tau));
      const x = axes.left + progress * (axes.right - axes.left);
      const y = axes.bottom - value * (axes.bottom - axes.top) * 0.82;
      if (index === 0) labContext.moveTo(x, y);
      else labContext.lineTo(x, y);
    }
    labContext.strokeStyle = curve === 0 ? rgba(color, 0.95) : "rgba(242, 174, 91, 0.78)";
    labContext.lineWidth = 2;
    labContext.stroke();
  }
  const tauProgress = clamp(tau / 5, 0, 1);
  const tauX = axes.left + tauProgress * (axes.right - axes.left);
  const chargeY = axes.bottom - (1 - Math.exp(-1)) * (axes.bottom - axes.top) * 0.82;
  labContext.save();
  labContext.strokeStyle = "rgba(225, 188, 125, 0.72)";
  labContext.setLineDash([4, 5]);
  labContext.beginPath();
  labContext.moveTo(tauX, axes.top);
  labContext.lineTo(tauX, axes.bottom);
  labContext.lineTo(axes.left, chargeY);
  labContext.stroke();
  labContext.setLineDash([]);
  labContext.fillStyle = "#e0b36f";
  labContext.beginPath();
  labContext.arc(tauX, chargeY, 4, 0, Math.PI * 2);
  labContext.fill();
  labContext.restore();
  labContext.restore();
  drawLabel(labContext, `τ = RC ≈ ${formatNumber(tau, 2)} ms`, axes.left, 18, rgba(color, 1));
  drawLabel(labContext, "63.2%", tauX + 7, chargeY - 8, "rgba(225, 188, 125, 0.82)");
  drawLabel(labContext, "充电", axes.right - 55, 18, rgba(color, 1));
  drawLabel(labContext, "放电", axes.right - 8, 18, "rgba(242, 174, 91, 0.9)", "right");
  drawLabel(labContext, "时间 / ms", (axes.left + axes.right) / 2, height - 14, undefined, "center");
}

function drawSemiconductorModel(width, height, time) {
  const axes = drawCanvasAxes(labContext, width, height, {
    left: width * 0.5,
    right: width * 0.93,
    top: height * 0.16,
    bottom: height * 0.82
  });
  const color = signalColor();
  const temperature = 300 / Math.max(250, state.secondary);
  const exponent = 18 * temperature;
  labContext.save();
  const deviceX = width * 0.08;
  const deviceY = height * 0.3;
  const deviceW = width * 0.28;
  const deviceH = height * 0.31;
  const pRegion = labContext.createLinearGradient(deviceX, 0, deviceX + deviceW / 2, 0);
  pRegion.addColorStop(0, "rgba(198, 128, 91, 0.62)");
  pRegion.addColorStop(1, "rgba(154, 89, 67, 0.78)");
  labContext.fillStyle = pRegion;
  labContext.fillRect(deviceX, deviceY, deviceW / 2, deviceH);
  const nRegion = labContext.createLinearGradient(deviceX + deviceW / 2, 0, deviceX + deviceW, 0);
  nRegion.addColorStop(0, "rgba(85, 145, 156, 0.76)");
  nRegion.addColorStop(1, "rgba(52, 111, 126, 0.6)");
  labContext.fillStyle = nRegion;
  labContext.fillRect(deviceX + deviceW / 2, deviceY, deviceW / 2, deviceH);
  labContext.fillStyle = "rgba(236, 219, 176, 0.21)";
  labContext.fillRect(deviceX + deviceW / 2 - 8, deviceY, 16, deviceH);
  labContext.strokeStyle = "rgba(221, 235, 226, 0.35)";
  labContext.strokeRect(deviceX, deviceY, deviceW, deviceH);
  labContext.strokeStyle = "#b6c8c0";
  labContext.lineWidth = 3;
  labContext.beginPath();
  labContext.moveTo(deviceX + deviceW * 0.2, deviceY - 24);
  labContext.lineTo(deviceX + deviceW * 0.2, deviceY);
  labContext.moveTo(deviceX + deviceW * 0.8, deviceY - 24);
  labContext.lineTo(deviceX + deviceW * 0.8, deviceY);
  labContext.stroke();
  labContext.restore();
  labContext.save();
  labContext.beginPath();
  for (let index = 0; index <= 140; index += 1) {
    const progress = index / 140;
    const voltage = progress * 1.2;
    const current = Math.max(0, Math.exp((voltage - 0.62) * exponent) - Math.exp(-0.62 * exponent));
    const x = axes.left + progress * (axes.right - axes.left);
    const y = axes.bottom - clamp(current / 25, 0, 1) * (axes.bottom - axes.top);
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.95);
  labContext.lineWidth = 2.3;
  labContext.stroke();
  labContext.restore();
  drawAnalogMeter(width * 0.23, height * 0.73, 24, clamp((state.primary / 1.2), 0, 1), "偏置 / V");
  drawLabel(labContext, "PN结非线性伏安特性", axes.left, 18);
  drawLabel(labContext, `温度 ${formatNumber(state.secondary, 0)} K`, axes.right, 18, rgba(color, 1), "right");
  drawLabel(labContext, "P 区", deviceX + deviceW * 0.2, deviceY + 18, "rgba(240, 205, 178, 0.74)", "center");
  drawLabel(labContext, "N 区", deviceX + deviceW * 0.8, deviceY + 18, "rgba(185, 229, 235, 0.78)", "center");
  drawLabel(labContext, "耗尽层", deviceX + deviceW / 2, deviceY + deviceH + 17, "rgba(232, 224, 190, 0.58)", "center");
  drawLabel(labContext, "偏置电压 / V", (axes.left + axes.right) / 2, height - 14, undefined, "center");
}

function drawDoubleSlitModel(width, height, time) {
  const color = wavelengthToRgb(state.primary);
  const centerY = height * 0.48;
  const sourceX = width * 0.1;
  const lensX = width * 0.27;
  const slitX = width * 0.43;
  const screenX = width * 0.67;
  const screenWidth = width * 0.25;
  const gap = 16 + state.secondary * 42;
  drawGlow(labContext, sourceX, centerY, 35, color, 0.2);
  drawBeam(labContext, sourceX + 20, centerY, lensX, centerY, color, time, 0.8);
  drawBeam(labContext, lensX, centerY, slitX, centerY, color, time, 0.72);
  drawBeam(labContext, slitX, centerY - gap / 2, screenX, height * 0.16, color, time, 0.35);
  drawBeam(labContext, slitX, centerY - gap / 2, screenX, height * 0.8, color, time, 0.35);
  drawBeam(labContext, slitX, centerY + gap / 2, screenX, height * 0.16, color, time, 0.35);
  drawBeam(labContext, slitX, centerY + gap / 2, screenX, height * 0.8, color, time, 0.35);
  drawLaserHead(sourceX - 27, centerY, color, time);
  labContext.save();
  labContext.strokeStyle = "rgba(213, 241, 221, 0.62)";
  labContext.fillStyle = "rgba(150, 211, 185, 0.06)";
  labContext.lineWidth = 1.5;
  labContext.beginPath();
  labContext.ellipse(lensX, centerY, 13, 56, 0, 0, Math.PI * 2);
  labContext.fill();
  labContext.stroke();
  labContext.restore();
  labContext.save();
  labContext.strokeStyle = "rgba(220, 235, 226, 0.6)";
  labContext.lineWidth = 2;
  labContext.fillStyle = "rgba(12, 31, 20, 0.78)";
  labContext.beginPath();
  labContext.rect(slitX - 6, height * 0.1, 12, height * 0.78);
  labContext.fill();
  labContext.stroke();
  labContext.strokeStyle = rgba(color, 0.82);
  labContext.lineWidth = 3;
  labContext.beginPath();
  labContext.moveTo(slitX, centerY - gap / 2 - 4);
  labContext.lineTo(slitX, centerY - gap / 2 + 4);
  labContext.moveTo(slitX, centerY - gap / 2 + 4);
  labContext.lineTo(slitX, centerY + gap / 2 - 4);
  labContext.stroke();
  drawGlow(labContext, slitX, centerY - gap / 2, 12, color, 0.45);
  drawGlow(labContext, slitX, centerY + gap / 2, 12, color, 0.45);
  labContext.restore();
  drawFringeScreen(screenX, height * 0.08, screenWidth, height * 0.78, color, time, 24 - state.secondary * 22, centerY);
  drawLabel(labContext, "相干激光", sourceX - 28, centerY + 38);
  drawLabel(labContext, "扩束 / 准直透镜", lensX - 31, centerY + 75);
  drawLabel(labContext, `双缝 d = ${formatNumber(state.secondary, 2)} mm`, slitX - 36, height * 0.91);
  drawLabel(labContext, "干涉条纹", screenX + screenWidth / 2, height * 0.045, rgba(color, 0.9), "center");
  const period = Math.max(5, 24 - state.secondary * 22);
  const spacing = (state.primary * 1e-3) / Math.max(0.001, state.secondary);
  if (state.annotations) {
    labContext.save();
    labContext.strokeStyle = "rgba(229, 190, 124, 0.58)";
    labContext.setLineDash([3, 4]);
    labContext.beginPath();
    labContext.moveTo(screenX + screenWidth * 0.48, centerY);
    labContext.lineTo(screenX + screenWidth * 0.48, centerY + period * 5);
    labContext.moveTo(screenX + screenWidth * 0.48, centerY + period * 5);
    labContext.lineTo(screenX + screenWidth * 0.48, centerY + period * 10);
    labContext.stroke();
    labContext.restore();
    drawLabel(labContext, `Δx 示意 ${formatNumber(spacing, 2)} mm`, screenX + screenWidth * 0.5 + 8, centerY + period * 5 + 3, "rgba(228, 190, 126, 0.8)");
  }
}

function drawFringeScreen(x, y, width, height, color, time, period, centerY) {
  labContext.save();
  labContext.shadowColor = "rgba(0, 0, 0, 0.45)";
  labContext.shadowBlur = 16;
  labContext.fillStyle = "#07110b";
  labContext.beginPath();
  labContext.roundRect(x - 4, y - 4, width + 8, height + 8, 7);
  labContext.fill();
  labContext.shadowBlur = 0;
  labContext.strokeStyle = "rgba(219, 239, 226, 0.35)";
  labContext.lineWidth = 1.5;
  labContext.stroke();
  labContext.beginPath();
  labContext.rect(x, y, width, height);
  labContext.clip();
  labContext.fillStyle = "rgba(3, 11, 6, 0.7)";
  labContext.fillRect(x, y, width, height);
  for (let py = y; py < y + height; py += 1.4) {
    const intensity = Math.pow(0.5 + 0.5 * Math.cos(((py - centerY) / Math.max(5, period)) * Math.PI * 2 + state.phase), 2);
    const gradient = labContext.createLinearGradient(x, 0, x + width, 0);
    gradient.addColorStop(0, rgba(color, intensity * 0.26));
    gradient.addColorStop(0.24, rgba(color, intensity * 0.72));
    gradient.addColorStop(0.5, rgba(color, intensity));
    gradient.addColorStop(0.76, rgba(color, intensity * 0.72));
    gradient.addColorStop(1, rgba(color, intensity * 0.26));
    labContext.fillStyle = gradient;
    labContext.fillRect(x, py, width, 1.6);
  }
  const sheen = labContext.createLinearGradient(x, 0, x + width, 0);
  sheen.addColorStop(0, "rgba(255,255,255,0.02)");
  sheen.addColorStop(0.42, "rgba(255,255,255,0.08)");
  sheen.addColorStop(0.55, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(255,255,255,0.02)");
  labContext.fillStyle = sheen;
  labContext.fillRect(x, y, width, height);
  labContext.restore();
}

function drawDiffractionModel(width, height, time) {
  const color = wavelengthToRgb(state.primary);
  const centerY = height * 0.5;
  const screenX = width * 0.55;
  const screenWidth = width * 0.38;
  const slitWidth = 0.12 + (state.secondary / 120) * 1.8;
  drawBeam(labContext, width * 0.08, centerY, screenX, centerY, color, time, 0.65);
  labContext.save();
  labContext.fillStyle = "rgba(3, 11, 6, 0.76)";
  labContext.fillRect(screenX, height * 0.08, screenWidth, height * 0.84);
  for (let py = height * 0.08; py < height * 0.92; py += 1.3) {
    const angle = (py - centerY) / height;
    const sinc = Math.sin(angle * Math.PI * 8 * slitWidth) / Math.max(0.001, angle * Math.PI * 8 * slitWidth);
    const value = sinc * sinc;
    const gradient = labContext.createLinearGradient(screenX, 0, screenX + screenWidth, 0);
    gradient.addColorStop(0, rgba(color, value * 0.35));
    gradient.addColorStop(0.5, rgba(color, value));
    gradient.addColorStop(1, rgba(color, value * 0.35));
    labContext.fillStyle = gradient;
    labContext.fillRect(screenX, py, screenWidth, 1.5);
  }
  labContext.restore();
  drawLabel(labContext, "平行光", width * 0.08, centerY + 24);
  drawLabel(labContext, `缝宽 ${formatNumber(state.secondary, 0)} μm`, width * 0.42, height * 0.09);
  drawLabel(labContext, "衍射强度分布", screenX + screenWidth / 2, height * 0.055, rgba(color, 0.9), "center");
}

function drawGratingModel(width, height, time) {
  const centerY = height * 0.5;
  const slitCount = 9;
  labContext.save();
  labContext.strokeStyle = "rgba(220, 244, 225, 0.56)";
  for (let index = 0; index < slitCount; index += 1) {
    const x = width * 0.28 + index * 6;
    labContext.beginPath();
    labContext.moveTo(x, height * 0.17);
    labContext.lineTo(x, height * 0.83);
    labContext.stroke();
  }
  labContext.restore();
  const screenX = width * 0.55;
  const screenWidth = width * 0.4;
  labContext.fillStyle = "rgba(3, 10, 6, 0.75)";
  labContext.fillRect(screenX, height * 0.08, screenWidth, height * 0.84);
  const colors = [[110, 220, 255], [110, 240, 160], [255, 218, 101], [255, 126, 91], [231, 100, 160]];
  colors.forEach((color, order) => {
    const y = centerY + (order - 2) * height * (0.11 - state.secondary * 0.007) + Math.sin(time * 0.0005 + order) * 2;
    const gradient = labContext.createLinearGradient(screenX, y - 8, screenX, y + 8);
    gradient.addColorStop(0, rgba(color, 0));
    gradient.addColorStop(0.5, rgba(color, 0.95));
    gradient.addColorStop(1, rgba(color, 0));
    labContext.fillStyle = gradient;
    labContext.fillRect(screenX, y - 9, screenWidth, 18);
  });
  drawLabel(labContext, "复合光", width * 0.08, centerY + 24);
  drawLabel(labContext, "光栅", width * 0.3, height * 0.9);
  drawLabel(labContext, "多级衍射光谱", screenX + screenWidth / 2, height * 0.055, undefined, "center");
}

function drawOpticsModel(width, height, time) {
  const color = signalColor();
  const axisY = height * 0.52;
  const lensX = width * 0.5;
  const objectX = width * 0.18;
  const imageX = width * 0.82;
  labContext.save();
  labContext.strokeStyle = "rgba(213, 242, 220, 0.22)";
  labContext.setLineDash([4, 6]);
  labContext.beginPath();
  labContext.moveTo(0, axisY);
  labContext.lineTo(width, axisY);
  labContext.stroke();
  labContext.setLineDash([]);
  labContext.strokeStyle = rgba(color, 0.7);
  labContext.beginPath();
  labContext.moveTo(objectX, axisY - 65);
  labContext.lineTo(objectX, axisY + 65);
  labContext.stroke();
  labContext.beginPath();
  labContext.ellipse(lensX, axisY, 23, 105, 0, 0, Math.PI * 2);
  labContext.stroke();
  labContext.restore();
  drawBeam(labContext, objectX, axisY - 65, lensX, axisY - 65, color, time, 0.65);
  drawBeam(labContext, lensX, axisY - 65, imageX, axisY + 65, color, time, 0.65);
  drawBeam(labContext, objectX, axisY - 65, lensX, axisY, color, time, 0.35);
  drawBeam(labContext, lensX, axisY, imageX, axisY + 65, color, time, 0.35);
  drawLabel(labContext, "物", objectX - 4, axisY + 82);
  drawLabel(labContext, "薄透镜", lensX - 18, axisY + 122);
  drawLabel(labContext, "像", imageX - 4, axisY + 82);
  drawLabel(labContext, `u = ${formatNumber(state.primary, 1)} cm   f = ${formatNumber(state.secondary, 1)} cm`, width / 2, 24, rgba(color, 1), "center");
}

function drawPolarizationModel(width, height, time) {
  const theta = (state.secondary * Math.PI) / 180;
  const intensity = Math.pow(Math.cos(theta), 2);
  const color = [103, 229, 154];
  const centerY = height * 0.48;
  drawBeam(labContext, width * 0.1, centerY, width * 0.34, centerY, color, time, 0.8);
  labContext.save();
  labContext.translate(width * 0.4, centerY);
  labContext.strokeStyle = "rgba(220, 244, 226, 0.7)";
  labContext.strokeRect(-7, -80, 14, 160);
  labContext.rotate(theta);
  labContext.beginPath();
  labContext.moveTo(0, -70);
  labContext.lineTo(0, 70);
  labContext.strokeStyle = rgba(color, 0.9);
  labContext.stroke();
  labContext.restore();
  drawBeam(labContext, width * 0.42, centerY, width * 0.69, centerY, color, time, intensity);
  const graphLeft = width * 0.72;
  const graphRight = width * 0.94;
  const graphTop = height * 0.2;
  const graphBottom = height * 0.78;
  labContext.save();
  labContext.strokeStyle = "rgba(220, 244, 226, 0.18)";
  labContext.strokeRect(graphLeft, graphTop, graphRight - graphLeft, graphBottom - graphTop);
  labContext.beginPath();
  for (let index = 0; index <= 90; index += 1) {
    const angle = (index / 90) * Math.PI * 2;
    const value = Math.pow(Math.cos(angle), 2);
    const x = graphLeft + (index / 90) * (graphRight - graphLeft);
    const y = graphBottom - value * (graphBottom - graphTop);
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.95);
  labContext.lineWidth = 2;
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, "自然光", width * 0.1, centerY - 22);
  drawLabel(labContext, "检偏器", width * 0.38, centerY + 94);
  drawLabel(labContext, `I/I₀ = cos²θ = ${formatNumber(intensity, 3)}`, width * 0.83, height * 0.88, rgba(color, 1), "center");
}

function drawGlow(context, x, y, radius, color, alpha = 1) {
  const glow = context.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, rgba(color, alpha));
  glow.addColorStop(0.22, rgba(color, alpha * 0.72));
  glow.addColorStop(1, rgba(color, 0));
  context.save();
  context.globalCompositeOperation = "lighter";
  context.fillStyle = glow;
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  context.restore();
}

function drawLaserHead(x, y, color, time, angle = 0) {
  labContext.save();
  labContext.translate(x, y);
  labContext.rotate(angle);
  labContext.fillStyle = "#21352e";
  labContext.strokeStyle = "rgba(211, 234, 220, 0.4)";
  labContext.lineWidth = 1;
  labContext.beginPath();
  labContext.roundRect(-38, -16, 52, 32, 6);
  labContext.fill();
  labContext.stroke();
  labContext.fillStyle = "#0b1310";
  labContext.beginPath();
  labContext.roundRect(-41, -12, 8, 24, 3);
  labContext.fill();
  labContext.fillStyle = rgba(color, 0.8);
  labContext.fillRect(14, -5, 4, 10);
  labContext.fillStyle = "rgba(226, 236, 229, 0.5)";
  labContext.font = '8.5px "Cascadia Code", Consolas, monospace';
  labContext.fillText("λ", -22, 2);
  labContext.restore();
  drawGlow(labContext, x, y, 28 + Math.sin(time * 0.003) * 2, color, 0.34);
}

function drawMetalMirror(cx, cy, width, vertical = false) {
  labContext.save();
  labContext.translate(cx, cy);
  if (vertical) labContext.rotate(Math.PI / 2);
  const metal = labContext.createLinearGradient(0, -12, 0, 12);
  metal.addColorStop(0, "#6f8179");
  metal.addColorStop(0.28, "#e7f0e9");
  metal.addColorStop(0.5, "#95a69e");
  metal.addColorStop(0.7, "#d4dfd8");
  metal.addColorStop(1, "#536760");
  labContext.fillStyle = metal;
  labContext.fillRect(-width / 2, -5, width, 10);
  labContext.strokeStyle = "rgba(235, 248, 239, 0.38)";
  labContext.strokeRect(-width / 2, -5, width, 10);
  labContext.strokeStyle = "rgba(214, 232, 220, 0.28)";
  labContext.beginPath();
  labContext.moveTo(0, 5);
  labContext.lineTo(0, 46);
  labContext.moveTo(-14, 46);
  labContext.lineTo(14, 46);
  labContext.stroke();
  labContext.fillStyle = "#71837a";
  labContext.beginPath();
  labContext.arc(0, 54, 5, 0, Math.PI * 2);
  labContext.fill();
  labContext.restore();
}

function drawMichelsonModel(width, height, time) {
  const color = wavelengthToRgb(state.primary);
  const centerY = height * 0.48;
  const sourceX = width * 0.08;
  const splitterX = width * 0.34;
  const mirrorTopY = height * 0.18;
  const mirrorBottomY = height * 0.76;
  const screenX = width * 0.57;
  const screenWidth = width * 0.35;
  const screenTop = height * 0.08;
  const screenHeight = height * 0.78;

  labContext.save();
  labContext.globalCompositeOperation = "lighter";
  labContext.strokeStyle = rgba(color, 0.12);
  labContext.lineWidth = 9;
  labContext.beginPath();
  labContext.moveTo(sourceX, centerY);
  labContext.lineTo(splitterX, centerY);
  labContext.moveTo(splitterX, centerY);
  labContext.lineTo(splitterX, mirrorTopY);
  labContext.moveTo(splitterX, centerY);
  labContext.lineTo(splitterX, mirrorBottomY);
  labContext.stroke();
  labContext.restore();
  drawBeam(labContext, sourceX + 18, centerY, splitterX, centerY, color, time, 0.92);
  drawBeam(labContext, splitterX, centerY, splitterX, mirrorTopY, color, time, 0.78);
  drawBeam(labContext, splitterX, centerY, splitterX, mirrorBottomY, color, time, 0.78);
  drawBeam(labContext, splitterX, centerY, screenX, centerY, color, time, 0.48);

  drawLaserHead(sourceX - 28, centerY, color, time);
  drawMetalMirror(splitterX, mirrorTopY, 62);
  drawMetalMirror(splitterX, mirrorBottomY, 62);

  labContext.save();
  labContext.translate(splitterX, centerY);
  labContext.rotate(Math.PI / 4);
  const glass = labContext.createLinearGradient(-11, 0, 11, 0);
  glass.addColorStop(0, "rgba(201, 242, 222, 0.08)");
  glass.addColorStop(0.48, "rgba(216, 247, 230, 0.3)");
  glass.addColorStop(0.52, rgba(color, 0.58));
  glass.addColorStop(1, "rgba(193, 233, 213, 0.07)");
  labContext.fillStyle = glass;
  labContext.strokeStyle = "rgba(225, 248, 232, 0.68)";
  labContext.beginPath();
  labContext.roundRect(-5, -28, 10, 56, 3);
  labContext.fill();
  labContext.stroke();
  labContext.restore();

  labContext.save();
  labContext.fillStyle = "#07110c";
  labContext.strokeStyle = "rgba(220, 236, 225, 0.45)";
  labContext.lineWidth = 2;
  labContext.beginPath();
  labContext.roundRect(screenX, screenTop, screenWidth, screenHeight, 7);
  labContext.fill();
  labContext.stroke();
  labContext.beginPath();
  labContext.roundRect(screenX + 4, screenTop + 4, screenWidth - 8, screenHeight - 8, 5);
  labContext.clip();
  const screenGlow = labContext.createRadialGradient(screenX + screenWidth / 2, centerY, 5, screenX + screenWidth / 2, centerY, screenWidth * 0.55);
  screenGlow.addColorStop(0, "rgba(10, 22, 14, 0.18)");
  screenGlow.addColorStop(1, "rgba(1, 5, 3, 0.8)");
  labContext.fillStyle = screenGlow;
  labContext.fillRect(screenX, screenTop, screenWidth, screenHeight);
  const scale = 27 + state.secondary * 4.8;
  for (let y = screenTop; y < screenTop + screenHeight; y += 1.35) {
    for (let x = screenX; x < screenX + screenWidth; x += 1.35) {
      const nx = (x - (screenX + screenWidth / 2)) / scale;
      const ny = (y - centerY) / scale;
      const radius = Math.sqrt(nx * nx + ny * ny);
      const intensity = Math.pow(0.5 + 0.5 * Math.cos(radius * 4.7 + state.phase * 4), 7);
      if (intensity > 0.022) {
        labContext.fillStyle = rgba(color, intensity * 0.94);
        labContext.fillRect(x, y, 1.35, 1.35);
      }
    }
  }
  labContext.restore();

  const profileX = screenX + 9;
  const profileY = screenTop + screenHeight - 47;
  const profileW = screenWidth - 18;
  labContext.save();
  labContext.fillStyle = "rgba(3, 12, 7, 0.62)";
  labContext.strokeStyle = "rgba(214, 240, 221, 0.12)";
  labContext.beginPath();
  labContext.roundRect(profileX, profileY, profileW, 37, 5);
  labContext.fill();
  labContext.stroke();
  labContext.beginPath();
  for (let index = 0; index <= 80; index += 1) {
    const progress = index / 80;
    const r = (progress - 0.5) * 10;
    const intensity = Math.pow(0.5 + 0.5 * Math.cos(r * 4.7 + state.phase * 4), 6);
    const x = profileX + progress * profileW;
    const y = profileY + 31 - intensity * 24;
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.88);
  labContext.lineWidth = 1.3;
  labContext.stroke();
  labContext.restore();

  drawLabel(labContext, "He–Ne / 激光源", sourceX - 42, centerY + 38);
  drawLabel(labContext, "50:50 分束镜", splitterX - 30, centerY + 55);
  drawLabel(labContext, "M1 反射镜", splitterX + 27, mirrorTopY + 4);
  drawLabel(labContext, "M2 反射镜", splitterX + 27, mirrorBottomY + 4);
  drawLabel(labContext, "等倾干涉图样", screenX + screenWidth / 2, screenTop - 10, rgba(color, 0.92), "center");
  drawLabel(labContext, "径向光强截面", profileX + 4, profileY - 5, "rgba(220, 241, 225, 0.48)");
  drawGlow(labContext, screenX + screenWidth / 2, centerY, 55, color, 0.13);
}

function drawNewtonModel(width, height, time) {
  const color = wavelengthToRgb(state.primary);
  const centerX = width * 0.52;
  const centerY = height * 0.5;
  const scale = 8 + state.secondary * 0.35;
  labContext.save();
  for (let y = height * 0.08; y < height * 0.92; y += 1.7) {
    for (let x = centerX - 170; x < centerX + 170; x += 1.7) {
      const radius = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const intensity = Math.pow(0.5 + 0.5 * Math.cos(radius * radius / scale + state.phase * 2), 7);
      if (intensity > 0.035) {
        labContext.fillStyle = rgba(color, intensity);
        labContext.fillRect(x, y, 1.7, 1.7);
      }
    }
  }
  labContext.restore();
  labContext.save();
  labContext.strokeStyle = "rgba(219, 245, 224, 0.16)";
  labContext.beginPath();
  labContext.moveTo(centerX - 190, centerY);
  labContext.lineTo(centerX + 190, centerY);
  labContext.moveTo(centerX, centerY - 170);
  labContext.lineTo(centerX, centerY + 170);
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, "牛顿环干涉图样", width * 0.06, 22, rgba(color, 0.9));
  drawLabel(labContext, `R ≈ ${formatNumber(state.secondary, 0)} cm`, width - 25, height - 20, rgba(color, 0.9), "right");
}

function drawAmplifierModel(width, height, time) {
  const left = width * 0.16;
  const top = height * 0.24;
  const triangleSize = Math.min(150, width * 0.17);
  labContext.save();
  labContext.strokeStyle = "rgba(218, 244, 224, 0.7)";
  labContext.lineWidth = 2;
  labContext.beginPath();
  labContext.moveTo(left, top);
  labContext.lineTo(left, top + triangleSize);
  labContext.lineTo(left + triangleSize, top + triangleSize / 2);
  labContext.closePath();
  labContext.stroke();
  labContext.beginPath();
  labContext.moveTo(left - 60, top + 35);
  labContext.lineTo(left, top + 35);
  labContext.moveTo(left + triangleSize, top + triangleSize / 2);
  labContext.lineTo(left + triangleSize + 70, top + triangleSize / 2);
  labContext.stroke();
  labContext.restore();
  drawBeam(labContext, left - 55, top + 35, left, top + 35, signalColor(), time, 0.8);
  drawBeam(labContext, left + triangleSize, top + triangleSize / 2, left + triangleSize + 65, top + triangleSize / 2, signalColor(), time, 0.9);
  drawLabel(labContext, "Vi", left - 57, top + 26);
  drawLabel(labContext, "Vo", left + triangleSize + 22, top + triangleSize / 2 - 12);
  const graphLeft = width * 0.55;
  const graphRight = width * 0.92;
  const graphTop = height * 0.2;
  const graphBottom = height * 0.78;
  const gain = state.primary * (1 - state.secondary * 0.7);
  labContext.save();
  labContext.strokeStyle = "rgba(218, 244, 224, 0.2)";
  labContext.strokeRect(graphLeft, graphTop, graphRight - graphLeft, graphBottom - graphTop);
  labContext.beginPath();
  for (let index = 0; index <= 150; index += 1) {
    const progress = index / 150;
    const x = graphLeft + progress * (graphRight - graphLeft);
    const amp = clamp(gain / 500, 10, 65);
    const y = (graphTop + graphBottom) / 2 - Math.sin(progress * Math.PI * 10 + time * 0.002) * amp;
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(signalColor(), 0.9);
  labContext.lineWidth = 2;
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, `输出波形  Av ≈ ${formatNumber(gain / state.primary, 2)}`, graphLeft, graphTop - 10);
}

function drawFrequencyModel(width, height, time) {
  const axes = drawCanvasAxes(labContext, width, height);
  const fc = state.primary * 1000;
  labContext.save();
  labContext.fillStyle = "rgba(5, 18, 12, 0.5)";
  labContext.strokeStyle = "rgba(210, 236, 220, 0.17)";
  labContext.beginPath();
  labContext.roundRect(axes.left - 5, axes.top - 12, axes.right - axes.left + 10, axes.bottom - axes.top + 25, 8);
  labContext.fill();
  labContext.stroke();
  labContext.beginPath();
  labContext.moveTo(axes.left, axes.bottom);
  for (let index = 0; index <= 150; index += 1) {
    const progress = index / 150;
    const frequency = 10 * Math.pow(100000, progress);
    const gain = -10 * Math.log10(1 + Math.pow(frequency / fc, 2 * Math.round(state.secondary)));
    const x = axes.left + progress * (axes.right - axes.left);
    const y = axes.top + clamp((-gain) / 80, 0, 1) * (axes.bottom - axes.top);
    labContext.lineTo(x, y);
  }
  labContext.lineTo(axes.right, axes.bottom);
  labContext.closePath();
  const area = labContext.createLinearGradient(0, axes.top, 0, axes.bottom);
  area.addColorStop(0, "rgba(207, 165, 98, 0.17)");
  area.addColorStop(1, "rgba(207, 165, 98, 0.01)");
  labContext.fillStyle = area;
  labContext.fill();
  labContext.beginPath();
  for (let index = 0; index <= 150; index += 1) {
    const progress = index / 150;
    const frequency = 10 * Math.pow(100000, progress);
    const gain = -10 * Math.log10(1 + Math.pow(frequency / fc, 2 * Math.round(state.secondary)));
    const x = axes.left + progress * (axes.right - axes.left);
    const y = axes.top + clamp((-gain) / 80, 0, 1) * (axes.bottom - axes.top);
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(signalColor(), 0.95);
  labContext.lineWidth = 2.4;
  labContext.stroke();
  labContext.beginPath();
  for (let index = 0; index <= 150; index += 1) {
    const progress = index / 150;
    const frequency = 10 * Math.pow(100000, progress);
    const phase = -Math.round(state.secondary) * Math.atan(frequency / fc) * 180 / Math.PI;
    const x = axes.left + progress * (axes.right - axes.left);
    const y = axes.bottom - clamp(-phase / 360, 0, 1) * (axes.bottom - axes.top) * 0.8;
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = "rgba(110, 176, 168, 0.62)";
  labContext.lineWidth = 1.4;
  labContext.setLineDash([5, 5]);
  labContext.stroke();
  labContext.restore();
  const cutoffProgress = clamp(Math.log10(fc / 10) / 5, 0, 1);
  const cutoffX = axes.left + cutoffProgress * (axes.right - axes.left);
  labContext.save();
  labContext.strokeStyle = "rgba(224, 181, 111, 0.66)";
  labContext.setLineDash([3, 4]);
  labContext.beginPath();
  labContext.moveTo(cutoffX, axes.top);
  labContext.lineTo(cutoffX, axes.bottom);
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, `截止频率 ${formatNumber(state.primary, 0)} kHz`, axes.left, 18, rgba(signalColor(), 1));
  drawLabel(labContext, "-3 dB", cutoffX + 7, axes.top + 16, "rgba(224, 181, 111, 0.76)");
  drawLabel(labContext, "相位", axes.right, axes.top + 16, "rgba(110, 176, 168, 0.74)", "right");
  drawLabel(labContext, "对数频率", (axes.left + axes.right) / 2, height - 14, undefined, "center");
}

function drawOscillatorModel(width, height, time) {
  const axes = drawCanvasAxes(labContext, width, height);
  const color = signalColor();
  const frequency = 1 / Math.sqrt(state.primary * state.secondary * 0.001);
  labContext.save();
  labContext.beginPath();
  for (let x = axes.left; x <= axes.right; x += 1) {
    const progress = (x - axes.left) / (axes.right - axes.left);
    const value = Math.sin(progress * Math.PI * 2 * frequency * 2 + time * 0.0018);
    const y = (axes.top + axes.bottom) / 2 - value * (axes.bottom - axes.top) * 0.35;
    if (x === axes.left) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.95);
  labContext.lineWidth = 2;
  labContext.shadowColor = rgba(color, 0.35);
  labContext.shadowBlur = 6;
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, `振荡频率 ≈ ${formatNumber(frequency, 2)} kHz`, axes.left, 18, rgba(color, 1));
  drawLabel(labContext, "自激振荡波形", axes.right, 18, undefined, "right");
}

function drawDigitalModel(width, height, time) {
  const axes = drawCanvasAxes(labContext, width, height);
  const color = signalColor();
  const channels = 4;
  const rowHeight = (axes.bottom - axes.top) / channels;
  labContext.save();
  labContext.strokeStyle = "rgba(116, 176, 165, 0.1)";
  labContext.setLineDash([2, 6]);
  for (let index = 0; index <= 10; index += 1) {
    const x = axes.left + ((axes.right - axes.left) * index) / 10;
    labContext.beginPath();
    labContext.moveTo(x, axes.top);
    labContext.lineTo(x, axes.bottom);
    labContext.stroke();
    drawLabel(labContext, `${index}`, x - 2, axes.bottom + 15, "rgba(147, 181, 171, 0.26)");
  }
  labContext.restore();
  for (let channel = 0; channel < channels; channel += 1) {
    const baseline = axes.top + rowHeight * (channel + 0.75);
    labContext.save();
    labContext.strokeStyle = rgba(color, 0.78);
    labContext.lineWidth = 1.8;
    labContext.beginPath();
    for (let x = axes.left; x <= axes.right; x += 2) {
      const progress = (x - axes.left) / (axes.right - axes.left);
      const phase = progress * (8 + state.primary * 0.25) + channel * 0.67 + time * 0.0005;
      const bit = channel === 0
        ? Math.sin(phase * Math.PI) > 0
        : channel === 1
          ? Math.sin(phase * Math.PI * 0.5 + 0.5) > 0
          : channel === 2
            ? (Math.floor(phase * 2) % 3) !== 0
            : (Math.floor(phase * 2) % 2) === 1;
      const y = baseline - (bit ? rowHeight * 0.52 : 5);
      if (x === axes.left) labContext.moveTo(x, y);
      else {
        const previousProgress = (x - 2 - axes.left) / (axes.right - axes.left);
        const previousPhase = previousProgress * (8 + state.primary * 0.25) + channel * 0.67 + time * 0.0005;
        const previousBit = channel === 0
          ? Math.sin(previousPhase * Math.PI) > 0
          : channel === 1
            ? Math.sin(previousPhase * Math.PI * 0.5 + 0.5) > 0
            : channel === 2
              ? (Math.floor(previousPhase * 2) % 3) !== 0
              : (Math.floor(previousPhase * 2) % 2) === 1;
        if (previousBit !== bit) {
          const previousY = baseline - (previousBit ? rowHeight * 0.52 : 5);
          labContext.lineTo(x, previousY);
        }
        labContext.lineTo(x, y);
      }
    }
    labContext.stroke();
    labContext.restore();
    drawLabel(labContext, `CH${channel + 1}`, axes.left - 35, baseline - rowHeight * 0.28);
  }
  drawLabel(labContext, "逻辑分析仪多通道时序", axes.left, 17, rgba(color, 1));
  drawLabel(labContext, `${formatNumber(state.primary, 1)} Mbps`, axes.right, 17, rgba(color, 1), "right");
}

function drawSpectrumModel(width, height, time) {
  const color = signalColor();
  const centerY = height * 0.42;
  labContext.save();
  labContext.strokeStyle = rgba(color, 0.6);
  labContext.beginPath();
  for (let x = 30; x < width * 0.42; x += 1) {
    const progress = (x - 30) / (width * 0.42 - 30);
    const noise = currentExperiment().sim === "dsp" ? (state.primary / 100) * Math.sin(x * 7.3 + time * 0.01) * 22 : 0;
    const y = centerY - Math.sin(progress * Math.PI * 16 + time * 0.001) * 35 - noise;
    if (x === 30) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, "时域信号", 30, 20);
  const spectrumLeft = width * 0.52;
  const base = height * 0.78;
  const harmonics = Math.round(state.secondary);
  for (let index = 1; index <= harmonics; index += 1) {
    const x = spectrumLeft + index * ((width * 0.42) / (harmonics + 1));
    const amplitude = (1 / index) * (height * 0.55) * Math.max(0.2, state.primary / 1000);
    labContext.save();
    labContext.fillStyle = rgba(color, 0.82);
    labContext.fillRect(x - 3, base - amplitude, 6, amplitude);
    labContext.fillStyle = rgba(color, 0.25);
    labContext.fillRect(x - 5, base - amplitude - 3, 10, 3);
    labContext.restore();
  }
  labContext.strokeStyle = "rgba(214, 243, 221, 0.2)";
  labContext.beginPath();
  labContext.moveTo(spectrumLeft, base);
  labContext.lineTo(width - 25, base);
  labContext.stroke();
  drawLabel(labContext, "频域幅度", spectrumLeft, 20);
  drawLabel(labContext, `fs / f = ${formatNumber(state.secondary / Math.max(1, state.primary), 2)}`, width - 25, height - 18, rgba(color, 1), "right");
}

function drawAnalogMeter(cx, cy, radius, value, label) {
  labContext.save();
  labContext.fillStyle = "rgba(239, 237, 226, 0.94)";
  labContext.strokeStyle = "rgba(30, 41, 36, 0.55)";
  labContext.lineWidth = 2;
  labContext.beginPath();
  labContext.arc(cx, cy, radius, 0, Math.PI * 2);
  labContext.fill();
  labContext.stroke();
  labContext.strokeStyle = "rgba(41, 50, 46, 0.7)";
  labContext.lineWidth = 1;
  for (let index = 0; index <= 10; index += 1) {
    const angle = Math.PI * 1.15 + (index / 10) * Math.PI * 0.7;
    const inner = radius - (index % 5 === 0 ? 11 : 7);
    labContext.beginPath();
    labContext.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    labContext.lineTo(cx + Math.cos(angle) * (radius - 3), cy + Math.sin(angle) * (radius - 3));
    labContext.stroke();
  }
  const needleAngle = Math.PI * 1.15 + clamp(value, 0, 1) * Math.PI * 0.7;
  labContext.strokeStyle = "#a05e3f";
  labContext.lineWidth = 2;
  labContext.beginPath();
  labContext.moveTo(cx, cy);
  labContext.lineTo(cx + Math.cos(needleAngle) * radius * 0.72, cy + Math.sin(needleAngle) * radius * 0.72);
  labContext.stroke();
  labContext.fillStyle = "#59635e";
  labContext.font = '8.5px "Microsoft YaHei UI", sans-serif';
  labContext.textAlign = "center";
  labContext.fillText(label, cx, cy + radius + 13);
  labContext.restore();
}

function drawPhotoelectricModel(width, height, time) {
  const color = wavelengthToRgb(state.primary);
  const centerY = height * 0.52;
  const sourceX = width * 0.1;
  const chamberLeft = width * 0.45;
  const chamberRight = width * 0.86;
  const cathodeX = width * 0.58;
  const anodeX = width * 0.8;
  const cutoff = 620;
  const emits = state.primary < cutoff;
  labContext.save();
  labContext.fillStyle = "rgba(174, 212, 205, 0.035)";
  labContext.strokeStyle = "rgba(197, 226, 220, 0.24)";
  labContext.lineWidth = 1.5;
  labContext.beginPath();
  labContext.roundRect(chamberLeft, height * 0.12, chamberRight - chamberLeft, height * 0.72, 42);
  labContext.fill();
  labContext.stroke();
  labContext.strokeStyle = "rgba(218, 239, 232, 0.08)";
  labContext.beginPath();
  labContext.moveTo(chamberLeft + 30, height * 0.17);
  labContext.lineTo(chamberRight - 38, height * 0.17);
  labContext.stroke();
  const plateGradient = labContext.createLinearGradient(cathodeX - 5, 0, cathodeX + 12, 0);
  plateGradient.addColorStop(0, "#59655f");
  plateGradient.addColorStop(0.45, "#dfe9e2");
  plateGradient.addColorStop(1, "#68746d");
  labContext.fillStyle = plateGradient;
  labContext.fillRect(cathodeX, height * 0.2, 10, height * 0.57);
  labContext.fillStyle = "#9fb3aa";
  labContext.fillRect(anodeX, height * 0.27, 9, height * 0.43);
  labContext.strokeStyle = "rgba(207, 230, 217, 0.35)";
  labContext.beginPath();
  labContext.moveTo(cathodeX + 5, height * 0.77);
  labContext.lineTo(cathodeX + 5, height * 0.88);
  labContext.lineTo(anodeX + 5, height * 0.88);
  labContext.lineTo(anodeX + 5, height * 0.7);
  labContext.stroke();
  labContext.restore();
  drawGlow(labContext, sourceX, centerY, 34, color, 0.28);
  drawLaserHead(sourceX - 28, centerY, color, time);
  const photonCount = Math.round(7 + state.secondary / 6);
  for (let index = 0; index < photonCount; index += 1) {
    const progress = ((time * 0.045 * state.speed + index * 47) % 230) / 230;
    const x = sourceX + 18 + progress * (cathodeX - sourceX - 18);
    const y = centerY + Math.sin(index * 1.7 + time * 0.001) * height * 0.25;
    labContext.save();
    labContext.globalCompositeOperation = "lighter";
    const tail = labContext.createLinearGradient(x - 24, y, x + 2, y);
    tail.addColorStop(0, rgba(color, 0));
    tail.addColorStop(1, rgba(color, 0.78));
    labContext.strokeStyle = tail;
    labContext.lineWidth = 1.4;
    labContext.beginPath();
    labContext.moveTo(x - 24, y);
    labContext.lineTo(x, y);
    labContext.stroke();
    labContext.fillStyle = rgba(color, 0.88);
    labContext.beginPath();
    labContext.arc(x, y, 2.2, 0, Math.PI * 2);
    labContext.fill();
    labContext.restore();
  }
  if (emits) {
    for (let index = 0; index < 10; index += 1) {
      const progress = ((time * 0.075 * state.speed + index * 77) % 280) / 280;
      const x = cathodeX + 10 + progress * (anodeX - cathodeX - 10);
      const y = centerY + Math.sin(progress * Math.PI) * (index - 5) * 8;
      labContext.save();
      labContext.strokeStyle = `rgba(143, 220, 255, ${0.86 - progress * 0.25})`;
      labContext.lineWidth = 1.4;
      labContext.beginPath();
      labContext.arc(x, y, 2.4, 0, Math.PI * 2);
      labContext.stroke();
      labContext.fillStyle = "rgba(124, 199, 228, 0.24)";
      labContext.fill();
      labContext.restore();
    }
  }
  drawAnalogMeter(width * 0.72, height * 0.83, 29, emits ? 0.25 + state.secondary / 135 : 0.03, "光电流");
  drawLabel(labContext, emits ? "光子能量高于逸出功" : "光子能量低于逸出功", sourceX - 20, 24, emits ? rgba(color, 0.95) : "rgba(240, 171, 89, 0.9)");
  drawLabel(labContext, "高真空光电管", chamberLeft + 22, height * 0.095);
  drawLabel(labContext, "阴极 K", cathodeX - 10, height * 0.9);
  drawLabel(labContext, "阳极 A", anodeX - 10, height * 0.9);
  drawLabel(labContext, emits ? "电子形成光电流" : "无电子逸出", width * 0.72, height * 0.66, emits ? "rgba(143, 220, 255, 0.78)" : "rgba(233, 172, 99, 0.76)", "center");
}

function drawDeviceIVModel(width, height, time) {
  const axes = drawCanvasAxes(labContext, width, height, {
    left: width * 0.5,
    right: width * 0.93,
    top: height * 0.16,
    bottom: height * 0.82
  });
  const color = signalColor();
  const isSolar = currentExperiment().sim === "solar";
  labContext.save();
  const panelX = width * 0.09;
  const panelY = height * 0.2;
  const panelW = width * 0.29;
  const panelH = height * 0.46;
  const panelFill = labContext.createLinearGradient(panelX, panelY, panelX + panelW, panelY + panelH);
  panelFill.addColorStop(0, isSolar ? "rgba(48, 79, 102, 0.82)" : "rgba(30, 66, 71, 0.82)");
  panelFill.addColorStop(1, isSolar ? "rgba(18, 35, 55, 0.92)" : "rgba(17, 37, 38, 0.94)");
  labContext.fillStyle = panelFill;
  labContext.strokeStyle = "rgba(211, 225, 215, 0.4)";
  labContext.lineWidth = 1.5;
  labContext.beginPath();
  labContext.roundRect(panelX, panelY, panelW, panelH, 8);
  labContext.fill();
  labContext.stroke();
  labContext.strokeStyle = isSolar ? "rgba(184, 211, 232, 0.2)" : "rgba(115, 196, 181, 0.24)";
  labContext.lineWidth = 1;
  for (let index = 1; index < 4; index += 1) {
    labContext.beginPath();
    labContext.moveTo(panelX + panelW * index / 4, panelY);
    labContext.lineTo(panelX + panelW * index / 4, panelY + panelH);
    labContext.stroke();
  }
  for (let index = 1; index < 3; index += 1) {
    labContext.beginPath();
    labContext.moveTo(panelX, panelY + panelH * index / 3);
    labContext.lineTo(panelX + panelW, panelY + panelH * index / 3);
    labContext.stroke();
  }
  if (isSolar) {
    for (let index = 0; index < 7; index += 1) {
      const rayX = panelX + panelW * (0.12 + index * 0.13);
      drawBeam(labContext, rayX - 35, panelY - 24, rayX, panelY, [244, 199, 102], time + index * 40, 0.42);
    }
  } else {
    labContext.fillStyle = "rgba(147, 229, 211, 0.12)";
    labContext.beginPath();
    labContext.arc(panelX + panelW / 2, panelY + panelH / 2, 34, 0, Math.PI * 2);
    labContext.fill();
  }
  labContext.restore();
  labContext.save();
  labContext.beginPath();
  for (let index = 0; index <= 150; index += 1) {
    const progress = index / 150;
    let value;
    if (isSolar) {
      const voltage = progress * 0.7;
      value = clamp((0.45 - voltage) / 0.45, 0, 1) * (1 - Math.pow(progress, 3) * 0.16);
    } else {
      value = 0.06 + progress * 0.72 + Math.sin(progress * Math.PI * 3 + time * 0.0008) * 0.025;
    }
    const x = axes.left + progress * (axes.right - axes.left);
    const y = axes.bottom - value * (axes.bottom - axes.top) * 0.9;
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.95);
  labContext.lineWidth = 2.3;
  labContext.stroke();
  labContext.restore();
  drawGlow(labContext, panelX + panelW / 2, panelY + panelH / 2, 30, color, 0.09);
  drawLabel(labContext, isSolar ? "太阳能电池 I–V 曲线" : "光电二极管响应曲线", axes.left, 18);
  drawLabel(labContext, isSolar ? "光伏电池板" : "光电二极管封装", panelX + panelW / 2, panelY + panelH + 20, undefined, "center");
  drawLabel(labContext, isSolar ? `温度 ${formatNumber(state.secondary, 0)} °C` : `反向偏压 ${formatNumber(state.primary, 1)} V`, axes.right, 18, rgba(color, 1), "right");
  drawLabel(labContext, "输出电压 / V", (axes.left + axes.right) / 2, height - 14, undefined, "center");
}

function drawLaserModel(width, height, time) {
  const color = wavelengthToRgb(state.primary);
  const centerY = height * 0.5;
  const beamWidth = 13 + state.secondary * 0.17;
  labContext.save();
  labContext.strokeStyle = "rgba(216, 240, 224, 0.14)";
  labContext.setLineDash([4, 7]);
  labContext.beginPath();
  labContext.moveTo(width * 0.05, centerY);
  labContext.lineTo(width * 0.94, centerY);
  labContext.stroke();
  labContext.restore();
  drawLaserHead(width * 0.075, centerY, color, time);
  labContext.save();
  const gradient = labContext.createLinearGradient(0, centerY - beamWidth * 2, 0, centerY + beamWidth * 2);
  gradient.addColorStop(0, rgba(color, 0));
  gradient.addColorStop(0.38, rgba(color, 0.16));
  gradient.addColorStop(0.5, rgba(color, 0.95));
  gradient.addColorStop(0.62, rgba(color, 0.16));
  gradient.addColorStop(1, rgba(color, 0));
  labContext.fillStyle = gradient;
  labContext.fillRect(width * 0.09, centerY - beamWidth * 2, width * 0.85, beamWidth * 4);
  labContext.restore();
  drawGlow(labContext, width * 0.18, centerY, 45, color, 0.17);
  labContext.save();
  labContext.strokeStyle = "rgba(211, 239, 220, 0.5)";
  labContext.fillStyle = "rgba(154, 214, 188, 0.04)";
  labContext.beginPath();
  labContext.ellipse(width * 0.2, centerY, 11, 52, 0, 0, Math.PI * 2);
  labContext.fill();
  labContext.stroke();
  labContext.restore();
  const profileLeft = width * 0.12;
  const profileRight = width * 0.9;
  labContext.save();
  for (const sign of [-1, 1]) {
    labContext.beginPath();
    for (let x = profileLeft; x <= profileRight; x += 1) {
      const progress = (x - profileLeft) / (profileRight - profileLeft);
      const radius = Math.sqrt(1 + progress * progress * 5) * 15;
      const y = centerY + sign * (radius + Math.sin(x * 0.08 - time * 0.001) * 1.2);
      if (x === profileLeft) labContext.moveTo(x, y);
      else labContext.lineTo(x, y);
    }
    labContext.strokeStyle = rgba(color, sign === 1 ? 0.82 : 0.46);
    labContext.lineWidth = 1.2;
    labContext.stroke();
  }
  labContext.restore();
  const profileX = width * 0.72;
  const profileTop = height * 0.12;
  const profileBottom = height * 0.84;
  labContext.save();
  labContext.beginPath();
  for (let index = 0; index <= 80; index += 1) {
    const progress = index / 80;
    const y = profileTop + progress * (profileBottom - profileTop);
    const x = profileX - Math.exp(-((progress - 0.5) ** 2) / 0.012) * 46;
    if (index === 0) labContext.moveTo(profileX, y);
    labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.72);
  labContext.lineWidth = 1.4;
  labContext.stroke();
  labContext.restore();
  labContext.save();
  labContext.strokeStyle = "rgba(219, 240, 225, 0.16)";
  for (let x = profileLeft; x <= profileRight; x += 1) {
    if ((x - profileLeft) % 40 < 1) {
      labContext.beginPath();
      labContext.moveTo(x, centerY - 3);
      labContext.lineTo(x, centerY + 3);
      labContext.stroke();
    }
  }
  labContext.restore();
  drawLabel(labContext, "高斯光束传播包络", width * 0.09, 24, rgba(color, 0.95));
  drawLabel(labContext, "准直透镜", width * 0.16, centerY + 72);
  drawLabel(labContext, "横向高斯截面", profileX + 8, height * 0.1, "rgba(220, 240, 226, 0.48)");
  drawLabel(labContext, `驱动 ${formatNumber(state.secondary, 0)} mA`, width - 24, height - 20, rgba(color, 0.8), "right");
}

function drawImagingModel(width, height, time) {
  const cols = 16;
  const rows = 9;
  const cellW = Math.min(23, (width * 0.56) / cols);
  const cellH = (height * 0.55) / rows;
  const startX = (width - cols * cellW) / 2;
  const startY = (height - rows * cellH) / 2;
  const color = signalColor();
  labContext.save();
  labContext.fillStyle = "rgba(8, 22, 14, 0.76)";
  labContext.strokeStyle = "rgba(216, 238, 224, 0.24)";
  labContext.beginPath();
  labContext.roundRect(width * 0.055, height * 0.32, width * 0.16, height * 0.34, 10);
  labContext.fill();
  labContext.stroke();
  labContext.fillStyle = "#13251d";
  labContext.beginPath();
  labContext.ellipse(width * 0.215, height * 0.49, width * 0.055, height * 0.12, 0, 0, Math.PI * 2);
  labContext.fill();
  labContext.stroke();
  labContext.fillStyle = rgba(color, 0.18);
  labContext.beginPath();
  labContext.arc(width * 0.215, height * 0.49, 9, 0, Math.PI * 2);
  labContext.fill();
  labContext.stroke();
  labContext.restore();
  labContext.save();
  labContext.fillStyle = "rgba(211, 236, 221, 0.05)";
  labContext.beginPath();
  labContext.moveTo(width * 0.25, height * 0.42);
  labContext.lineTo(startX, startY);
  labContext.lineTo(startX, startY + rows * cellH);
  labContext.lineTo(width * 0.25, height * 0.58);
  labContext.closePath();
  labContext.fill();
  labContext.restore();
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const nx = (col - cols / 2) / cols;
      const ny = (row - rows / 2) / rows;
      const edge = Math.abs(nx + ny * 0.35 - 0.12) < 0.035;
      const texture = 0.11 + Math.abs(Math.sin(col * 12.9898 + row * 78.233)) * 0.1 + Math.sin(col * 0.8 + time * 0.001) * 0.025;
      const value = edge ? 0.88 : texture;
      labContext.fillStyle = rgba(color, value);
      labContext.fillRect(startX + col * cellW + 1, startY + row * cellH + 1, cellW - 2, cellH - 2);
    }
  }
  labContext.strokeStyle = "rgba(211, 244, 220, 0.26)";
  labContext.strokeRect(startX - 5, startY - 5, cols * cellW + 10, rows * cellH + 10);
  const profileX = startX;
  const profileY = startY + rows * cellH + 22;
  labContext.save();
  labContext.beginPath();
  for (let index = 0; index <= 90; index += 1) {
    const progress = index / 90;
    const edge = Math.exp(-((progress - 0.54) ** 2) / 0.0015);
    const x = profileX + progress * cols * cellW;
    const y = profileY + 36 - (0.14 + edge * 0.72) * 28;
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.78);
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, "CMOS 像素阵列 / 边缘响应", startX, startY - 13);
  drawLabel(labContext, "工业相机", width * 0.07, height * 0.29);
  drawLabel(labContext, "像素灰度截面", profileX, profileY - 4);
  drawLabel(labContext, `曝光 ${formatNumber(state.primary, 1)} ms · F${formatNumber(state.secondary, 1)}`, startX + cols * cellW, startY - 13, rgba(color, 0.8), "right");
}

function drawFiberModel(width, height, time) {
  const color = wavelengthToRgb(clamp(state.primary, 400, 750));
  const centerY = height * 0.5;
  const attenuation = Math.exp(-state.secondary / 35);
  const visualAttenuation = Math.max(0.55, attenuation);
  labContext.save();
  const jacket = labContext.createLinearGradient(0, centerY - 62, 0, centerY + 62);
  jacket.addColorStop(0, "rgba(35, 54, 49, 0.25)");
  jacket.addColorStop(0.2, "rgba(113, 137, 126, 0.32)");
  jacket.addColorStop(0.5, "rgba(15, 30, 23, 0.72)");
  jacket.addColorStop(0.8, "rgba(102, 127, 116, 0.28)");
  jacket.addColorStop(1, "rgba(22, 37, 30, 0.16)");
  labContext.fillStyle = jacket;
  labContext.strokeStyle = "rgba(207, 229, 216, 0.22)";
  labContext.beginPath();
  labContext.roundRect(width * 0.06, centerY - 64, width * 0.88, 128, 64);
  labContext.fill();
  labContext.stroke();
  labContext.strokeStyle = "rgba(212, 236, 222, 0.12)";
  for (const offset of [-48, -30, 30, 48]) {
    labContext.beginPath();
    labContext.moveTo(width * 0.08, centerY + offset);
    labContext.lineTo(width * 0.92, centerY + offset);
    labContext.stroke();
  }
  const core = labContext.createLinearGradient(0, centerY - 8, 0, centerY + 8);
  core.addColorStop(0, "rgba(15, 29, 22, 0.2)");
  core.addColorStop(0.5, rgba(color, 0.18));
  core.addColorStop(1, "rgba(15, 29, 22, 0.2)");
  labContext.fillStyle = core;
  labContext.fillRect(width * 0.07, centerY - 8, width * 0.86, 16);
  labContext.restore();
  for (let pulse = 0; pulse < 4; pulse += 1) {
    const x = width * (0.14 + (((time * 0.03 + pulse * 90) % 260) / 260) * 0.74);
    const pulseStrength = 0.95 * visualAttenuation * (0.82 + Math.sin(time * 0.002 + pulse) * 0.1);
    const gradient = labContext.createRadialGradient(x, centerY, 0, x, centerY, 50);
    gradient.addColorStop(0, rgba(color, pulseStrength));
    gradient.addColorStop(0.24, rgba(color, pulseStrength * 0.4));
    gradient.addColorStop(1, rgba(color, 0));
    labContext.fillStyle = gradient;
    labContext.fillRect(x - 55, centerY - 55, 110, 110);
    labContext.save();
    labContext.strokeStyle = rgba(color, pulseStrength * 0.8);
    labContext.lineWidth = 1.5;
    labContext.beginPath();
    labContext.ellipse(x, centerY, 12 + pulse * 1.6, 4.5, 0, 0, Math.PI * 2);
    labContext.stroke();
    labContext.restore();
  }
  labContext.save();
  labContext.strokeStyle = rgba(color, 0.2);
  labContext.beginPath();
  for (let x = width * 0.1; x < width * 0.9; x += 1) {
    const y = centerY + Math.sin(x * 0.1 + time * 0.001) * 4;
    if (x === width * 0.1) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.stroke();
  labContext.restore();
  const graphLeft = width * 0.18;
  const graphTop = height * 0.78;
  const graphWidth = width * 0.62;
  labContext.save();
  labContext.strokeStyle = "rgba(215, 238, 222, 0.14)";
  labContext.fillStyle = "rgba(5, 18, 10, 0.36)";
  labContext.beginPath();
  labContext.roundRect(graphLeft - 12, graphTop - 14, graphWidth + 24, 55, 5);
  labContext.fill();
  labContext.stroke();
  labContext.beginPath();
  labContext.moveTo(graphLeft, graphTop + 28);
  labContext.lineTo(graphLeft + graphWidth, graphTop + 28);
  labContext.stroke();
  labContext.beginPath();
  for (let index = 0; index <= 70; index += 1) {
    const progress = index / 70;
    const power = Math.exp(-state.secondary * progress / 35);
    const x = graphLeft + progress * graphWidth;
    const y = graphTop + 28 - power * 26;
    if (index === 0) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.72);
  labContext.stroke();
  labContext.restore();
  drawLabel(labContext, "光纤模式与脉冲传输", width * 0.08, 24);
  drawLabel(labContext, "纤芯", width * 0.08, centerY - 12);
  drawLabel(labContext, "包层 / 涂覆层", width * 0.08, centerY - 54);
  drawLabel(labContext, "归一化功率衰减", graphLeft, graphTop);
  drawLabel(labContext, `${formatNumber(state.secondary, 1)} km · 输出 ${formatNumber(attenuation * 100, 1)}%`, width * 0.9, height - 12, "rgba(240, 205, 145, 0.9)", "right");
}

function drawHolographyModel(width, height, time) {
  const color = wavelengthToRgb(state.primary);
  const centerX = width / 2;
  const centerY = height / 2;
  const angle = (state.secondary * Math.PI) / 180;
  const colorCss = rgba(color, 0.55);
  drawBeam(labContext, width * 0.03, height * 0.24, width * 0.13, height * 0.34, color, time, 0.52);
  drawBeam(labContext, width * 0.95, height * 0.08, width * 0.84, height * 0.2, color, time, 0.38);
  drawGlow(labContext, width * 0.12, height * 0.32, 26, color, 0.17);
  labContext.save();
  labContext.fillStyle = "rgba(3, 11, 7, 0.68)";
  labContext.fillRect(width * 0.12, height * 0.1, width * 0.76, height * 0.8);
  for (let y = height * 0.1; y < height * 0.9; y += 1.5) {
    for (let x = width * 0.12; x < width * 0.88; x += 1.5) {
      const dx = x - centerX;
      const dy = y - centerY;
      const interference = Math.cos(dx * Math.cos(angle) + dy * Math.sin(angle) + state.phase * 8);
      const object = Math.exp(-((dx / 120) ** 2 + (dy / 75) ** 2)) * 0.8;
      const intensity = Math.pow(0.5 + 0.5 * interference, 2) * (0.18 + object);
      if (intensity > 0.025) {
        labContext.fillStyle = rgba(color, intensity);
        labContext.fillRect(x, y, 1.5, 1.5);
      }
    }
  }
  labContext.strokeStyle = "rgba(210, 237, 221, 0.23)";
  labContext.lineWidth = 1.5;
  labContext.strokeRect(width * 0.12, height * 0.1, width * 0.76, height * 0.8);
  labContext.fillStyle = "rgba(219, 238, 226, 0.26)";
  [[0.12, 0.1], [0.88, 0.1], [0.12, 0.9], [0.88, 0.9]].forEach(([nx, ny]) => {
    labContext.beginPath();
    labContext.arc(width * nx, height * ny, 2.5, 0, Math.PI * 2);
    labContext.fill();
  });
  labContext.restore();
  drawLabel(labContext, "物光与参考光干涉记录", width * 0.12, height * 0.075, rgba(color, 0.9));
  drawLabel(labContext, "参考光", width * 0.77, height * 0.065, colorCss, "right");
  drawLabel(labContext, "物光", width * 0.1, height * 0.34, colorCss);
  drawLabel(labContext, `${formatNumber(state.secondary, 0)}° 参考光夹角`, width * 0.88, height * 0.93, rgba(color, 0.85), "right");
}

function drawEmbeddedModel(width, height, time) {
  const axes = drawCanvasAxes(labContext, width, height);
  const color = signalColor();
  const channels = ["UART TX", "UART RX", "SCL", "SDA"];
  const rowH = (axes.bottom - axes.top) / channels.length;
  channels.forEach((channel, index) => {
    const baseY = axes.top + rowH * (index + 0.7);
    labContext.save();
    labContext.strokeStyle = rgba(color, index === 1 ? 0.55 : 0.8);
    labContext.beginPath();
    for (let x = axes.left; x <= axes.right; x += 2) {
      const progress = (x - axes.left) / (axes.right - axes.left);
      const speed = 6 + state.primary * 0.02;
      const high = Math.floor((progress * speed + time * 0.0008 + index * 0.37) % 3) !== 0;
      const y = baseY - (high ? 14 : 0);
      if (x === axes.left) labContext.moveTo(x, y);
      else labContext.lineTo(x, y);
    }
    labContext.stroke();
    labContext.restore();
    drawLabel(labContext, channel, axes.left - 47, baseY - 4);
  });
  drawLabel(labContext, `波特率 ${formatNumber(state.primary, 1)} kbps`, axes.right, 18, rgba(color, 0.9), "right");
}

function drawCommunicationModel(width, height, time) {
  const color = signalColor();
  const centerY = height * 0.48;
  const rail = 47 - Math.min(24, state.secondary * 0.82);
  for (let trace = -4; trace <= 4; trace += 1) {
    labContext.save();
    labContext.strokeStyle = rgba(color, 0.13 + (4 - Math.abs(trace)) * 0.035);
    labContext.lineWidth = 1.1;
    labContext.beginPath();
    for (let x = width * 0.12; x <= width * 0.88; x += 1.5) {
      const progress = (x - width * 0.12) / (width * 0.76);
      const extended = progress * 4 + (trace + 4) * 0.31 + time * 0.00008;
      const bitIndex = Math.floor(extended);
      const previous = ((bitIndex * 7 + trace * 3 + 5) % 11) > 5 ? 1 : -1;
      const current = (((bitIndex + 1) * 7 + trace * 3 + 5) % 11) > 5 ? 1 : -1;
      const local = extended - bitIndex;
      const transitionProgress = clamp((local - 0.34) / 0.32, 0, 1);
      const smooth = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
      const value = previous + (current - previous) * smooth;
      const jitter = Math.sin(x * 0.19 + trace * 1.7 + time * 0.001) * (1.4 + state.secondary * 0.045);
      const y = centerY + value * rail + jitter;
      if (x === width * 0.12) labContext.moveTo(x, y);
      else labContext.lineTo(x, y);
    }
    labContext.stroke();
    labContext.restore();
  }
  const histogramX = width * 0.67;
  for (let bucket = 0; bucket < 18; bucket += 1) {
    const gaussian = Math.exp(-Math.pow((bucket - 8) / 3.5, 2));
    const barWidth = 3;
    const barHeight = 8 + gaussian * 36;
    labContext.fillStyle = `rgba(199, 158, 95, ${0.08 + gaussian * 0.2})`;
    labContext.fillRect(histogramX + bucket * 4, centerY + 70 - barHeight, barWidth, barHeight);
  }
  labContext.strokeStyle = "rgba(213, 244, 220, 0.15)";
  labContext.setLineDash([5, 7]);
  labContext.beginPath();
  labContext.moveTo(width * 0.1, centerY);
  labContext.lineTo(width * 0.9, centerY);
  labContext.stroke();
  labContext.setLineDash([]);
  drawLabel(labContext, "接收眼图与判决门限", width * 0.12, 24, rgba(color, 0.9));
  drawLabel(labContext, "幅度直方图", histogramX, centerY + 88, "rgba(218, 190, 148, 0.5)");
  drawLabel(labContext, `链路损耗 ${formatNumber(state.secondary, 1)} dB`, width * 0.88, height - 20, rgba(color, 0.8), "right");
}

function drawIntegratedModel(width, height, time) {
  const color = signalColor();
  const panels = 4;
  const pad = 22;
  const gap = 10;
  const panelW = (width - pad * 2 - gap) / 2;
  const panelH = (height - pad * 2 - gap) / 2;
  for (let index = 0; index < panels; index += 1) {
    const x = pad + (index % 2) * (panelW + gap);
    const y = pad + Math.floor(index / 2) * (panelH + gap);
    labContext.fillStyle = "rgba(16, 45, 30, 0.78)";
    labContext.fillRect(x, y, panelW, panelH);
    labContext.strokeStyle = "rgba(209, 244, 217, 0.14)";
    labContext.strokeRect(x, y, panelW, panelH);
    labContext.beginPath();
    for (let px = x + 12; px < x + panelW - 12; px += 2) {
      const progress = (px - x) / panelW;
      const value = Math.sin(progress * Math.PI * (3 + index * 1.5) + time * 0.001 + index) * (index === 2 ? 25 : 0.33);
      const valueNormalized = value <= 1 && value >= -1 ? value : value / 25;
      const py = y + panelH / 2 - valueNormalized * panelH * 0.32;
      if (px === x + 12) labContext.moveTo(px, py);
      else labContext.lineTo(px, py);
    }
    labContext.strokeStyle = rgba(color, 0.82);
    labContext.lineWidth = 1.5;
    labContext.stroke();
    drawLabel(labContext, ["光信号", "探测器", "数据处理", "决策输出"][index], x + 10, y + 15, rgba(color, 0.75));
  }
  drawLabel(labContext, "系统端到端状态", pad, height - 4, rgba(color, 0.4));
}

function drawGenericModel(width, height, time) {
  const color = signalColor();
  const centerY = height / 2;
  labContext.save();
  labContext.beginPath();
  for (let x = 30; x < width - 30; x += 1) {
    const progress = (x - 30) / (width - 60);
    const y = centerY - Math.sin(progress * Math.PI * 12 + time * 0.001) * height * 0.2;
    if (x === 30) labContext.moveTo(x, y);
    else labContext.lineTo(x, y);
  }
  labContext.strokeStyle = rgba(color, 0.9);
  labContext.lineWidth = 2;
  labContext.stroke();
  labContext.restore();
}

function renderYearOverview() {
  const container = document.getElementById("year-overview");
  const graduateModules = CATALOG
    .filter((semester) => semester.scope === "graduate")
    .reduce((total, semester) => total + semester.experiments.length, 0);
  const graduateCourses = CATALOG.filter((semester) => semester.scope === "graduate").length;
  container.innerHTML = [1, 2, 3, 4].map((year) => {
    const semesters = CATALOG.filter((semester) => semester.year === year && semester.scope !== "graduate");
    const generalSemesters = semesters.filter((semester) => !semester.scope || semester.scope === "general");
    const oldHustModules = semesters
      .filter((semester) => semester.scope === "hust")
      .reduce((total, semester) => total + semester.experiments.length, 0);
    const verifiedModules = semesters
      .filter((semester) => semester.scope === "hust-exact")
      .reduce((total, semester) => total + semester.experiments.length, 0);
    const electricalModules = semesters
      .filter((semester) => semester.scope === "electrical")
      .reduce((total, semester) => total + semester.experiments.length, 0);
    const titles = generalSemesters.map((semester) => semester.title);
    const totalExperiments = semesters.reduce((total, semester) => total + semester.experiments.length, 0);
    return `<button class="year-overview-card" data-jump-year="${year}" data-year="${year}">
      <div class="year-card-top"><span>YEAR ${String(year).padStart(2, "0")}</span><i></i></div>
      <h3>${["先打好基础", "开始上手", "做深一点", "完成一个设计"][year - 1]}</h3>
      <p>${titles.join("；")}${oldHustModules ? `；原华科光电本科 ${oldHustModules} 项` : ""}${verifiedModules ? `；华科核验清单 ${verifiedModules} 项` : ""}${electricalModules ? `；华科电学扩展 ${electricalModules} 项` : ""}</p>
      <small>${totalExperiments} 个实验 · ${semesters.length} 个课程节点</small>
    </button>`;
  }).join("") + `<button class="graduate-overview-card" data-jump-year="graduate">
    <span>GRADUATE RESEARCH</span>
    <div>
      <strong>研究生实验与研究平台</strong>
      <p>高等光谱、超快光学、量子光子学、微纳光子学、生物医学光子学、智能仪器与先进光网络。</p>
    </div>
    <small>${graduateModules} 个研究生实验 · ${graduateCourses} 个方向</small>
  </button>`;
  container.querySelectorAll("[data-jump-year]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filterYear = button.dataset.jumpYear;
      document.querySelectorAll(".year-filter button").forEach((item) => {
        item.classList.toggle("active", item.dataset.year === state.filterYear);
      });
      renderCatalog();
      document.getElementById("catalog-section").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function filteredCatalog() {
  const query = state.search.trim().toLowerCase();
  return CATALOG
    .filter((semester) =>
      state.filterYear === "all" ||
      (state.filterYear === "hust-exact" && semester.scope === "hust-exact") ||
      (state.filterYear === "general" && (!semester.scope || semester.scope === "general" || semester.scope === "hust")) ||
      (state.filterYear === "graduate" && semester.scope === "graduate") ||
      (state.filterYear === "hust" && semester.scope === "hust") ||
      (state.filterYear === "electrical" && semester.scope === "electrical") ||
      semester.year === Number(state.filterYear)
    )
    .map((semester) => ({
      ...semester,
      experiments: semester.experiments.filter((experiment) =>
        !query || [experiment.name, experiment.description, experiment.formula, semester.title]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    }))
    .filter((semester) => semester.experiments.length);
}

function renderCatalog() {
  const container = document.getElementById("semester-list");
  const catalog = filteredCatalog();
  const visibleCount = catalog.reduce((total, semester) => total + semester.experiments.length, 0);
  document.getElementById("catalog-count").textContent = state.filterYear === "all" && !state.search
    ? `共 ${visibleCount} 个实验`
    : `筛选到 ${visibleCount} 个实验`;
  if (!catalog.length) {
    container.innerHTML = '<div class="catalog-empty">没有匹配的实验。请尝试更短的关键词或切换年级。</div>';
    return;
  }
  const yearNames = { 1: "大一", 2: "大二", 3: "大三", 4: "大四" };
  container.innerHTML = catalog.map((semester) => {
    const containsSelected = semester.experiments.some((experiment) => experiment.id === state.experimentId);
    const openByDefault = state.search.trim() ||
      containsSelected ||
      (state.filterYear === "hust-exact" && semester.scope === "hust-exact") ||
      (state.filterYear === "general" && (!semester.scope || semester.scope === "general" || semester.scope === "hust")) ||
      (state.filterYear === "graduate" && semester.scope === "graduate") ||
      (state.filterYear === "electrical" && semester.scope === "electrical") ||
      (yearNames[state.filterYear] && semester.year === Number(state.filterYear));
    const officialCourse = semester.scope === "hust" || semester.scope === "hust-exact" || semester.scope === "electrical" || semester.scope === "graduate";
    const coursePrefix = semester.scope === "electrical"
      ? "华中科技大学电学扩展 · "
      : semester.scope === "hust"
        ? "原华科光电本科培养方案 · "
        : semester.scope === "hust-exact"
          ? `华科核验清单 · ${semester.termLabel || `大${["一", "二", "三", "四"][semester.year - 1]}${semester.term === 1 ? "上" : "下"}`} · `
        : semester.scope === "graduate"
          ? `研究生 · 研${semester.degreeYear === 2 ? "二" : "一"} · `
          : "";
    return `
    <section class="semester-group ${semester.scope === "hust" ? "hust-course-group" : ""} ${semester.scope === "hust-exact" ? "hust-exact-course-group" : ""} ${semester.scope === "electrical" ? "electrical-course-group" : ""} ${semester.scope === "graduate" ? "graduate-course-group" : ""}">
      <div class="semester-header">
        <div>
          <span class="semester-number">${officialCourse ? semester.officialCode : String((semester.year - 1) * 2 + semester.term).padStart(2, "0")}</span>
          <div>
            <h3>${coursePrefix || `大${["一", "二", "三", "四"][semester.year - 1]} · ${semester.term === 1 ? "上学期" : "下学期"} · `}${semester.title}</h3>
            <p>${semester.focus}${officialCourse ? ` · ${semester.officialCredits} 学分 / ${semester.officialHours}` : ""}${semester.location ? ` · ${semester.location}` : ""}</p>
          </div>
        </div>
        <div class="semester-group-actions">
          <span>${semester.scope === "hust" ? "原华科光电本科 · " : semester.scope === "hust-exact" ? "华科核验清单 · " : semester.scope === "electrical" ? "HUST 电学扩展 · " : semester.scope === "graduate" ? "研究生研究实验 · " : ""}${semester.experiments.length} 个实验</span>
          <button class="group-toggle" data-group-toggle="${semester.id}" aria-expanded="${openByDefault ? "true" : "false"}">${openByDefault ? "收起" : "展开"}</button>
        </div>
      </div>
      <div class="experiment-card-grid ${openByDefault ? "" : "collapsed"}" data-group-grid="${semester.id}">
        ${semester.experiments.map((experiment, index) => `
          <button class="experiment-card ${experiment.id === state.experimentId ? "selected" : ""} ${semester.scope === "hust" ? "hust-experiment-card" : ""} ${semester.scope === "hust-exact" ? "hust-exact-experiment-card" : ""} ${semester.scope === "electrical" ? "electrical-experiment-card" : ""} ${semester.scope === "graduate" ? "graduate-experiment-card" : ""}" data-experiment-id="${experiment.id}">
            <span class="experiment-card-index">${officialCourse ? semester.officialCode : "EXP"} ${String(index + 1).padStart(2, "0")}</span>
            <h4>${escapeHtml(experiment.name)}</h4>
            <p>${escapeHtml(experiment.description)}</p>
            <span class="experiment-card-formula">${escapeHtml(experiment.formula)}</span>
            ${experiment.requirement || experiment.evidenceGrade ? `<span class="experiment-card-tags"><b>${escapeHtml(experiment.requirement || "课程项目")}</b><i>${escapeHtml(experiment.evidenceGrade || "证据未标注")}</i></span>` : ""}
          </button>
        `).join("")}
      </div>
    </section>
  `;
  }).join("");
  const noLabContainer = document.getElementById("hust-no-lab-terms");
  const visibleNoLabTerms = (window.HUST_EXACT_NO_LAB_TERMS || []).filter((item) =>
    state.filterYear === "all" ||
    state.filterYear === "hust" ||
    state.filterYear === "hust-exact" ||
    (yearNames[state.filterYear] && item.term.includes(yearNames[state.filterYear]))
  );
  const showNoLabTerms = !state.search && visibleNoLabTerms.length;
  const dedupeReport = window.OPTILAB_DEDUPE_REPORT;
  const noLabHtml = showNoLabTerms
    ? `<div class="hust-no-lab-heading"><strong>清单中的无实验学期</strong><span>这些行保留在源表中，不作为可点击实验项目。</span></div>
      ${visibleNoLabTerms.map((item) => `<div class="hust-no-lab-row"><b>${escapeHtml(item.term)}</b><span>${escapeHtml(item.note)}</span><i>${escapeHtml(item.evidence)}</i></div>`).join("")}`
    : "";
  const dedupeHtml = !state.search && dedupeReport?.removedCount
    ? `<div class="hust-no-lab-heading"><strong>重复项清理</strong><span>相同实验只保留资料更明确的一份。</span></div>
      <div class="hust-no-lab-row"><b>已清理 ${dedupeReport.removedCount} 项</b><span>旧版华科目录、原光电目录和电学扩展中的同名或同公式项目已去重。</span><i>专业认知 ${dedupeReport.protectedCount} 项全部保留</i></div>`
    : "";
  noLabContainer.innerHTML = noLabHtml + dedupeHtml;
  container.querySelectorAll("[data-experiment-id]").forEach((button) => {
    button.addEventListener("click", () => selectExperiment(button.dataset.experimentId, true));
  });
  container.querySelectorAll("[data-group-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const grid = container.querySelector(`[data-group-grid="${button.dataset.groupToggle}"]`);
      const willOpen = grid.classList.contains("collapsed");
      grid.classList.toggle("collapsed", !willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
      button.textContent = willOpen ? "收起" : "展开";
    });
  });
  document.getElementById("catalog-expand").textContent =
    container.querySelector(".experiment-card-grid.collapsed") ? "展开全部" : "收起全部";
  refreshMotionTargets();
}

function selectExperiment(experimentId, scrollToLab = false) {
  const experiment = EXPERIMENTS.find((item) => item.id === experimentId);
  if (!experiment) return;
  state.experimentId = experiment.id;
  const config = controlConfig(experiment);
  state.primary = config.primary.value;
  state.secondary = config.secondary.value;
  state.autoScan = false;
  state.paused = false;
  const principle = principleInfo(experiment);
  document.getElementById("auto-scan").setAttribute("aria-pressed", "false");
  document.getElementById("lab-pause").textContent = "暂停";
  document.getElementById("lab-title").textContent = experiment.name;
  const courseLevel = experiment.scope === "graduate"
    ? `研${experiment.degreeYear === 2 ? "二" : "一"}`
    : `大${["一", "二", "三", "四"][experiment.year - 1]}`;
  document.getElementById("lab-year-tag").textContent = `${courseLevel} · ${experiment.term === 1 ? "上" : "下"}`;
  document.getElementById("lab-subtitle").textContent = `${simInfo(experiment).domain} · ${experiment.semesterTitle}，拖动器件和参数看看哪里会变`;
  document.getElementById("lab-description").textContent = principle.intro;
  document.getElementById("lab-formula").textContent = experiment.formula;
  document.getElementById("lab-badge").textContent = experiment.sim.replaceAll("-", " ").toUpperCase();
  document.getElementById("record-x").textContent = simInfo(experiment).xLabel;
  document.getElementById("record-y").textContent = simInfo(experiment).yLabel;
  document.getElementById("lab-objectives").innerHTML = [
    `理解${experiment.name}的核心测量关系`,
    `按档案完成仪器检查与关键步骤`,
    `记录${simInfo(experiment).xLabel}与${simInfo(experiment).yLabel}并评价异常点`
  ].map((text) => `<li>${escapeHtml(text)}</li>`).join("");
  document.getElementById("principle-subtitle").textContent =
    `${experiment.name} · ${courseLevel}${experiment.term === 1 ? "上" : "下"} · ${experiment.semesterTitle}`;
  document.getElementById("principle-intro-title").textContent = experiment.name;
  document.getElementById("principle-intro").textContent = principle.intro;
  document.getElementById("principle-theory").textContent = principle.theory;
  document.getElementById("principle-formula").textContent = experiment.formula;
  document.getElementById("principle-variables").textContent = principle.variables;
  document.getElementById("principle-apparatus").textContent = principle.apparatus;
  document.getElementById("principle-steps").innerHTML = principle.steps
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join("");
  document.getElementById("principle-caution").textContent = principle.caution;
  document.getElementById("principle-observations").textContent = principle.observations;
  renderEquipmentProfile(experiment);
  document.getElementById("lab-legend").innerHTML = [
    `<span><i class="legend-green"></i> ${escapeHtml(config.primary.label)}</span>`,
    `<span><i class="legend-amber"></i> ${escapeHtml(config.secondary.label)}</span>`
  ].join("");
  updateSimulationStory();
  primaryControl.min = config.primary.min;
  primaryControl.max = config.primary.max;
  primaryControl.step = config.primary.step;
  primaryControl.value = state.primary;
  secondaryControl.min = config.secondary.min;
  secondaryControl.max = config.secondary.max;
  secondaryControl.step = config.secondary.step;
  secondaryControl.value = state.secondary;
  document.getElementById("primary-label").textContent = config.primary.label;
  document.getElementById("secondary-label").textContent = config.secondary.label;
  updateControlReadouts();
  document.querySelectorAll(".experiment-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.experimentId === experiment.id);
  });
  drawLabFrame(performance.now());
  pulseMotion(labCanvas, "canvas-switch");
  if (scrollToLab) {
    document.getElementById("lab-section").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`已切换到 ${experiment.name}`);
  }
}

function updateControlReadouts() {
  const experiment = currentExperiment();
  const config = controlConfig(experiment);
  document.getElementById("primary-value").textContent = formatControlValue(state.primary, config.primary);
  document.getElementById("secondary-value").textContent = formatControlValue(state.secondary, config.secondary);
  document.getElementById("lab-readout").textContent =
    `${config.primary.label} ${formatControlValue(state.primary, config.primary)}`;
  const derived = calculateDerivedReading(experiment);
  document.getElementById("derived-reading").textContent = derived.value;
  document.getElementById("derived-note").textContent =
    `${derived.note} · 统一计算引擎 ${derived.engineVersion || "local"}`;
  updateSimulationStory();
}

function calculateDerivedReading(experiment = currentExperiment()) {
  const unified = window.OptilabPhysics?.calculate(experiment, state.primary, state.secondary);
  if (unified) return unified;
  const primary = state.primary;
  const secondary = state.secondary;
  switch (experiment.sim) {
    case "double-slit": {
      const spacing = (primary * 1e-3) / Math.max(0.001, secondary);
      return { value: `Δx ≈ ${formatNumber(spacing, 3)} mm`, note: "按缝到屏距离 L = 1 m 估算相邻明纹间距。" };
    }
    case "diffraction": {
      const angle = Math.asin(clamp((primary / 1000) / secondary, -1, 1)) * 180 / Math.PI;
      return { value: `一级暗纹 θ ≈ ${formatNumber(angle, 3)}°`, note: "假设垂直入射并使用 a·sinθ = λ。" };
    }
    case "grating": {
      const angle = Math.asin(clamp((primary / 1000) / secondary, -1, 1)) * 180 / Math.PI;
      return { value: `一级衍射角 ≈ ${formatNumber(angle, 2)}°`, note: "d·sinθ = kλ，当前取一级衍射 k = 1。" };
    }
    case "michelson": {
      const wavelengthUm = primary / 1000;
      const fringes = (2 * secondary) / wavelengthUm;
      return { value: `理论条纹数 ≈ ${formatNumber(fringes, 1)}`, note: "镜面位移改变往返光程，N = 2Δd/λ。" };
    }
    case "polarization": {
      const intensity = Math.cos(secondary * Math.PI / 180) ** 2;
      return { value: `I/I₀ ≈ ${formatNumber(intensity, 4)}`, note: "马吕斯定律 I = I₀cos²θ，已计入当前检偏角。" };
    }
    case "optics": {
      const imageDistance = (primary * secondary) / Math.max(0.01, primary - secondary);
      return { value: `像距 v ≈ ${formatNumber(imageDistance, 2)} cm`, note: "由 1/f = 1/u + 1/v 计算，物距需大于焦距才能成实像。" };
    }
    case "rc": {
      const tau = primary * secondary / 1000;
      return { value: `时间常数 τ ≈ ${formatNumber(tau, 2)} ms`, note: "R 以 kΩ、C 以 μF 输入时，RC 的数值直接对应 ms。" };
    }
    case "photoelectric": {
      const photonEnergy = 1240 / Math.max(1, primary);
      return { value: `单光子能量 ≈ ${formatNumber(photonEnergy, 3)} eV`, note: "使用 E(eV) ≈ 1240/λ(nm)，用于与材料逸出功比较。" };
    }
    case "laser": {
      const divergence = (0.64 / Math.max(0.001, secondary)) * 180 / Math.PI;
      return { value: `近似发散半角 ≈ ${formatNumber(divergence, 3)}°`, note: "简化估算 θ ≈ λ/(πw₀)，实际需使用测得腰斑拟合。" };
    }
    case "fiber": {
      const output = Math.exp(-secondary / 35) * 100;
      return { value: `示范输出 ≈ ${formatNumber(output, 1)}%`, note: "演示模型采用等效衰减长度，真实结果以输入功率和损耗系数为准。" };
    }
    case "solar": {
      const fillFactor = 0.62 + (secondary - 25) * 0.002;
      return { value: `示范填充因子 ≈ ${formatNumber(fillFactor, 3)}`, note: "温度升高通常使开路电压和填充因子下降。" };
    }
    case "amplifier": {
      const closedLoopGain = 28 / (1 + 28 * secondary);
      return { value: `闭环增益示意 ≈ ${formatNumber(closedLoopGain, 2)}`, note: "负反馈降低增益并提高稳定性，实际值由开环增益和反馈网络决定。" };
    }
    case "frequency": {
      return { value: `-3 dB 截止 ≈ ${formatNumber(primary, 1)} kHz`, note: `当前选择 ${Math.round(secondary)} 阶响应，阶数越高带外衰减越快。` };
    }
    case "photodiode": {
      const responsivity = 0.45 + secondary / 900;
      return { value: `响应度示意 ≈ ${formatNumber(responsivity, 3)} A/W`, note: "偏压与波长会共同影响真实响应度，演示值仅用于趋势观察。" };
    }
    case "measurement": {
      const standardError = secondary / Math.sqrt(Math.max(1, primary));
      return { value: `标准误差示意 ≈ ${formatNumber(standardError, 3)}`, note: "增加重复测量次数可降低随机误差的统计分量。" };
    }
    case "circuit": {
      return { value: `I ≈ ${formatNumber(primary / secondary * 1000, 2)} mA`, note: "按欧姆定律 I = U/R 计算，忽略电源内阻和仪表负载。" };
    }
    default:
      return { value: `${experiment.formula}`, note: "根据当前参数和数据记录验证理论关系。" };
  }
}

function setPreset(name) {
  const config = controlConfig();
  if (name === "typical") {
    state.primary = config.primary.value;
    state.secondary = config.secondary.value;
  } else if (name === "contrast") {
    state.primary = config.primary.min + (config.primary.max - config.primary.min) * 0.42;
    state.secondary = config.secondary.min + (config.secondary.max - config.secondary.min) * 0.25;
  } else {
    state.primary = config.primary.max;
    state.secondary = config.secondary.max;
  }
  primaryControl.value = state.primary;
  secondaryControl.value = state.secondary;
  updateControlReadouts();
  drawLabFrame(performance.now());
  showToast(`已应用${name === "typical" ? "典型" : name === "contrast" ? "高对比度" : "极限"}场景`);
}

function scanLoop(delta) {
  if (!state.autoScan || state.paused) return;
  const config = controlConfig();
  const progress = (Math.sin(state.phase * 0.16) + 1) / 2;
  state.secondary = config.secondary.min + progress * (config.secondary.max - config.secondary.min);
  secondaryControl.value = state.secondary;
  updateControlReadouts();
}

function animationLoop(time) {
  if (!state.lastFrame) state.lastFrame = time;
  const delta = Math.min(50, time - state.lastFrame);
  state.lastFrame = time;
  if (document.hidden || !state.labInView) {
    requestAnimationFrame(animationLoop);
    return;
  }
  if (!state.paused) {
    state.phase += delta * 0.0012 * state.speed;
    scanLoop(delta);
    drawLabFrame(time);
  }
  requestAnimationFrame(animationLoop);
}

function parseDelimitedLine(line, delimiter) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function parseTable(text) {
  const clean = text.replace(/^\uFEFF/, "").trim();
  if (!clean) throw new Error("数据内容为空");
  const lines = clean.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("至少需要一行表头和一行数据");
  const delimiterCounts = [
    [",", lines[0].split(",").length - 1],
    [";", lines[0].split(";").length - 1],
    ["\t", lines[0].split("\t").length - 1]
  ].sort((a, b) => b[1] - a[1]);
  const delimiter = delimiterCounts[0][0];
  const rows = lines.map((line) => parseDelimitedLine(line, delimiter));
  const headers = rows[0];
  const body = rows.slice(1);
  const columnCount = Math.min(...body.map((row) => row.length));
  const numericColumns = [];
  for (let column = 0; column < columnCount; column += 1) {
    const valid = body.filter((row) => row[column] !== "" && Number.isFinite(Number(row[column]))).length;
    if (valid >= Math.max(2, body.length * 0.6)) numericColumns.push(column);
  }
  if (numericColumns.length < 2) throw new Error("没有找到两组有效数值列");
  return { headers, body, numericColumns };
}

function prepareParsedData(text, sourceName) {
  const parsed = parseTable(text);
  state.parsed = { ...parsed, sourceName };
  const xSelect = document.getElementById("x-column-select");
  const ySelect = document.getElementById("y-column-select");
  xSelect.innerHTML = parsed.numericColumns
    .map((column) => `<option value="${column}">${escapeHtml(parsed.headers[column] || `第${column + 1}列`)}</option>`)
    .join("");
  ySelect.innerHTML = xSelect.innerHTML;
  xSelect.value = parsed.numericColumns[0];
  ySelect.value = parsed.numericColumns[1];
  xSelect.disabled = false;
  ySelect.disabled = false;
  mapAndAnalyzeData();
}

function mapAndAnalyzeData() {
  if (!state.parsed) return null;
  const xColumn = Number(document.getElementById("x-column-select").value);
  const yColumn = Number(document.getElementById("y-column-select").value);
  if (xColumn === yColumn) {
    showToast("横轴和纵轴需要选择不同列");
    return null;
  }
  const points = state.parsed.body
    .map((row) => ({ x: Number(row[xColumn]), y: Number(row[yColumn]), rawX: row[xColumn], rawY: row[yColumn] }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    .sort((a, b) => a.x - b.x);
  if (points.length < 2) {
    showToast("有效数据不足两行");
    return null;
  }
  const analysis = analyzePoints(points);
  state.data = {
    points,
    analysis,
    xHeader: state.parsed.headers[xColumn] || "横轴",
    yHeader: state.parsed.headers[yColumn] || "纵轴",
    sourceName: state.parsed.sourceName,
    rawText: null
  };
  updateAnalysisUI();
  drawAdvancedChart();
  return state.data;
}

function analyzePoints(points) {
  const values = points.map((point) => point.y);
  const n = values.length;
  const mean = values.reduce((total, value) => total + value, 0) / n;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const meanX = points.reduce((total, point) => total + point.x, 0) / n;
  const sxx = points.reduce((total, point) => total + (point.x - meanX) ** 2, 0);
  const sxy = points.reduce((total, point) => total + (point.x - meanX) * (point.y - mean), 0);
  const slope = sxx ? sxy / sxx : 0;
  const intercept = mean - slope * meanX;
  const ssTotal = values.reduce((total, value) => total + (value - mean) ** 2, 0);
  const ssResidual = points.reduce((total, point) => total + (point.y - (slope * point.x + intercept)) ** 2, 0);
  const r2 = ssTotal ? 1 - ssResidual / ssTotal : 1;
  const degreesOfFreedom = Math.max(1, n - 2);
  const residualVariance = ssResidual / degreesOfFreedom;
  const residualRmse = Math.sqrt(residualVariance);
  const slopeStandardError = sxx ? Math.sqrt(residualVariance / sxx) : 0;
  const interceptStandardError = sxx
    ? Math.sqrt(residualVariance * (1 / n + (meanX * meanX) / sxx))
    : 0;
  const standardError = std / Math.sqrt(n);
  const confidence95 = 1.96 * standardError;
  const relativeStdPercent = Math.abs(mean) > 1e-12 ? (std / Math.abs(mean)) * 100 : 0;
  const range = max - min;
  const outliers = points.filter((point) => std > 0 && Math.abs(point.y - mean) / std > 2.5);
  const peaks = [];
  for (let index = 1; index < points.length - 1; index += 1) {
    if (points[index].y > points[index - 1].y && points[index].y >= points[index + 1].y && points[index].y > mean) {
      peaks.push(points[index]);
    }
  }
  const peakSpacings = peaks.slice(1).map((peak, index) => Math.abs(peak.x - peaks[index].x));
  const meanPeakSpacing = peakSpacings.length
    ? peakSpacings.reduce((total, value) => total + value, 0) / peakSpacings.length
    : 0;
  const peakSpacingStd = peakSpacings.length > 1
    ? Math.sqrt(peakSpacings.reduce((total, value) => total + (value - meanPeakSpacing) ** 2, 0) / peakSpacings.length)
    : 0;
  const outlierRatio = outliers.length / n;
  let qualityScore = 96;
  if (n < 10) qualityScore -= 22;
  else if (n < 20) qualityScore -= 10;
  qualityScore -= outlierRatio * 160;
  if (peaks.length < 2 && r2 < 0.45) qualityScore -= 18;
  else if (peaks.length < 2 && r2 < 0.7) qualityScore -= 8;
  qualityScore = Math.round(clamp(qualityScore, 25, 98));
  const qualityLabel = qualityScore >= 85 ? "数据质量优秀" : qualityScore >= 70 ? "数据质量良好" : qualityScore >= 55 ? "数据可分析" : "建议复核原始数据";
  return {
    n,
    mean,
    std,
    standardError,
    confidence95,
    relativeStdPercent,
    min,
    max,
    range,
    slope,
    intercept,
    residualRmse,
    slopeStandardError,
    interceptStandardError,
    r2,
    correlation: Math.sign(slope || 1) * Math.sqrt(clamp(r2, 0, 1)),
    outliers,
    peaks,
    peakSpacings,
    meanPeakSpacing,
    peakSpacingStd,
    qualityScore,
    qualityLabel
  };
}

function updateAnalysisUI() {
  if (!state.data) return;
  const { analysis, xHeader, yHeader } = state.data;
  document.getElementById("record-count").textContent = `${analysis.n} 条记录`;
  animateMetric(document.getElementById("metric-mean"), analysis.mean);
  animateMetric(document.getElementById("metric-max"), analysis.max);
  animateMetric(document.getElementById("metric-min"), analysis.min);
  animateMetric(document.getElementById("metric-std"), analysis.std);
  animateMetric(document.getElementById("metric-r2"), analysis.r2, (value) => formatNumber(value, 3));
  animateMetric(document.getElementById("metric-outliers"), analysis.outliers.length, (value) => String(Math.round(value)), 420);
  document.getElementById("quality-ring").style.setProperty("--score", analysis.qualityScore);
  animateMetric(document.getElementById("quality-score"), analysis.qualityScore, (value) => String(Math.round(value)), 720);
  document.getElementById("quality-label").textContent = analysis.qualityLabel;
  document.getElementById("quality-note").textContent =
    `${analysis.n} 个有效点；95% 均值区间 ±${compactNumber(analysis.confidence95)}；${analysis.peaks.length} 个局部峰值。`;
  document.getElementById("chart-x-label").textContent = xHeader;
  document.getElementById("chart-y-label").textContent = yHeader;
  document.getElementById("advanced-chart-empty").classList.add("hidden");
  const chartWrap = document.querySelector(".advanced-chart-wrap");
  pulseMotion(chartWrap, "chart-refresh");
}

function drawAdvancedChart() {
  const { width, height } = setCanvasResolution(chartCanvas);
  chartContext.clearRect(0, 0, width, height);
  if (!state.data) return;
  const points = state.data.points;
  const analysis = state.data.analysis;
  const padding = { left: 50, right: 22, top: 22, bottom: 34 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xMin = Math.min(...points.map((point) => point.x));
  const xMax = Math.max(...points.map((point) => point.x));
  const yMinRaw = Math.min(...points.map((point) => point.y));
  const yMaxRaw = Math.max(...points.map((point) => point.y));
  const spanY = yMaxRaw - yMinRaw || 1;
  const yMin = yMinRaw - spanY * 0.12;
  const yMax = yMaxRaw + spanY * 0.12;
  const spanX = xMax - xMin || 1;
  const mapX = (x) => padding.left + ((x - xMin) / spanX) * plotWidth;
  const mapY = (y) => padding.top + (1 - (y - yMin) / (yMax - yMin)) * plotHeight;

  chartContext.save();
  chartContext.strokeStyle = "rgba(201, 224, 210, 0.11)";
  chartContext.fillStyle = "#929c97";
  chartContext.font = '9.5px "Cascadia Code", Consolas, monospace';
  chartContext.textAlign = "right";
  chartContext.textBaseline = "middle";
  for (let index = 0; index <= 4; index += 1) {
    const value = yMin + ((yMax - yMin) * index) / 4;
    const y = mapY(value);
    chartContext.beginPath();
    chartContext.moveTo(padding.left, y);
    chartContext.lineTo(width - padding.right, y);
    chartContext.stroke();
    chartContext.fillText(compactNumber(value), padding.left - 7, y);
  }
  chartContext.textAlign = "center";
  chartContext.textBaseline = "top";
  for (let index = 0; index <= 4; index += 1) {
    const value = xMin + (spanX * index) / 4;
    chartContext.fillText(compactNumber(value), mapX(value), height - padding.bottom + 10);
  }
  chartContext.restore();

  const area = chartContext.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  area.addColorStop(0, "rgba(198, 157, 94, 0.2)");
  area.addColorStop(1, "rgba(198, 157, 94, 0.008)");
  chartContext.beginPath();
  points.forEach((point, index) => {
    if (index === 0) chartContext.moveTo(mapX(point.x), mapY(point.y));
    else chartContext.lineTo(mapX(point.x), mapY(point.y));
  });
  chartContext.lineTo(mapX(points.at(-1).x), height - padding.bottom);
  chartContext.lineTo(mapX(points[0].x), height - padding.bottom);
  chartContext.closePath();
  chartContext.fillStyle = area;
  chartContext.fill();

  chartContext.beginPath();
  points.forEach((point, index) => {
    if (index === 0) chartContext.moveTo(mapX(point.x), mapY(point.y));
    else chartContext.lineTo(mapX(point.x), mapY(point.y));
  });
  chartContext.strokeStyle = "#d1aa6d";
  chartContext.lineWidth = 2.2;
  chartContext.lineJoin = "round";
  chartContext.stroke();

  points.forEach((point) => {
    const isOutlier = analysis.outliers.includes(point);
    chartContext.beginPath();
    chartContext.fillStyle = isOutlier ? "#d78361" : "#151b1e";
    chartContext.strokeStyle = isOutlier ? "#e09b73" : "#d1aa6d";
    chartContext.lineWidth = 1.3;
    chartContext.arc(mapX(point.x), mapY(point.y), isOutlier ? 3.7 : 2.5, 0, Math.PI * 2);
    chartContext.fill();
    chartContext.stroke();
  });
}

function createSampleCsv(experiment) {
  const info = simInfo(experiment);
  const config = controlConfig(experiment);
  const n = 42;
  const sim = experiment.sim;
  const xHeader = info.xLabel;
  const yHeader = info.yLabel;
  const rows = [["x", "y"]];
  for (let index = 0; index < n; index += 1) {
    const progress = index / (n - 1);
    let x;
    let y;
    if (["measurement", "circuit"].includes(sim)) {
      x = progress * 10;
      y = 2.5 + progress * 7.2 + Math.sin(index * 1.7) * 0.18;
    } else if (sim === "rc") {
      x = progress * 8;
      y = 5 * (1 - Math.exp(-x / 2.2)) + Math.sin(index) * 0.03;
    } else if (sim === "semiconductor") {
      x = progress * 1.2;
      y = Math.max(0, Math.exp((x - 0.62) * 18) - 0.0001);
    } else if (sim === "double-slit" || sim === "michelson" || sim === "newton" || sim === "holography") {
      x = progress * 4;
      y = 0.5 + 0.45 * Math.cos(progress * Math.PI * 7 + 0.3) ** 2 + Math.sin(index * 2.2) * 0.018;
    } else if (sim === "diffraction") {
      x = progress * 12 - 6;
      const value = x === 0 ? 1 : Math.sin(x * 1.4) / (x * 1.4);
      y = value * value * 1.2 + Math.abs(Math.sin(index * 3.1)) * 0.012;
    } else if (sim === "grating") {
      x = progress * 40;
      y = Math.exp(-((progress - 0.5) ** 2) / 0.012) + 0.35 * Math.exp(-((progress - 0.22) ** 2) / 0.002) + 0.3 * Math.exp(-((progress - 0.78) ** 2) / 0.002);
    } else if (sim === "optics") {
      x = 6 + progress * 34;
      y = (x * 10) / Math.max(0.1, x - 10);
    } else if (sim === "polarization") {
      x = progress * 360;
      y = Math.cos((x * Math.PI) / 180) ** 2 + Math.sin(index * 1.9) * 0.01;
    } else if (sim === "amplifier" || sim === "frequency" || sim === "oscillator") {
      x = 10 * Math.pow(1000, progress);
      y = 20 * Math.exp(-(Math.log10(Math.max(1, x / 100)) ** 2)) + Math.sin(index * 2.4) * 0.25;
    } else if (["digital", "fpga", "embedded"].includes(sim)) {
      x = index;
      y = ((Math.floor(index / 4) + Math.floor(index / 9)) % 2) * 3.3;
    } else if (["sampling", "fourier", "dsp"].includes(sim)) {
      x = 20 + index * 12;
      y = Math.abs(Math.sin(index * 0.52)) * 4 + Math.abs(Math.sin(index * 1.7)) * 0.45;
    } else if (sim === "photoelectric") {
      x = 380 + progress * 320;
      y = Math.max(0, (x - 430) * 0.04) * (1 + Math.sin(index) * 0.03);
    } else if (sim === "photodiode") {
      x = progress * 12;
      y = 2 + progress * 16 + Math.sin(index * 0.8) * 0.16;
    } else if (sim === "solar") {
      x = progress * 0.7;
      y = Math.max(0, 85 * (1 - Math.exp(-(0.7 - x) * 10)));
    } else if (sim === "laser") {
      x = progress * 100;
      y = 18 * Math.sqrt(1 + (x / 45) ** 2) + Math.sin(index * 1.6) * 0.16;
    } else if (sim === "imaging") {
      x = index;
      y = 40 + 100 / (1 + Math.exp(-(index - 21) * 0.7)) + Math.sin(index * 1.3) * 2;
    } else if (sim === "fiber") {
      x = progress * 80;
      y = Math.exp(-x / 28) + Math.sin(index * 1.5) * 0.006;
    } else if (sim === "communication") {
      x = progress * 30;
      y = Math.max(0.00001, 0.5 * Math.exp(-x / 4) + Math.abs(Math.sin(index * 2.3)) * 0.001);
    } else if (sim === "integrated") {
      x = progress * 20;
      y = 1.5 + progress * 3 + Math.sin(progress * Math.PI * 4) * 0.4 + Math.sin(index * 2.8) * 0.08;
    } else {
      x = progress * 20;
      y = Math.sin(progress * Math.PI * 5) + Math.sin(index * 1.6) * 0.03;
    }
    rows.push([x.toFixed(4), y.toFixed(4)]);
  }
  rows[0] = [xHeader, yHeader];
  const units = `采样条件：${config.primary.label} = ${formatNumber(state.primary, 2)} ${config.primary.unit}；${config.secondary.label} = ${formatNumber(state.secondary, 2)} ${config.secondary.unit}`;
  return {
    csv: rows.map((row) => row.join(",")).join("\n"),
    xHeader,
    yHeader,
    units
  };
}

function ingestData(text, sourceName) {
  prepareParsedData(text, sourceName);
  if (!state.data) return;
  createReportRecord(true);
}

function loadSmartSample() {
  const sample = createSampleCsv(currentExperiment());
  ingestData(sample.csv, `示例_${currentExperiment().name}.csv`);
  showToast(`已生成 ${currentExperiment().name} 示例数据和新报告`);
}

function createUniqueReportId() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("");
  const random = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `RPT-${stamp}-${random}`;
}

function createReportRecord(auto = false) {
  if (!state.data) {
    showToast("请先导入或生成实验数据");
    return null;
  }
  const experiment = currentExperiment();
  const now = new Date();
  const batchName = document.getElementById("batch-name").value.trim() || `自动批次 ${now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  const record = {
    id: createUniqueReportId(),
    createdAt: now.toISOString(),
    experimentId: experiment.id,
    experimentName: experiment.name,
    year: experiment.year,
    term: experiment.term,
    sourceName: state.data.sourceName,
    batchName,
    xHeader: state.data.xHeader,
    yHeader: state.data.yHeader,
    analysis: state.data.analysis,
    dataPoints: state.data.points.map((point) => ({
      x: point.x,
      y: point.y,
      rawX: point.rawX,
      rawY: point.rawY
    })),
    parameters: {
      primaryLabel: controlConfig(experiment).primary.label,
      primaryValue: state.primary,
      primaryUnit: controlConfig(experiment).primary.unit,
      secondaryLabel: controlConfig(experiment).secondary.label,
      secondaryValue: state.secondary,
      secondaryUnit: controlConfig(experiment).secondary.unit
    },
    physicsSnapshot: window.OptilabPhysics?.snapshot(experiment, state.primary, state.secondary, {
      primaryLabel: controlConfig(experiment).primary.label,
      primaryUnit: controlConfig(experiment).primary.unit,
      secondaryLabel: controlConfig(experiment).secondary.label,
      secondaryUnit: controlConfig(experiment).secondary.unit,
      sourceName: state.data.sourceName
    }),
    photoInfo: state.photoInfo,
    report: ""
  };
  record.report = buildReportText(record);
  state.reports.unshift(record);
  state.reports = state.reports.slice(0, MAX_REPORTS);
  state.activeReportId = record.id;
  persistReports();
  renderReportHistory();
  showReportRecord(record);
  showToast(auto ? "数据已导入，并生成新的报告版本" : "已用当前数据创建新报告版本");
  return record;
}

function buildReportText(record) {
  const experiment = EXPERIMENTS.find((item) => item.id === record.experimentId) || currentExperiment();
  const info = SIM_INFO[experiment.sim] || SIM_INFO.measurement;
  const principle = principleInfo(experiment);
  const analysis = record.analysis;
  const createdAt = new Date(record.createdAt);
  const dateText = createdAt.toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  let modelType;
  let trendText;
  if (analysis.peaks.length >= 2) {
    modelType = "周期性/多峰响应";
    const spacingVariation = analysis.meanPeakSpacing
      ? (analysis.peakSpacingStd / Math.abs(analysis.meanPeakSpacing)) * 100
      : 0;
    trendText = `数据中出现 ${analysis.peaks.length} 个高于均值的局部峰值，峰间距均值为 ${compactNumber(analysis.meanPeakSpacing)}，相对离散度为 ${formatNumber(spacingVariation, 2)}%。响应具有明显的周期性或多峰结构，应与 ${experiment.formula} 给出的理论周期或条纹间距对照。`;
  } else if (analysis.r2 >= 0.8) {
    modelType = "近似线性响应";
    trendText = `线性拟合决定系数 R² = ${formatNumber(analysis.r2, 4)}，响应与横轴之间呈较强线性关系。拟合斜率为 ${compactNumber(analysis.slope)} ± ${compactNumber(analysis.slopeStandardError)}，可进一步与理论系数和仪器标定值对照。`;
  } else if (analysis.r2 >= 0.45) {
    modelType = "弱线性/混合响应";
    trendText = `线性拟合决定系数 R² = ${formatNumber(analysis.r2, 4)}，数据具有一定趋势但线性解释不足。应结合实验模型、测量区间和非线性区段判断，不能仅凭单一直线拟合得出确定结论。`;
  } else {
    modelType = "非线性或显著波动";
    trendText = `线性拟合决定系数 R² = ${formatNumber(analysis.r2, 4)}，数据存在明显非线性、周期波动或噪声。应优先结合实验机理判断趋势，并检查坐标映射、量程、单位与采集稳定性。`;
  }
  const outlierText = analysis.outliers.length
    ? `检测到 ${analysis.outliers.length} 个偏离均值超过 2.5 倍标准差的点，建议回查对应原始读数、接线状态、量程切换或环境扰动。`
    : "未检测到超过 2.5 倍标准差的显著离群点。";
  const photoText = record.photoInfo
    ? `${record.photoInfo.fileName}；尺寸 ${record.photoInfo.width} × ${record.photoInfo.height} px；亮度${record.photoInfo.brightness}；清晰度${record.photoInfo.sharpness}。`
    : "本次报告未附加实验照片。";
  const points = Array.isArray(record.dataPoints) && record.dataPoints.length
    ? record.dataPoints
    : state.data && state.data.sourceName === record.sourceName
      ? state.data.points
      : [];
  const sampleRows = points.length
    ? [...points.slice(0, 5), ...points.slice(-5)]
      .map((point, index) => `| ${index + 1} | ${point.rawX ?? point.x} | ${point.rawY ?? point.y} |`)
      .join("\n")
    : "| — | 原始数据未随历史报告保存 | — |";
  const outlierRows = analysis.outliers.length
    ? analysis.outliers.slice(0, 8).map((point, index) =>
      `| ${index + 1} | ${point.rawX ?? point.x} | ${point.rawY ?? point.y} | ${compactNumber((point.y - analysis.mean) / Math.max(1e-12, analysis.std))}σ |`
    ).join("\n")
    : "| — | 未检测到 | — | — |";
  const previousSameExperiment = state.reports.find((item) =>
    item.experimentId === record.experimentId && item.id !== record.id
  );
  let comparisonText;
  if (previousSameExperiment) {
    const previousMean = previousSameExperiment.analysis.mean;
    const meanDelta = previousMean !== 0 ? ((analysis.mean - previousMean) / Math.abs(previousMean)) * 100 : 0;
    const qualityDelta = analysis.qualityScore - previousSameExperiment.analysis.qualityScore;
    comparisonText = `上一版本：${previousSameExperiment.id}（${previousSameExperiment.batchName}）
上一版本均值：${compactNumber(previousMean)}
本版本均值：${compactNumber(analysis.mean)}
均值相对变化：${formatNumber(meanDelta, 3)}%
质量分变化：${qualityDelta >= 0 ? "+" : ""}${qualityDelta} 分

如果两个批次的测量条件一致，较小的均值差异说明重复测量比较稳定；如果差异明显，先比较仪器参数、环境条件和横纵轴定义，再判断实验现象是否真的发生了变化。`;
  } else {
    comparisonText = "这是当前浏览器中保存的第一份同实验报告，暂时没有其他批次可以比较。完成重复测量后，这里会并列显示不同批次。";
  }
  const procedureText = principle.steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");
  const parameterText = record.parameters
    ? `${record.parameters.primaryLabel}：${formatNumber(record.parameters.primaryValue, 3)} ${record.parameters.primaryUnit}
${record.parameters.secondaryLabel}：${formatNumber(record.parameters.secondaryValue, 3)} ${record.parameters.secondaryUnit}`
    : "未保存模型参数，数据解释以导入文件为准。";
  const physicsBlock = record.physicsSnapshot
    ? `计算引擎：${record.physicsSnapshot.engineVersion}
模型：${record.physicsSnapshot.sim}
基础关系：${record.physicsSnapshot.formula}
当前推演：${record.physicsSnapshot.derived?.value || "不适用"}
模型假设：${(record.physicsSnapshot.derived?.assumptions || []).join("；") || "以课程指导书为准"}
输入哈希：${record.physicsSnapshot.inputHash}`
    : "该历史报告未保存统一计算链快照，请重新生成报告以补齐来源记录。";
  let citationItems = [];
  try {
    const storedCitations = JSON.parse(localStorage.getItem("optilab_citation_library_v1") || "[]");
    citationItems = Array.isArray(storedCitations) ? storedCitations.filter((item) => item && item.title).slice(0, 20) : [];
  } catch {
    citationItems = [];
  }
  const literatureBlock = citationItems.length
    ? citationItems.map((item, index) => {
      const authors = Array.isArray(item.authors) && item.authors.length ? item.authors.join(", ") : "作者信息未提供";
      const doiText = item.doi ? ` https://doi.org/${item.doi}` : item.url || "";
      return `[${index + 1}] ${authors}. ${item.title}. ${item.journal || "未标注期刊"}, ${item.year || "n.d."}.${doiText}`;
    }).join("\n\n")
    : "整理这份报告时还没有保存文献。可以到“文献引用”中检索并保存，后面生成的报告会带上引用信息。";
  const reportCourseLevel = experiment.scope === "graduate"
    ? `研${experiment.degreeYear === 2 ? "二" : "一"}`
    : `大${["一", "二", "三", "四"][experiment.year - 1]}`;
  const reportCoursePosition = (experiment.scope === "hust" || experiment.scope === "hust-exact") && experiment.semesterTermLabel
    ? `${experiment.semesterTermLabel} · ${experiment.semesterTitle}`
    : `${reportCourseLevel} ${experiment.term === 1 ? "上学期" : "下学期"} · ${experiment.semesterTitle}`;

  return `# ${experiment.name}实验报告

报告编号：${record.id}
整理时间：${dateText}
实验批次：${record.batchName}
数据文件：${record.sourceName}
课程位置：${reportCoursePosition}
报告类型：数据处理、误差分析与结果讨论

## 摘要
本次共整理 ${analysis.n} 个有效数据点，横轴为“${record.xHeader}”，纵轴为“${record.yHeader}”。从数据形态看，结果主要表现为${modelType}。数据完整度和趋势可解释性的提示分为 ${analysis.qualityScore}/100。${trendText} ${outlierText} 这些判断还需要和原始记录、仪器参数及课程指导书一起核对。

## 一、报告信息
| 项目 | 内容 |
| --- | --- |
| 报告编号 | ${record.id} |
| 实验名称 | ${experiment.name} |
| 实验批次 | ${record.batchName} |
| 数据来源 | ${record.sourceName} |
| 有效数据点 | ${analysis.n} |
| 当前参数 | ${parameterText.replace(/\n/g, "；")} |

## 二、实验目的
${principle.intro}

除了得到结果，还要说明仪器条件、使用的公式、原始数据和结论之间是怎样对应起来的。

## 三、实验原理
### 3.1 物理或系统机理
${principle.theory}

### 3.2 核心理论关系
${experiment.formula}

### 3.3 公式变量说明
${principle.variables}

### 3.4 图样、波形或曲线的判读原则
${principle.observations}

## 四、器材与实验条件
${principle.apparatus}

本次记录对应的参数如下：
- ${parameterText.replace(/\n/g, "\n- ")}

### 4.1 统一计算链记录
${physicsBlock}

做真实实验时，还应补上仪器编号、量程、环境温度、湿度、光源功率、采集软件版本和校准日期。

## 五、实验步骤
${procedureText}

每一步做完后，先确认仪器状态和数据是否合理，再继续往下做。出现异常读数时，先停止采集并记录现场条件。

## 六、数据来源与质量
- 横轴：${record.xHeader}
- 纵轴：${record.yHeader}
- 有效数据点：${analysis.n}
- 数值范围：${compactNumber(analysis.min)} 至 ${compactNumber(analysis.max)}
- 数据来源：${record.sourceName}
- 实验照片检查：${photoText}

这里的提示分只反映数据完整度、异常点比例和趋势是否容易解释，不等同于测量不确定度，也不能代替教师审核。

## 七、数据处理
| 指标 | 计算结果 |
| --- | --- |
| 平均值 | ${compactNumber(analysis.mean)} |
| 标准差 | ${compactNumber(analysis.std)} |
| 相对标准差 | ${formatNumber(analysis.relativeStdPercent, 3)}% |
| 最大值 | ${compactNumber(analysis.max)} |
| 最小值 | ${compactNumber(analysis.min)} |
| 极差 | ${compactNumber(analysis.range)} |
| 标准误差 | ${compactNumber(analysis.standardError)} |
| 95% 均值置信区间半宽 | ${compactNumber(analysis.confidence95)} |
| 线性斜率 | ${compactNumber(analysis.slope)} ± ${compactNumber(analysis.slopeStandardError)} |
| 线性截距 | ${compactNumber(analysis.intercept)} ± ${compactNumber(analysis.interceptStandardError)} |
| 决定系数 R² | ${formatNumber(analysis.r2, 5)} |
| 相关系数 r | ${formatNumber(analysis.correlation, 5)} |
| 拟合残差 RMSE | ${compactNumber(analysis.residualRmse)} |
| 局部峰值数 | ${analysis.peaks.length} |
| 平均峰间距 | ${analysis.meanPeakSpacing ? compactNumber(analysis.meanPeakSpacing) : "不适用"} |

线性回归方程：

\`y = ${compactNumber(analysis.slope)} x + ${compactNumber(analysis.intercept)}\`

这条方程只对当前测量范围作统计描述。周期、指数、饱和或阈值型现象，不能只凭 R² 判断数据对错，也不能仅凭高 R² 就说理论已经得到证明。

## 八、结果分析
${trendText}

${outlierText}

可能影响结果的误差来源包括：${info.errors}

遇到偏离趋势的点，先检查测量条件是否一致，再回到原始记录判断是不是非线性工作区、接触问题、背景光、温漂或量程切换造成的。

## 九、不确定度与误差讨论
基于当前样本，均值的 A 类标准误差估计为 ${compactNumber(analysis.standardError)}，近似 95% 置信区间为 ${compactNumber(analysis.mean)} ± ${compactNumber(analysis.confidence95)}。该估计假设样本相对独立且主要误差为随机误差。

如果仪器说明书给出了 B 类不确定度、分辨率或校准证书，还要把它与 A 类不确定度合成。这里没有读取真实仪器证书，因此标准误差不能代替完整的测量不确定度评定。

${principle.caution}

## 十、改进建议
${info.improvements}

建议在相同条件下至少重复 3 个批次，并保持坐标轴、单位和数据处理方法一致。比较批次均值、标准差、异常点、峰值间距和拟合参数，以判断结果变化来自真实实验条件还是随机波动。

## 十一、同实验批次比较
${comparisonText}

## 十二、结论
本次实验共整理 ${analysis.n} 个有效数据点，从数据形态看，主要表现为${modelType}。${trendText} 数据完整度提示分为 ${analysis.qualityScore}/100，${analysis.outliers.length ? `并发现 ${analysis.outliers.length} 个需要复核的高偏差点。` : "未发现超过当前统计阈值的显著高偏差点。"}

可以这样写结论：在本次参数、仪器条件和数据范围内，观测结果与上述趋势一致。若要进一步给出物理常数、器件性能或系统指标，还需补充重复测量、仪器校准信息和完整不确定度评定。

## 十三、提交前审核清单
- [ ] 已核对实验名称、报告编号和批次名称。
- [ ] 已核对横纵轴含义、单位与原始数据顺序。
- [ ] 已检查异常点对应的原始读数或图像。
- [ ] 已将软件参数替换为真实仪器设置。
- [ ] 已补充实验日期、合作者、仪器编号和环境条件。
- [ ] 已按课程要求补充理论推导、图表标题和参考文献。
- [ ] 已确认结论没有超出当前数据能够支持的范围。

## 附录 A：高偏差点
| 序号 | 横轴值 | 纵轴值 | 偏离程度 |
| --- | --- | --- | --- |
${outlierRows}

## 附录 B：数据摘要
以下列出首端和末端各最多 5 个点，便于快速核对。完整数据以原文件为准。

| 摘要序号 | ${record.xHeader} | ${record.yHeader} |
| --- | --- | --- |
${sampleRows}

## 附录 C：实验规范与安全
${principle.caution}

## 附录 D：引用文献
${literatureBlock}

> 本报告根据本次导入的数据和当前实验模板整理，包含统计结果、趋势判断、误差提示和批次比较。提交前请按课程要求核对数据、补写讨论，并完成教师要求的签名和审核。`;
}

function persistReports() {
  try {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(state.reports));
  } catch {
    showToast("浏览器无法保存历史报告，但当前报告仍可使用");
  }
}

function loadPersistedReports() {
  try {
    const stored = JSON.parse(localStorage.getItem(REPORT_STORAGE_KEY) || "[]");
    state.reports = Array.isArray(stored) ? stored.filter((record) => record && record.report).slice(0, MAX_REPORTS) : [];
  } catch {
    state.reports = [];
  }
}

function formatStorageSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, 1)} KB`;
  return `${formatNumber(bytes / (1024 * 1024), 2)} MB`;
}

function reportCleanupBackup() {
  try {
    const backup = JSON.parse(sessionStorage.getItem(REPORT_CLEANUP_BACKUP_KEY) || "null");
    return backup && Array.isArray(backup.reports) ? backup : null;
  } catch {
    return null;
  }
}

function saveReportCleanupBackup() {
  const backup = {
    reports: state.reports.map((record) => record),
    activeReportId: state.activeReportId,
    createdAt: new Date().toISOString()
  };
  try {
    sessionStorage.setItem(REPORT_CLEANUP_BACKUP_KEY, JSON.stringify(backup));
  } catch {
    showToast("报告备份空间不足；本次清理仍可执行，但无法使用撤销");
  }
  return backup;
}

function updateReportCleanupUI() {
  const bytes = new Blob([JSON.stringify(state.reports)]).size;
  const count = document.getElementById("report-cleanup-count");
  const size = document.getElementById("report-cleanup-size");
  const undo = document.getElementById("report-cleanup-undo");
  if (count) count.textContent = `${state.reports.length} 份`;
  if (size) size.textContent = formatStorageSize(bytes);
  if (undo) undo.disabled = !reportCleanupBackup();
}

function resetReportPreview() {
  state.activeReportId = null;
  reportPreview.textContent = `# 实验报告

当前还没有保存的数据报告。

导入 CSV 或 Excel 数据后，系统会自动生成报告；也可以返回实验演示区继续调整参数。`;
  document.getElementById("active-report-id").textContent = "等待生成报告";
  document.getElementById("active-report-time").textContent = "—";
}

function finalizeReportCleanup(message) {
  state.reports = state.reports.slice(0, MAX_REPORTS);
  if (!state.reports.some((record) => record.id === state.activeReportId)) {
    state.activeReportId = state.reports[0]?.id || null;
  }
  persistReports();
  renderReportHistory();
  if (state.activeReportId) {
    const record = state.reports.find((item) => item.id === state.activeReportId);
    if (record) showReportRecord(record);
    else resetReportPreview();
  } else {
    resetReportPreview();
  }
  updateReportCleanupUI();
  const status = document.getElementById("report-cleanup-status");
  if (status) status.textContent = message;
  showToast(message);
}

function cleanReports(mode, targetId = "") {
  if (!state.reports.length) {
    showToast("当前没有可清理的报告");
    return;
  }
  let remaining = state.reports;
  const before = state.reports.length;
  if (mode === "active") {
    const id = targetId || state.activeReportId;
    if (!id) {
      showToast("请先选择一份报告");
      return;
    }
    remaining = state.reports.filter((record) => record.id !== id);
  } else if (mode === "keep10") {
    remaining = state.reports.slice(0, 10);
  } else if (mode === "old30") {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    remaining = state.reports.filter((record) => new Date(record.createdAt).getTime() >= cutoff);
  } else if (mode === "all") {
    if (!window.confirm(`确定清空全部 ${state.reports.length} 份实验报告吗？`)) return;
    remaining = [];
  }
  if (remaining.length === before) {
    const status = document.getElementById("report-cleanup-status");
    if (status) status.textContent = "没有符合当前条件的报告。";
    showToast("没有符合清理条件的报告");
    return;
  }
  saveReportCleanupBackup();
  state.reports = remaining;
  finalizeReportCleanup(`已清理 ${before - remaining.length} 份报告；可撤销一次。`);
}

function undoReportCleanup() {
  const backup = reportCleanupBackup();
  if (!backup) {
    showToast("没有可恢复的清理记录");
    return;
  }
  state.reports = backup.reports.filter((record) => record && record.report).slice(0, MAX_REPORTS);
  state.activeReportId = backup.activeReportId;
  try {
    sessionStorage.removeItem(REPORT_CLEANUP_BACKUP_KEY);
  } catch {
    // Ignore storage restrictions.
  }
  finalizeReportCleanup(`已恢复清理前的 ${state.reports.length} 份报告。`);
}

function renderReportHistory() {
  const list = document.getElementById("report-history-list");
  document.getElementById("history-count").textContent = String(state.reports.length);
  document.getElementById("hero-report-count").textContent = String(state.reports.length);
  updateReportCleanupUI();
  window.dispatchEvent(new CustomEvent("optilab:reports-changed", {
    detail: { reports: state.reports.map((record) => ({
      id: record.id,
      experimentName: record.experimentName,
      batchName: record.batchName
    })) }
  }));
  if (!state.reports.length) {
    list.innerHTML = `<div class="history-empty"><strong>还没有保存过报告</strong><span>导入数据后，新的报告会出现在这里</span></div>`;
    return;
  }
  list.innerHTML = state.reports.map((record) => {
    const time = new Date(record.createdAt).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    return `<div class="history-row">
      <button class="history-item ${record.id === state.activeReportId ? "active" : ""}" data-report-id="${record.id}">
        <div class="history-item-top">
          <strong>${escapeHtml(record.experimentName)}</strong>
          <span>${time}</span>
        </div>
        <p>${escapeHtml(record.id)}</p>
        <div class="history-item-meta">
          <span>${record.analysis.n} 点</span>
          <span>质量 ${record.analysis.qualityScore}</span>
          <span>${escapeHtml(record.batchName)}</span>
        </div>
      </button>
      <button class="history-delete" data-delete-report="${record.id}" aria-label="删除报告 ${escapeHtml(record.id)}" title="删除这份报告">×</button>
    </div>`;
  }).join("");
  list.querySelectorAll("[data-report-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = state.reports.find((item) => item.id === button.dataset.reportId);
      if (record) {
        state.activeReportId = record.id;
        renderReportHistory();
        showReportRecord(record);
      }
    });
  });
  list.querySelectorAll("[data-delete-report]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!window.confirm("确定删除这份实验报告吗？")) return;
      cleanReports("active", button.dataset.deleteReport);
    });
  });
  refreshMotionTargets();
}

function showReportRecord(record) {
  state.activeReportId = record.id;
  reportPreview.textContent = record.report;
  document.getElementById("active-report-id").textContent = record.id;
  document.getElementById("active-report-time").textContent =
    new Date(record.createdAt).toLocaleString("zh-CN", { hour12: false });
  pulseMotion(reportPreview, "paper-refresh");
}

function activeReport() {
  return state.reports.find((record) => record.id === state.activeReportId) || null;
}

async function copyActiveReport() {
  const record = activeReport();
  const text = record ? record.report : reportPreview.textContent;
  if (!text.trim() || document.getElementById("active-report-id").textContent === "等待生成报告") {
    showToast("还没有可复制的报告");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(reportPreview);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("copy");
    selection.removeAllRanges();
  }
  showToast("报告已复制");
}

function downloadActiveReport() {
  const record = activeReport();
  if (!record) {
    showToast("还没有可下载的报告");
    return;
  }
  const blob = new Blob([record.report], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = record.experimentName.replace(/[\\/:*?"<>|]/g, "_");
  anchor.href = url;
  anchor.download = `${safeName}_${record.id}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast("报告已下载");
}

function analyzePhoto(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("请选择有效图片");
    return;
  }
  const image = new Image();
  const url = URL.createObjectURL(file);
  image.onload = () => {
    const sampleCanvas = document.createElement("canvas");
    const maxSize = 110;
    const ratio = image.width / image.height;
    sampleCanvas.width = ratio >= 1 ? maxSize : Math.max(2, Math.round(maxSize * ratio));
    sampleCanvas.height = ratio >= 1 ? Math.max(2, Math.round(maxSize / ratio)) : maxSize;
    const context = sampleCanvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, sampleCanvas.width, sampleCanvas.height);
    const pixels = context.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
    const gray = new Float32Array(sampleCanvas.width * sampleCanvas.height);
    let sum = 0;
    for (let index = 0; index < gray.length; index += 1) {
      const offset = index * 4;
      const value = pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722;
      gray[index] = value;
      sum += value;
    }
    const mean = sum / gray.length;
    let edge = 0;
    let count = 0;
    for (let y = 1; y < sampleCanvas.height - 1; y += 1) {
      for (let x = 1; x < sampleCanvas.width - 1; x += 1) {
        const index = y * sampleCanvas.width + x;
        const gx = gray[index + 1] - gray[index - 1];
        const gy = gray[index + sampleCanvas.width] - gray[index - sampleCanvas.width];
        edge += Math.sqrt(gx * gx + gy * gy);
        count += 1;
      }
    }
    const sharpnessValue = edge / Math.max(1, count);
    state.photoInfo = {
      fileName: file.name,
      width: image.width,
      height: image.height,
      brightness: mean < 55 ? "偏暗" : mean > 205 ? "偏亮" : "适中",
      sharpness: sharpnessValue < 8 ? "可能模糊" : sharpnessValue < 18 ? "一般" : "清晰"
    };
    document.getElementById("photo-result").textContent =
      `${image.width}×${image.height} · 亮度${state.photoInfo.brightness} · ${state.photoInfo.sharpness}`;
    showToast("照片质量检查完成，将在下一份报告中引用");
    URL.revokeObjectURL(url);
  };
  image.onerror = () => {
    showToast("无法读取这张图片");
    URL.revokeObjectURL(url);
  };
  image.src = url;
}

function setupNavigation() {
  document.querySelectorAll(".nav-item[data-target]").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.target).scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item === button));
    });
  });
  document.getElementById("browse-catalog").addEventListener("click", () => {
    document.getElementById("catalog-section").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("launch-current").addEventListener("click", () => {
    document.getElementById("lab-section").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`当前模型：${currentExperiment().name}`);
  });
}

function setupControls() {
  window.OptilabPanorama?.init(labCanvas);
  window.OptilabPanorama3D?.init(lab3dCanvas);
  if ("IntersectionObserver" in window) {
    const labObserver = new IntersectionObserver((entries) => {
      state.labInView = Boolean(entries[0]?.isIntersecting);
      if (state.labInView) {
        state.lastFrame = performance.now();
        drawLabFrame(performance.now());
      }
    }, { rootMargin: "320px 0px", threshold: 0.01 });
    labObserver.observe(document.getElementById("lab-section"));
  }
  const guideToggle = document.getElementById("guide-panel-toggle");
  const guidePanel = document.getElementById("lab-guide-panel");
  const labGrid = document.getElementById("lab-stage-card");
  let guideCollapsed = false;
  try {
    guideCollapsed = localStorage.getItem("optilab-guide-collapsed") === "1";
  } catch {
    guideCollapsed = false;
  }
  const syncGuidePanel = (threeD) => {
    if (guideToggle) {
      guideToggle.hidden = !threeD;
      guideToggle.textContent = guideCollapsed ? "显示指导" : "隐藏指导";
      guideToggle.setAttribute("aria-expanded", String(!guideCollapsed));
      guideToggle.title = guideCollapsed ? "展开右侧实验指导面板" : "折叠右侧实验指导面板";
    }
    if (labGrid) labGrid.classList.toggle("guide-collapsed", Boolean(threeD && guideCollapsed));
    if (guidePanel) guidePanel.setAttribute("aria-hidden", String(Boolean(threeD && guideCollapsed)));
  };
  const syncOverallMode = (mode) => {
    const overall = mode === "overall";
    const spatial = overall || mode === "3d";
    const threeD = mode === "3d";
    labCanvas.hidden = threeD;
    lab3dCanvas.hidden = !threeD;
    labCanvas.classList.toggle("overall-canvas", !threeD);
    document.querySelector(".advanced-canvas-wrap")?.classList.toggle("overall-mode", spatial);
    const toolbar = document.getElementById("panorama-toolbar");
    if (toolbar) toolbar.hidden = !spatial;
    window.OptilabPanorama?.setActive(overall);
    window.OptilabPanorama3D?.setActive(threeD);
    const loading = document.getElementById("lab-3d-loading");
    if (loading && !threeD) loading.hidden = true;
    const overlay = document.getElementById("lab-3d-overlay");
    if (overlay) overlay.hidden = !threeD;
    syncGuidePanel(threeD);
  };
  syncOverallMode(state.labMode);
  guideToggle?.addEventListener("click", () => {
    guideCollapsed = !guideCollapsed;
    try {
      localStorage.setItem("optilab-guide-collapsed", guideCollapsed ? "1" : "0");
    } catch {
      // Browsers can disable local storage in private or restricted contexts.
    }
    syncOverallMode(state.labMode);
    window.dispatchEvent(new Event("resize"));
    drawLabFrame(performance.now());
  });
  primaryControl.addEventListener("input", (event) => {
    state.primary = Number(event.target.value);
    updateControlReadouts();
    drawLabFrame(performance.now());
  });
  secondaryControl.addEventListener("input", (event) => {
    state.secondary = Number(event.target.value);
    updateControlReadouts();
    drawLabFrame(performance.now());
  });
  document.getElementById("lab-pause").addEventListener("click", (event) => {
    state.paused = !state.paused;
    event.currentTarget.textContent = state.paused ? "继续" : "暂停";
  });
  document.getElementById("sim-speed").addEventListener("click", (event) => {
    const speeds = [1, 0.5, 1.5];
    const currentIndex = speeds.indexOf(state.speed);
    state.speed = speeds[(currentIndex + 1) % speeds.length];
    event.currentTarget.textContent = `${state.speed.toFixed(1)}×`;
    showToast(`演示速度：${state.speed.toFixed(1)}×`);
  });
  document.getElementById("annotation-toggle").addEventListener("click", (event) => {
    state.annotations = !state.annotations;
    event.currentTarget.classList.toggle("active", state.annotations);
    event.currentTarget.textContent = state.annotations ? "标注" : "标注关";
    drawLabFrame(performance.now());
  });
  document.getElementById("auto-scan").addEventListener("click", (event) => {
    state.autoScan = !state.autoScan;
    event.currentTarget.setAttribute("aria-pressed", String(state.autoScan));
    showToast(state.autoScan ? "自动扫描已开启" : "自动扫描已暂停");
  });
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => setPreset(button.dataset.preset));
  });
  document.getElementById("reset-lab").addEventListener("click", () => {
    setPreset("typical");
    window.OptilabPanorama?.resetLayout();
    window.OptilabPanorama3D?.resetLayout();
  });
  window.addEventListener("optilab:auto-tune-request", () => {
    const config = controlConfig();
    state.primary = config.primary.value;
    state.secondary = config.secondary.value;
    primaryControl.value = state.primary;
    secondaryControl.value = state.secondary;
    state.paused = false;
    state.autoScan = false;
    document.getElementById("lab-pause").textContent = "暂停";
    document.getElementById("auto-scan").setAttribute("aria-pressed", "false");
    updateControlReadouts();
  });
  document.querySelectorAll("[data-lab-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.labMode = button.dataset.labMode;
      document.querySelectorAll("[data-lab-mode]").forEach((item) => item.classList.toggle("active", item === button));
      syncOverallMode(state.labMode);
      drawLabFrame(performance.now());
    });
  });
  document.getElementById("fullscreen-lab").addEventListener("click", async () => {
    const target = document.getElementById("lab-stage-card");
    try {
      if (!document.fullscreenElement) await target.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      showToast("当前浏览器不支持全屏演示");
    }
  });
  document.getElementById("jump-to-data").addEventListener("click", () => {
    document.getElementById("data-section").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function readExperimentDataFile(file) {
  if (/\.(xlsx|xls)$/i.test(file.name)) {
    if (!window.XLSX) {
      throw new Error("Excel 解析组件未加载，请刷新页面或改用 CSV 文件");
    }
    const workbook = window.XLSX.read(await file.arrayBuffer(), {
      type: "array",
      cellDates: true
    });
    const sheetName = workbook.SheetNames.includes("Data")
      ? "Data"
      : workbook.SheetNames[0];
    if (!sheetName) throw new Error("Excel 文件中没有工作表");
    const worksheet = workbook.Sheets[sheetName];
    const matrix = window.XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: true,
      defval: ""
    });
    const headers = matrix[0] || [];
    const meanIndex = headers.findIndex((header) => /Y.*均值|均值|Y值|纵轴/i.test(String(header)));
    const stdIndex = headers.findIndex((header) => /标准差|STD(?:EV)?/i.test(String(header)));
    const repeatIndices = headers
      .map((header, index) => /重复\s*\d+|Repeat\s*\d+/i.test(String(header)) ? index : -1)
      .filter((index) => index >= 0);
    if (meanIndex >= 0 && repeatIndices.length) {
      matrix.slice(1).forEach((row) => {
        const values = repeatIndices
          .map((index) => Number(row[index]))
          .filter(Number.isFinite);
        if (!Number.isFinite(Number(row[meanIndex])) || row[meanIndex] === "") {
          row[meanIndex] = values.length
            ? values.reduce((total, value) => total + value, 0) / values.length
            : "";
        }
        if (stdIndex >= 0 && values.length > 1 && (row[stdIndex] === "" || !Number.isFinite(Number(row[stdIndex])))) {
          const mean = Number(row[meanIndex]);
          row[stdIndex] = Math.sqrt(
            values.reduce((total, value) => total + (value - mean) ** 2, 0) / (values.length - 1)
          );
        }
      });
    }
    const normalized = window.XLSX.utils.aoa_to_sheet(matrix);
    return {
      text: window.XLSX.utils.sheet_to_csv(normalized, { blankrows: false }),
      sourceName: `${file.name} · ${sheetName}`
    };
  }
  return { text: await file.text(), sourceName: file.name };
}

function setupDataControls() {
  document.getElementById("catalog-search").addEventListener("input", (event) => {
    state.search = event.target.value;
    window.clearTimeout(catalogSearchTimer);
    catalogSearchTimer = window.setTimeout(renderCatalog, 90);
  });
  document.querySelectorAll(".year-filter button").forEach((button) => {
    button.addEventListener("click", () => {
      state.filterYear = button.dataset.year;
      document.querySelectorAll(".year-filter button").forEach((item) => item.classList.toggle("active", item === button));
      renderCatalog();
    });
  });
  document.getElementById("catalog-expand").addEventListener("click", (event) => {
    const grids = [...document.querySelectorAll(".experiment-card-grid")];
    const shouldExpand = grids.some((grid) => grid.classList.contains("collapsed"));
    grids.forEach((grid) => grid.classList.toggle("collapsed", !shouldExpand));
    document.querySelectorAll("[data-group-toggle]").forEach((button) => {
      button.setAttribute("aria-expanded", String(shouldExpand));
      button.textContent = shouldExpand ? "收起" : "展开";
    });
    event.currentTarget.textContent = shouldExpand ? "收起全部" : "展开全部";
  });
  document.getElementById("load-smart-sample").addEventListener("click", loadSmartSample);
  document.getElementById("parse-data").addEventListener("click", () => {
    const text = document.getElementById("data-text").value.trim();
    if (!text) {
      showToast("请先粘贴实验数据");
      return;
    }
    try {
      ingestData(text, "粘贴数据");
    } catch (error) {
      showToast(error.message);
    }
  });
  document.getElementById("data-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = await readExperimentDataFile(file);
      ingestData(imported.text, imported.sourceName);
    } catch (error) {
      showToast(error.message);
    }
  });
  const dataDrop = document.getElementById("data-drop");
  ["dragenter", "dragover"].forEach((type) => {
    dataDrop.addEventListener(type, (event) => {
      event.preventDefault();
      dataDrop.classList.add("drag-over");
    });
  });
  ["dragleave", "drop"].forEach((type) => {
    dataDrop.addEventListener(type, (event) => {
      event.preventDefault();
      dataDrop.classList.remove("drag-over");
    });
  });
  dataDrop.addEventListener("drop", async (event) => {
    const file = event.dataTransfer.files[0];
    if (!file) return;
    try {
      const imported = await readExperimentDataFile(file);
      ingestData(imported.text, imported.sourceName);
    } catch (error) {
      showToast(error.message);
    }
  });
  document.getElementById("x-column-select").addEventListener("change", mapAndAnalyzeData);
  document.getElementById("y-column-select").addEventListener("change", mapAndAnalyzeData);
  document.getElementById("new-report").addEventListener("click", () => createReportRecord(false));
  document.getElementById("photo-input").addEventListener("change", (event) => analyzePhoto(event.target.files[0]));
}

function setupReportControls() {
  document.getElementById("copy-advanced-report").addEventListener("click", copyActiveReport);
  document.getElementById("download-advanced-report").addEventListener("click", downloadActiveReport);
  const cleanupModal = document.getElementById("report-cleanup-modal");
  document.querySelectorAll("[data-report-cleanup-open]").forEach((button) => {
    button.addEventListener("click", () => {
      updateReportCleanupUI();
      cleanupModal.hidden = false;
      document.body.classList.add("report-cleanup-open");
    });
  });
  document.querySelectorAll("[data-report-cleanup-close]").forEach((button) => {
    button.addEventListener("click", () => {
      cleanupModal.hidden = true;
      document.body.classList.remove("report-cleanup-open");
    });
  });
  document.querySelectorAll("[data-report-cleanup-mode]").forEach((button) => {
    button.addEventListener("click", () => cleanReports(button.dataset.reportCleanupMode));
  });
  document.getElementById("report-cleanup-undo").addEventListener("click", undoReportCleanup);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !cleanupModal.hidden) {
      cleanupModal.hidden = true;
      document.body.classList.remove("report-cleanup-open");
    }
  });
  window.addEventListener("resize", () => {
    drawLabFrame(performance.now());
    drawAdvancedChart();
  });
}

function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

window.OptilabBridge = {
  currentExperiment,
  simInfo,
  principleInfo,
  getCurrentData: () => state.data,
  getPhysicsSnapshot: () => {
    const experiment = currentExperiment();
    const config = controlConfig(experiment);
    return window.OptilabPhysics?.snapshot(experiment, state.primary, state.secondary, {
      primaryLabel: config.primary.label,
      primaryUnit: config.primary.unit,
      secondaryLabel: config.secondary.label,
      secondaryUnit: config.secondary.unit,
      sourceName: state.data?.sourceName || "interactive-model"
    }) || null;
  },
  loadExternalData: (text, sourceName = "仪器直采数据") => prepareParsedData(text, sourceName),
  getReports: () => state.reports,
  getActiveReport: () => activeReport(),
  showToast,
  escapeHtml,
  formatNumber,
  compactNumber,
  renderReportHistory,
  refreshEquipment: () => renderEquipmentProfile(currentExperiment())
};

function initialize() {
  const total = EXPERIMENTS.length;
  console.info(`OptiLab 当前载入 ${total} 个实验，其中本科 ${window.HUST_UNDERGRADUATE_SOURCE?.experimentCount || 0} 个，研究生 ${total - (window.HUST_UNDERGRADUATE_SOURCE?.experimentCount || 0)} 个。`);
  document.getElementById("hero-experiment-count").textContent = String(total);
  document.getElementById("hero-course-count").textContent = String(CATALOG.length);
  const undergraduateTotal = EXPERIMENTS.filter((experiment) => experiment.scope !== "graduate").length;
  const verifiedTotal = EXPERIMENTS.filter((experiment) => experiment.scope === "hust-exact").length;
  const graduateTotal = EXPERIMENTS.filter((experiment) => experiment.scope === "graduate").length;
  document.getElementById("sidebar-catalog-summary").textContent =
    `本科目录 ${undergraduateTotal} 个（核验清单 ${verifiedTotal} 个）+ 研究生 ${graduateTotal} 个`;
  document.getElementById("dossier-status").textContent = `${total} / ${total} 已整理`;
  const initialReportText = `# 实验报告

当前还没有生成数据报告。

使用步骤：
1. 先选择一个实验；
2. 对照原理和器材说明，拖动参数看看变化；
3. 导入 CSV / Excel 数据，或者先用示例数据试一遍；
4. 报告会自动计算统计量并保存一份新的记录。

每次导入都会新建一份记录，即使文件内容相同，也不会覆盖上一份。`;
  reportPreview.textContent = initialReportText;
  renderYearOverview();
  renderCatalog();
  loadPersistedReports();
  renderReportHistory();
  selectExperiment(EXPERIMENTS[0]?.id, false);
  setupWelcomeScreen();
  setupNavigation();
  setupControls();
  setupDataControls();
  setupReportControls();
  setupMotionObserver();
  updateClock();
  window.setInterval(updateClock, 15000);
  drawAdvancedChart();
  requestAnimationFrame(animationLoop);
}

initialize();

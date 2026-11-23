"use strict";

(function () {
  const c = (id, name, sim, formula, description, options = {}) => ({
    id,
    name,
    sim,
    formula,
    description,
    ...options
  });

  window.LAB_CATALOG = [
    {
      id: "year-1-1",
      year: 1,
      term: 1,
      title: "基础测量与电子入门",
      focus: "测量误差、基本电学量和示波器",
      experiments: [
        c("length-density", "长度与密度的精密测量", "measurement", "ρ = m / V", "用游标卡尺、螺旋测微器和电子天平完成多次测量，分析仪器误差与数据处理结果。", {
          primaryLabel: "测量次数",
          primaryUnit: "次",
          primaryMin: 3,
          primaryMax: 20,
          primaryValue: 8,
          secondaryLabel: "样品密度",
          secondaryUnit: "g/cm³",
          secondaryMin: 1,
          secondaryMax: 12,
          secondaryValue: 7.85
        }),
        c("multimeter-basics", "万用表与基本电学量测量", "circuit", "U = IR", "测量电压、电流和电阻，练习仪表量程选择与正负接线端判断。"),
        c("oscilloscope-basics", "示波器波形观测", "oscilloscope", "f = 1 / T", "使用示波器观察周期信号的幅值、频率、相位和触发方式。"),
        c("kirchhoff", "基尔霍夫定律与叠加定理", "circuit", "ΣI = 0，ΣU = 0", "通过多回路电路测量支路电流和节点电压，验证基尔霍夫定律及线性叠加关系。"),
        c("thevenin", "戴维南与诺顿等效电路", "circuit", "Uoc = Isc · Rth", "测量含源二端网络的开路电压和短路电流，建立等效电源模型。"),
        c("rc-transient", "RC一阶电路暂态响应", "rc", "uC(t) = U0e^(-t/RC)", "记录电容充放电曲线，提取时间常数并检验一阶电路模型。"),
        c("rl-induction", "RL电路与电磁感应", "rc", "uL = L · di/dt", "观察电感电流变化引起的感应电动势，分析RL电路时间常数。"),
        c("diode-iv", "半导体二极管伏安特性", "semiconductor", "I = Is(e^(qU/kT) - 1)", "测量正向和反向伏安特性，理解PN结导通电压与温度影响。")
      ]
    },
    {
      id: "year-1-2",
      year: 1,
      term: 2,
      title: "波动光学与模拟电路基础",
      focus: "双缝、衍射、偏振与放大电路",
      experiments: [
        c("double-slit", "杨氏双缝干涉", "double-slit", "Δx = λL / d", "观察双缝干涉条纹，测量相邻明纹间距并验证光的波动性。"),
        c("single-slit", "单缝与圆孔衍射", "diffraction", "a sinθ = kλ", "记录单缝和圆孔衍射图样，测量中央亮纹宽度与暗纹位置。"),
        c("grating-spectrum", "光栅衍射与光谱测量", "grating", "d sinθ = kλ", "利用光栅分离不同波长，完成光栅常数标定和谱线识别。"),
        c("lens-imaging", "透镜焦距与光学成像", "optics", "1/f = 1/u + 1/v", "通过物距和像距测量薄透镜焦距，分析放大率与成像条件。"),
        c("polarization", "偏振光与马吕斯定律", "polarization", "I = I0cos²θ", "旋转检偏器测量透射光强，验证线偏振光的马吕斯定律。"),
        c("hall-effect", "霍尔效应及其应用", "semiconductor", "UH = KHIB", "测量霍尔电压与磁场、电流的关系，计算载流子浓度和霍尔系数。"),
        c("bridge-sensor", "电桥测量与温度传感", "measurement", "ΔU ≈ (ΔR/4R)U", "使用惠斯通电桥测量电阻微小变化，并分析热敏电阻温度响应。"),
        c("common-emitter", "共射放大电路基础", "amplifier", "Au = -βRL' / rbe", "测量共射放大器的静态工作点、电压增益和输入输出波形。")
      ]
    },
    {
      id: "year-2-1",
      year: 2,
      term: 1,
      title: "应用光学与模拟电子",
      focus: "干涉仪、放大器和频率响应",
      experiments: [
        c("michelson", "迈克尔逊干涉", "michelson", "Δd = Nλ / 2", "调节迈克尔逊干涉仪，观察等倾条纹并测量镜面位移。"),
        c("newton-rings", "牛顿环与曲率半径测量", "newton", "R = r² / (kλ)", "测量牛顿环暗环直径，计算平凸透镜曲率半径。"),
        c("light-speed", "光速测量", "measurement", "c = fλ", "通过调制光相位差或周期信号测量光速，并评价系统时延。", {
          primaryLabel: "调制频率",
          primaryUnit: "MHz",
          primaryMin: 10,
          primaryMax: 100,
          primaryValue: 45
        }),
        c("coherence", "光的干涉与相干长度", "double-slit", "Lc = λ² / Δλ", "改变光程差并观察条纹对比度，理解相干长度和光谱宽度关系。"),
        c("negative-feedback", "多级负反馈放大电路", "amplifier", "Af = A / (1 + AF)", "测量负反馈对增益、带宽和非线性失真的影响。"),
        c("opamp", "集成运算放大器特性", "amplifier", "Uo = Aod(U+ - U-)", "测量开环增益、共模抑制比，并搭建比例和加减运算电路。"),
        c("active-filter", "有源滤波与频率响应", "frequency", "|H(jω)| = |Uo/Ui|", "测量低通和高通滤波器的幅频响应，识别截止频率与滤波阶数。"),
        c("sine-oscillator", "正弦波振荡电路", "oscillator", "AF = 1", "搭建RC振荡器，观察起振条件、振荡频率和稳幅过程。")
      ]
    },
    {
      id: "year-2-2",
      year: 2,
      term: 2,
      title: "数字电子与信号分析",
      focus: "时序逻辑、采样、频谱与数字滤波",
      experiments: [
        c("logic-gates", "逻辑门电路与布尔代数", "digital", "Y = A'B + AB'", "测量基本逻辑门真值表和电平，验证布尔代数化简结果。"),
        c("combinational-logic", "组合逻辑设计与译码器", "digital", "Y = f(A,B,C,D)", "使用逻辑门和译码器实现组合逻辑，分析竞争冒险。"),
        c("flip-flops", "触发器与锁存器", "digital", "Q(n+1) = f(Qn, X)", "测量RS、JK和D触发器的时序行为，观察建立保持时间。"),
        c("counter", "计数器与时序逻辑", "digital", "fout = fin / 2^N", "搭建同步和异步计数器，测量分频比与状态转换序列。"),
        c("timer-555", "555定时器与脉冲电路", "oscillator", "T = 0.693(R1 + 2R2)C", "搭建多谐振荡器，测量占空比、频率与定时元件关系。"),
        c("sampling", "模拟信号采样与重构", "sampling", "fs > 2fmax", "观察采样率与信号频率变化，验证奈奎斯特采样定理。"),
        c("fourier-spectrum", "傅里叶变换与频谱分析", "fourier", "X(f) = ∫x(t)e^(-j2πft)dt", "分析方波、正弦波和噪声频谱，理解时域与频域对应关系。"),
        c("digital-filter", "数字滤波与噪声抑制", "dsp", "y[n] = Σh[k]x[n-k]", "设计低通FIR滤波器，比较滤波前后噪声和信号指标。")
      ]
    },
    {
      id: "year-3-1",
      year: 3,
      term: 1,
      title: "光电检测、激光与光纤",
      focus: "光电转换、激光器、成像与光纤传感",
      experiments: [
        c("photoelectric", "光电效应与普朗克常量测量", "photoelectric", "Ek = hν - W", "通过截止电压和入射光频率测量普朗克常量，验证光电效应规律。"),
        c("photodiode", "光电二极管特性与响应速度", "photodiode", "Iph = RλP", "测量响应度、暗电流和带宽，分析偏置对光电检测性能的影响。"),
        c("solar-cell", "光电池与太阳能电池特性", "solar", "FF = Pmax / (VocIsc)", "测量太阳能电池伏安曲线，提取短路电流、开路电压和填充因子。"),
        c("laser-beam", "激光特性与高斯光束", "laser", "w(z) = w0√(1 + (z/zR)²)", "测量激光光斑尺寸和发散角，验证高斯光束传播规律。"),
        c("laser-diode", "激光二极管调制特性", "laser", "P = η(I - Ith)", "测量激光二极管阈值电流、功率斜率和小信号调制响应。"),
        c("ccd-imaging", "CCD/CMOS成像原理", "imaging", "DN = g · Ne + offset", "采集均匀照明和测试靶标图像，分析像素响应、暗噪声和动态范围。"),
        c("fiber-na", "光纤数值孔径与损耗测量", "fiber", "NA = √(n1² - n2²)", "测量光纤出射光锥和传输损耗，计算数值孔径与衰减系数。"),
        c("fiber-sensor", "光纤传感与应变测量", "fiber", "Δλ/λ = (1 - pe)ε", "使用FBG或强度型光纤传感器测量应变与温度响应。")
      ]
    },
    {
      id: "year-3-2",
      year: 3,
      term: 2,
      title: "现代光学、嵌入式与通信",
      focus: "全息、傅里叶光学、MCU和调制解调",
      experiments: [
        c("holography", "全息照相", "holography", "I = |O + R|²", "记录并重现全息图，理解物光与参考光干涉形成的相位信息。"),
        c("spatial-filter", "空间滤波与4f光学系统", "fourier", "E2 = F⁻¹[H·F(E1)]", "搭建4f系统，通过频谱面滤波实现图像去噪、边缘增强和方向选择。"),
        c("optical-correlation", "光学图像相关与模式识别", "fourier", "C(x,y) = f★g", "利用相关峰识别目标图像，分析噪声和尺度变化对识别的影响。"),
        c("spectrometer", "光谱仪标定与发射光谱", "grating", "λ = aθ + b", "使用标准光源标定光谱仪，测量未知光源的发射谱线。"),
        c("mcu-gpio", "单片机GPIO与中断实验", "embedded", "PA0 → EXTI0", "配置GPIO输入输出和外部中断，测量按键响应与去抖处理效果。"),
        c("mcu-adc", "ADC采样与数字显示", "embedded", "D = round(Vin / Vref · 2^N)", "测量模拟电压与ADC输出码值关系，分析量化和采样误差。"),
        c("mcu-bus", "UART/I2C/SPI通信实验", "embedded", "Baud = 1 / Tbit", "使用逻辑分析仪观察串口、I2C和SPI时序，验证数据帧与总线仲裁。"),
        c("modem", "光电信号调制与解调", "communication", "m(t) = A[1 + km(t)]cosωct", "完成光信号的幅度调制与解调，测量信噪比、带宽和解调失真。")
      ]
    },
    {
      id: "year-4-1",
      year: 4,
      term: 1,
      title: "综合光电系统与工程实现",
      focus: "机器视觉、光通信、FPGA与实时信号",
      experiments: [
        c("image-edge", "数字图像采集与边缘检测", "imaging", "G = √(Gx² + Gy²)", "采集目标图像并实现梯度、阈值和边缘检测，评价检测精度。"),
        c("machine-vision", "机器视觉测量与缺陷检测", "imaging", "Lpixel = Lreal / N", "搭建相机标定和尺寸测量流程，识别划痕、缺口和异物。"),
        c("fiber-link", "光纤通信链路与误码率", "communication", "BER ≈ 1/2erfc(√SNR)", "测量光功率、眼图和误码率，分析链路损耗对通信质量的影响。"),
        c("wdm", "WDM波分复用与光谱监测", "fiber", "Δν = c / Δλ", "复用多个波长信道，使用光谱仪监测信道间隔和串扰。"),
        c("optical-amplifier", "光放大器与增益特性", "fiber", "G = 10log(Pout/Pin)", "测量掺铒光纤放大器增益、噪声系数和饱和输出功率。"),
        c("fpga-project", "FPGA数字系统设计", "fpga", "clkout = clkin / N", "使用Verilog实现分频、计数和状态机，并通过逻辑分析仪验证时序。"),
        c("dsp-realtime", "DSP实时信号处理", "dsp", "y[n] = Σa_kx[n-k]", "在DSP平台上实现实时滤波与频谱分析，测量算法延迟和资源占用。"),
        c("virtual-instrument", "虚拟仪器与自动测试", "integrated", "S = f(V, T, t)", "使用程序控制仪器完成自动扫描、数据记录和测试报告生成。")
      ]
    },
    {
      id: "year-4-2",
      year: 4,
      term: 2,
      title: "前沿光学与创新综合设计",
      focus: "系统装调、三维测量、计算成像与智能检测",
      experiments: [
        c("optical-alignment", "光学系统装调与像差评价", "optics", "W = W020ρ² + W040ρ⁴", "完成多透镜系统装调，使用星点或波前数据评价成像质量。"),
        c("laser-ranging", "激光测距与三维测量", "laser", "d = cΔt / 2", "搭建相位法或飞行时间测距系统，完成平面和台阶样件扫描。"),
        c("doe-design", "衍射光学元件设计验证", "diffraction", "U = F⁻¹[F(t)·H]", "设计并加工衍射光学元件，比较仿真与实际衍射效率。"),
        c("computational-imaging", "计算成像与相位恢复", "imaging", "I = |F[O]|²", "利用多幅强度图恢复相位和物体图像，分析算法收敛性。"),
        c("sensor-network", "光电传感器网络", "communication", "E = P·t", "部署多节点传感器网络，测试通信时延、能耗和数据同步。"),
        c("weak-signal", "高精度微弱信号检测", "measurement", "SNR = 20log(Vs/Vn)", "使用锁相放大和调制解调方法提取淹没在噪声中的微弱信号。"),
        c("photonic-chip", "光电子集成芯片测试", "fiber", "Pout = ηPin", "完成光子芯片耦合、光谱扫描和插入损耗测试，分析工艺偏差。"),
        c("smart-detection", "智能光电检测综合设计", "integrated", "y = f(I, λ, t)", "综合光源、探测器、采集电路和算法完成目标检测系统设计与评价。")
      ]
    }
  ];

  window.LAB_EXPERIMENTS = window.LAB_CATALOG.flatMap((semester) =>
    semester.experiments.map((experiment, index) => ({
      ...experiment,
      year: semester.year,
      term: semester.term,
      semesterTitle: semester.title,
      semesterId: semester.id,
      index: index + 1
    }))
  );
})();

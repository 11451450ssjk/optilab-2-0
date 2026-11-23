"use strict";

(function () {
  const SOURCE_URL = "https://oei.hust.edu.cn/info/1041/9935.htm";
  const makeExperiment = (id, name, sim, formula, description, theory, options = {}) => ({
    id: `hust-${id}`,
    name,
    sim,
    formula,
    description,
    theory,
    ...options
  });

  const makeCourse = (id, year, term, title, focus, code, credits, hours, caution, experiments, optional = false) => ({
    id: `hust-course-${id}`,
    year,
    term,
    title,
    focus,
    scope: "hust",
    officialCode: code,
    officialCredits: credits,
    officialHours: hours,
    sourceUrl: SOURCE_URL,
    optional,
    experiments: experiments.map((experiment) => ({
      ...experiment,
      officialCourseCode: code,
      officialCourseName: title,
      officialCourseCredits: credits,
      officialCourseHours: hours,
      officialSourceUrl: SOURCE_URL
    })),
    caution
  });

  const HUST_COURSES = [
    makeCourse(
      "professional-cognition",
      1,
      1,
      "专业认知实验",
      "光电学科方向、实验平台、工程安全与专业伦理",
      "OEI0065",
      "1",
      "1w",
      "进入实验室必须遵守激光、用电、化学品和机械安全规定；认知阶段以观察和记录为主。",
      [
        makeExperiment("cognition-optics", "光电信息技术导论与专业认知", "integrated", "S = f(光、电、信息)", "认识光源、光电器件、电子采集、信号处理和信息系统之间的完整链路。", "光电信息系统把光作为信息载体，通过光电转换、模拟与数字电路、通信和算法完成测量与控制。"),
        makeExperiment("cognition-laser-comm", "激光、光纤与光通信实验室认知", "fiber", "Pout = Pin · η", "观察激光器、光纤耦合、光功率计和通信误码测试平台。", "光纤通信利用光载波传输信息，链路性能由耦合效率、损耗、色散、噪声和接收灵敏度共同决定。"),
        makeExperiment("cognition-display-imaging", "显示、成像与机器视觉平台认知", "imaging", "I = I(x, y, λ)", "认识相机、镜头、显示器件、图像采集卡和视觉算法实验平台。", "成像系统将空间光强分布转换为像素灰度，再通过标定和算法恢复尺寸、位置或缺陷信息。"),
        makeExperiment("cognition-device-fab", "光电器件与微纳制造平台认知", "semiconductor", "P = I · V", "认识半导体材料、光刻、薄膜、封装和器件测试的基本流程。", "光电器件的性能由材料能带、结结构、载流子输运和封装热管理共同决定。")
      ]
    ),
    makeCourse(
      "physics-lab-1",
      1,
      2,
      "物理实验（上）",
      "力学、热学、基础电磁测量与实验不确定度",
      "PHY0191",
      "2",
      "32",
      "使用卡尺、天平、电桥和高压源时遵守仪器量程；高压部分不得带电接线。",
      [
        makeExperiment("uncertainty", "长度测量与实验不确定度", "measurement", "uc = √(uA² + uB²)", "用游标卡尺和螺旋测微器测量尺寸，完成 A 类与 B 类不确定度合成。", "多次测量的离散反映 A 类不确定度，仪器分辨率和校准证书提供 B 类不确定度，两者按平方和合成。"),
        makeExperiment("inertia", "刚体转动惯量测量", "measurement", "I = Σmr²", "通过扭摆或落体法测量刚体转动惯量并验证平行轴定理。", "刚体转动惯量取决于质量分布，绕不同轴的转动惯量可通过平行轴定理联系。"),
        makeExperiment("young-modulus", "杨氏模量测量", "measurement", "E = FL/(SΔL)", "使用拉伸、光杠杆或动态法测量材料弹性模量。", "在弹性范围内，材料正应力与正应变近似成正比，比例系数为杨氏模量。"),
        makeExperiment("surface-tension", "液体表面张力测量", "measurement", "F = αL", "使用拉脱法或毛细管法测量液体表面张力系数。", "液体表面分子势能导致表面收缩，表面张力描述单位接触长度上的拉力。"),
        makeExperiment("wheatstone", "惠斯登电桥测量电阻", "circuit", "Rx = R1R3/R2", "通过电桥平衡测量未知电阻并分析灵敏度。", "当电桥两臂比例相等时桥路电流为零，未知电阻可由比例臂计算。"),
        makeExperiment("scope-basic", "示波器基础与周期信号测量", "oscilloscope", "f = 1/T", "学习探头补偿、触发、时基与垂直档位，测量周期和峰峰值。", "示波器按时间采样并重建波形，稳定触发使周期信号在屏幕上保持固定。")
      ]
    ),
    makeCourse(
      "physics-lab-2",
      1,
      3,
      "物理实验（下）",
      "电磁学、波动光学与现代物理基础测量",
      "PHY0201",
      "1.5",
      "24",
      "激光实验避免直射眼睛；磁场设备附近不得放置磁性存储介质。",
      [
        makeExperiment("hall", "霍尔效应与载流子参数测量", "semiconductor", "UH = KHIB", "测量霍尔电压与磁场、电流关系并计算载流子浓度。", "运动载流子在磁场中受洛伦兹力偏转，形成横向霍尔电场和霍尔电压。"),
        makeExperiment("hysteresis", "铁磁材料磁滞回线", "measurement", "B = μH", "测量铁磁材料的磁化和磁滞特性，比较剩磁与矫顽力。", "铁磁材料存在磁畴和不可逆磁化过程，磁感应强度与磁场之间形成磁滞回线。"),
        makeExperiment("e-m", "电子荷质比测量", "measurement", "e/m = 2U/(B²r²)", "通过磁聚焦或偏转测量电子荷质比。", "电子在磁场中运动受到洛伦兹力，可根据轨迹半径和加速电压计算荷质比。"),
        makeExperiment("coherence-basic", "相干性与光程差", "double-slit", "Lc ≈ λ²/Δλ", "观察条纹对比度随光程差变化并理解相干长度。", "实际光源具有有限谱宽，不同波长条纹累积错位导致可见度随光程差下降。"),
        makeExperiment("grating-basic", "光栅衍射与波长测量", "grating", "d sinθ = kλ", "利用标准谱线标定光栅并测量未知波长。", "多缝衍射在满足光栅方程的方向形成主极大，不同波长对应不同衍射角。"),
        makeExperiment("photoelectric-basic", "光电效应基本测量", "photoelectric", "eU0 = hν - W", "测量截止电压和光电流，认识入射频率与光强的作用。", "光电子发射由单光子能量决定，截止电压与入射频率线性相关。")
      ]
    ),
    makeCourse(
      "circuit-test",
      2,
      1,
      "电路测试实验",
      "电路定理、暂态、谐振、三相网络和端口测试",
      "EEE0671",
      "1",
      "32",
      "接线前断电并检查极性；电流表必须串联，电压表必须并联测量。",
      [
        makeExperiment("kcl-kvl", "基尔霍夫定律与叠加定理", "circuit", "ΣI=0，ΣU=0", "测量多回路电路支路电流与回路电压，验证节点和回路定律。", "集中参数电路满足电荷守恒和能量守恒，线性电路的多源响应可以叠加。"),
        makeExperiment("thevenin-basic", "戴维南与诺顿等效", "circuit", "Uoc = IscRth", "测量含源二端口网络开路电压、短路电流和等效内阻。", "任何线性含源二端网络可等效为开路电压与内阻串联模型。"),
        makeExperiment("first-order", "一阶电路与时间常数", "rc", "uC(t)=U0e^(-t/RC)", "观察RC和RL电路暂态过程，提取时间常数。", "储能元件的电压或电流不能突变，一阶暂态响应按指数规律趋近稳态。"),
        makeExperiment("rlc-resonance", "RLC谐振与品质因数", "frequency", "f0=1/(2π√LC)", "测量串联RLC电路的谐振频率、带宽和品质因数。", "感抗和容抗在谐振频率处相互抵消，电流达到峰值，品质因数描述选频能力。"),
        makeExperiment("three-phase", "三相电路与功率测量", "circuit", "P=√3ULILcosφ", "测量星形和三角形负载的线电压、线电流与三相功率。", "对称三相系统中线电压与相电压成√3关系，总功率可由两表法或三表法测量。"),
        makeExperiment("two-port", "二端口网络参数测量", "circuit", "U1=Z11I1+Z12I2", "测量阻抗参数、传输参数和端口匹配特性。", "二端口网络用端口电压电流关系描述，可用于级联、匹配和传输分析。")
      ]
    ),
    makeCourse(
      "electronic-test",
      2,
      2,
      "电子测试与实验技术",
      "模拟电子电路测试、运放、滤波、振荡与电源",
      "EIC0651",
      "1.5",
      "48",
      "测量前检查电源极性和输出短路风险；示波器探头地线不得夹在非地节点。",
      [
        makeExperiment("instrument-error", "电子仪器使用与测量误差", "oscilloscope", "δ=Δ/x ×100%", "学习函数源、电源、示波器和万用表的量程、阻抗与测量误差。", "电子仪器内阻、带宽和量程会改变被测电路，读数误差需结合分辨率和系统误差分析。"),
        makeExperiment("ce-amplifier", "晶体管共射放大电路", "amplifier", "Au=-βRL'/rbe", "测量静态工作点、电压增益、输入输出电阻和失真。", "晶体管通过基极电流控制集电极电流，静态偏置决定放大区工作点。"),
        makeExperiment("opamp-linear", "运算放大器线性应用", "amplifier", "Uo=Aod(U+-U-)", "搭建比例、求和、积分和差动运算电路。", "深度负反馈下运放满足虚短与虚断，闭环增益由外部网络决定。"),
        makeExperiment("active-filter", "有源滤波器与频率响应", "frequency", "|H|=|Uo/Ui|", "测量低通、高通和带通滤波器的幅频响应。", "RC网络与运放构成频率选择系统，截止频率和阶数决定通带与衰减特性。"),
        makeExperiment("wave-gen", "正弦波与方波发生电路", "oscillator", "AF=1", "搭建RC振荡器和比较器方波源，观察起振与稳幅。", "正反馈满足幅值和相位条件时产生振荡，非线性网络限制振幅。"),
        makeExperiment("power-supply", "整流、滤波与稳压电源", "circuit", "Uo≈1.2~1.4U2", "测量桥式整流、电容滤波和线性稳压器输出纹波与负载调整率。", "二极管整流把交流变为脉动直流，滤波和稳压环节降低纹波并稳定输出。")
      ]
    ),
    makeCourse(
      "microcomputer-lab",
      2,
      2,
      "微机实验",
      "微机接口、GPIO、定时器、串行总线、ADC/DAC和电机控制",
      "OEI0066",
      "1",
      "16",
      "断电后插拔芯片和排线，避免IO过压、电源短路和电机堵转。",
      [
        makeExperiment("gpio", "GPIO输入输出与中断", "embedded", "PA0 → EXTI0", "配置按键中断与LED输出，测量响应时间和按键抖动。", "GPIO通过寄存器控制引脚电平和方向，外部中断在指定边沿触发服务程序。"),
        makeExperiment("timer", "定时器、计数器与PWM", "embedded", "fPWM=fclk/(prescaler·period)", "使用定时器产生周期中断和PWM，测量频率与占空比。", "定时器由预分频器和自动重装值决定计数周期，PWM通过比较阈值控制占空比。"),
        makeExperiment("serial", "UART通信与帧格式", "embedded", "Baud=1/Tbit", "设置波特率并收发固定数据，观察起始位、停止位与校验位。", "UART采用异步串行帧，收发双方依靠约定波特率和帧格式同步。"),
        makeExperiment("i2c-spi", "I2C与SPI总线实验", "embedded", "SCL/SDA · CS/SCLK/MOSI/MISO", "连接传感器并观察地址、应答、片选和时钟相位。", "I2C以地址和应答管理总线，SPI通过片选和同步时钟实现高速全双工传输。"),
        makeExperiment("adc-dac", "ADC与DAC接口实验", "embedded", "D=Vin/Vref·2^N", "测量模拟输入、数字码值和DAC输出，分析量化误差。", "ADC把模拟电压映射为数字码，DAC把数字码重建为模拟电压，参考源决定满量程。"),
        makeExperiment("motor", "步进电机与执行器控制", "embedded", "θ=Nstep·step_angle", "编写步进序列控制电机转速、方向和细分。", "步进电机按相序通电产生离散角位移，细分数和脉冲频率决定分辨率与速度。")
      ]
    ),
    makeCourse(
      "research-innovation",
      3,
      1,
      "科研创新实践",
      "文献研究、实验设计、数据表达、项目汇报与可重复研究",
      "OEI0125",
      "2.5",
      "4w",
      "科研数据必须保留原始记录；引用文献需核对原文，不得复制未阅读内容作为实验结论。",
      [
        makeExperiment("literature-design", "文献检索与实验方案设计", "integrated", "方案 = 目标 + 变量 + 对照", "围绕一个光电问题完成文献检索、变量识别、研究假设和实验方案。", "可重复实验方案需要明确研究问题、自变量、因变量、对照条件、样本量和数据处理方法。"),
        makeExperiment("data-quality", "科研数据采集与质量控制", "measurement", "CV=σ/μ", "建立原始数据模板、异常值规则和重复测量流程。", "数据质量控制通过统一测量条件、重复采集、校准和可追溯元数据降低系统误差与偶然误差。"),
        makeExperiment("result-presentation", "科研结果图与论文表达", "measurement", "Graph = Data + Mapping + Annotation", "把实验数据转换为可读图表，并撰写结果与讨论。", "科学图表需要选择合适坐标、保留误差信息、明确单位和图例，并对数据范围和局限性作出说明。"),
        makeExperiment("project-defense", "创新项目展示与答辩", "integrated", "Impact = 问题 × 方法 × 证据", "完成项目摘要、演示、问答和证据链复核。", "技术答辩需要用问题定义、方法选择、数据证据、创新点和限制条件构成完整论证。")
      ]
    ),
    makeCourse(
      "optoelectronic-lab",
      3,
      2,
      "光电子技术实验",
      "发光、探测、光伏、耦合与光电信号检测",
      "OEI0067",
      "1",
      "16",
      "激光和强光必须衰减并避免直视；光电器件注意极性和最大功率。",
      [
        makeExperiment("led-characterization", "LED伏安与发光特性", "photodiode", "I=I0(e^(qU/nkT)-1)", "测量LED正向电压、电流与辐射功率，分析发光效率。", "LED正向偏置下电子空穴复合发光，光功率随电流增加并受热效应影响。"),
        makeExperiment("ld-characterization", "半导体激光器阈值与功率特性", "laser", "P=η(I-Ith)", "测量激光二极管阈值电流、光功率和调制响应。", "激光二极管超过阈值后进入受激辐射区，输出功率随电流快速增加。"),
        makeExperiment("detector-responsivity", "光电探测器响应度与暗电流", "photodiode", "R=Iph/P", "测量光电二极管暗电流、光电流和响应度。", "光电探测器把光功率转换为电流，响应度描述单位光功率产生的光电流。"),
        makeExperiment("solar-characterization", "光电池输出与填充因子", "solar", "FF=Pmax/(VocIsc)", "测量太阳能电池I-V曲线并计算最大功率和效率。", "光伏器件吸收光子产生载流子，负载扫描给出短路电流、开路电压和最大功率点。"),
        makeExperiment("opto-coupler", "光耦隔离与传输特性", "communication", "Vout=f(IF)", "测量光耦输入电流、输出电流、隔离和频率响应。", "光耦通过发光器和光探测器实现电气隔离，传输比和带宽由器件结构决定。"),
        makeExperiment("photoelectric-detection", "微弱光电信号检测", "measurement", "SNR=20log(Vs/Vn)", "使用跨阻放大器和滤波电路检测微弱光信号。", "微弱光检测需抑制暗电流、背景光和电磁干扰，并通过放大、滤波和锁相提高信噪比。")
      ]
    ),
    makeCourse(
      "fiber-lab",
      3,
      2,
      "光纤技术实验",
      "光纤参数、耦合、损耗、熔接、OTDR与光纤传感",
      "OEI0068",
      "1",
      "16",
      "光纤弯曲半径不得过小；激光进入光纤前执行功率限制并清洁端面。",
      [
        makeExperiment("fiber-parameters", "光纤数值孔径与模式测量", "fiber", "NA=√(n1²-n2²)", "测量光纤接收角、输出光斑和模式分布。", "纤芯和包层折射率差决定全反射条件和数值孔径，多模光纤可支持多个模式。"),
        makeExperiment("fiber-loss", "光纤损耗与连接损耗", "fiber", "α=-10log(Pout/Pin)/L", "使用截断法测量光纤衰减和连接器附加损耗。", "光纤损耗来自材料吸收、瑞利散射、弯曲和连接端面不匹配，功率随距离指数衰减。"),
        makeExperiment("fiber-coupling", "光源-光纤耦合效率", "fiber", "η=Pfiber/Psource", "调整透镜和光纤端面位置，优化耦合功率。", "耦合效率由光源模式、数值孔径、端面反射和对准误差决定。"),
        makeExperiment("fiber-splicing", "光纤端面处理与熔接", "fiber", "Ltotal=ΣLi", "完成剥纤、切割、清洁和熔接，并测量熔接损耗。", "低损耗熔接需要高质量端面、精确对准和合理放电参数。"),
        makeExperiment("otdr", "OTDR光纤链路测试", "fiber", "d=cΔt/(2n)", "利用背向散射测量链路长度、损耗和事件点。", "OTDR向光纤发射脉冲并测量背向散射光时间，从而定位连接、弯曲和断点。"),
        makeExperiment("fbg-sensing", "光纤光栅应变与温度传感", "fiber", "Δλ/λ=(1-pe)ε+(α+ξ)ΔT", "测量FBG反射峰漂移与应变、温度的关系。", "光纤光栅反射波长由光栅周期和有效折射率决定，应变与温度都会改变峰位。")
      ]
    ),
    makeCourse(
      "optics-lab",
      3,
      2,
      "光学实验",
      "几何光学、干涉、衍射、偏振与全息",
      "OEI0049",
      "1",
      "16",
      "激光实验中光路需固定，禁止直视或使用镜面反射光进入眼睛。",
      [
        makeExperiment("focal-length", "透镜焦距与成像关系", "optics", "1/f=1/u+1/v", "测量薄透镜物距、像距、焦距和横向放大率。", "近轴条件下，薄透镜满足高斯物像关系，像距和物距共同决定成像位置。"),
        makeExperiment("polarization-basic", "偏振光与马吕斯定律", "polarization", "I=I0cos²θ", "旋转检偏器测量透射光强并识别偏振方向。", "线偏振光通过检偏器后，电场沿透振方向的投影决定透射光强。"),
        makeExperiment("double-slit-lab", "双缝干涉与相干光场", "double-slit", "Δx=λL/d", "测量双缝条纹间距并分析波长和缝距影响。", "两束相干光叠加形成稳定干涉条纹，条纹间距由波长、屏距和缝距决定。"),
        makeExperiment("single-slit-lab", "单缝衍射与中央亮纹", "diffraction", "a sinθ=kλ", "测量单缝衍射暗纹位置和中央亮纹宽度。", "有限狭缝的次波衍射造成中央亮纹和旁瓣分布，缝宽越小衍射角越大。"),
        makeExperiment("grating-lab", "光栅分光与谱线测量", "grating", "d sinθ=kλ", "使用光栅分离谱线并测量光栅常数或未知波长。", "多缝干涉主极大位置满足光栅方程，不同波长在空间中分离。"),
        makeExperiment("michelson-lab", "迈克尔逊干涉与条纹计数", "michelson", "Δd=Nλ/2", "调节干涉仪并利用条纹吞吐测量微小位移。", "两臂往返光程差变化一个波长，干涉条纹完成一次明暗周期。"),
        makeExperiment("newton-ring", "牛顿环与透镜曲率半径", "newton", "R=r²/(kλ)", "测量牛顿环暗环直径并计算平凸透镜曲率半径。", "空气楔厚度随半径变化，等厚干涉暗环半径平方与级次近似线性。"),
        makeExperiment("holography-basic", "全息照相与波前重现", "holography", "I=|O+R|²", "记录物光与参考光全息图并观察三维重现。", "全息图将物光与参考光的干涉振幅和相位信息编码在记录介质中。")
      ]
    ),
    makeCourse(
      "laser-lab",
      3,
      2,
      "激光技术实验",
      "激光谐振、功率、光束、偏振、调Q与倍频",
      "OEI0056",
      "1",
      "16",
      "必须使用匹配波长的激光防护镜；禁止直视直射光、反射光和倍频光。",
      [
        makeExperiment("laser-startup", "激光器结构与起振调试", "laser", "G ≥ L", "观察泵浦、增益介质、谐振腔和输出耦合，完成激光起振。", "激光器需要增益大于腔内损耗，并通过光学谐振腔形成模式选择和反馈。"),
        makeExperiment("laser-power", "激光功率与能量测量", "laser", "P=E/t", "使用功率计和能量计测量连续激光功率与脉冲能量。", "激光功率表示单位时间能量，探头需要匹配波长、功率密度和响应时间。"),
        makeExperiment("gaussian-profile", "激光光斑与高斯光束参数", "laser", "w(z)=w0√(1+(z/zR)²)", "测量光斑半径、腰斑和发散角，拟合高斯传播规律。", "基模激光横向强度近似高斯分布，束腰和瑞利长度决定远场扩散。"),
        makeExperiment("laser-polarization", "激光偏振特性测量", "polarization", "I=I0cos²θ", "使用偏振片和功率计测量激光偏振状态。", "激光谐振腔结构和输出镜会影响偏振，马吕斯定律可用于分析线偏振分量。"),
        makeExperiment("q-switching", "调Q脉冲激光实验", "laser", "Ppeak≈E/τp", "比较连续和调Q模式，测量脉冲宽度、峰值功率和重复频率。", "调Q通过延迟腔内损耗释放储能，形成短时高峰值功率脉冲。"),
        makeExperiment("shg", "激光倍频与非线性效应", "laser", "ω2=2ω1", "观察倍频晶体将近红外激光转换为可见光并测量转换效率。", "在非线性介质中二倍频使两光子合成为一个倍频光子，相位匹配决定转换效率。")
      ]
    )
  ];

  const HUST_PRINCIPLES = {};
  HUST_COURSES.forEach((course) => {
    course.experiments.forEach((experiment) => {
      HUST_PRINCIPLES[experiment.id] = {
        intro: experiment.description,
        theory: `${experiment.theory} 本实验通过改变输入条件、观察输出响应并记录对应数据，检验 ${experiment.formula} 所描述的定量关系。理论分析还应区分理想模型、仪器工作区间和实际误差来源，避免把单个测量点直接外推到全部范围。`,
        apparatus: `华中科技大学2025级培养方案“${course.title}”（${course.officialCode}）所列实验平台，包括与“${experiment.name}”对应的光源、电子仪器、光学元件、探测器、数据采集或软件工具。`,
        steps: [
          "根据课程指导书检查仪器、量程、极性、光学对准和安全条件。",
          `设置“${experiment.name}”的初始参数，记录仪器型号、环境条件和原始读数。`,
          "逐步改变关键变量并重复测量，保存原始数据，使用理论关系和不确定度方法完成复核。"
        ],
        variables: `${experiment.formula}。实验报告应补充每个符号的物理意义、单位、测量方法和适用范围。`,
        caution: course.caution,
        observations: `重点判断观测结果是否满足“${experiment.formula}”所描述的关系，并检查异常点、重复性和仪器工作区间。具体实验项目与开设学年应以学院当年实验教学安排为准。`
      };
    });
  });

  window.HUST_2025_SOURCE = {
    title: "华中科技大学2025级光电信息科学与工程专业培养方案",
    url: SOURCE_URL,
    courseCount: HUST_COURSES.length,
    experimentCount: HUST_COURSES.reduce((total, course) => total + course.experiments.length, 0)
  };
  window.LAB_CATALOG.push(...HUST_COURSES);
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
  Object.assign(window.LAB_PRINCIPLES, HUST_PRINCIPLES);
})();

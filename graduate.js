"use strict";

(function () {
  const makeExperiment = (id, name, sim, formula, description, theory, options = {}) => ({
    id: `grad-${id}`,
    name,
    sim,
    formula,
    description,
    theory,
    ...options
  });

  const makeCourse = (id, year, term, title, focus, code, experiments) => ({
    id: `graduate-course-${id}`,
    year,
    term,
    degreeYear: year - 4,
    title,
    focus,
    scope: "graduate",
    officialCode: code,
    officialCredits: "2",
    officialHours: "32",
    experiments: experiments.map((experiment) => ({
      ...experiment,
      graduateCourseCode: code,
      graduateCourseName: title
    })),
    caution: "遵守激光防护、洁净环境、高压与低温设备操作规范。研究生实验应保留原始数据、仪器配置和研究记录，并在导师或实验平台负责人指导下完成。"
  });

  const GRADUATE_COURSES = [
    makeCourse(
      "advanced-spectroscopy",
      5,
      1,
      "高等光谱与精密测量",
      "吸收光谱、拉曼、荧光寿命与腔增强测量",
      "GR-OPT-501",
      [
        makeExperiment("tdlas", "TDLAS气体吸收光谱", "laser", "I(ν)=I₀exp[-Sφ(ν)NL]", "扫描可调谐激光波长，反演气体吸收线型与浓度。", "可调谐二极管激光吸收光谱通过扫描分子吸收线，将吸收深度、线宽和频率位置与气体温度、压强及浓度联系起来。"),
        makeExperiment("raman", "共聚焦拉曼光谱与峰位标定", "grating", "Δν=ν₀-νs", "测量材料拉曼散射峰位并完成光谱仪波长标定。", "拉曼散射反映分子振动和转动能级，频移与激发波长无关，强度受材料截面、聚焦和采集条件影响。"),
        makeExperiment("fluorescence-lifetime", "荧光寿命与时间分辨测量", "photodiode", "I(t)=I₀exp(-t/τ)", "使用脉冲光源和高速探测记录荧光衰减曲线并提取寿命。", "荧光寿命描述激发态布居随时间衰减的速率，需要校准仪器响应函数并处理多指数衰减。"),
        makeExperiment("cavity-ringdown", "腔衰荡光谱与超低损耗测量", "laser", "τ=L/[c(1-R+αL)]", "测量高反射腔中光强衰减时间，反演腔损和微弱吸收。", "腔衰荡时间由腔长、镜面反射率和介质吸收共同决定，对微弱吸收具有很高灵敏度。")
      ]
    ),
    makeCourse(
      "ultrafast-photonics",
      5,
      2,
      "超快光学与脉冲测量",
      "锁模、自相关、泵浦探测与色散控制",
      "GR-OPT-502",
      [
        makeExperiment("mode-locked", "锁模脉冲激光器调试", "laser", "frep=c/(2nL)", "调节锁模状态，测量重复频率、光谱宽度和平均功率。", "锁模使大量纵模保持固定相位，在时域形成短脉冲；重复频率由谐振腔往返时间决定。"),
        makeExperiment("autocorrelation", "飞秒脉冲自相关测量", "laser", "Iac(τ)=∫I(t)I(t-τ)dt", "使用自相关仪测量超短脉冲宽度并分析非线性响应。", "自相关通过扫描两束脉冲的相对延迟，将时间宽度转换为可测量的倍频或双光子信号。"),
        makeExperiment("pump-probe", "泵浦-探测瞬态动力学", "laser", "ΔT/T=f(τ)", "测量样品在飞秒激发后的瞬态吸收或反射变化。", "泵浦光激发样品后，探测光在可变延迟下记录激发态布居、载流子弛豫和热效应。"),
        makeExperiment("pulse-compression", "色散补偿与脉冲压缩", "fiber", "φ(ω)=β₂Lω²/2", "测量光纤和光栅对引起的色散，完成脉冲压缩。", "不同频率分量传播速度不同会造成啁啾，通过相反色散元件可以重新压缩脉冲。")
      ]
    ),
    makeCourse(
      "nanophotonics",
      5,
      2,
      "微纳光子学与超表面",
      "超表面、光子晶体、微腔与表面等离激元",
      "GR-OPT-503",
      [
        makeExperiment("metasurface", "超表面相位设计与远场测量", "diffraction", "Eout=Σanexp(iφn)", "设计纳米天线阵列，测量聚焦效率和远场相位响应。", "超表面通过亚波长结构逐点调控光的振幅和相位，设计目标与制造误差共同决定光学效率。"),
        makeExperiment("photonic-crystal", "光子晶体带隙与透射谱", "fiber", "ω=ck/n_eff", "测量一维或二维光子晶体的透射谱并识别带隙。", "周期介电结构形成光子能带，在带隙频率范围内传播被抑制。"),
        makeExperiment("spr", "表面等离激元共振传感", "photodiode", "kSPR=k₀√(εmεd/(εm+εd))", "扫描入射角或波长，测量共振谷与折射率变化。", "金属表面等离激元对周围介质折射率敏感，共振角用于检测浓度、厚度或分子结合。"),
        makeExperiment("microcavity", "回音壁微腔耦合与Q值测量", "laser", "Q=ω/Δω", "观察微腔谐振峰，测量自由光谱范围和品质因数。", "高Q微腔将光限制在很小的模式体积内，谐振线宽反映损耗和耦合强度。")
      ]
    ),
    makeCourse(
      "fiber-networks",
      6,
      1,
      "先进光纤传感与光网络",
      "分布传感、相干通信、OFDR与动态光网络",
      "GR-OPT-601",
      [
        makeExperiment("fbg-distributed", "FBG分布式应变温度传感", "fiber", "ΔλB/λB=(1-pe)ε+(α+ξ)ΔT", "测量多个光栅波长漂移，分离应变和温度响应。", "光纤布拉格光栅的反射波长由有效折射率和周期决定，外界应变和温度会改变两者。"),
        makeExperiment("botda", "BOTDA分布式温度应变测量", "fiber", "νB=νB0+Cεε+CTΔT", "测量布里渊频移沿光纤分布并分析空间分辨率。", "受激布里渊散射的频移与声速相关，因此可以反演光纤沿线的温度和应变。"),
        makeExperiment("coherent-link", "相干光通信与DSP均衡", "communication", "BER=Q(√(2SNR))", "测量QPSK/16QAM链路星座、误码率与数字均衡效果。", "相干接收同时恢复光载波的幅度、相位和偏振，数字信号处理补偿色散、频偏和相位噪声。"),
        makeExperiment("ofdr", "OFDR高分辨分布式测量", "fiber", "z=cτ/(2n)", "完成光纤沿线高分辨反射与应变测量。", "扫频干涉将距离映射为拍频，通过傅里叶变换获得高空间分辨率。")
      ]
    ),
    makeCourse(
      "quantum-photonics",
      6,
      1,
      "量子光学与光子信息",
      "纠缠、单光子、HBT与量子密钥分发",
      "GR-OPT-602",
      [
        makeExperiment("hbt", "Hanbury Brown–Twiss光子相关", "photodiode", "g²(τ)=⟨I(t)I(t+τ)⟩/⟨I⟩²", "测量光场二阶相关函数，区分相干光与单光子源。", "二阶相关函数描述光子到达时间的关联，理想单光子源在零延迟处表现为反聚束。"),
        makeExperiment("qkd", "BB84量子密钥分发", "communication", "K=1-H(eB)", "完成基矢选择、误码估计和密钥率分析。", "量子密钥分发利用未知量子态不可克隆原理；窃听会引入误码，因此可通过误码阈值判断安全性。"),
        makeExperiment("entangled-photon", "纠缠光子制备与符合测量", "polarization", "|Ψ⟩=(|HV⟩-|VH⟩)/√2", "测量偏振关联与贝尔不等式违背。", "自发参量下转换产生的光子对具有时间和偏振关联，符合计数用于验证纠缠。"),
        makeExperiment("spad", "单光子探测与死时间校正", "photodiode", "Rdet=Rin/(1+Rinτd)", "测量SPAD暗计数、探测效率和计数率饱和。", "单光子雪崩二极管在盖革模式下放大单光子事件，死时间和后脉冲限制最大计数率。")
      ]
    ),
    makeCourse(
      "intelligent-instruments",
      6,
      2,
      "智能仪器与AI辅助实验",
      "锁相检测、自适应光学、高光谱与自动标定",
      "GR-AI-603",
      [
        makeExperiment("lock-in", "锁相放大器与微弱信号检测", "measurement", "Vout∝Vscos(φ)", "从强噪声背景中提取调制微弱信号并优化时间常数。", "锁相放大利用正交解调将目标频率分量搬到直流，窄带滤波抑制其他频率噪声。"),
        makeExperiment("adaptive-optics", "自适应光学波前校正", "optics", "φcorr=-φaberr", "测量波前畸变并驱动变形镜完成闭环校正。", "自适应光学通过波前传感器、控制器和校正器构成反馈回路，提高受大气或像差影响系统的成像质量。"),
        makeExperiment("hyperspectral", "高光谱成像与光谱立方体", "imaging", "I=I(x,y,λ)", "采集空间-光谱数据立方体并完成分类或材料识别。", "高光谱成像同时获得空间和多个窄带光谱信息，通过特征提取识别材料或生理状态。"),
        makeExperiment("auto-calibration", "仪器自动标定与异常诊断", "integrated", "θ*=argminΣ(yi-fθ(xi))²", "使用标准件和自动扫描完成参数拟合、漂移检测和异常诊断。", "自动标定将仪器响应模型与标准输入数据结合，通过优化估计参数并监测残差变化。")
      ]
    ),
    makeCourse(
      "biomedical-photonics",
      6,
      2,
      "生物医学光子学",
      "组织光学、光声、OCT与荧光成像",
      "GR-BME-604",
      [
        makeExperiment("tissue-optics", "生物组织光学参数测量", "photodiode", "μt=μa+μs", "使用积分球或空间分辨反射测量组织吸收和散射。", "组织中的吸收与散射共同决定光传播，可用扩散近似或蒙特卡罗模型反演光学参数。"),
        makeExperiment("photoacoustic", "光声成像与信号重建", "imaging", "p0=ΓμaF", "采集光声信号并重建吸收体分布。", "脉冲光被组织吸收后产生热弹性膨胀并激发超声，光声图像反映吸收系数和光通量分布。"),
        makeExperiment("oct", "光学相干层析成像", "fiber", "z=cΔf/(2n)", "测量低相干干涉信号并重建层状组织截面。", "低相干干涉只在光程差较小时产生信号，从而实现深度方向高分辨率成像。"),
        makeExperiment("fluorescence-imaging", "共聚焦荧光显微与光谱拆分", "imaging", "I(x,y)=PSF⊗O(x,y)", "完成荧光样品共聚焦扫描、PSF测量与多通道拆分。", "共聚焦针孔抑制离焦光，点扩散函数、信噪比和荧光串扰决定成像分辨率与定量能力。")
      ]
    ),
    makeCourse(
      "optoelectronic-materials",
      6,
      2,
      "先进光电子材料与器件",
      "钙钛矿、二维材料、光探测器与太赫兹",
      "GR-OPT-605",
      [
        makeExperiment("perovskite", "钙钛矿光电探测器响应测试", "photodiode", "R=Iph/Pin", "测量响应度、探测率和上升下降时间。", "光生载流子的产生、输运、复合和收集共同决定探测器响应与带宽。"),
        makeExperiment("2d-material", "二维材料光谱与偏振响应", "polarization", "I=I0cos²θ", "测量二维材料吸收峰和偏振相关光致发光。", "二维材料的能带和激子响应受层数、应变和介电环境强烈影响。"),
        makeExperiment("apd", "雪崩光电二极管增益与噪声", "photodiode", "M=Im/Ip", "测量APD增益、过剩噪声和温度漂移。", "碰撞电离产生雪崩倍增，同时放大信号与噪声，增益和带宽存在权衡。"),
        makeExperiment("thz-tds", "太赫兹时域光谱", "oscilloscope", "n(ω)=cφ(ω)/(ωd)+1", "测量太赫兹参考与样品时域波形，反演折射率和吸收。", "太赫兹时域光谱同时获得幅值和相位，可通过频域传递函数提取材料复折射率。")
      ]
    )
  ];

  const GRADUATE_PRINCIPLES = {};
  GRADUATE_COURSES.forEach((course) => {
    course.experiments.forEach((experiment) => {
      GRADUATE_PRINCIPLES[experiment.id] = {
        intro: experiment.description,
        theory: `${experiment.theory} 研究过程中应同时记录环境参数、仪器配置、校准状态和原始数据，使用 ${experiment.formula} 建立定量模型，并检查模型适用区间。`,
        apparatus: `${course.title}实验平台，包括与“${experiment.name}”对应的激光或光源、精密光路、探测器、数据采集、控制软件和标准件。`,
        steps: [
          "完成仪器预约、安全检查、激光防护和平台状态确认。",
          "记录设备型号、校准信息、环境条件和初始参数。",
          `按照研究方案搭建或加载“${experiment.name}”配置，完成预实验和量程检查。`,
          "改变关键变量并完成重复测量，保存原始数据和处理脚本。",
          "比较重复批次、残差、不确定度和适用边界，形成可复现研究记录。"
        ],
        variables: `${experiment.formula}。报告中应说明各变量的物理意义、单位、测量方法、标定方式和适用范围。`,
        caution: course.caution,
        observations: `重点检查数据是否满足 ${experiment.formula} 所描述的物理关系，并比较重复批次、噪声、漂移和系统偏差。研究生实验应保留失败记录和异常数据，避免只报告理想结果。`
      };
    });
  });

  window.LAB_CATALOG.push(...GRADUATE_COURSES);
  window.LAB_EXPERIMENTS = window.LAB_CATALOG.flatMap((semester) =>
    semester.experiments.map((experiment, index) => ({
      ...experiment,
      year: semester.year,
      term: semester.term,
      semesterTitle: semester.title,
      semesterId: semester.id,
      scope: semester.scope,
      degreeYear: semester.degreeYear || null,
      officialCode: semester.officialCode || "",
      officialCredits: semester.officialCredits || "",
      officialHours: semester.officialHours || "",
      index: index + 1
    }))
  );
  Object.assign(window.LAB_PRINCIPLES, GRADUATE_PRINCIPLES);
})();

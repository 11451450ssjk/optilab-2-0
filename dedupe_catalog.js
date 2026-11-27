"use strict";

(function () {
  const protectedScopes = new Set();
  window.LAB_EXPERIMENTS
    .filter((experiment) => experiment.semesterTitle === "专业认知实验")
    .forEach((experiment) => protectedScopes.add(experiment.id));

  const removals = {
    "hust-kcl-kvl": "与原光电本科“基尔霍夫定律与叠加定理”重复",
    "hust-thevenin-basic": "与原光电本科“戴维南与诺顿等效电路”重复",
    "hust-first-order": "与原光电本科“RC一阶电路暂态响应”重复",
    "hust-active-filter": "与原光电本科“有源滤波与频率响应”重复",
    "hust-ce-amplifier": "与原光电本科“共射放大电路基础”重复",
    "hust-opamp-linear": "与原光电本科“集成运算放大器特性”重复",
    "hust-wave-gen": "与原光电本科“正弦波振荡电路”重复",
    "hust-gpio": "与原光电本科“单片机GPIO与中断实验”重复",
    "hust-serial": "与原光电本科“UART/I2C/SPI通信实验”重复",
    "hust-i2c-spi": "与原光电本科“UART/I2C/SPI通信实验”重复",
    "hust-grating-basic": "与原光电本科“光栅衍射与光谱测量”重复",
    "hust-grating-lab": "与原光电本科“光栅衍射与光谱测量”重复",
    "hust-polarization-basic": "与原光电本科“偏振光与马吕斯定律”重复",
    "hust-double-slit-lab": "与原光电本科“杨氏双缝干涉”重复",
    "hust-single-slit-lab": "与原光电本科“单缝与圆孔衍射”重复",
    "hust-michelson-lab": "与原光电本科“迈克尔逊干涉”重复",
    "hust-newton-ring": "与原光电本科“牛顿环与曲率半径测量”重复",
    "hust-holography-basic": "与原光电本科“全息照相”重复",
    "hust-focal-length": "与原光电本科“透镜焦距与光学成像”重复",
    "hust-gaussian-profile": "与原光电本科“激光特性与高斯光束”重复",
    "hust-solar-characterization": "与原光电本科“光电池与太阳能电池特性”重复",
    "hust-ld-characterization": "与原光电本科“激光二极管调制特性”重复",
    "hust-fiber-parameters": "与原光电本科“光纤数值孔径与损耗测量”重复",
    "hust-rlc-resonance": "与电学扩展“串联RLC谐振与品质因数”重复",
    "hust-two-port": "与电学扩展“二端口网络参数测量”重复",
    "hust-wheatstone": "与华科核验清单“交直流电桥的应用”重复",
    "hust-coherence-basic": "与原光电本科“光的干涉与相干长度”重复",
    "hust-scope-basic": "与华科核验清单“示波器的使用”重复",
    "hust-photoelectric-basic": "与华科核验清单“光电效应与弗兰克-赫兹实验”重复",
    "hust-hall": "与原光电本科“霍尔效应及其应用”重复",
    "oscilloscope-basics": "与华科核验清单“示波器的使用”重复",
    "diode-iv": "与华科核验清单“电子元件伏安特性”重复",
    "photoelectric": "与华科核验清单“光电效应与弗兰克-赫兹实验”重复",
    "light-speed": "与华科核验清单“声速与光速测量”重复",
    "elec-ce-output": "与原光电本科“共射放大电路基础”重复",
    "elec-combinational-design": "与原光电本科“组合逻辑设计与译码器”重复",
    "elec-sequential-basics": "与原光电本科“触发器与锁存器”重复",
    "elec-digital-counter": "与原光电本科“计数器与时序逻辑”重复",
    "elec-mcu-bus-electrical": "与原光电本科“UART/I2C/SPI通信实验”重复",
    "elec-sampling-alias": "与原光电本科“模拟信号采样与重构”重复"
  };

  const removed = [];
  window.LAB_CATALOG = window.LAB_CATALOG
    .map((course) => {
      const experiments = course.experiments.filter((experiment) => {
        if (protectedScopes.has(experiment.id)) return true;
        const reason = removals[experiment.id];
        if (!reason) return true;
        removed.push({
          id: experiment.id,
          name: experiment.name,
          course: course.title,
          scope: course.scope || "general",
          reason
        });
        return false;
      });
      return { ...course, experiments };
    })
    .filter((course) => course.experiments.length);

  window.LAB_EXPERIMENTS = window.LAB_CATALOG.flatMap((semester) =>
    semester.experiments.map((experiment, index) => ({
      ...experiment,
      year: semester.year,
      term: semester.term,
      semesterTitle: semester.title,
      semesterId: semester.id,
      semesterTermLabel: semester.termLabel || "",
      scope: semester.scope || "general",
      degreeYear: semester.degreeYear || null,
      officialCode: semester.officialCode || "",
      officialCredits: semester.officialCredits || "",
      officialHours: semester.officialHours || "",
      sourceUrl: semester.sourceUrl || "",
      index: index + 1
    }))
  );

  window.OPTILAB_DEDUPE_REPORT = {
    removedCount: removed.length,
    protectedCount: protectedScopes.size,
    removed
  };
})();

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import engines from "./engines.json"
let x = 74.3
/*
  "0" - Синхронная частота вращения 3000 об/мин
*/

class Header extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="header">
          <h1>Расчет редуктора онлайн</h1>
        </div>
      </React.Fragment>
    )
  }
}

class Main extends React.Component {
  state = {
    w_el: 157, //Угловая скорость вращения ротора электродвигателя
    U_rp: 3, //Передаточное отношение ременной передачи
    V_sr: 1.2, //Средняя скорость поршня компрессора
    w_kr: 14, //Угловая скорость вращения кривошипа
    S0toD: 1, //Отношение хода поршня к диаметру поршня
    lambda: 0.15, //Отношение длины кривошипа к длине шатуна
    pressure: 0.32, //Среднее удельное давление на поршень компрессора
    delta: 0.01 // Допускаемое значение коэффициента неравномерности вращения звена приведения
  }
  render() {
    const {w_el, U_rp, V_sr, w_kr, S0toD, lambda, pressure, delta} = this.state
    const newParams = {} // Создаем список параметров для передачи их компонентам
    if (this.state.S0) {
       newParams.S0 = this.state.S0 //Объявляем новые параметры после их появления в state
       newParams.r = this.state.r
       newParams.l = this.state.l
       newParams.D = this.state.D
       newParams.U_pr = this.state.U_pr
       newParams.U_r = this.state.U_r
       newParams.U12 = this.state.U12
       newParams.w1 = this.state.w1
       newParams.w2 = this.state.w2 //w2 = w_kr - скорость вращения кривошипа
       newParams.VBf = this.state.VBf
       newParams.VCf = this.state.VCf
       newParams.TprCycle = this.state.TprCycle
       newParams.n = this.state.n
       newParams.J = this.state.J
       newParams.d = this.state.d
       newParams.P_engine = this.state.P_engine
       newParams.Psd = this.state.Psd
       newParams.T2 = this.state.T2
    }
    const {S0, l, r, D, VBf, VCf, U_pr, U_r, U12, w1, w2, TprCycle, n, P_engine, J, d, Psd, T2} = newParams
    return (
      <div className="main">
        <div className="mainInfo">
          <Parametrs  params={{w_el, U_rp, V_sr, w_kr, S0toD, lambda, pressure, delta}}/>
          <KinematicSynthesis params={{w_kr, V_sr, lambda, S0toD}} onUpdateParams={this.updateParams}/>
          <KinematicTransmissionAnalysis params={{w_el, w_kr, U_rp}} onUpdateParams={this.updateParams}/>
          {newParams.r ? <KinematicCompressorAnalysis params={{w_kr, r, lambda}} onUpdateParams={this.updateParams}/> : null} {/*Компонент отрисовывается только после появления новых значений в state*/}
          {newParams.VBf ? <MomentsDetermination params={{VBf, VCf, pressure, D, w2}} onUpdateParams={this.updateParams}/> : null}
          {newParams.TprCycle ? <EngineDetermination params={{TprCycle, w2, w_el}} onUpdateParams={this.updateParams}/> : null}
          {newParams.n ? <ShaftDinamicCalculation params={{n, U_rp, U_r, Psd}} onUpdateParams={this.updateParams}/> : null}
          {newParams.T2 ? <WorkingStressDetermination params={{U_r, T2}} onUpdateParams={this.updateParams}/> : null}
        </div>
      </div>
    )
  }
  updateParams = (key,value) => {
    this.setState({[key]:value})
  }
}

class Parametrs extends React.Component { //Начальные параметры

  render() {
    return (
      <div className="parametrs paragraph">
        <h2>Начальные параметры: </h2>
        <p>Wэл = {this.props.params.w_el} - угловая скорость вращения ротора электродвигателя, рад/с;</p>
        <p>Uрп = {this.props.params.U_rp} - передаточное отношение ременной передачи;</p>
        <p>Vср = {this.props.params.V_sr} - средняя скорость поршня компрессора, м/с;</p>
        <p>ωкр = {this.props.params.w_kr} - угловая скорость вращения кривошипа, рад/с;</p>
        <p>S0/D = {this.props.params.S0toD} - отношение хода поршня к диаметру поршня;</p>
        <p>λ = r/l = {this.props.params.lambda} - отношение длины кривошипа к длине шатуна;</p>
        <p>P = {this.props.params.pressure} - среднее удельное давление на поршень компрессора, Мпа;</p>
        <p>[δ] = {this.props.params.delta} - допускаемое значение коэффициента неравномерности вращения звена приведения;</p>
      </div>
    )
  }
}

class KinematicSynthesis extends React.Component { //Кинематический синтез
  constructor(props) {
    super(props)
    const {V_sr, w_kr, lambda, S0toD} = this.props.params
    this.state = ({ //Вычисляем новые значения
      S0: ["S0", Number((Math.PI*V_sr/w_kr).toFixed(3))], //Ход ползуна
      r: ["r", Number((Math.PI*V_sr/w_kr * 0.5).toFixed(3))], //Размер кривошипа
      l: ["l", Number((Math.PI*V_sr/w_kr* 0.5 / lambda).toFixed(3)) ], //Длина шатуна
      D: ["D", Number((Math.PI*V_sr/w_kr / S0toD).toFixed(3))] //Диаметр поршня
    })
  }
  render() {
    const update = () => {
      for (let key in this.state) {
        this.props.onUpdateParams(this.state[key][0], this.state[key][1]) //Передаем значения родителю
      }
    }
    const {S0, r, l, D} = this.state

    return (
      <div className="kinSintes paragraph" onLoad = {update}> {/*При рендере div выполняем передачу новых значений родителю*/}
        <h2>5.2 Кинематический синтез</h2>
        <p>По исходным данным Wкр, Vср и λ следует определить ход ползуна S0, размер кривошипа r и длину шатуна l.</p>
        <p>Ход ползуна определим по формуле</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/S0.png" alt="ход ползуна"></img>
        <p className="result">S0 = {S0[1]} м.</p>
        <p>Из схемы кривошипно-ползунного механизма следует</p>
        <p className="result">r = 0,5 * {S0[1]} = {r[1]} м.</p>
        <p>Длина шатуна</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/l.png" alt="длина шатуна"></img>
        <p className="result">l = {l[1]}</p>
        <p>Диаметр поршня находим из соотношения S0/D</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/D.png" alt="диаметр поршня"></img>
        <p className="result">D = {D[1]}</p>
      </div>
    )
  }
}

class KinematicTransmissionAnalysis extends React.Component{ //Кинематический анализ передаточного механизма агрегата
  constructor(props) {
    super(props)
    const {w_el, w_kr, U_rp} = this.props.params
    this.state = ({ //Вычисляем новые значения
      U_pr: ["U_pr", Number((w_el/w_kr).toFixed(3))], //Передаточное отношение привода
      U_r: ["U_r", Number(((w_el/w_kr)/U_rp).toFixed(3))], //Передаточное отношение редуктора
      U12: ["U12", Number((1.5 * Math.sqrt((w_el/w_kr)/U_rp)).toFixed(3))], //Передаточное отношение передачи в редукторе
      w1: ["w1", Number((w_el/U_rp).toFixed(3))], //Угловая скорость ведущего(быстроходного) вала
      w2: ["w2", Number(((w_el/U_rp)/((w_el/w_kr)/U_rp)).toFixed(3))] //Угловая скорость ведомого (тихоходного) вала
    })
  }
  render() {
    const update = () => {
      for (let key in this.state) {
        this.props.onUpdateParams(this.state[key][0], this.state[key][1]) //Передаем значения родителю
      }
    }
    const {U_pr, U_r, U12, w1, w2} = this.state
    return (
      <div className="kinSintAnalysis paragraph" onLoad={update}> {/*При рендере div выполняем передачу новых значений родителю*/}
        <h2>5.3 Кинематический анализ передаточного механизма агрегата</h2>
        <p>Кинематический расчет привода компрессора (замедляющей передачи)
производится из условия обеспечения требуемого передаточного отношения привода Uпр:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/U_pr.png" alt="передаточное отношение привода"></img>
        <p className="result">Uпр = {U_pr[1]}</p>
        <p>При выборе в качестве редуктора цилиндрической зубчатой пары вводится ременная передача.</p>
        <p>Тогда:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/U_pr_spur.png" alt="передаточное отношение привода для цилиндрической зубчатой пары"></img>
        <p>Здесь Uрп , Uр – передаточные отношения соответственно ременной передачи и редуктора. </p>
        <p>Отсюда:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/U%D1%80.png" alt="передаточное отношение редуктора"></img>
        <p className="result">Uр = {U_r[1]}</p>
        <p>Для цилиндрического редуктора из условия обеспечения минимальных габаритных размеров редуктора примем: </p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/U12.png" alt="Передаточное отношение передачи в редукторе"></img>
        <p>Где U12 – передаточное отношение цилиндрической косозубой передачи.</p>
        <p className="result">U12 = {U12[1]}</p>
        <p>Определим угловую скорость ω1 ведущего (быстроходного) вала:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/omega1.png" alt="угловая скорость ведущего вала"></img>
        <p className="result">ω1 = {w1[1]}</p>
        <p>а угловая скорость ω2 ведомого (тихоходного) вала, равная угловой скорости кривошипа:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/omega2.png" alt="угловая скорость ведомого вала"></img>
        <p className="result">ω2 = {w2[1]}</p>
      </div>
    )
  }
}

class KinematicCompressorAnalysis extends React.Component {
  constructor(props) {
    super(props)
    this.state = ({
      result : this.createTable()
    })
  }
  createTable = () => {
    let table = [<tr key="1">
      <td>φ, град</td>
      <td>Vb(φ), м/с</td>
      <td>Vc(φ), м/с</td>
      <td>Vb1(φ), м/с</td>
      <td>Vb2(φ), м/с</td>
    </tr>];
    const {r, w_kr, lambda} = this.props.params
    const VBf = [];
    const VCf = [];
    for (let i = 0; i <= 360; i += 15) {
      let children = [];
      for (let j = 0; j < 5; j++) {
        switch (j) {
          case 0:
            children.push(<td key={i + j}>{i}</td>) //Угол поворота кривошипа
            break;
          case 1:
            VBf.push(((-r)*w_kr*(Math.sin((i * Math.PI)/180) + ((lambda / 2) * Math.sin(2 * (i * Math.PI)/180)))).toFixed(3))
            children.push(<td key={i + j}>{VBf[VBf.length - 1]}</td>); //Угловая скорость первого ползуна
            break;
          case 2:
            VCf.push(((-r)*w_kr*(Math.sin(((i + 90) * Math.PI)/180) + ((lambda / 2) * Math.sin(2 * (((i + 90) * Math.PI)/180))))).toFixed(3))
            children.push(<td key={i + j}>{VCf[VCf.length - 1]}</td>); //Угловая скорость второго ползуна
            break;
          case 3:
            children.push(<td key={i + j}>{(-r * w_kr * Math.sin((i * Math.PI)/180)).toFixed(3)}</td>);
            break;
          case 4:
            children.push(<td key={i + j}>{(-r * w_kr * (lambda / 2) * Math.sin(2 * (i * Math.PI)/180)).toFixed(3)}</td>)
            break;
          default:
            break
        }
      }
      table.push(<tr key={i - 1}>{children}</tr>)
    }
    return {
      table: table,
      VBf: ["VBf", VBf],
      VCf: ["VCf", VCf]
    }
  }
  render() {
    const {r, w_kr, lambda} = this.props.params
    const {result} = this.state
    const update = () => {
      for (let key in this.state) {
        for (let i in this.state[key]) {
          if (i !== "table") {
            this.props.onUpdateParams(this.state[key][i][0], this.state[key][i][1]) //Передаем значения родителю
          }
        }
      }
    }
    return (
      <div className="kinCompressorAnalysis paragraph" onLoad={update}>
        <h2>5.4 Кинематический анализ механизма компрессора</h2>
        <p>Скорость движения первого и второго ползуна может быть найдена по следующим формулам:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/VB.png" alt="скорость движения первого ползуна"></img>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/VC.png" alt="скорость движения второго ползуна"></img>
        <p>где ωкр – угловая скорость кривошипа, φ – угол поворота кривошипа.</p>
        <p>При кинематическом исследовании механизма второго кинематического механизма учтем, что его кривошип повернут относительно первого на 90°.</p>
        <p>Скорость движения первого ползуна можно записать в виде:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/VB(2).png" alt="скорость движения первого ползуна"></img>
        <p>Здесь VB1 (φ) и VB2 (φ) являются первой и второй гармоникой соответственно:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/VB1.png" alt="первая гармоника"></img>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/VB2.png" alt="вторая гармоника"></img>
        <p>Пример:</p>
        <p>При φ=90°:</p>
        <p className="result">VB(φ) = {((-r)*w_kr*(Math.sin((90 * Math.PI)/180) + ((lambda / 2) * Math.sin(2 * (90 * Math.PI)/180)))).toFixed(3)}</p>
        <p className="result">VC(φ) = {((-r)*w_kr*(Math.sin((180 * Math.PI)/180) + ((lambda / 2) * Math.sin(2 * (180 * Math.PI)/180)))).toFixed(3)}</p>
        <p className="result">VB1(φ) = {(-r * w_kr * Math.sin((90 * Math.PI)/180)).toFixed(3)}</p>
        <p className="result">VB2(φ) = {(-r * w_kr * (lambda / 2) * Math.sin(2 * (90 * Math.PI  )/180)).toFixed(3)}</p>
        <p>Выполним расчеты VB (φ), VC (φ), VB1 (φ), VB2 (φ) при значениях угла поворота φ кривошипа, изменяющимся от 0° до 360°:</p>
        <table className="resultTable">
          <tbody>
            {result.table}
          </tbody>
        </table>
        <p>Пример графика зависимости скорости первого ползуна от угла поворота кривошипа:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/graphVB.png" alt="зависимость скорости первого ползуна от угла поворота кривошипа"></img>
      </div>
    )
  }
}

class MomentsDetermination extends React.Component {
  constructor(props) {
    super(props)
    const {pressure, D, Vbf, VCf} = this.props.params
    this.state = ({
      F: ["F", (pressure * (10 ** 6) * (Math.PI*(D**2) / 4)).toFixed(3)],
      result: this.createTable(),
      TprCycle: ["TprCycle", (this.createTable().TprSum[1].slice(0, 24).reduce((a, b) => +a + +b) / 24).toFixed(3)]
    })
  }

  createTable = () => {
    let table = [<tr key="100">
      <td>φ, град</td>
      <td>Tпр.1(φ), Н*м</td>
      <td>Tпр.2(φ), Н*м</td>
      <td>Tпр.Σ(φ), Н*м</td>
    </tr>];
    const w_kr = this.props.params.w2 //скорость вращения тихоходного вала и скорость вращения кривошипа равны
    const {pressure, D, VCf, VBf} = this.props.params
    const F = (pressure * (10 ** 6) * (Math.PI*(D**2) / 4)).toFixed(3)
    const Tpr1 = [];
    const Tpr2 = [];
    const TprSum = [];
    for (let i = 0; i <= 24; i++) {
      let children = [];
      for (let j = 0; j < 4; j++) {
        switch (j) {
          case 0:
            children.push(<td key={i + j }>{i *15}</td>)
            break;
          case 1:
            Tpr1.push((F * Math.abs(VBf[i])  / w_kr).toFixed(3))
            children.push(<td key={i + j}>{Tpr1[i]}</td>)
            break;
          case 2:
            Tpr2.push((F * Math.abs(VCf[i])  / w_kr).toFixed(3))
            children.push(<td key={i + j}>{Tpr2[i]}</td>)
            break;
          case 3:
            TprSum.push((+Tpr1[i] + +Tpr2[i]).toFixed(3))
            children.push(<td key={i + j}>{TprSum[i]}</td>)
            break;
          case 4:
        }
      }
      table.push(<tr key={i - 1}>{children}</tr>)
    }

    return {
      table: table,
      Tpr1 : ["Tpr1", Tpr1],
      Tpr2 : ["Tpr2", Tpr2],
      TprSum : ["TprSum", TprSum]
    };
  }
  update = () => {
    console.log("sd")
    for (let key in this.state) {
      console.log(this.state[key])
      for (let i in this.state[key]) {
        if (i !== "table") {
          this.props.onUpdateParams(this.state[key][i][0], this.state[key][i][1]) //Передаем значения родителю
        }
      }
    }
  }
  componentDidMount() {
    for (let key in this.state) {
      if (key === "result") {
        for (let i in this.state[key]) {
          if (i !== "table") {
            this.props.onUpdateParams(this.state[key][i][0], this.state[key][i][1]) //Передаем значения родителю
          }
        }
      } else {
          this.props.onUpdateParams(this.state[key][0], this.state[key][1]) //Передаем значения родителю
      }
    }
  }

  render() {
    const {F, result, TprCycle} = this.state
    return (
      <div className="momentsDetermination paragraph">
        <h2>6.1 Определение приведенных моментов сил производственных сопротивлений</h2>
        <p>Силами производственных сопротивлений являются силы давления воздуха в цилиндрах компрессора на поршни при прямых и обратных ходах. Они характеризуются средним постоянным удельным давлением P.</p>
        <p>Сила постоянного давления F на поршень определяется по формуле:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/F.png" alt="сила постоянного давления"></img>
        <p className="result">F = {F[1]}</p>
        <p>где (πD^2)/4 – площадь поршня компрессора, D – диаметр поршня, P – среднее удельное давление.</p>
        <br />
        <p>Определим приведенные моменты сил Tпр.1(φ) для первого КПМ и Tпр.2(φ) для второго КПМ.</p>
        <p>При изменении направления скорости движения поршня изменяется и направление силы давления на поршень. Однако, учитывая, что оба хода поршня являются рабочими, при определении приведенных моментов принимаются абсолютные значения скорости и силы давления на поршень.</p>
        <p>Значения приведенных моментов сил определим по формулам:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/Tpr12.png" alt="приведенные моменты сил"></img>
        <p>При определении приведенных моментов сил Tпр.1(φ) и Tпр.2(φ) пренебрегаем силами тяжести звеньев, в силу их малости по сравнению с силами давления воздуха на поршни компрессора.</p>
        <p>Суммарный приведенный момент сил производственных сопротивлений для каждого значения угла φ поворота кривошипа представляет собой сумму приведенных моментов сил давления воздуха на поршни двух КПМ:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/TprSum.png" alt="сумма приведенных моментов сил"></img>
        <p>Пример:</p>
        <p>При φ = 60°</p>
        <p className="result">Tпр.1(φ) = {result.Tpr1[1][4]} Н*м</p>
        <p className="result">Tпр.2(φ) = {result.Tpr2[1][4]} Н*м</p>
        <p className="result">Tпр.Σ(φ) = {result.TprSum[1][4]} Н*м</p>
        <p>Выполним расчеты Tпр.Σ(φ), Tпр.1(φ), Tпр.2(φ) при значениях угла поворота φ кривошипа, изменяющимся от 0° до 360°: </p>
        <table className="resultTable">
          <tbody>
            {this.state.result.table}
          </tbody>
        </table>
        <p>Значение Tпр.Σ(φ) за один цикл движения определяется по формуле:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/TprSumCycle.png" alt="сумма приведенных моментов сил за один цикл"></img>
        <p className="result">Tпр.Σ = {TprCycle[1]} Н*м</p>
        <p>Примерный вид диаграммы приведенных моментов при изменении угла поворота кривошипа в пределах от 0° до 360°:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/graphTpr.png" alt="график приведенного момента"></img>
      </div>
    )
  }
}

class EngineDetermination extends React.Component {
  constructor (props) {
    super(props)
    const {TprCycle, w2, w_el} = this.props.params
    const nel = (w_el * 60 / (2*Math.PI)).toFixed(3) //Угловую скорость вращения ротора электродвигателя переводим в об/мин из рад/с
    let engineGroup //Группа двигателей в каталоге в зависимости оч скорости вращения ротора
    let P_nominal //Номинальная мощность электродвигателя
    let engine //Параметры найденного двигателя, определяются ниже в цикле
    const Psp = (TprCycle * w2 / 1000).toFixed(3) //Мощность сил производственных
    const Psd = ((TprCycle * w2 / 1000)/(0.94 * 0.96 * 0.9 * 0.98)).toFixed(3) //Мощность сил движущих
    const Pel = (1.2 * (TprCycle * w2 / 1000)/(0.94 * 0.96 * 0.9 * 0.98)).toFixed(3) //Минимальная мощность электродвигателя (нужен элетродвигатель с мощностью больше чем это число)

    if (nel <= 500) {
      engineGroup = "5";
    } else if (nel <= 600) {
      engineGroup = "4";
    } else if (nel <= 750) {
      engineGroup = "3";
    } else if (nel <= 1000) {
      engineGroup = "2";
    } else if (nel <= 1500) {
      engineGroup = "1";
    } else if (nel <= 3000) {
      engineGroup = "0";
    }

    for (let key in engines[engineGroup]){ //!НЕ СТИРАТЬ, ЭТО ПОДСКАЗКА!
      if (Pel <= key) {
        P_nominal = key;
        engine = engines[engineGroup][P_nominal];
        break;
      }
    }

    this.state = ({
      Psp: ["Psp", Psp],
      Psd: ["Psd", Psd],
      Pel: ["Pel", Pel],
      engineName: ["engineName", engine[0]], //Марка двигателя
      P_engine: ["P_engine", Number(engine[1])], //Мощность двигателя
      n: ["n", Number(engine[2])], //Номинальная скорость вращения ротора двигателя
      J: ["J", Number(engine[3])], //Момент инерции вращения ротора двигателя
      d: ["d", Number(engine[4])] //Диаметр выходного вала двигателя
    })
  }

  componentDidMount () {
    for (let key in this.state) {
      this.props.onUpdateParams(this.state[key][0], this.state[key][1]) //Передаем значения родителю
    }
  }

  render() {
    const {Psp, Psd, Pel, engineName, P_engine, n, J, d} = this.state
    return (
      <div className="engineDetermination paragraph">
        <h2>6.2 Определение мощности сил движущих и подбор элек-тродвигателя</h2>
        <p>Мощность сил движущих определим по формуле:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/Psd.png" alt="мощность сил движущих"></img>
        <p>Где Pсп – мощность сил производственных сопротивлений, развиваемая поршнем компрессора:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/Psp.png" alt="мощность сил производственных сопротивлений"></img>
        <p className="result">Pсп = {Psp[1]} кВт</p>
        <p>ηагр – КПД машинного агрегата без учета потерь в двигателе (собственные потери двигателя учитываются в его выходных параметрах).</p>
        <p>КПД агрегата оценивается приблизительно с учетом типа соединения редуктора и компрессора:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/Efficiency.png" alt="КПД"></img>
        <p>где  ηрп – КПД ременной передачи, η_рп = 0,92...0,96;</p>
        <p>η_р – КПД редуктора (для цилиндрического редуктора η_р = 0,96);</p>
        <p>η_к – КПД компрессора (при параллельном соединении кривошипно-ползунных механизмов насоса η_к = 0,9);</p>
        <p>η_м – КПД соединительной муфты, η_м = 0,98;</p>
        <p>Отсюда:</p>
        <p className="result">ηагр = {(0.94 * 0.96 * 0.9 * 0.98).toFixed(3)}</p>
        <p>Тогда:</p>
        <p className="result">Pсд = {Psd[1]} кВт</p>
        <p>Требуемая мощность электродвигателя рассчитывается по формуле:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/Pel.png" alt="требуемая мощность электродвигателя"></img>
        <p className="result">Pэл = {Pel[1]} кВт</p>
        <p>По мощности Pэл и заданной угловой скорости вращения wэл выберем электродвигатель из каталога:</p>
        <br />
        <p>Электродвигатель <strong>{engineName[1]}</strong></p>
        <p>Номинальная мощность P = {P_engine[1]} кВт</p>
        <p>Частота вращения вала n = {n[1]} об/мин</p>
        <p>Момент инерции ротора J = {J[1]} кг*м^2</p>
        <p>Диаметр выходного вала d = {d[1]} мм</p>
      </div>
    )
  }
}

class ShaftDinamicCalculation extends React.Component {
  constructor(props) {
    super(props)
    const {n, U_rp, U_r, Psd} = this.props.params
    const n_b = (n / U_rp).toFixed(3) //Частота вращения быстроходного вала
    const n_t = (n_b / U_r).toFixed(3) //Частота вращения тихоходного вала
    const T2 = (Psd * 9550 / n_t).toFixed(3) //Вращающий момент на ведомом валу редуктора
    const T1 = (T2 / U_r).toFixed(3) //Вращающий момент на ведущем валу редуктора
    this.state = ({
      n_b: ["n_b", n_b],
      n_t: ["n_t", n_t],
      T1: ["T1", T1],
      T2: ["T2", T2]
    })
  }

  componentDidMount() {
    for (let key in this.state) {
      this.props.onUpdateParams(this.state[key][0], this.state[key][1]) //Передаем значения родителю
    }
  }

  render() {
    const {n_b, n_t, T1, T2} = this.state
    return (
      <div className="shaftDinamicCalculation paragraph">
        <h2>6.3 Динамический расчет валов</h2>
        <p>Частота вращения быстроходного вала:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/n_b.png" alt="частота вращения быстроходного вала"></img>
        <p className="result">nб = {n_b[1]} об/мин</p>
        <p>Частота вращения тихоходного вала:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/n_t.png" alt="частота вращения тихоходного вала"></img>
        <p className="result">nт = {n_t[1]} об/мин</p>
        <p>Найдем вращающий момент на ведомом валу редуктора:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/T2.png" alt="вращающий момент на ведомом валу редуктора"></img>
        <p className="result">T2 = {T2[1]} Н*м</p>
        <p>Найдем вращающий момент на ведущем валу редуктора:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/T1.png" alt="вращающий момент на ведущем валу редуктора"></img>
        <p className="result">T1 = {T1[1]} Н*м</p>
      </div>
    )
  }
}

class WorkingStressDetermination extends React.Component {
  constructor(props) {
    super(props)

    const a_w_array = [40, 50, 63, 71, 80, 90, 100, 112, 125, 140, 160, 180, 200, 224, 250, 280,
    315, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1120, 1250, 1400, 1600, 1800, 2000,
    2240, 2500]

    const {T2, U_r} = this.props.params

    const L = 10000
    const sigma_n_lim = 2 * 225 + 70
    const Zn = 1
    const Sn = 1.1
    const sigma_n = (sigma_n_lim * Zn / Sn).toFixed(3)
    const psi_ba = 0.4
    const Knb = 1.25
    const Ka = 430

    let a_w = (Ka*(U_r + 1)*Math.pow((T2*Knb)/(Math.pow(sigma_n, 2)*U_r*psi_ba),(1/3))).toFixed(3)
    const a_w_before = a_w
    for (let i = 0; i < a_w_array.length; i++) {
      if (a_w <= a_w_array[i]) {
        if (a_w - a_w_array[i - 1] < (a_w_array[i] - a_w_array[i - 1]) / 2) {
          a_w = a_w_array[i - 1];
        } else {
          a_w = a_w_array[i];
        }
        break;
      }

    }
    this.state = ({
      sigma_n_lim: ["sigma_n_lim", sigma_n_lim],
      sigma_n: ["sigma_n", sigma_n],
      a_w_before: ["a_w_before", a_w_before],
      a_w: ["a_w", a_w]
    })
  }
  render() {
    const {sigma_n_lim, sigma_n, a_w, a_w_before} = this.state
    return (
      <div className="workingStressDetermination paragraph">
        <h2>7.1 Определение допускаемых напряжений</h2>
        <p>При расчетах параметров редуктора следует принимать:</p>
        <ul>
          <li>Материал зубчатых колес – сталь 45;</li>
          <li>Термообработка зубчатых колес – нормализация или улучшение, обеспечивающая твердость по Бринелю HB = 200…250; временное сопротивление σB=800…900 МПа;</li>
          <li>Долговечность L=10000 ч;</li>
        </ul>
        <p>Расчет зубчатых колес редуктора проводится из условий обеспече-ния прочности зубьев по контактным напряжениям:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/sigma_n1.png" alt="контактные напряжения"></img>
        <p>Допускаемые контактные напряжения при расчете на выносливость:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/sigma_n2.png" alt="допускаемые контактные напряжения"></img>
        <p>где σнlim – предел контактной выносливости поверхностей зубьев;</p>
        <p>Sн – коэффициент безопасности;</p>
        <p>Zн – коэффициент долговечности;</p>
        <p>Приближенное значение предела контактной выносливости при заданной твердости поверхности зубьев 2HB ≤350 определяют из выражения:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/sigma_n_lim.png" alt="предел контактной выносливости"></img>
        <p className="result">σнlim = {sigma_n_lim[1]}</p>
        <p>При заданной долговечности редуктора L величина Zн=1. При нормализации или улучшении рекомендуется значение Sн=1,1. Отсюда:</p>
        <p className="result">[σн] = {sigma_n[1]} Мпа</p>
        <p>Примем коэффициент ширины венца ψba=0,4, а коэффициент, учитывающий неравномерность распределения нагрузки по ширине венца Kнβ=1,25.</p>
        <p>Определим межосевое расстояние из условия контактной выносливо-сти активных поверхностей зубьев по формуле:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/a_w.png" alt="предел контактной выносливости"></img>
        <p>Для косозубых передач Ka=43.</p>
        <p className="result">aw = {a_w_before[1]} мм</p>
        <p>Ближайшее значение межосевого расстояния по ГОСТ 2185-66 aw = {a_w[1]} мм.</p>
      </div>
    )
  }
}

class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <Main />
      </React.Fragment>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)

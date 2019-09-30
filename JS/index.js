import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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
    }
    const {S0, r, l , D} = newParams
    return (
      <div className="main">
        <div className="mainInfo">
          <Parametrs  params={{w_el, U_rp, V_sr, w_kr, S0toD, lambda, pressure, delta}}/>
          <KinematicSynthesis params={{w_kr, V_sr, lambda, S0toD}} onUpdateParams={this.updateParams}/>
          <KinematicTransmissionAnalysis params={{w_el, w_kr, U_rp}} onUpdateParams={this.updateParams}/>
          <KinematicCompressorAnalysis params={{w_kr, r, lambda}}/>
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
  createTable =() => {
    let table = [<tr key="1">
      <td>φ, град</td>
      <td>Vb(φ), м/с</td>
      <td>Vc(φ), м/с</td>
      <td>Vb1(φ), м/с</td>
      <td>Vb2(φ), м/с</td>
    </tr>];
    const {r, w_kr, lambda} = this.props.params
    for (let i = 0; i <= 360; i += 15) {
      let children = [];
      for (let j = 0; j < 5; j++) {
        switch (j) {
          case 0:
            children.push(<td key={i + j}>{i}</td>) //Угол поворота кривошипа
            break;
          case 1:
            children.push(<td key={i + j}>{((-r)*w_kr*(Math.sin((i * Math.PI)/180) + ((lambda / 2) * Math.sin(2 * (i * Math.PI)/180)))).toFixed(3)}</td>); //Угловая скорость первого ползуна
            break;
          case 2:
            children.push(<td key={i + j}>{((-r)*w_kr*(Math.sin(((i + 90) * Math.PI)/180) + ((lambda / 2) * Math.sin(2 * (((i + 90) * Math.PI)/180))))).toFixed(3)}</td>); //Угловая скорость второго ползуна
            break;
          case 3:
            children.push(<td key={i + j}>{(-r * w_kr * Math.sin((i * Math.PI)/180)).toFixed(3)}</td>);
            break;
          case 4:
            children.push(<td key={i + j}>{(-r * w_kr * (lambda / 2) * Math.sin(2 * (i * Math.PI)/180)).toFixed(3)}</td>)
        }
      }
      table.push(<tr key={i - 1}>{children}</tr>)
    }

    return table;
  }
  render() {
    const {r, w_kr, lambda} = this.props.params
    return (
      <div className="kinCompressorAnalysis">
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
        <p className="result">VB2(φ) = {(-r * w_kr * (lambda / 2) * Math.sin(2 * (90 * Math.PI)/180)).toFixed(3)}</p>
        <p>Выполним расчеты VB (φ), VC (φ), VB1 (φ), VB2 (φ) при значениях угла поворота φ, изменяющимся от 0° до 360°:</p>
        <table className="kinCompressorTable">
          <tbody>
            {this.createTable()}
          </tbody>
        </table>
        <p>Пример графика зависимости скорости первого ползуна от угла поворота кривошипа:</p>
        <img src="https://raw.githubusercontent.com/a-real-human-bean/images/master/gear%D0%A1alculation/images/graphVB.png" alt="зависимость скорости первого ползуна от угла поворота кривошипа"></img>
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

import React, {Component} from 'react';
import './App.css';
import {Helmet} from "react-helmet";
import Line from "./line"
// import * as rita from "rita"
import {RiTa} from "rita"

// var rita = require('rita');


class App extends Component {

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.incrementChanger, false);
  }

  fetchPoem = () => {
    fetch("https://lit.jtsiskin.com/sonnets").then((response) =>
      response.json()
    ).then((json) => {
      const idx = Math.floor(Math.random() *  json.length)
      const words = json[idx].lines.join(" * ");
      const tokenized = RiTa.tokenize(words);
      const tags = RiTa.getPosTags(tokenized);
      const wordArray = tokenized.map((e, i) => [e, tags[i]]);
      const lines = [];
      let line = [];
      let charCount = 0;

      const max = 70;
      for (let i = 0; i < wordArray.length; i += 1) {
        const wordTup = wordArray[i];
        const len = wordTup[0].length
        charCount += len;
        if (wordTup[0] === "*") {
          charCount += max;
        } else {
          line.push(wordTup)
        }
        if (charCount > max) {
          charCount = 0;
          lines.push(line);
          line = [];
        }
      }
      lines.push(line);

      console.log(lines);
      this.setState( {x: 0, y: 0, wordArray, lines, correct: 0, incorrect: 0});
    });
  }

  constructor(props) {
    super(props)
    this.fetchPoem()
    this.state = {x: 0, y: 0, rita: false, wordArray: [], lines:[], debug: false, correct: 0, incorrect: 0}

  }
  tryWebGazerBegin = () => {
    const t = this;
    if (window.webgazer) {
      window.webgazer.setGazeListener(function(data, elapsedTime) {
        if (data == null) {
          return;
        }
        var x = data.x; //these x coordinates are relative to the viewport
        var y = data.y; //these y coordinates are relative to the viewport
        t.setState({x,y});
      }).begin();
      if (this.state.debug)
        window.webgazer.showPredictionPoints(true);
    } else {
      setTimeout(this.tryWebGazerBegin, 200);
    }
  }

  checkDebug = () => {
    const hash = window.location.hash;
    if (hash.indexOf("d") !== -1) {
      this.setState({debug: true})
      if (window.webgazer)
        window.webgazer.showPredictionPoints(true);
    } else {
      if (window.webgazer)
        window.webgazer.showPredictionPoints(false);
    }
  }
  componentDidMount() {
    this.tryWebGazerBegin()
    window.addEventListener("hashchange", this.checkDebug, false);
    this.checkDebug()
    this.incrementChanger()

  }

  _onMouseMove = (e) => {
    if (this.state.debug)
      this.setState({ x: e.pageX, y: e.pageY });
  }
  onCorrect = (x) => {
    const lines = this.state.lines;
    if (x) {
      lines[x[0]][x[1]] = [lines[x[0]][x[1]][0], lines[x[0]][x[1]][1]]
    }
    this.setState({correct: this.state.correct += 1, lines})
  }
  onIncorrect = () => {
    this.setState({incorrect: this.state.incorrect += 1})
  }

  incrementChanger = () => {
    const lines = this.state.lines;
    if (lines.length > 0) {
      const lineNum = Math.floor(Math.random() * lines.length)
      const line = lines[lineNum]
      const wordNum = Math.floor(Math.random() * line.length);
      if (lines[lineNum][wordNum])
      lines[lineNum][wordNum].push([lineNum, wordNum])
      this.setState(lines)
    }
    setTimeout(this.incrementChanger, 1000);
  }

  render() {
    if (window.location.hash.indexOf("d") === -1) {
      require("./Hide.css")
    }
    return (
      <div className="App" onMouseMove={this._onMouseMove}>
        <Helmet>
          <script src={process.env.PUBLIC_URL + "/webgazer.js"} type="text/javascript" async={true} ></script>
          {/*<script src="https://cdnjs.cloudflare.com/ajax/libys/rita/1.3.86/rita-full.min.js" async={true}></script>*/}
        </Helmet>
        <div style={{height: '100vh'}}>
        <header className="App-header" style={{height: '95vh', overflow: 'hidden'}}>
          {this.state.lines.map((line) => {
            return <Line x={this.state.x} y={this.state.y} debug={this.state.debug} words={line} onCorrect={this.onCorrect} onIncorrect={this.onIncorrect}/>
          })}
        </header>
        <div>
          <button className={"fetchNew"} onClick={this.fetchPoem}> New </button>
          <p>correct: {this.state.correct} incorrect: {this.state.incorrect}</p>
          <p>Please stare at the mouse as you click in the corners to calibrate</p>
        </div>
        </div>
      </div>
    );
  }
}

export default App;

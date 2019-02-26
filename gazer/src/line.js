import React, { Component } from 'react';
import Word from "./word"

class Line extends Component {

  constructor(props) {
    super(props)
    this.state = {rec: null, words: this.props.words}
  }

  onRef = (element) => {
    if (this.state.rec == null)
      this.setState({rec: element.getBoundingClientRect(), element})
  }
  rectEquals = (x, y) =>{
    if (x === y) {
      return true
    }

    return (
      x.left === y.left &&
      x.right === y.right &&
      x.top === y.top &&
      x.bottom === y.bottom &&
      x.width === y.width &&
      x.height === y.height
    )
  }

  componentDidMount() {

  }

  componentWillUpdate(nextProps, nextState, nextContext) {
    if (this.state.element != null){
      const box = this.state.element.getBoundingClientRect();
      if (!this.rectEquals(box, this.state.rec) && (!this.state.alt || (this.state.alt && (this.state.displayingAlt === nextState.displayingAlt)))) {
        this.setState({rec: box})
      }
    }
  }

  onClick = () => {


  }
  render() {
    let style = {};
    let visible = false;
    if (this.state.rec) {
      const y = this.state.rec.top + (this.state.rec.height/2);
      const dist = Math.abs(y - this.props.y)
      if (dist < 120) {
        if (this.props.debug)
          style = {background: 'black'}
        visible = true;

      }
      // console.log(this.props.word, x,y);
    }
    return (<div ref={this.onRef} style={{display: 'flex', flexDirection: 'row',  flexShrink: 0}}> {this.props.words.map(
      (word, i) => {
        return (< Word
          lookedAtLine={visible}
          key = {word[0] +i}
          word = {word[0]}
          pos = {word[1]}
          chosen={word.length >= 3}
          idx={word[2]}
          x = {this.props.x}
          y = {this.props.y}
          onCorrect = {this.props.onCorrect}
          onIncorrect = {this.props.onIncorrect}
          debug={this.props.debug}
        />)})}
    </div>);
  }
}

export default Line;

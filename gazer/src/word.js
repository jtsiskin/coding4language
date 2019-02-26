import React, { Component } from 'react';

class Word extends Component {

  constructor(props) {
    super(props)
    this.state = {rec: null, element: null, alt: null, displayingAlt: false}
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
    if (!this.state.alt && this.state.displayingAlt) {
      const {word, pos} = this.props;
      if (["jj", "nn", "vb"].indexOf(pos) !== -1) {
        let code = "ml"
        if (Math.random() < 0.5) {
          code = "rel_syn"
        }
        fetch("https://api.datamuse.com/words?"+code+"="+word).then((response) => {
          return response.json()
        }).then((json) => {
          // console.log(json)
          if (json && json.length > 0) {
            const idx = Math.floor(Math.random() * Math.min(10, json.length))
            // console.log(json[idx].word);
            this.setState({alt: json[idx].word})
          }
        });
      }
    }
  }

  onClick = () => {
    if (this.state.displayingAlt) {
      this.setState({displayingAlt: false, alt: null})
      this.props.onCorrect(this.props.idx)
    } else {
      this.props.onIncorrect()
    }

  }
  render() {
    let style = {};
    let visible = false;
    if (this.state.rec) {
      const x = this.state.rec.left + (this.state.rec.width/2);
      const y = this.state.rec.top + (this.state.rec.height/2);
      const dist = Math.sqrt(Math.pow(x - this.props.x, 2) + Math.pow(y - this.props.y,2))
      if (dist < 200 || this.props.lookedAtLine) {
        if (this.props.debug)
          style = {background: 'black'}
        visible = true;

      } else {
        if (!this.state.displayingAlt && this.props.chosen)
          this.setState({displayingAlt: true})
      }
      // console.log(this.props.word, x,y);
    }
    let className = "word";
    if (this.props.pos.length === 1) {
      className = "punctuation"
    }
    return (
      <div ref={this.onRef} style={style} onClick={this.onClick}>
        <p className={className}>{(this.state.displayingAlt && this.state.alt)? this.state.alt : this.props.word}</p>
      </div>
    );
  }
}

export default Word;

import React, { Component } from "react";
import timeFormat from "./timeFormat"

class Timer extends Component<any,any>{

  clock: number;
  timer: any;

  constructor(props: any) {
    super(props);
    this.state = {
      clock: 0
    }
    this.clock = 0;
    this.ticker = this.ticker.bind(this);
  }

  componentDidMount() {
    this.timer = setInterval(this.ticker,1);
  }

  ticker() {
    this.setState({clock : new Date().getTime()-this.props.start})
  }

  render() {
    var clock = this.state.clock;
    return(
      <div>
        <h2>
          { timeFormat(clock) }
        </h2>
      </div>

    )
  }
}

export default Timer;

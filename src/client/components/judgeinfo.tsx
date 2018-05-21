import {Component} from "react";

class JudgeInfo extends Component<Props> {
    render() {
      return (
        <div className="judgeInfo-comp">
          <span>
            <span>{"Hello, "}</span>
            <span>{this.props.name}</span>
            <span>{"!"}</span>
          </span>
        </div>
      );
    }
}

export interface Props {
  name : string;
}

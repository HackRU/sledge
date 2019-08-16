import * as React from "react";

import {
  ButtonGroup,
  Button
} from "reactstrap";

export class Hideable extends React.Component<HideableProps, any> {
  constructor(props) {
    super(props);

    this.state = {
      hidden: !!this.props.initiallyHidden
    };
  }

  render() {
    let currentlyHidden = this.state.hidden;
    return (
      <div>
        <ButtonGroup>
          <Button
            onClick={() => this.setState({hidden: !currentlyHidden})}
          >{`Show/Hide`}</Button>
        </ButtonGroup>
        {this.state.hidden ? [] : this.props.children}
      </div>
    );
  }
}

export interface HideableProps {
  initiallyHidden?: boolean;
}

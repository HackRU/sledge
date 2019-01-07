import React from "react";

import {
  Input,
  InputGroup,
  InputGroupAddon,
  Button
} from "reactstrap";
import {List} from "immutable";

export class AddRow extends React.Component<AddRowProps, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      values: List(this.props.fields.map(x => ""))
    };
  }

  dispatchAdd() {
    this.setState(prevState => ({
      values: List(prevState.values.map(x => ""))
    }));
    this.props.onAdd(this.state.values);
  }

  render() {
    let inputs = this.props.fields.map((field, i) => (
      <Input
        placeholder={field}
        onChange={evt => {
          let newVal = evt.target.value;
          this.setState(prevState => ({
            values: prevState.values.set(i, newVal)
          }));
        }}
        value={this.state.values.get(i)}
        key={i+"|"+field}
      />
    ));

    return (
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          {this.props.name}
        </InputGroupAddon>
        {inputs}
        <InputGroupAddon addonType="append">
          <Button onClick={() => this.dispatchAdd()}>{`GO`}</Button>
        </InputGroupAddon>
      </InputGroup>
    );
  }
}

export interface AddRowProps {
  name: string;
  fields: List<string>;
  onAdd: (values: List<string>) => void;
}

interface State {
  values: List<string>;
}

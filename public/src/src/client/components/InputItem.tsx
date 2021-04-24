import React from "react";

import {
  Input,
  InputGroup,
  InputGroupAddon,
  Button
} from "reactstrap";

export class InputItem extends React.Component<InputItemProps, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      values: this.props.fields.map(x => "")
    };
  }

  dispatchAdd() {
    this.setState(prevState => ({
      values: prevState.values.map(x => "")
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
            values: setArray(prevState.values, i, newVal)
          }));
        }}
        onKeyPress={evt => {
          if (evt.ctrlKey && evt.key === "Enter") {
            this.dispatchAdd();
          }
        }}
        value={this.state.values[i]}
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

export interface InputItemProps {
  name: string;
  fields: Array<string>;
  onAdd: (values: Array<string>) => void;
}

interface State {
  values: Array<string>;
}

function setArray<A>(arr: Array<A>, index: number, newVal: A) {
  let newArray = arr.map(x => x);
  newArray[index] = newVal;
  return newArray;
}

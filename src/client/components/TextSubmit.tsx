import * as React from "react";

import {
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  Button
} from "reactstrap";

export class TextSubmit extends React.Component<TextSubmitProps, any> {
  constructor(props) {
    super(props);

    this.state = {
      textValue: ""
    };
  }

  onChange(evt) {
    this.setState({ textValue: evt.target.value });
  }

  handleKeyPress(evt) {
    if (evt.ctrlKey && evt.key === "Enter") {
      this.submit();
    }
  }

  submit() {
    this.props.onChange(this.state.textValue);
  }

  render() {
    return (
      <Form>
        <InputGroup>
          <Input
            type="textarea"
            onChange={evt => this.onChange(evt)}
            onKeyPress={evt => this.handleKeyPress(evt)}
            value={this.state.textValue}
          />
          <InputGroupAddon addonType="append">
            <Button
              onClick={() => this.submit()}
            >{`GO`}</Button>
          </InputGroupAddon>
        </InputGroup>
      </Form>
    );
  }
}

export interface TextSubmitProps {
  onChange: (value: string) => void;
}

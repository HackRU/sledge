import React from "react";
import { Container, Input, Button, ButtonGroup } from "reactstrap";
import { getSocket } from "../Socket";
import { catchOnly } from "../../shared/util";

export const DebugPage = (props: DebugPageProps) => (
  <Container id="DebugPage">
    <h1>{`Debug Events`}</h1>

    <EventDebugFormController
      {...props}
    />
  </Container>
);

export interface DebugPageProps {
  templates: Map<string, string>;
  templatesReady: boolean;
};

export const EventDebugForm = (props: EventDebugFormProps) => (
  <form>
    <Input
      type="textarea"
      value={props.eventJsonValue}
      onChange={evt => props.onChangeEventJson(evt.target.value)}
    />
    <div>
      <Button
        onClick={() => props.onSendRequest()}
      >
        {`Send`}
      </Button>
    </div>
    <span>{`Templates:`}</span>
    <ButtonGroup>
      <Button
        onClick={() => props.onLoadTemplate("status")}
        disabled={!props.templatesReady}
      >
        {`Global Status`}
      </Button>
      <Button
        onClick={() => props.onLoadTemplate("beginJudging")}
        disabled={!props.templatesReady}
      >
        {`Begin Judging`}
      </Button>
      <Button
        onClick={() => props.onLoadTemplate("samplePopulate")}
        disabled={!props.templatesReady}
      >
        {`Load Sample Populate Data`}
      </Button>
    </ButtonGroup>

    <h2>{`Response`}</h2>
    <Input type="textarea" readOnly value={props.response} />
  </form>
);

interface EventDebugFormProps {
  eventJsonValue: string;
  response: string;
  templatesReady: boolean;

  onSendRequest: () => void;
  onLoadTemplate: (name: string) => void;
  onChangeEventJson: (newEventJson: string) => void;
};

export class EventDebugFormController extends
  React.Component<EventDebugFormControllerProps, EventDebugFormControllerState>
{
  constructor(props: any) {
    super(props);

    this.state = {
      eventJson: "",
      response: ""
    };
  }

  sendRequest() {
    let obj = catchOnly("SyntaxError",
      () => JSON.parse(this.state.eventJson)
    );
    if (obj instanceof Error) {
      this.setState({response: obj.message});
    }
    getSocket().sendDebug(obj).then(res => {
      let json = JSON.stringify(res);
      this.setState({response: json});
    });
  }

  loadTemplate(name: string) {
    let json = this.props.templates.get(name);
    if (typeof json != "string") {
      throw new Error(`No template ${name}!`);
    }

    this.setState({
      eventJson: json
    });
  }

  changeEventJson(newJson: string) {
    this.setState({
      eventJson: newJson
    });
  }

  render() {
    return (
      <EventDebugForm
        eventJsonValue={this.state.eventJson}
        response={this.state.response}
        templatesReady={this.props.templatesReady}

        onSendRequest={() => this.sendRequest()}
        onLoadTemplate={(name: string) => this.loadTemplate(name)}
        onChangeEventJson={(newJson: string) => this.changeEventJson(newJson)}
      />
    );
  }
}

type EventDebugFormControllerProps = DebugPageProps;

interface EventDebugFormControllerState {
  eventJson: string;
  response: string;
};
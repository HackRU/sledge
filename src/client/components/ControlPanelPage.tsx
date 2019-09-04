import React from "react";

import {
  Form,
  Container,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  FormGroup,
  Label
} from "reactstrap";

import {ListSelect} from "./ListSelect";

export const ControlPanelPage = (props: ControlPanelPageProps) => (
  <Container id="ControlPanelPage">
    <h1>{`Admin Control Panel`}</h1>


    <Form>
      <h2>{`Assign Prize to Judge`}</h2>

      <FormGroup>
        <Label>{`Judge`}</Label>
        <ListSelect
          choices={props.judges}
          choiceIndex={props.assignPrizeToJudgeForm.judgeIndex}
          placeholderItem="Judge"
          onChange={(i) => alert(i)}
        />
      </FormGroup>

      <FormGroup>
        <Label>{`Prize`}</Label>
        <ListSelect
          choices={props.prizes}
          choiceIndex={props.assignPrizeToJudgeForm.prizeIndex}
          placeholderItem="Prize"
          onChange={(i) => alert(i)}
        />
      </FormGroup>

      <Button
        disabled={!isAssignPrizeToJudgeFormValid(props.assignPrizeToJudgeForm)}
        onClick={() => alert()}
      >
        {`GO`}
      </Button>
    </Form>
  </Container>
);

export interface ControlPanelPageProps {
  judges: Array<string>;
  prizes: Array<string>;
  assignPrizeToJudgeForm: AssignPrizeToJudgeForm;

  onAlterAssignPrizeToJudgeForm: (f: (o: AssignPrizeToJudgeForm) => AssignPrizeToJudgeForm) => void;
};

export interface AssignPrizeToJudgeForm {
  judgeIndex: number;
  prizeIndex: number;
};

function isAssignPrizeToJudgeFormValid(form: AssignPrizeToJudgeForm) {
  return form.judgeIndex >= 0 && form.prizeIndex >= 0;
}

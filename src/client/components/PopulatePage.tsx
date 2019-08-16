import React from "react";

import {
  Container,
  Input,
  ButtonGroup,
  Button
} from "reactstrap";

import {TextSubmit} from "./TextSubmit";
import {TabularActions} from "./TabularActions";
import {InputItem} from "./InputItem";

export interface PopulatePageProps {
  json: string;
  status: string;
  submissions: Array<{location: number, name: string, prizes: Array<number>}>;
  prizes: Array<{name: string}>;
  judges: Array<{name: string}>;
  categories: Array<{name: string}>;

  onLoadFromJson: (json: string) => void;
  onReset: () => void;
  onReloadFromLocalStorage: () => void;
  onRemoveSubmission: (submissionIndex: number) => void;
  onAssignSubmissionAllPrizes: (submissionIndex: number) => void;
  onChangeSubmissionLocation: (submissionIndex: number, newLocation: number) => void;
  onRemovePrize: (prizeIndex: number) => void;
  onRenamePrize: (prizeIndex: number, newName: string) => void;
  onAddJudge: (newJudgeName: string) => void;
  onRemoveJudge: (judgeIndex: number) => void;
  onAddCategory: (newCategoryName: string) => void;
  onRemoveCategory: (categoryIndex: number) => void;
  onPopulateServer: () => void;
  onStartJudging: () => void;
};

export const PopulatePage = (props: PopulatePageProps) => (
  <Container id="PopulatePage">
    <h1>{`Populate Data`}</h1>

    <h2>{`Load Data`}</h2>

    <InputItem
      name="From JSON"
      fields={["JSON Data"]}
      onAdd={json => props.onLoadFromJson(json[0])}
    />

    <ButtonGroup>
      <Button
        onClick={() => props.onReloadFromLocalStorage()}
      >
        {`Reload from LocalStorage`}
      </Button>
      <Button
        onClick={() => props.onReset()}
      >
        {`Reset`}
      </Button>
    </ButtonGroup>

    <h2>{`Submissions`}</h2>

    <TabularActions
      headings={["Location", "Name", "Prizes"]}
      data={props.submissions.map(
        submission => [
          submission.location.toString(),
          submission.name,
          submission.prizes.map(idx => props.prizes[idx].name).join(", ")
        ]
      )}
      actions={[{
        name: "Remove",
        cb: idx => props.onRemoveSubmission(idx)
      }, {
        name: "Assign All Prizes",
        cb: idx => props.onAssignSubmissionAllPrizes(idx)
      }, {
        name: "Change Location",
        cb: idx => {
          let newTableNumber = parseInt(prompt("New Loaction"));
          if (!Number.isNaN(newTableNumber)) {
            props.onChangeSubmissionLocation(idx, newTableNumber);
          }
        }
      }]}
    />

    <h2>{`Prizes`}</h2>

    <TabularActions
      headings={["Name"]}
      data={props.prizes.map(prize => [prize.name])}
      actions={[{
        name: "Remove",
        cb: idx => props.onRemovePrize(idx)
      }, {
        name: "Rename",
        cb: idx => {
          let newName = prompt("New Prize Name");
          if (newName !== null) {
            props.onRenamePrize(idx, newName);
          }
        }
      }]}
    />

    <h2>{`Judges`}</h2>

    <ButtonGroup>
      <Button
        onClick={() => {
          let name = prompt("Name for New Judge");
          if (name !== null) {
            props.onAddJudge(name);
          }
        }}
      >
        {`Add`}
      </Button>
    </ButtonGroup>

    <TabularActions
      headings={["Name"]}
      data={props.judges.map(
        judge => [judge.name]
      )}
      actions={[{
        name: "Remove",
        cb: idx => props.onRemoveJudge(idx)
      }]}
    />

    <h2>{`Categories`}</h2>

    <ButtonGroup>
      <Button
        onClick={() => {
          let name = prompt("New Category Name");
          if (name !== null) {
            props.onAddCategory(name);
          }
        }}
      >
        {`Add`}
      </Button>
    </ButtonGroup>

    <TabularActions
      headings={["Name"]}
      data={props.categories.map(
        cat => [cat.name]
      )}
      actions={[{
        name: "Remove",
        cb: idx => props.onRemoveCategory(idx)
      }]}
    />

    <h2>{`Populate on Server`}</h2>

    <ButtonGroup>
      <Button
        onClick={() => props.onPopulateServer()}
      >
        {`Populate Server`}
      </Button>
      <Button
        onClick={() => props.onStartJudging()}
      >
        {`Start Judging`}
      </Button>
    </ButtonGroup>

    <Input
      type="textarea"
      readOnly
      value={props.json}
    />

    <Input
      type="textarea"
      readOnly
      value={props.status}
    />
  </Container>
);

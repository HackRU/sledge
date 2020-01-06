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
  submissions: Array<{location: number, name: string, prizes: Array<number>, track: number}>;
  prizes: Array<{name: string}>;
  judges: Array<{name: string}>;
  categories: Array<{name: string, track: number}>;
  tracks: Array<{name: string}>;

  onLoadFromJson: (json: string) => void;
  onReset: () => void;
  onReloadFromLocalStorage: () => void;
  onRemoveSubmission: (submissionIndex: number) => void;
  onAssignSubmissionAllPrizes: (submissionIndex: number) => void;
  onChangeSubmissionLocation: (submissionIndex: number, newLocation: number) => void;
  onAddPrize: (prizeName: string) => void;
  onRemovePrize: (prizeIndex: number) => void;
  onRenamePrize: (prizeIndex: number, newName: string) => void;
  onAssignPrizeToAll: (prizeIndex: number) => void;
  onAddJudge: (newJudgeName: string) => void;
  onRemoveJudge: (judgeIndex: number) => void;
  onAddCategory: (newCategoryName: string) => void;
  onRemoveCategory: (categoryIndex: number) => void;
  onExpandCategory: (categoryIndex: number) => void;
  onAddTrack: (trackName: string) => void;
  onRemoveTrack: (trackIndex: number) => void;
  onRenameTrack: (trackIndex: number, newName: string) => void;
  onConvertPrizeToTrack: (trackIndex: number) => void;
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
      headings={["Location", "Name", "Track", "Prizes"]}
      data={props.submissions.map(
        submission => [
          submission.location.toString(),
          submission.name,
          props.tracks[submission.track].name,
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
          let newTableNumber = parseInt(prompt("New Loaction")||"0");
          if (!Number.isNaN(newTableNumber)) {
            props.onChangeSubmissionLocation(idx, newTableNumber);
          }
        }
      }]}
    />

    <h2>{`Tracks`}</h2>

    <ButtonGroup>
      <Button
        onClick={() => {
          const name = prompt("New Track", "name");
          if (name) {
            props.onAddTrack(name)
          }
        }}
      >
        {`Add Track`}
      </Button>
    </ButtonGroup>

    <TabularActions
      headings={["name"]}
      data={props.tracks.map(track => [track.name])}
      actions={[{
        name: "Remove",
        cb: idx => props.onRemoveTrack(idx)
      }, {
        name: "Rename",
        cb: idx => {
          const name = prompt("Rename Track");
          if (name) {
            props.onRenameTrack(idx, name)
          }
        }
      }]}
    />

    <h2>{`Prizes`}</h2>

    <ButtonGroup>
      <Button
        onClick={() => {
          const name = prompt("New Prize", "name");
          if (name) {
            props.onAddPrize(name)
          }
        }}
      >
        {`Add Prize`}
      </Button>
    </ButtonGroup>

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
      }, {
        name: "Convert to Track",
        cb: props.onConvertPrizeToTrack
      }, {
        name: "Assign to All",
        cb: props.onAssignPrizeToAll
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
        {`Add Judge`}
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
        {`Add Category`}
      </Button>
    </ButtonGroup>

    <TabularActions
      headings={["Name", "Track"]}
      data={props.categories.map(
        cat => [
          cat.name,
          props.tracks[cat.track].name
        ]
      )}
      actions={[{
        name: "Remove",
        cb: idx => props.onRemoveCategory(idx)
      }, {
        name: "Expand",
        cb: idx => props.onExpandCategory(idx)
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

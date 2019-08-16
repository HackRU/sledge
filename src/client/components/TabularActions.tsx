import * as React from "react";

import {
  Table,
  Button,
  ButtonGroup
} from "reactstrap";

const TabularActionsRow = (props: {
  actions: Array<Action>,
  columns: Array<string>,
  index: number
}) => (
  <tr key={props.index}>
    {props.columns.map((c,i) => (
      <td key={i}>{c}</td>
    ))}
    {props.actions.length > 0 && (
      <td key="actions">
        <ButtonGroup>
          {props.actions.map((a,i) => (
            <Button
              key={i}
              onClick={() => a.cb(props.index)}
            >
              {a.name}
            </Button>
          ))}
        </ButtonGroup>
      </td>
    )}
  </tr>
);

export const TabularActions = (props: TabularActionsProps) => (
  <Table hover>
    <thead>
      <tr>
        {props.headings.map(
          (h,i) => (<th key={i}>{h}</th>)
        )}
        {props.actions.length > 0 && (
          <th>{`Actions`}</th>
        )}
      </tr>
    </thead>
    <tbody>
      {props.data.map((columns, i) => (
        <TabularActionsRow
          key={i}
          actions={props.actions}
          columns={columns}
          index={i}
        />
      ))}
    </tbody>
  </Table>
);

export interface TabularActionsProps {
  headings: string[];
  data: Array<Array<string>>;
  actions: Array<Action>;
}

export interface Action {
  name: string;
  cb: (rowId:number) => void;
}

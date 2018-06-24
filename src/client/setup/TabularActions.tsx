import React from "react";

import {
  Table,
  Button,
  ButtonGroup
} from "reactstrap";

export class TabularActions extends React.Component<TabularActionsProps, State> {
  constructor(props:any) {
    super(props);

    this.state = {
    };
  }

  renderRow(row:Row): JSX.Element {
    return (
      <tr key={row.id}>
        {row.columns.map((c,i) => (<td key={i+"|"+c}>{c}</td>))}
        {this.props.actions.length > 0 ? [(
          <td key="actions">
            <ButtonGroup>
              {this.props.actions.map((a,ia) => (
                <Button
                  key={ia}
                  onClick={() => a.cb(row.id)}
                >{a.name}</Button>
              ))}
            </ButtonGroup>
          </td>)] : []}
      </tr>
    );
  }

  render() {
    return (
      <Table hover>
        <thead>
          <tr>
            {this.props.headings.map(
              (h,i) => (<th key={i+"|"+h}>{h}</th>)
            )}
            {this.props.actions.length > 0 ?
              [(<th key="actions">{`Actions`}</th>)] :
              []}
          </tr>
        </thead>
        <tbody>
          {this.props.rows.map(
            row => this.renderRow(row)
          )}
        </tbody>
      </Table>
    );
  }
}

export interface TabularActionsProps {
  headings: string[];
  rows: Array<Row>;
  actions: Array<Action>;
}

export interface Row {
  id: number;
  columns: string[];
}

export interface Action {
  name: string;
  cb: (rowId:number) => void;
}

interface State {
}

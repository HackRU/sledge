import React from "react";

import {
  Table,
  Button
} from "reactstrap";

export class ToggleMatrix extends React.Component<ToggleMatrixProps, State> {
  constructor(props:any) {
    super(props);
  }

  render() {
    return (
      <Table bordered size="sm" className="togglematrix">
        <thead>
          <tr>
            <td />
            {this.props.columns.map((col,j) => (
              <th key={j}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {this.props.rows.map((row,i) => (
            <tr key={i}>
              <th>{row}</th>
              {this.props.columns.map((col,j) => (
                <td key={j}>
                  <button
                    className={`togglematrix-button ${
                      this.props.matrix[j][i] ? "togglematrix-on" : "togglematrix-off"
                    }`}
                    onClick={() => this.props.onToggle(this.props.matrix[j][i], j, i)}
                  >{this.props.matrix[j][i]}</button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }
}

export interface ToggleMatrixProps {
  columns: string[];
  rows: string[];
  matrix: number[][];

  onToggle: (current:number, col:number, row:number) => void;
}

interface State {
}

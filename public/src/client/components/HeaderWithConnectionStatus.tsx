import React from "react";

import {ConnectionStatus} from "../JudgeTypes";

export const HeaderWithConnectionStatus = (props: HeaderWithConnectionStatusProps) => (
  <header className="masthead" style={{margin: "15px 30px"}}>
    <div className="inner">
      <h1 className="masthead-brand" style={{display: "inline", verticalAlign: "baseline"}}>{`Sledge`}</h1>
      <svg viewBox="0 0 100 100" height="35" width="35" style={{display: "inline", verticalAlign: "baseline"}}>
        <circle cx="50" cy="50" r="50" fill={getConnectionStatusColor(props.connectionStatus)} />
      </svg>
    </div>
  </header>
);

export interface HeaderWithConnectionStatusProps {
  connectionStatus: ConnectionStatus;
}

function getConnectionStatusColor(status: ConnectionStatus): string {
  switch (status) {
    case ConnectionStatus.Good:
      return "green";
    case ConnectionStatus.Weak:
      return "yellow";
    case ConnectionStatus.Disconnected:
      return "red";
    default:
      throw new Error(`Unhandled ConnectionStatus ${status}`);
  }
}

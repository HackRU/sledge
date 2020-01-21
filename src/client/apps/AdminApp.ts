import React from "react";
import { Socket } from "../Socket";
import { SledgeProvider } from "../SledgeProvider";
import { AdminPageProps, AdminPage } from "../components/AdminPage";

export class AdminApp extends React.Component<any, any> {
  socket: Socket;
  provider: SledgeProvider;

  constructor(props: any) {
    super(props);

    this.socket = new Socket();
    this.provider = new SledgeProvider(this.socket);
  }

  getPageProps(): AdminPageProps {
    return {
      dataProvider: this.provider
    };
  }

  render() {
    return React.createElement(
      AdminPage,
      this.getPageProps()
    );
  }
}

import React, { Fragment } from "react";
import { Admin, DataProvider, Resource, ListGuesser, List, Datagrid, NumberField, TextField, DateField } from "react-admin";
import { Route } from "react-router-dom";

export const AdminPage = (props: AdminPageProps) => (
  <Admin dataProvider={props.dataProvider} dashboard={Dashboard}>
    <Resource name="Status" list={StatusList} />
    <Resource name="Submission" list={SubmissionList} />
    <Resource name="Track" list={TrackList} />
    <Resource name="Judge" list={JudgeList} />
    <Resource name="Prize" list={PrizeList} />
    <Resource name="Category" list={CategoryList} />
    <Resource name="Assignment" list={AssignmentList} />
  </Admin>
);

const Dashboard = () => (
  <div>
    <p>{`Welcome to the admin's page!`}</p>
    <ul>
      <li><a href="/populate">{`Import a Devpost CSV`}</a></li>
      <li><a href="/controlpanel">{`Perform Admin Actions`}</a></li>
      <li><a href="/debug">{`Send a raw request to Sledge`}</a></li>
      <li><a href="/visualizeratings">{`View a table relating Judges and Submissions`}</a></li>
      <li><a href="/visualizeprizes">{`View a table relating Judges and Submissions by Prize`}</a></li>
    </ul>
  </div>
);

const StatusList = (props: any) => (
  <List {...props} bulkActionButtons={<Fragment />}>
    <Datagrid>
      <NumberField source="id" sortable={false} />
      <DateField showTime source="timestamp" sortable={false} />
      <NumberField source="phase" sortable={false} />
    </Datagrid>
  </List>
);

const SubmissionList = (props: any) => (
  <List {...props} bulkActionButtons={<Fragment />}>
    <Datagrid>
      <NumberField source="id" sortable={false} />
      <TextField source="name" sortable={false} />
      <NumberField source="trackId" sortable={false} />
      <NumberField source="location" sortable={false} />
      <NumberField source="active" sortable={false} />
    </Datagrid>
  </List>
);

const TrackList = (props: any) => (
  <List {...props} bulkActionButtons={<Fragment />}>
    <Datagrid>
      <NumberField source="id" sortable={false} />
      <TextField source="name" sortable={false} />
    </Datagrid>
  </List>
);

const JudgeList = (props: any) => (
  <List {...props} bulkActionButtons={<Fragment />}>
    <Datagrid>
      <NumberField source="id" sortable={false} />
      <TextField source="name" sortable={false} />
      <NumberField source="anchor" sortable={false} />
    </Datagrid>
  </List>
);

const PrizeList = (props: any) => (
  <List {...props} bulkActionButtons={<Fragment />}>
    <Datagrid>
      <NumberField source="id" sortable={false} />
      <TextField source="name" sortable={false} />
    </Datagrid>
  </List>
);

const CategoryList = (props: any) => (
  <List {...props} bulkActionButtons={<Fragment />}>
    <Datagrid>
      <NumberField source="id" sortable={false} />
      <TextField source="name" sortable={false} />
      <NumberField source="trackId" sortable={false} />
    </Datagrid>
  </List>
);

const AssignmentList = (props: any) => (
  <List {...props} bulkActionButtons={<Fragment />}>
    <Datagrid>
      <NumberField source="id" sortable={false} />
      <NumberField source="judgeId" sortable={false} />
      <NumberField source="priority" sortable={false} />
      <NumberField source="type" sortable={false} />
      <NumberField source="active" sortable={false} />
    </Datagrid>
  </List>
);

export interface AdminPageProps {
  dataProvider: DataProvider;
}

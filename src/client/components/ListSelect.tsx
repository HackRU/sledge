import React from "react";

import Select from "react-select";

export const ListSelect = (props: ListSelectProps) => (
  <Select
    value={
      props.choiceIndex < 0 ?
        {value: -1, label: `[Select a ${props.placeholderItem}]`} :
        {value: props.choiceIndex, label: props.choices[props.choiceIndex]}
    }
    options={
      props.choices.map((label, value) => ({label, value}))
    }
    onChange={
      (v, t) => t.action === "set-value" && props.onChange((v as any).value)
    }
  />
);

export interface ListSelectProps {
  choices: Array<string>;
  choiceIndex: number;
  placeholderItem: string;
  onChange: (newChoiceIndex: number) => void;
};

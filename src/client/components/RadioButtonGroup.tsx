import React from "react";

import {
  Button,
  ButtonGroup
} from "reactstrap";

export const RadioButtonGroup = (props: RadioButtonGroupProps) => (
  <ButtonGroup size={props.size} style={{width: "100%"}}>
    {props.options.map((option, i) => (
      <Button
        key={i}
        active={option.value === props.value}
        color={option.value === props.value ? "primary" : "secondary"}
        disabled={!!props.disabled}
        onClick={() => props.onChange(option.value)}
      >
        {option.label}
      </Button>
    ))}
  </ButtonGroup>
);

export interface RadioButtonGroupProps {
  options: Array<{value: number, label:string}>;
  value: number;
  size?: "sm" | "lg";
  disabled?: boolean;

  onChange: (value: number) => void;
}

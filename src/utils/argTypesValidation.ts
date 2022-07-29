import { Args, InputType } from "@storybook/csf";
import { ArgTypes } from "@storybook/react";

const hasBooleanControl = (inputType: InputType): boolean =>
  inputType.control === "boolean" || inputType.control?.type === "boolean";

const hasInvalidArgDefinition = (
  inputType: InputType,
  initialValue: any | undefined
): boolean => {
  if (!hasBooleanControl(inputType)) {
    return false;
  }

  if (typeof initialValue === "boolean") {
    return false;
  }

  return (
    inputType.type !== "boolean" && (inputType.type as any)?.name !== "boolean"
  );
};

// If a boolean control is specified without type _and_ without default value,
// then storybook can't parse it correctly.
// For more information, see: https://github.com/storybookjs/storybook/issues/18796
export const hasInvalidBooleanDefinitions = (
  argTypes: ArgTypes,
  args?: Args
): boolean => {
  return Object.entries(argTypes).some(([name, value]) =>
    hasInvalidArgDefinition(value, args?.[name])
  );
};

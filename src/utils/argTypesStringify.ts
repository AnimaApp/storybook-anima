import { ArgType, ArgTypes } from "@storybook/api";
import { isArray, mapValues } from "lodash";
import { isValidElement } from "react";
import { getReactElementDisplayName } from "./reactComponentName";

function stringifyReactElement(reactElement: React.ReactElement) {
  const eLChildren = reactElement.props?.children ?? [];

  const children = isArray(eLChildren) ? eLChildren : [eLChildren];

  return {
    ...reactElement,
    props: {
      ...(reactElement.props || {}),
      children: children.map(stringifyReactElement),
    },
    type: getReactElementDisplayName(reactElement),
    $$typeof: "react.element",
  };
}

function stringifyMappingValue(mappingValue: any) {
  if (isValidElement(mappingValue)) {
    return stringifyReactElement(mappingValue);
  }
  return mappingValue;
}

function stringifyArgType(argType: ArgType) {
  const res = { ...argType };
  if (argType.mapping) {
    res.mapping = mapValues(argType.mapping, stringifyMappingValue);
  }
  return res;
}

export function stringifyArgTypes(argTypes: ArgTypes): string {
  const types = mapValues(argTypes, stringifyArgType);
  return JSON.stringify(types);
}

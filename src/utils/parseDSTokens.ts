// Convert DTCG design tokens to a key value flat JSON object
// Some of the code is inspired by : https://github.com/Heydon/design-tokens-cli

import { camelCase, get, isArray, isObject, isString } from "lodash";
import ShortUniqueId from "short-unique-id";
import { Parser } from "expr-eval";
import { DSTokenMap, DSTokenType, ShadowToken } from "../types";
import { STRING_UNIT_TYPES } from "../constants";
const uid = new ShortUniqueId({ length: 6 });

const getStringWithUnit = (inp: string) => {
  if (!inp) return "";
  const re = /[^{\}]+(?=})/g;

  const matches = inp.match(re);

  if (matches && matches.length > 0) return inp;

  const n = parseFloat(inp),
    p = inp.match(/%|em/),
    output = isNaN(n) ? "" : p ? n + p[0] : Math.round(n) + "px";
  return output;
};

const getStringsWithUnit = (values: string[]): string[] => {
  return values.map(getStringWithUnit);
};

export const parseShadowObjectToString = (
  input: ShadowToken | ShadowToken[]
): string => {
  const toString = (shadow: ShadowToken) => {
    const [offsetX, offsetY, blur, spread, x, y] = getStringsWithUnit([
      shadow.offsetX,
      shadow.offsetY,
      shadow.blur,
      shadow.spread,
      shadow.x,
      shadow.y,
    ]);

    return `${shadow.color} ${offsetX ? offsetX : x} ${
      offsetY ? offsetY : y
    } ${blur} ${spread}`;
  };

  if (isArray(input)) {
    return input.map(toString).join(", ");
  }
  return toString(input);
};

const flattenJSON = (tokens: Record<string, any>) => {
  const existingObjects = [];
  const path = [];
  const tokensArrays = [];

  const addEntry = (entry: any) => {
    path.push(entry);
    tokensArrays.push([...path]);
    path.pop();
  };

  (function find(_tokens) {
    for (const key of Object.keys(_tokens)) {
      if (key === "$value" || key === "value") {
        const value = _tokens[key];
        const parent = get(tokens, `${path.join(".")}`);
        const type = parent?.$type || parent?.type;

        if (isString(value)) {
          addEntry({ value, type });
        } else if (isObject(value)) {
          if (type === "shadow" || type === "boxShadow") {
            const shadowToken = _tokens[key];
            const shadow = parseShadowObjectToString(shadowToken);
            addEntry({ value: shadow, type });
          }
        }
      }
      const o = _tokens[key];
      if (o && isObject(o) && !isArray(o)) {
        if (!existingObjects.find((_tokens) => _tokens === o)) {
          path.push(key);
          existingObjects.push(o);
          find(o);
          path.pop();
        }
      }
    }
  })(tokens);
  const newObject = {};
  tokensArrays.forEach((arr) => {
    const keys = arr.slice(0, -1).map((k) => {
      return k.split(" ").join("-");
    });
    const key = keys.join("-");
    const value = arr.at(-1);
    newObject[key] = value;
  });

  return sortKeys(newObject);
};

const sortKeys = (object: Record<string, any>): Record<string, any> => {
  const objectCopy = { ...object };

  return Object.keys(objectCopy)
    .sort()
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: objectCopy[key],
      }),
      {}
    );
};

const refToName = (refString: string) => {
  const cropped = refString.slice(1, -1).trim();
  return cropped.split(".").join("-").split(" ").join("-");
};

export { refToName };

export const findTrueValues = (groups: Record<string, any>) => {
  const newGroups = JSON.parse(JSON.stringify(groups));
  let justPairs = {};
  Object.keys(newGroups).forEach((group) => {
    Object.assign(justPairs, newGroups[group]);
  });

  for (const pair in justPairs) {
    let { value, type } = justPairs[pair];
    if (!isString(value)) continue;
    const re = /[^{\}]+(?=})/g;

    while (true) {
      const refs = value.match(re);
      if (!refs || refs.length === 0) break;

      const map = {};
      let expression = `${value}`.trim();
      for (const ref of refs) {
        expression = expression.replace(`{${ref}}`, camelCase(ref));
        const name = refToName(`{${ref}}`);
        map[camelCase(ref)] = justPairs[name]?.value;
      }

      try {
        value = Parser.evaluate(expression, map)?.toString();
      } catch (error) {
        value = "";
      }
    }
    if (STRING_UNIT_TYPES.includes(type)) {
      value = getStringWithUnit(value);
    }
    if (value) {
      justPairs[pair] = { type, value };
    } else {
      delete justPairs[pair];
    }
  }
  return justPairs;
};

const getDSTokenType = (obj: { value: string; type: string }): DSTokenType => {
  const { type, value } = obj;
  const isColor =
    type === "color" ||
    CSS.supports("color", value) ||
    CSS.supports("background-color", value);
  const isBoxShadow =
    type === "shadow" ||
    type === "boxShadow" ||
    CSS.supports("box-shadow", value);
  const isFontSize = type === "fontSizes" || CSS.supports("font-size", value);
  const isFontFamily =
    type === "fontFamily" ||
    type === "fontFamilies" ||
    CSS.supports("font-family", value);
  const isFontWeight =
    type === "fontWeight" ||
    type === "fontWeights" ||
    CSS.supports("font-weight", value);

  const isTextStyle = isFontSize || isFontFamily || isFontWeight;
  const isEffectStyle = isBoxShadow;

  const tokenType = isColor
    ? "PAINT"
    : isTextStyle
    ? "TEXT"
    : isEffectStyle
    ? "EFFECT"
    : "unknown";

  return tokenType;
};

const convertToDSTokenMap = (pairs: Record<string, any>): DSTokenMap => {
  return Object.keys(pairs).reduce<DSTokenMap>((prev, key) => {
    const type = getDSTokenType(pairs[key]);

    prev[key] = { id: uid(), name: key, value: pairs[key], type };
    return prev;
  }, {});
};

export const flattenToPairs = (json: Record<string, any>) => {
  const pairs = flattenJSON(json);
  return findTrueValues({ pairs });
};

export const convertDSToJSON = (json: Record<string, any>) => {
  const resolvedPairs = flattenToPairs(json);
  console.log(resolvedPairs);
  return convertToDSTokenMap(resolvedPairs);
};

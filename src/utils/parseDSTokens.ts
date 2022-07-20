// Convert DTCG design tokens to a key value flat JSON object
// Some of the code is inspired by : https://github.com/Heydon/design-tokens-cli

import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId({ length: 6 });

type DSToken = {
  name: string;
  value: string;
  id: string;
  type: string;
};

export type DSTokenMap = Record<string, DSToken>;

const flattenJSON = (tokens: Record<string, any>) => {
  const existingObjects = [];
  const path = [];
  const tokensArrays = [];
  (function find(tokens) {
    for (const key of Object.keys(tokens)) {
      if (key === "$value") {
        if (typeof tokens[key] === "string") {
          path.push(tokens[key]);
          tokensArrays.push([...path]);
          path.pop();
        } else if (typeof tokens[key] === "object") {
          let $values = tokens[key];
          for (const key in $values) {
            let pathCopy = [...path];
            pathCopy.push(key);
            pathCopy.push($values[key]);
            tokensArrays.push([...pathCopy]);
          }
        } else {
          throw new Error(`$value properties must be strings or objects.`);
        }
      }
      const o = tokens[key];
      if (o && typeof o === "object" && !Array.isArray(o)) {
        if (!existingObjects.find((tokens) => tokens === o)) {
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
  return Object.keys(object)
    .sort()
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: object[key],
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
    let val = justPairs[pair];
    while (val.startsWith("{")) {
      let name = refToName(justPairs[pair]);
      if (!justPairs[name]) {
        throw new Error(`The token reference name '${name}' does not exist.`);
      }
      val = justPairs[name];
    }
    justPairs[pair] = val;
  }
  return justPairs;
};

const getDSTokenTypeByValue = (value: string) => {
  const isColor =
    CSS.supports("color", value) || CSS.supports("background-color", value);
  const isBoxShadow = CSS.supports("box-shadow", value);
  const isFontSize = CSS.supports("font-size", value);
  const isFontFamily = CSS.supports("font-family", value);
  const isFontWeight = CSS.supports("font-weight", value);
  const isTextStyle = isFontSize || isFontFamily || isFontWeight;
  const isEffectStyle = isBoxShadow;

  const type = isColor
    ? "PaintStyle"
    : isTextStyle
    ? "TextStyle"
    : isEffectStyle
    ? "EffectStyle"
    : "unknown";

  return type;
};

const convertToDSTokenMap = (pairs: Record<string, string>): DSTokenMap => {
  return Object.keys(pairs).reduce<DSTokenMap>((prev, key) => {
    const value = pairs[key];
    const type = getDSTokenTypeByValue(value);

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
  return convertToDSTokenMap(resolvedPairs);
};

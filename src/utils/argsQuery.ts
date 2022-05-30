import { isPlainObject } from "lodash";
import deepEqual from "fast-deep-equal";
import qs, { IStringifyOptions } from "qs";

export const buildArgsParam = (initialArgs: any, args: any): string => {
  const update = deepDiff(initialArgs, args);
  if (!update || update === DEEPLY_EQUAL) return "";

  const object = Object.entries(update).reduce((acc, [key, value]) => {
    if (validateArgs(key, value)) return Object.assign(acc, { [key]: value });

    return acc;
  }, {});

  return qs
    .stringify(encodeSpecialValues(object), QS_OPTIONS)
    .replace(/ /g, "+")
    .split(";")
    .map((part: string) => part.replace("=", ":"))
    .join(";");
};

export const QS_OPTIONS: IStringifyOptions = {
  encode: false, // we handle URL encoding ourselves
  delimiter: ";", // we don't actually create multiple query params
  allowDots: true, // encode objects using dot notation: obj.key=val
  format: "RFC1738", // encode spaces using the + sign
  serializeDate: (date: Date) => `!date(${date.toISOString()})`,
};
const VALIDATION_REGEXP = /^[a-zA-Z0-9 _-]*$/;
const NUMBER_REGEXP = /^-?[0-9]+(\.[0-9]+)?$/;
export const DEEPLY_EQUAL = Symbol("Deeply equal");
const HEX_REGEXP = /^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i;
const COLOR_REGEXP =
  /^(rgba?|hsla?)\(([0-9]{1,3}),\s?([0-9]{1,3})%?,\s?([0-9]{1,3})%?,?\s?([0-9](\.[0-9]{1,2})?)?\)$/i;
export const deepDiff = (value: any, update: any): any => {
  if (typeof value !== typeof update) return update;
  if (deepEqual(value, update)) return DEEPLY_EQUAL;
  if (Array.isArray(value) && Array.isArray(update)) {
    const res = update.reduce((acc, upd, index) => {
      const diff = deepDiff(value[index], upd);
      if (diff !== DEEPLY_EQUAL) acc[index] = diff;
      return acc;
    }, new Array(update.length));
    if (update.length >= value.length) return res;
    return res.concat(new Array(value.length - update.length).fill(undefined));
  }
  if (isPlainObject(value) && isPlainObject(update)) {
    return Object.keys({ ...value, ...update }).reduce((acc, key) => {
      const diff = deepDiff(value?.[key], update?.[key]);
      return diff === DEEPLY_EQUAL ? acc : Object.assign(acc, { [key]: diff });
    }, {});
  }
  return update;
};

export const encodeSpecialValues = (value: unknown): any => {
  if (value === undefined) return "!undefined";
  if (value === null) return "!null";
  if (typeof value === "string") {
    if (HEX_REGEXP.test(value)) return `!hex(${value.slice(1)})`;
    if (COLOR_REGEXP.test(value)) return `!${value.replace(/[\s%]/g, "")}`;
    return value;
  }
  if (Array.isArray(value)) return value.map(encodeSpecialValues);
  if (isPlainObject(value)) {
    return Object.entries(value).reduce(
      (acc, [key, val]) =>
        Object.assign(acc, { [key]: encodeSpecialValues(val) }),
      {}
    );
  }
  return value;
};

export const validateArgs = (key = "", value: unknown): boolean => {
  if (key === null) return false;
  if (key === "" || !VALIDATION_REGEXP.test(key)) return false;
  if (value === null || value === undefined) return true; // encoded as `!null` or `!undefined`
  if (value instanceof Date) return true; // encoded as modified ISO string
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (typeof value === "string") {
    return (
      VALIDATION_REGEXP.test(value) ||
      NUMBER_REGEXP.test(value) ||
      HEX_REGEXP.test(value) ||
      COLOR_REGEXP.test(value)
    );
  }
  if (Array.isArray(value)) return value.every((v) => validateArgs(key, v));
  if (isPlainObject(value))
    return Object.entries(value).every(([k, v]) => validateArgs(k, v));
  return false;
};

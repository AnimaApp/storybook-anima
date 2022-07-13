import { isObject } from "lodash";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId({ length: 6 });

export const normalizeUserDSTokens = (dsJSON: Record<string, string>) => {
  if (!isObject(dsJSON)) return {};

  const map = {};
  for (const key in dsJSON) {
    const value = dsJSON[key];
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

    map[key] = { name: key, value, type, id: uid() };
  }

  return map;
};

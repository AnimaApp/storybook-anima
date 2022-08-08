import {
  flattenToPairs,
  findTrueValues,
  parseShadowObjectToString,
} from "../src/utils/parseDSTokens";

describe("Transform W3C design format to JSON", () => {
  describe("Flatten JSON", () => {
    test("single token", () => {
      const tokens = {
        "token-name": {
          $value: "token value",
          type: "other",
        },
      };

      const expected = {
        "token-name": { type: "other", value: "token value" },
      };

      const returned = flattenToPairs(tokens);
      expect(JSON.stringify(expected)).toEqual(JSON.stringify(returned));
    });
    test("multiple token", () => {
      const tokens = {
        "--primary": {
          $value: "#1976D2",
          $type: "color",
        },
        "--secondary": {
          $value: "#ffcd29",
          $type: "color",
        },
      };

      const expected = {
        "--primary": { type: "color", value: "#1976D2" },
        "--secondary": { type: "color", value: "#ffcd29" },
      };

      const returned = flattenToPairs(tokens);
      expect(JSON.stringify(expected)).toEqual(JSON.stringify(returned));
    });

    test("with description", () => {
      const tokens = {
        "button-background": {
          $value: "#777777",
          type: "color",
          $description:
            "The background color for buttons in their normal state.",
        },
      };

      const expected = {
        "button-background": { type: "color", value: "#777777" },
      };

      const returned = flattenToPairs(tokens);
      expect(JSON.stringify(expected)).toEqual(JSON.stringify(returned));
    });
    test("with groups and nested groups", () => {
      const tokens = {
        uno: {
          $value: "token value 1",
          type: "other",
        },
        group: {
          dos: {
            $value: "token value 2",
            type: "other",
          },
          "nested group": {
            tres: {
              $value: "token value 3",
              type: "other",
            },
            cuatro: {
              $value: "token value 4",
              type: "other",
            },
          },
        },
      };

      const expected = {
        "group-dos": { type: "other", value: "token value 2" },
        "group-nested-group-cuatro": { type: "other", value: "token value 4" },
        "group-nested-group-tres": { type: "other", value: "token value 3" },
        uno: { type: "other", value: "token value 1" },
      };

      const returned = flattenToPairs(tokens);
      expect(JSON.stringify(expected)).toEqual(JSON.stringify(returned));
    });
  });

  test("find/apply values if references are used", () => {
    const tokens = {
      color: {
        "color-a": { value: "#ffffff", type: "color" },
        "color-b": { value: "{color.a}", type: "color" },
        "color-c": { value: "{color.b}", type: "color" },
      },
    };

    const returned = findTrueValues(tokens);
    expect(returned["color-c"].value).toBe("#ffffff");
  });
});

describe("Parse Shadow Object to valid CSS string", () => {
  test("single value", () => {
    const shadow = {
      color: "#000000",
      x: "0",
      y: "2",
      blur: "4",
      spread: "0",
    };
    const expected = "#000000 0px 2px 4px 0px";
    const returned = parseShadowObjectToString(shadow);
    expect(returned).toBe(expected);
  }),
    test("multiple values", () => {
      const shadow = [
        {
          color: "#000000",
          x: "0",
          y: "2",
          blur: "4",
          spread: "0",
        },
        {
          color: "#ffffff",
          x: "4",
          y: "-2",
          blur: "4",
          spread: "1",
        },
      ];
      const expected = "#000000 0px 2px 4px 0px, #ffffff 4px -2px 4px 1px";
      const returned = parseShadowObjectToString(shadow);
      expect(returned).toBe(expected);
    });
});

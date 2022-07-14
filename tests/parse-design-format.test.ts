import { flattenToPairs, findTrueValues } from "../src/utils/parseDSTokens";

describe("Transform W3C design format to JSON", () => {
  describe("Flatten JSON", () => {
    test("single token", () => {
      const tokens = {
        "token-name": {
          $value: "token value",
        },
      };

      const expected = {
        "token-name": "token value",
      };

      const returned = flattenToPairs(tokens);
      console.log(returned);
      expect(JSON.stringify(expected)).toEqual(JSON.stringify(returned));
    });
    test("multiple token", () => {
      const tokens = {
        "--primary": {
          $value: "#1976D2",
        },
        "--secondary": {
          $value: "#ffcd29",
        },
      };

      const expected = {
        "--primary": "#1976D2",
        "--secondary": "#ffcd29",
      };

      const returned = flattenToPairs(tokens);
      expect(JSON.stringify(expected)).toEqual(JSON.stringify(returned));
    });

    test("with description", () => {
      const tokens = {
        "Button background": {
          $value: "#777777",
          $description:
            "The background color for buttons in their normal state.",
        },
      };

      const expected = {
        "Button-background": "#777777",
      };

      const returned = flattenToPairs(tokens);
      console.log(returned);
      expect(JSON.stringify(expected)).toEqual(JSON.stringify(returned));
    });
    test("with groups and nested groups", () => {
      const tokens = {
        "token uno": {
          $value: "token value 1",
        },
        "token group": {
          "token dos": {
            $value: "token value 2",
          },
          "nested token group": {
            "token tres": {
              $value: "token value 3",
            },
            "Token cuatro": {
              $value: "token value 4",
            },
          },
        },
      };

      const expected = {
        "token-group-nested-token-group-Token-cuatro": "token value 4",
        "token-group-nested-token-group-token-tres": "token value 3",
        "token-group-token-dos": "token value 2",
        "token-uno": "token value 1",
      };

      const returned = flattenToPairs(tokens);
      console.log(returned);
      expect(JSON.stringify(expected)).toEqual(JSON.stringify(returned));
    });
  });

  test("find/apply values if references are used", () => {
    const tokens = {
      color: {
        "color-a": "#ffffff",
        "color-b": "{color.a}",
        "color-c": "{color.b}",
      },
    };

    const returned = findTrueValues(tokens);
    expect(returned["color-c"]).toBe("#ffffff");
  });
});

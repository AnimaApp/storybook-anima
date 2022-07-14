import { flattenToPairs, findTrueValues } from "../src/utils/parseDSTokens";

describe("Transform W3C design format to JSON", () => {
  test("Converts tokens to (flat) JSON", () => {
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
    expect(JSON.stringify(expected).replace(/\s/g, "")).toEqual(
      JSON.stringify(returned).replace(/\s/g, "")
    );
  });
  test("find/apply values if references are used", () => {
    const tokens = {
      color: {
        "color-a": "#ffffff",
        "color-b": "{color.a}",
        "color-c": "{color.b}",
      },
    };

    const resolved = findTrueValues(tokens);
    console.log(resolved);
    expect(resolved["color-c"]).toBe("#ffffff");
  });
});

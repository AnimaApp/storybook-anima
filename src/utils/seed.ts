import {
  concat,
  find,
  first,
  flatMap,
  fromPairs,
  get,
  isArray,
  keys,
  map,
  mapValues,
  reduce,
  values,
  zip,
} from "lodash/fp";
import md5 from "object-hash";

import flatten, { unflatten } from "flat";

type CartesianData<T> = { [P in keyof T]: Array<T[P]> | any };

const xProduct = (vals: any[][]) =>
  reduce((a: any[][], b: any[]) =>
    flatMap((x: any) => map((y: any) => concat(x, [y]))(b))(a)
  )([[]])(vals);

const compile = <Props>(data: CartesianData<Props>) =>
  find((v) => isChoice(v), values(data))
    ? data
    : mapValues((v) => (isArray(v) ? choice(...v) : v), data);

const isChoice = (v: any) =>
  isArray(v) && v.length === 2 && first(v) === "$choice$";
const choice = (...choices: any) => ["$choice$", choices];
const nodeValue = (node: any) => get("1", node);

const runSeed = <Props>(seed: () => CartesianData<Props>) => {
  const data = flatten(seed(), { safe: true });
  const compiledData = compile(data);
  const fields = keys(compiledData);

  const rows = map(
    (p) => unflatten(fromPairs(zip(fields, p))) as Props,
    xProduct(
      map(
        (v) => (isChoice(v) ? nodeValue(v) : [v]),
        values<CartesianData<Props>>(compiledData as any)
      )
    )
  );
  return rows.map((e) => {
    return { ...e, hash: md5(e) };
  });
};

export { choice, runSeed };

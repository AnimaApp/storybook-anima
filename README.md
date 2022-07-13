<div align="center">
  <br/>
  <img src="https://user-images.githubusercontent.com/1323193/153215858-dc6b4ac3-411a-4cf0-8e56-b4460ee339d7.svg" width="280" alt="Storybook to Anima to Figma Addon"/>
  <br/>
  
  <h1>Storybook Anima addon</h1>

  <br/>
</div>

[Storybook](https://github.com/storybooks/storybook) addon that extracts the Storybook data and transforms stories into Figma components for a better design-development workflow.

Learn more about the motivations and benefits in our [our blog post](https://blog.animaapp.com/design-with-your-live-code-components-7f61e99b9bf0)

### Demo

  <div align="center">
  <img src="https://user-images.githubusercontent.com/1323193/155579455-2b9919de-41e7-4e6d-b067-12993833a172.gif" width="700px" alt="Storybook to Anima to Figma Addon"/>
  </div>

## Requirements

- Storybook@>=6.0.0
- [Anima Account](https://www.animaapp.com/figma)
- Sign up for [Anima's beta](https://form.typeform.com/to/eNOueDoh)
- [Anima's Figma plugin](https://www.figma.com/community/plugin/857346721138427857/Export-to-React%2C-HTML-%26-Vue-code-with-Anima)

This addon should work with any framework. If you find a case that the addon does not work, please open an issue.

> :warning: Currently, we only support Wepback builders, if you use a custom builder for storybook for example, `vite` or one of storybook's experimental features, please write to us or open an issue as the addon might not work as expected.

## Getting started

### 1. Install

```sh
npm install --save-dev storybook-anima --legacy-peer-deps
# yarn add -D storybook-anima
```

### 2. Register the addon in `.storybook/main.js`

```js
// .storybook/main.js
module.exports = {
  addons: ["storybook-anima"],
};
```

### 3. Set Anima access token

First get the access token from the Anima Figma plugin, or in your Anima team settings. Learn more about [how to get the token from Anima](https://www.loom.com/share/9f93c49c33824773afdb0fc4658c69e0?utm_source=github).

You can then set the access token as an environment variable called `STORYBOOK_ANIMA_TOKEN`.

You can create `.env` file in your project's root folder, or you can provide the environment variable as a command line parameter when building or dynamically running Storybook.

```shell
# .env
STORYBOOK_ANIMA_TOKEN="<paste your TOKEN here>"
```

# Design system tokens support

In order for Anima to export your stories to Figma using your design system tokens by turning them into Figma styles please follow these simple steps

Currently we support json files of this format

```json
// public/design-system-tokens.json
{
  "--primary": "#ffcd29",
  "--secondary": "#ffcd29",
  "--text-primary": "#b86200",
  "--text-secondary": "#1976D2"
}
```

By default Anima will try to look for a file called `design-system-tokens.json` in your Storybook static directory

Make sure you have the file added to your storybook static directory folder (`public` in this case)

```js
// .storybook/main.js

module.exports = {
  stories: [],
  addons: ["storybook-anima"],
  staticDirs: ["../public"], // tells storybook to use this directory as a static directory
};
```

Example : your project structure should look like something similar to this

```
root
├── .storybook
│   ├── preview.js
│   ├── main.js
│
├── public
│   ├── design-system-tokens.json
│   ├── ...
|
├── package.json
└── ....
```

OPTIONAL : if you want to rename your file to something different than `design-system-tokens.json` make sure to export a new parameter from your Storybook `preview.js`

```js
// .storybook/preview.js

export const parameters = {
  ...

  anima: {
    designTokens: {
      filename: 'my-tokens.json'
    },
  },
};


```

## Considerations

For the time being, this integration works best if the your stories composition consists of just the component itself, rather than complex stories with multiple examples or included documentation.

### In short, what you see in the Storybook story, is what you'll get in Figma.

## Limits on the number of variants

The addon currently limits the number of variants to a maximum of 1025 for any given story.
As a result, some props might be missing in the exported
components.

In the near future, we are going to provide some options to
customize which controls should be included or excluded during
the export process.

## Development

Run following commands in separate tabs to start development

```shell
npm run build
npm run dev
```

For more information visit : [Anima Storybook integration](https://blog.animaapp.com/design-with-your-live-code-components-7f61e99b9bf0)

## License

MIT © [Anima](https://www.animaapp.com)

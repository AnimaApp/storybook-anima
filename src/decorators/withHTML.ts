import { addons, makeDecorator } from '@storybook/addons';
import { EVENT_CODE_RECEIVED } from '../constants';

export const withHTML = makeDecorator({
  name: 'withHTML',
  parameterName: 'html',
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context, { parameters = {} }) => {
    setTimeout(() => {
      const channel = addons.getChannel();
      const rawHTML = storyFn(context);
      console.log(rawHTML)
      const rootSelector = parameters.root || '#root';
      const root = document.querySelector(rootSelector);
      console.log(root)
      let html = root ? root.innerHTML : `${rootSelector} not found.`;
      if (parameters.removeEmptyComments) {
        html = html.replace(/<!--\s*-->/g, '');
      }
      channel.emit(EVENT_CODE_RECEIVED, { html, options: parameters });
    }, 0);
    return storyFn(context);
  },
});

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}
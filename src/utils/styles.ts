import { createElementFromHTML } from "./helpers";

const GLOBAL_STYLES = `
`;

export const injectCustomStyles = () => {
  const customFont = document.querySelector("#anima-custom-font");
  !customFont &&
    document.head.appendChild(
      createElementFromHTML(
        `<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">`
      )
    ) &&
    document.head.appendChild(
      createElementFromHTML(
        `<style>.t{animation:3s cubic-bezier(.34,1.56,.64,1) 0s infinite normal forwards running t;transform-box:fill-box;transform-origin:0% 0%}@keyframes t{0%{transform:scale(0);opacity:0}3.33%{opacity:1}23.33%{transform:scale(1)}76.67%{opacity:1}80%{transform:scale(1)}93.33%{transform:scale(0);opacity:0}100%{transform:scale(0);opacity:0}}.c{animation:3s cubic-bezier(.34,1.56,.64,1) .5s infinite normal forwards running c;transform-box:fill-box;transform-origin:50% 50%}@keyframes c{0%{transform:scale(0);opacity:0}3.33%{opacity:1}23.33%{transform:scale(1)}76.67%{opacity:1}80%{transform:scale(1)}93.33%{transform:scale(0);opacity:0}100%{transform:scale(0);opacity:0}}.l{animation:3s cubic-bezier(.34,1.56,.64,1) .8s infinite normal forwards running l;transform-box:fill-box;transform-origin:50% 50%}@keyframes l{0%{transform:scale(0) rotateZ(-180deg);opacity:0}3.33%{opacity:1}23.33%{transform:scale(1)}50%{transform:rotateZ(0)}76.67%{opacity:1}80%{transform:scale(1)}93.33%{transform:scale(0);opacity:0}100%{transform:scale(0);opacity:0}}</style>`
      )
    ) &&
    document.head.appendChild(
      createElementFromHTML(`<style>${GLOBAL_STYLES}</style>`)
    );
};

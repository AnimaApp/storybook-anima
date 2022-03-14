import { createElementFromHTML } from "./helpers";

const GLOBAL_STYLES = `

.anima_export_banner {
  position: fixed;
  z-index: 998;
  bottom: 20px;
  right: 20px;
  height: 65px;
  min-Width: 200px;
  box-shadow: inset 0px 0px 0px 2px #505050;
  border-radius: 5px;
  overflow: hidden;
  font-family: Mulish, sans-serif;
}

.anima_export_banner_content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 15px;
  background-color:#3B3B3B;
  color:#fff;
}

.anima_export_banner_progress {
  position: absolute;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  overflow: hidden;
  background: #6F6F6F;
}

.anima_export_banner_progress_inner {
  background: #ff6250;
  width: var(--width);
  height: 100%;
  transition: width 0.2s ease;
  will-change: width;
}

.sb_popover_content{
  background-color: #3B3B3B;
  padding:10px 0;
  border-radius:5px;
  color:#fff;
  font-family: Mulish, sans-serif;
  font-size:14px;
  overflow:hidden;
}
.sb_popover_list{
  list-style:none;
  padding:0;
  margin:0;
  display:flex;
  flex-direction:column;
}
.sb_popover_list_item {
  padding:5px 20px;
  cursor:pointer;

}
.sb_popover_list_item:not(:last-child) {
  margin-bottom:5px;
}
.sb_popover_list_item:hover {
  color:#ff6250;
}

`;

export const injectCustomStyles = () => {
  const customFont = document.querySelector("#anima-custom-font");
  !customFont &&
    document.head.appendChild(
      createElementFromHTML(
        `<link rel="preconnect" href="https://fonts.googleapis.com">`
      )
    ) &&
    document.head.appendChild(
      createElementFromHTML(
        `<link  href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700&display=swap" rel="stylesheet">`
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

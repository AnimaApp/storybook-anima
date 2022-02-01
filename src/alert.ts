import { css } from "@storybook/theming";
import { createElementFromHTML } from "./utils";

export const createAlert = (text: string): HTMLElement => {
  const htmlTemplate = `
  <div style="${
    css`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
    `.styles
  }">
  <div style="${
    css`
      background: #222;
      border-radius: 5px;
      opacity: 0;
      transition: opacity 0.15s linear;
      box-shadow: 0 5px 17px #0003, 0 2px 7px #00000026,
        inset 0 0 0 1px var(--bg-overlay-inner-outline),
        0 0 0 1px var(--bg-overlay-outline);
    `.styles
  }">
    <div style="${
      css`
        position: relative;
        padding: 6px 16px;
      `.styles
    }">
      <div style="${
        css`
          display: flex;
          align-items: center;
        `.styles
      }">
      <svg
        style="margin-right: 10px;"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width="18"
        height="18"
        viewBox="0 0 32 32"
      >
        <rect width="32" height="32" fill="#3B3B3B" rx="4" />
        <path
          fill="#FF6250"
          d="M7.1287 6H24.353a.1262.1262 0 0 1 .1088.0586.1266.1266 0 0 1 .0072.1234 19.319 19.319 0 0 1-6.4955 7.4335c-4.4781 3.0214-8.9875 3.3334-10.8435 3.35a.1261.1261 0 0 1-.12-.0779.1282.1282 0 0 1-.01-.0494V6.1273A.1274.1274 0 0 1 7.1287 6Z"
        />
        <path
          fill="#FFDF90"
          d="M10.8461 25.9999c2.1241 0 3.846-1.7219 3.846-3.846 0-2.1242-1.7219-3.8461-3.846-3.8461C8.7219 18.3078 7 20.0297 7 22.1539c0 2.1241 1.722 3.846 3.8461 3.846Z"
        />
        <path
          fill="#36F"
          d="M18.708 25.7722c-1.088-.4153-1.6667-1.6127-1.298-2.6727l2.9034-8.2855c.372-1.06 1.5554-1.582 2.6434-1.1667 1.088.4161 1.6667 1.6127 1.298 2.6734l-2.9034 8.2855c-.372 1.06-1.5553 1.5827-2.6434 1.166Z"
        />
       </svg>
        <span style="${
          css`
            line-height: 24px;
            color: #fff;
            font-size: 14px;
            font-family: Inter, sans-serif;
          `.styles
        }" >${text}</span>
      </div>
    </div>
  </div>
  </div>`;

  return createElementFromHTML(htmlTemplate);
};

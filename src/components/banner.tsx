import { Channel } from "@storybook/addons";
import React, { useEffect, useState } from "react";
import { Transition } from "react-transition-group";
import {
  EXPORT_END,
  EXPORT_PROGRESS,
  EXPORT_START,
  TOGGLE_EXPORT_STATUS,
} from "../constants";

interface IProps {
  channel: Channel;
}

const Banner: React.FC<IProps> = (props) => {
  const defaultExportStatus = { current: 1, total: 1, storyName: "Story" };
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(defaultExportStatus);

  const transitions = {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
    exiting: {
      width: "0px",
      opacity: 1,
      display: "block",
    },
    exited: {
      width: "0px",
      opacity: 0,
      display: "none",
    },
  };

  const handleExportStart = ({ total = 1, storyName = "Story" } = {}) => {
    setProgress({ current: 1, total, storyName });
    setIsOpen(true);
  };
  const handleExportEnd = () => {
    setIsOpen(false);
    setProgress(defaultExportStatus);
  };
  const handleProgressUpdate = (progress) => {
    setProgress(progress);
  };
  const handleToggle = ({ show = false } = {}) => {
    setIsOpen(show);
  };

  useEffect(() => {
    props.channel.on(EXPORT_START, handleExportStart);
    props.channel.on(EXPORT_END, handleExportEnd);
    props.channel.on(EXPORT_PROGRESS, handleProgressUpdate);
    props.channel.on(TOGGLE_EXPORT_STATUS, handleToggle);

    return () => {
      props.channel.off(EXPORT_START, handleExportStart);
      props.channel.on(EXPORT_END, handleExportEnd);
      props.channel.off(TOGGLE_EXPORT_STATUS, handleProgressUpdate);
      props.channel.off(TOGGLE_EXPORT_STATUS, handleToggle);
    };
  });

  return (
    <Transition in={isOpen} timeout={100}>
      {(state) => (
        <div
          style={{
            willChange: "width",
            opacity: "0",
            transition: "all .2s",
            ...transitions[state],
          }}
          className="anima_export_banner"
        >
          <div className="anima_export_banner_content">
            <svg
              style={{ marginRight: "20px" }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              width="24"
              height="24"
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
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  marginBottom: "5px",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                Exporting {progress.storyName}
              </span>
              <span
                style={{
                  marginBottom: "5px",
                  fontWeight: 600,
                  fontSize: "10px",
                }}
              >
                {progress.current} / {progress.total} variants exported
              </span>
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default Banner;

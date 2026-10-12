import { useLayoutEffect, useRef } from "react";

// 내용이 길어지면 줄바꿈되며 높이가 아래로 늘어나는 textarea
export default function AutoGrowTextarea({ value, ...rest }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const resize = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [value]);

  return <textarea ref={ref} rows={1} value={value} {...rest} />;
}

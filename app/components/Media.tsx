import { useEffect, useRef, useState } from "react";
import type { Media } from "~/helper";

export const MediaComponent = (props: {
  sources: Media[];
  divWidth: number;
}) => {
  const { sources, divWidth } = props;
  const [media, setMedia] = useState<HTMLDivElement[]>();
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = Array.from(
      mediaRef.current!.querySelectorAll<HTMLDivElement>(".dpics")
    );
    setMedia(media);
  }, []);

  useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (
      media &&
      divWidth &&
      mediaRef.current!.clientWidth < divWidth + 52 &&
      document.body.clientWidth < 640
    ) {
      const length = media.length;
      if (length === 1) return;
      const nm = Array<HTMLDivElement>();
      let delay = 7000;
      setTimeout(() => {
        media.forEach((md, i) => {
          const content = md.firstElementChild;
          if (content?.tagName === "VIDEO") {
            const rcontent = content as HTMLMediaElement;
            delay = 2 * rcontent.duration * 1000;
          }
          let oldX = md.style.translate;
          oldX = oldX ? oldX.slice(0, oldX.indexOf("p")) : "0";
          const x = Number(oldX);
          const clientWidth = md.clientWidth;
          if (i === length - 1) {
            md.style.translate = `${-i * clientWidth + x - i * 10}px`;
            i = 0;
          } else {
            md.style.translate = `${clientWidth + x + 10}px`;
            i++;
          }
          nm[i] = md;
        });
        setMedia(nm);
      }, delay);
    }
    return () => {
      t && clearTimeout(t);
    };
  }, [media, divWidth]);

  return (
    <div ref={mediaRef} className="pics">
      {sources.map((m, i) => (
        <div key={i} className="dpics">
          {m.contentType.startsWith("image") ? (
            <img src={m.url} alt="App " />
          ) : (
            <video src={m.url} controls></video>
          )}
        </div>
      ))}
    </div>
  );
};

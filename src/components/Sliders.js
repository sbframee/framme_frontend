import React, { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";

const TypesOfOutlets = ({ item = [] }) => {
  const [position, setPosition] = useState(0);
  const pages = useMemo(
    () =>
      item
        ?.sort((a, b) => a.sort_order - b.sort_order)
        ?.map((a, i) => ({ index: i, src: a.posters })) || [],

    [item]
  );
  useEffect(() => {
    setPosition(pages[0]);
  }, [pages]);
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        // console.log(prev.index === pages.length - 1);

        return prev?.index === pages.length - 1
          ? pages[0]
          : pages.find((a) => a?.index === prev?.index + 1);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [pages]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setPosition((prev) =>
        prev.index === pages.length - 1
          ? pages[0]
          : pages.find((a) => a?.index === position?.index + 1)
      );
      console.log("swipeup");
    },
    onSwipedRight: () => {
      setPosition((prev) =>
        prev.index === 0
          ? prev
          : pages.find((a) => a?.index === prev?.index - 1)
      );
      console.log("swipedown");
    },
    delta: 60, // min distance(px) before a swipe starts. *See Notes*
    preventScrollOnSwipe: true, // prevents scroll during swipe (*See Details*)
    trackTouch: true, // track touch input
    trackMouse: true, // track mouse input
    rotationAngle: 0, // set a rotation angle
    swipeDuration: Infinity, // allowable duration of a swipe (ms). *See Notes*
    touchEventOptions: { passive: true },
  });
  return (
    <div
      {...handlers}
      style={{
        position: "relative",
        width: "100%",
        height: "fit-content",
        // borderRadius: "30px",
        // padding: "10px",
        // marginTop: "10px",
      }}
    >
      <div
        style={{
          position: "relative",
          objectFit: "contain",
          width: "100vw",
          height: "200px",
        //   backgroundColor:"black"
        }}
      >
        {pages.map((page, i) => (
          <motion.div
            key={i}
            className="container_main"
            // initial={{ rotate: 1 }}
            animate={{
              //   rotate: 0,
              //   top: "10",
              left: `${(page?.index - (position?.index || 0)) * 88 + 8}vw`,
            }}
            transition={{
              type: "tween",
              bounceStifafness: 260,
              bounceDamping: 20,
            }}
            style={{
              objectFit: "contain",
              width: "85vw",
              height: "25vh",
              borderRadius: "20px",
            }}
          >
            <img
              src={page?.src}
              style={{ objectFit: "fill", width: "100vw", height: "100vw" }}
              alt="abc"
            />
          </motion.div>
        ))}
      </div>
      <div id="scroll-btns-container">
        {pages.map((page, i) => (
          <button
            key={i}
            id={position.index === i ? "current" : ""}
            onClick={(e) => setPosition(page)}
          />
        ))}
      </div>
    </div>
  );
};

export default TypesOfOutlets;

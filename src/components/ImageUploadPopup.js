import React, { useState, useRef, useEffect, useCallback } from "react";

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import { canvasPreview } from "./canvasPreview";
import { useDebounceEffect } from "./useDebounceEffect";
import { BiRotateRight, BiRotateLeft } from "react-icons/bi";
import "react-image-crop/dist/ReactCrop.css";
import { GoMirror } from "react-icons/go";
import { Box, Slider } from "@mui/material";
import { styled } from "@mui/system";
const PrettoSlider = styled(Slider)({
  color: "#fff",
  height: 4,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 15,
    width: 15,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
      height: 24,
      width: 24,
    },
    "&:before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    color: "var(--main-color)",
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#fff",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&:before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
});
// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 100,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageUploadPopup({
  file,
  onClose,
  setSelectedFile,
  selectedimage,
  fixed,
}) {
  const [imgSrc, setImgSrc] = useState("");

  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState({
    height: 250,
    unit: "px",
    width: 250,
    x: 0,
    y: 0,
  });
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(1);
  const [scale, setScale] = useState(1);
  const [update, setupdat] = useState(false);

  function onSelectFile(file) {
    if (file) {
      setupdat(prev=>!prev)
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result.toString() || "")
      );
      reader.readAsDataURL(file);
    }
  }
  useEffect(() => {
    setTimeout(() => onSelectFile(file), 2000);
    // console.log(aspect, completedCrop);
  }, [file]);

  useEffect(() => {
    setTimeout(() => {
      if (fixed) {
        let coordinates = selectedimage?.a.split(",");
        let width = selectedimage?.b.split(",")[0] - coordinates[0];
        let height = selectedimage?.d.split(",")[1] - coordinates[1];

        setAspect((width || 250) / (height || 250));
        // setCrop(
        //   centerAspectCrop(width, height, (width || 250) / (height || 250))
        // );
      } else if (
        (imgRef?.current?.offsetWidth, imgRef?.current?.clientHeight)
      ) {
        setAspect(
          ((selectedimage?.circle
            ? selectedimage?.width
            : imgRef?.current?.offsetWidth) || 250) /
            ((selectedimage?.circle
              ? selectedimage?.height
              : imgRef?.current?.clientHeight) || 250)
        );
        setCrop(
          centerAspectCrop(
            (selectedimage?.circle
              ? selectedimage?.width
              : imgRef?.current?.offsetWidth) || 250,
            (selectedimage?.circle
              ? selectedimage?.height
              : imgRef?.current?.clientHeight) || 250,
            ((selectedimage?.circle
              ? selectedimage?.width
              : imgRef?.current?.offsetWidth) || 250) /
              ((selectedimage?.circle
                ? selectedimage?.height
                : imgRef?.current?.clientHeight) || 250)
          )
        );
      }
    }, 2000);
  }, [
    fixed,
    selectedimage?.a,
    selectedimage?.b,
    selectedimage?.circle,
    selectedimage?.d,
    selectedimage?.height,
    selectedimage?.width,
  ]);

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.

        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate,update]
  );

  console.log(crop, completedCrop, fixed);
  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_header">
          <h3>Upload Image</h3>
          <div className="exit_btn" onClick={onClose}>
            X
          </div>
        </div>
        <div
          className="popup_body"
          style={{ overflowY: "scroll", height: "max-content" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "column",
              maxHeight: "100vh",
            }}
          >
            {Boolean(completedCrop) && (
              <canvas
                id="alpha"
                ref={previewCanvasRef}
                style={{
                  border: "1px solid black",
                  objectFit: "contain",
                  width: completedCrop.width,
                  height: completedCrop.height,
                  display: "none",
                }}
              />
            )}
            {Boolean(imgSrc) && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) =>
                  setCrop(
                    (prev) =>
                      // fixed
                      //   ? { ...prev, x: percentCrop?.x, y: percentCrop?.y }
                      //   :
                      percentCrop
                  )
                }
                onComplete={(c) =>
                  setCompletedCrop(
                    // fixed ? { ...prev, x: c.x, y: c.y } :
                    c
                  )
                }
                aspect={aspect}
                style={{ marginTop: "20px" }}
                circularCrop={selectedimage?.circle}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    height: "250px",
                    maxHeight: "50vh",
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <BiRotateLeft
              onClick={() => {
                setRotate((prev) =>
                  prev - 90 === -360
                    ? 0
                    : Math.min(360, Math.max(-360, Number(prev - 90)))
                );
              }}
              style={{ width: "50%", fontSize: "20px", cursor: "pointer" }}
            />
            <GoMirror
              onClick={() => {
                setScale((prev) => (prev === 1 ? -1 : 1));
                setRotate((prev) => prev + 180);
              }}
              style={{ width: "50%", fontSize: "20px", cursor: "pointer" }}
            />
            <BiRotateRight
              onClick={() => {
                setRotate((prev) =>
                  prev + 90 === 360
                    ? 0
                    : Math.min(360, Math.max(-360, Number(prev + 90)))
                );
              }}
              style={{ width: "50%", fontSize: "20px", cursor: "pointer" }}
            />
          </div>
          <div
            className="flex"
            style={{ width: "100%", backgroundColor: "var(--main-color)" }}
          >
            <PrettoSlider
              aria-label="pretto slider"
              valueLabelDisplay="auto"
              value={scale * 25 || 0}
              onChange={(e) => setScale(Math.abs(e.target.value / 25))}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              var canvas = document.getElementById("alpha");

              canvas?.toBlob((blob) => {
                setSelectedFile(blob, "pretty image.png");
                onClose();
              });
            }}
            style={{ position: "relative", top: "0", left: "0" }}
            className="inputButton"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

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
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageUploadPopup({ file, onClose, setSelectedFile }) {
  const [imgSrc, setImgSrc] = useState("");

  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState({
    height: 100,
    unit: "px",
    width: 100,
    x: 0,
    y: 0,
  });
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);
  const [scale, setScale] = useState(1);

  function onSelectFile(file) {
    if (file) {
      setCrop(
        centerAspectCrop(completedCrop?.width, completedCrop?.height, aspect)
      ); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result.toString() || "")
      );
      reader.readAsDataURL(file);
    }
  }
  useEffect(() => {
    onSelectFile(file);
  }, [file]);
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
    [completedCrop, scale, rotate]
  );

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else if (imgRef.current) {
      const { width, height } = imgRef.current;
      setAspect(16 / 9);
      setCrop(centerAspectCrop(width, height, 16 / 9));
    }
  }
  useEffect(() => {
    handleToggleAspectClick();
  }, []);
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
              maxHeight: "400px",
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
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                style={{ marginTop: "20px" }}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    height: "200px",
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

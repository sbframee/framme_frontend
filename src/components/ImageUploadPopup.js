import React, { useState, useRef, useEffect } from "react";

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
    height: 300,
    unit: "px",
    width: 400,
    x: 0,
    y: 0,
  });
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);
  const [scale, setScale] = useState(1);

  function onSelectFile(file) {
    if (file) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result.toString() || "")
      );
      reader.readAsDataURL(file);
    }
  }
  useEffect(() => {
    onSelectFile(file);
  }, []);
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
    <div className="popup_bg">
      <div className="popup">
        <div className="popup_header">
          <h3>Upload Image</h3>
          <div className="exit_btn" onClick={onClose}>
            X
          </div>
        </div>
        <div className="popup_body" style={{ overflowY: "scroll" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {Boolean(imgSrc) && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    width: "400px",
                    maxHeight: "50vh",
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
            {Boolean(completedCrop) && (
              <canvas
                id="alpha"
                ref={previewCanvasRef}
                style={{
                  border: "1px solid black",
                  objectFit: "contain",
                  width: completedCrop.width,
                  height: completedCrop.height,
                }}
              />
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

          <button
            type="button"
            onClick={() => {
              var canvas = document.getElementById("alpha");

              canvas?.toBlob((blob) => {
                setSelectedFile(blob, "pretty image.png");
                onClose();
              });
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

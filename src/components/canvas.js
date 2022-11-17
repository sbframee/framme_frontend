import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import getStroke from "perfect-freehand";
import axios from "axios";
import { v4 as uuid } from "uuid";
const generator = rough.generator();
const createElement = (id, x1, y1, x2, y2, type, ratioX, ratioY) => {
  const roughElement = generator.rectangle(
    x1,
    y1,
    ratioX ? ratioX * (y2 - y1) : x2 - x1,
    y2 - y1
  );
  return { id, x1, y1, x2, y2, type, roughElement };
};

const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? "inside" : null;
};

const positionWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    case "rectangle":
      const topLeft = nearPoint(x, y, x1, y1, "tl");
      const topRight = nearPoint(x, y, x2, y1, "tr");
      const bottomLeft = nearPoint(x, y, x1, y2, "bl");
      const bottomRight = nearPoint(x, y, x2, y2, "br");
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;

    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getElementAtPosition = (x, y, elements) => {
  return elements
    .map((element) => ({
      ...element,
      position: positionWithinElement(x, y, element),
    }))
    .find((element) => element.position !== null);
};

const adjustElementCoordinates = (element) => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

const cursorForPosition = (position) => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

const resizedCoordinates = (
  clientX,
  clientY,
  position,
  coordinates,
  ratioX,
  ratioY
) => {
  const { x1, y1, x2, y2 } = coordinates;
  console.log(clientX, clientY, position, coordinates);
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null; //should not really get here...
  }
};

const useHistory = (initialState) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action, overwrite = false) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prevState) => prevState + 1);
    }
  };

  const undo = () => index > 0 && setIndex((prevState) => prevState - 1);
  const redo = () =>
    index < history.length - 1 && setIndex((prevState) => prevState + 1);

  return [history[index], setState, undo, redo];
};

const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};

const drawElement = (roughCanvas, context, element) => {
  switch (element.type) {
    case "line":
    case "rectangle":
      roughCanvas.draw(element.roughElement);
      break;
    case "pencil":
      const stroke = getSvgPathFromStroke(getStroke(element.points));
      context.fill(new Path2D(stroke));
      break;
    case "text":
      context.textBaseline = "top";
      context.font = "24px sans-serif";
      context.fillText(element.text, element.x1, element.y1);
      break;
    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

const adjustmentRequired = (type) => ["line", "rectangle"].includes(type);

const Canvas = ({
  imageArea,
  setImageData,
  ImageData,
  templateHoldersData,
  tempstate,
  setTempState,
}) => {
  const [elements, setElements, undo, redo] = useHistory([]);
  const [action, setAction] = useState("none");
  const [inputValues, setInputValues] = useState({});
  const [ElementId, setElementId] = useState();
  const [tool, setTool] = useState("none");
  const [selectedElement, setSelectedElement] = useState(null);
  const textAreaRef = useRef();
  const [tag, setTag] = useState("");
  const [tagsData, setTagsData] = useState([]);
  const [templateHolders, setTemplateHolders] = useState("");
  const getTagsData = async () => {
    const response = await axios({ method: "get", url: "/tags/getTags" });
    console.log(response);
    if (response.data.success) {
      setTagsData(response.data.result);
    }
  };
  useEffect(() => {
    getTagsData();
  }, []);
  useEffect(() => {
    if (tempstate) {
      setElements([]);
      setTempState(false);
    }
  }, [tempstate]);
  useEffect(
    () =>
      setImageData({
        ...ImageData,
        holder: elements.map((element) => ({
          ...element,
          a: `${element.x1},${element.y1}`,
          b: `${element.x2},${element.y1}`,
          c: `${element.x2},${element.y2}`,
          d: `${element.x1},${element.y2}`,
        })),
      }),
    [elements]
  );
  useEffect(
    (data) => {
      setElements(
        templateHoldersData
          .find((a) => a.ht_uuid === templateHolders)
          ?.holder?.map((element, i) => ({
            ...element,
            ...createElement(
              elements.length + i,
              +element.a.split(",")[0],
              +element.a.split(",")[1],
              +element.c.split(",")[0],
              +element.c.split(",")[1],
              "rectangle"
            ),
          })) || []
      );
    },
    [templateHolders]
  );
  // useEffect(()=>{
  //     if(elements.length>1)
  //     setElements( elements.filter((value, index, self) =>
  //   index === self.findIndex((t) => (
  //     t.id === value.id
  //   ))
  // ))
  // },[elements])
  console.log(templateHoldersData, templateHolders, elements);
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      if (action === "writing" && selectedElement.id === element.id) return;
      drawElement(roughCanvas, context, element);
    });
  }, [elements, action, selectedElement]);

  useEffect(() => {
    const undoRedoFunction = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (action === "writing") {
      textArea.focus();
      textArea.value = selectedElement.text;
    }
  }, [action, selectedElement]);

  const updateElement = (
    id,
    x1,
    y1,
    x2,
    y2,
    type,

    values = {}
  ) => {
    const elementsCopy = [...elements];
    let ratioX = +values?.width / +values?.height;
    let ratioY = +values?.height / +values?.width;
    elementsCopy[id] = {
      ...values,
      ...createElement(
        id,
        x1,
        y1,
        values?.fixed ? x1 + ratioX * (y2 - y1) : x2,
        y2,
        type
      ),
    };
    if (!elementsCopy[id].uuid) setElements(elementsCopy, true);
  };
  const DoubleClickHandel = (event) => {
    const { clientX, clientY } = {
      ...event,
      clientX: event.clientX - 100,
      clientY: event.clientX - 50,
    };
    const element = getElementAtPosition(clientX, clientY, elements);
    if (
      element &&
      !elements.find(
        (a) => a.label_uuid === element?.label_uuid || a.id === element.id
      )?.fixed
    ) {
      console.log(element);
      setElementId({ uuid: element?.uuid, id: element?.id });
    }
  };
  const handleMouseDown = (event) => {
    const { clientX, clientY } = {
      ...event,
      clientX: event.clientX - 100,
      clientY: event.clientY - 50,
    };
    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        if (element.type === "pencil") {
          const xOffsets = element.points.map((point) => clientX - point.x);
          const yOffsets = element.points.map((point) => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          console.log("element", element);
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        console.log("before", elements);
        setElements((prevState) => prevState);
        console.log("after", elements);

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else if (tool === "copy") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        const id = elements.length;
        let newElement = createElement(
          id,
          element.x1 + 100,
          element.y1,
          element.x2 + 100,
          element.y2,
          "rectangle"
        );
        newElement = { ...element, ...newElement };
        newElement.uuid = uuid();
        setElements((prevState) => [...prevState, newElement]);
      }
    } else if (tool === "delete") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        setElements((prevState) =>
          prevState.filter((a) => a.id !== element.id)
        );
      }
    } else {
      let element = getElementAtPosition(clientX, clientY, elements);
      if (!element) {
        const id = elements.length;
        element = createElement(id, clientX, clientY, clientX, clientY, tool);
        element.uuid = uuid();
        setElements((prevState) => [...prevState, element]);
        setSelectedElement(element);
        setAction(tool === "text" ? "writing" : "drawing");
      } else {
        if (element.type === "pencil") {
          const xOffsets = element.points.map((point) => clientX - point.x);
          const yOffsets = element.points.map((point) => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setElements((prevState) => prevState);

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    }
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = {
      ...event,
      clientX: event.clientX - 100,
      clientY: event.clientY - 50,
    };

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      event.target.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      if (selectedElement.type === "pencil") {
        const newPoints = selectedElement.points.map((_, index) => ({
          x: clientX - selectedElement.xOffsets[index],
          y: clientY - selectedElement.yOffsets[index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = {
          ...elementsCopy[selectedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = clientX - offsetX;
        const newY1 = clientY - offsetY;
        updateElement(
          id,
          newX1,
          newY1,
          newX1 + width,
          newY1 + height,
          type,
          selectedElement
        );
      }
    } else if (action === "resizing") {
      const { id, type, position, ...coordinates } = selectedElement;
      console.log("selectedElement", selectedElement);

      const { x1, y1, x2, y2 } = resizedCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );
      updateElement(id, x1, y1, x2, y2, type, selectedElement);
    }
  };

  const handleMouseUp = (event) => {
    const { clientX, clientY } = {
      ...event,
      clientX: event.clientX - 100,
      clientY: event.clientY - 50,
    };

    if (selectedElement) {
      if (
        selectedElement.type === "text" &&
        clientX - selectedElement.offsetX === selectedElement.x1 &&
        clientY - selectedElement.offsetY === selectedElement.y1
      ) {
        setAction("writing");
        return;
      }

      const index = selectedElement.id;
      // console.log("uuid", selectedElement)
      const { id, type } = elements[index];
      if (
        (action === "drawing" || action === "resizing") &&
        adjustmentRequired(type)
      ) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type, elements[index]);
      }
      console.log("data", selectedElement);
      if (type === "rectangle" && !selectedElement.fixed) {
        console.log(selectedElement);
        setElementId({ uuid: selectedElement?.uuid, id: selectedElement?.id });
      }
    }

    if (action === "writing") return;
    setAction("none");
    setSelectedElement(null);
  };
  const addRectangle = () => {
    if (inputValues.width && inputValues.height) {
      let id = elements.length;
      let x1 = imageArea?.current?.offsetWidth / 2;
      let y1 = imageArea?.current?.offsetHeight / 2;
      let element = createElement(
        id,
        x1,
        y1,
        +inputValues.width + x1,
        +inputValues.height + y1,
        "rectangle"
      );

      setElements((prevState) => [...prevState, element]);
      setElementId(id);
    }
  };
  const addOldRectangle = () => {
    if (tag.width && tag.height) {
      let id = elements.length;
      let x1 = imageArea?.current?.offsetWidth / 2;
      let y1 = imageArea?.current?.offsetHeight / 2;
      let element = createElement(
        id,
        x1,
        y1,
        +tag.width + x1,
        +tag.height + y1,
        "rectangle"
      );

      // setElements([...elements,element])
      setElements((prevState) => [
        ...prevState,
        { ...element, ...tag, label_uuid: tag?.tag_uuid, fixed: true },
      ]);
      setTag("");
    }
  };

  const onChangeHandler = (e) => {
    if (e.target.value === "none") {
      setTag("");
      return;
    }

    setTag(tagsData.find((a) => a.tag_uuid === e.target?.value));
  };
  console.log(elements);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: `${imageArea?.current?.offsetWidth || "100%"}`,
          height: `${imageArea?.current?.offsetHeight || "100%"}`,
        }}
      >
        <div
          className="flex"
          style={{
            position: "fixed",
            bottom: "30px",
            flexDirection: "column",
            left: "10px",
            zIndex: "9999999999999",
            alignItems: "flex-start",
          }}
        >
          <div>Options</div>

          <label htmlFor="selection">
            <input
              type="radio"
              id="selection"
              checked={tool === "selection"}
              onChange={() => setTool("selection")}
            />
            Selection
          </label>

          <label htmlFor="rectangle">
            <input
              type="radio"
              id="rectangle"
              checked={tool === "rectangle"}
              onChange={() => setTool("rectangle")}
            />
            Rectangle
          </label>
          <label htmlFor="rectangle">
            <input
              type="radio"
              id="delete"
              checked={tool === "delete"}
              onChange={() => setTool("delete")}
            />
            Delete
          </label>
          <label htmlFor="rectangle">
            <input
              type="radio"
              id="copy"
              checked={tool === "copy"}
              onChange={() => setTool("copy")}
            />
            Copy
          </label>
          {/* 
                <input type="radio" id="text" checked={tool === "text"} onChange={() => setTool("text")} />
                <label htmlFor="text">Text</label> */}
        </div>
        <div
          style={{
            position: "fixed",
            bottom: "250px",
            left: "10px",
            zIndex: "999999999999999",
          }}
        >
          <div>Saved Tags</div>
          <select
            value={templateHolders.ht_uuid}
            onChange={(e) => setTemplateHolders(e.target.value)}
            style={{ width: "90px" }}
          >
            <option value={""}>None</option>
            {templateHoldersData.map((data) => (
              <option value={data.ht_uuid}>{data.ht_title}</option>
            ))}
          </select>
        </div>
        <div
          className="flex"
          style={{
            position: "fixed",
            bottom: "150px",
            flexDirection: "column",
            left: "10px",
            zIndex: "9999999999999",
            alignItems: "flex-start",
            width: "100px",
          }}
        >
          <div>Custome Tags</div>
          <input
            type="text"
            placeholder="width"
            id="width"
            style={{ width: "90px" }}
            value={inputValues?.width}
            onChange={(e) =>
              setInputValues({
                ...inputValues,
                width: e.target.value.replace(/\D/, ""),
              })
            }
          />
          <input
            type="text"
            placeholder="height"
            id="height"
            value={inputValues?.height}
            style={{ width: "90px" }}
            onChange={(e) =>
              setInputValues({
                ...inputValues,
                height: e.target.value.replace(/\D/, ""),
              })
            }
          />
          <button
            className="flex"
            style={{
              padding: "2px 5px",
              backgroundColor: "var(--main-color)",
              border: "none",
              color: "#fff",
            }}
            type="button"
            onClick={addRectangle}
          >
            Add
          </button>
        </div>
        <div
          className="flex"
          style={{
            position: "fixed",
            bottom: "300px",
            flexDirection: "column",
            left: "10px",
            zIndex: "9999999999999",
            alignItems: "flex-start",
            width: "100px",
          }}
        >
          <div>Add Tags</div>
          <select
            // className="label_popup_input"
            // style={{ width: "200px" }}
            value={tag?.tag_uuid}
            onChange={onChangeHandler}
          >
            {/* <option selected={occasionsTemp.length===occasionsData.length} value="all">All</option> */}
            <option value="none">None</option>
            {tagsData.map((cat) => (
              <option value={cat.tag_uuid}>{cat.tag_title}</option>
            ))}
          </select>

          <button
            className="flex"
            style={{
              padding: "2px 5px",
              backgroundColor: "var(--main-color)",
              border: "none",
              color: "#fff",
            }}
            type="button"
            onClick={addOldRectangle}
          >
            Add
          </button>
        </div>

        <canvas
          id="canvas"
          width={imageArea?.current?.offsetWidth}
          height={imageArea?.current?.offsetHeight}
          onMouseDown={handleMouseDown}
          onDoubleClick={DoubleClickHandel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          Canvas
        </canvas>
      </div>
      {ElementId ? (
        <NamePopup
          tagsData={tagsData}
          setElements={setElements}
          elements={elements}
          uuid={ElementId}
          close={() => setElementId(null)}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default Canvas;
const NamePopup = ({ setElements, tagsData, elements, uuid, close }) => {
  const [tag, setTag] = useState({});
  useEffect(() => {
    let item = elements.find(
      (a) => a.label_uuid === uuid?.label_uuid || a.id === uuid.id
    );
    console.log("item", item);
    setTag({
      tag_uuid: item?.label_uuid || tagsData[0]?.tag_uuid || "",
      text_color: item?.text_color || tagsData[0]?.text_color || "#000",
      fontFamily: item?.fontFamily || tagsData[0]?.fontFamily || "sans-serif",
    });
  }, []);
  const saveHandler = (data) => {
    if (data) {
      setElements(
        elements.map((a) =>
          a.id === uuid.id
            ? {
                ...a,
                label_uuid: data.tag_uuid,
                text_color: data.text_color,
                fontFamily: data.fontFamily,
              }
            : a
        )
      );
      console.log(
        "data",
        elements.map((a) =>
          a.id === uuid.id ? { ...a, label_uuid: data } : a
        ),
        uuid
      );
      close();
    }
  };
  return (
    <div className="label_popup_container">
      <div className="label_popup">
        <div className="label_popup_header">Input Label</div>
        <div className="exit_icon" onClick={close}>
          x
        </div>
        <select
          value={tag.tag_uuid}
          onChange={(e) => setTag({ ...tag, tag_uuid: e.target.value })}
        >
          {tagsData.map((tagItem) => (
            <option value={tagItem.tag_uuid}>{tagItem.tag_title}</option>
          ))}
        </select>
        {tagsData?.find((a) => a?.tag_uuid === tag?.tag_uuid)?.tag_type ===
        "T" ? (
          <>
            <div style={{ fontSize: "18px" }}>
              Text color
              <input
                placeholder="#000"
                value={tag.text_color}
                onChange={(e) => setTag({ ...tag, text_color: e.target.value })}
              />
            </div>
            <div style={{ fontSize: "18px", fontFamily: tag.fontFamily }}>
              <span>Font Style: </span>
              <select
                placeholder="#000"
                value={tag.fontFamily}
                onChange={(e) => setTag({ ...tag, fontFamily: e.target.value })}
              >
                <option value="sans-serif" style={{ fontFamily: "sans-serif" }}>
                  Normal
                </option>
                <option value="Roboto" style={{ fontFamily: "Roboto" }}>
                  Roboto
                </option>
                <option value="Fascinate" style={{ fontFamily: "Fascinate" }}>
                  Fascinate
                </option>
                <option value="Lato" style={{ fontFamily: "Lato" }}>
                  Lato
                </option>
                <option
                  value="Montserrat Alternates"
                  style={{ fontFamily: "Montserrat Alternates" }}
                >
                  Montserrat Alternates
                </option>
                <option value="Open Sans" style={{ fontFamily: "Open Sans" }}>
                  Open Sans
                </option>
                <option value="Oswald" style={{ fontFamily: "Oswald" }}>
                  Oswald
                </option>
                <option
                  value="Raleway Dots"
                  style={{ fontFamily: "Raleway Dots" }}
                >
                  Raleway Dots
                </option>
                <option
                  value="Rubik Moonrocks"
                  style={{ fontFamily: "Rubik Moonrocks" }}
                >
                  Rubik Moonrocks
                </option>
                <option value="Slabo 27px" style={{ fontFamily: "Slabo 27px" }}>
                  Slabo
                </option>
                <option value="Smooch" style={{ fontFamily: "Smooch" }}>
                  Smooch
                </option>
                <option value="Titan One" style={{ fontFamily: "Titan One" }}>
                  Titan One
                </option>
              </select>
            </div>
          </>
        ) : (
          ""
        )}
        <button
          type="button"
          style={{ padding: "8px 12px", fontSize: "20px", borderRadius: "0" }}
          className="save_button"
          onClick={() => saveHandler(tag)}
        >
          Save
        </button>
      </div>
    </div>
  );
};

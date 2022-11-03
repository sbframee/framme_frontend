const Card = ({
  selectedOrder,

  rounded,

  selectedCounter,
  setSelectOrder,
  order,
}) => {
  return (
    <>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectOrder(true);
        }}
      >
        <button
          className={`card-focus 
            ${rounded ? "rounded" : ""} 
            ${selectedOrder ? "selected-seat" : selectedCounter ? "" : ""}
            `}
          style={{ margin: "5px" }}
        >
          <div
            className={`card ${rounded ? "rounded" : ""}`}
            style={{
              padding: "10px 15px",
              gap: "2px",
              backgroundColor: order.order_status === "A" ? "#00edff" : "#fff",
              position: "relative",
            }}
          >
            {order?.img_url ? (
              <img
                src={order?.img_url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              ""
            )}
            {order?.user_title || order?.user_name ? (
              <h1
                className="flex"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  wordWrap:"break-word"
                }}
              >
                {order?.user_title || order?.user_name}
              </h1>
            ) : (
              ""
            )}
          </div>
        </button>
      </div>
    </>
  );
};

export default Card;

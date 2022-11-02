import "./Sidebar.css";

import PostersPopup from "./PostersPopup";
import React, { useMemo, useState } from "react";
import "./style.css";
import NavLink from "./Navlink";
import {
  AutoAwesomeMosaicOutlined as MasterIcon,
  AssessmentOutlined as ReportsIcon,
  FlashOn as QuickAccessIcon,
  SettingsOutlined as SettingsIcon,
  UpgradeOutlined,
} from "@mui/icons-material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useLocation } from "react-router-dom";
const SideBar = () => {
  const [posterPopup, setPosterPopup] = useState(false);

  return (
    <>
      <div
        className="left-panel"
        style={{ position: "relative", zIndex: "9000000" }}
      >
        <div className="nav" style={{ height: "calc(100vh - 100px)",marginTop:"100px" }}>
          <NavLink
            title={"Master"}
            icon={<MasterIcon sx={{ fontSize: 50 }} />}
            isActive={true}
            menuList={[
              {
                name: "Occasion",
                link: "/occasion",
              },
              {
                name: "Categories",
                link: "/category",
              },
              {
                name: "Tags",
                link: "/tags",
              },
              {
                name: "Users",
                link: "/user_data",
              },
              {
                name: "User Category",
                link: "/user_category",
              },
              {
                name: "WA Boot",
                link: "/waBoot",
              },
              
            ]}
          />

          <NavLink
            setIsItemAvilableOpen={setPosterPopup}
            title={"Quick Access"}
            icon={<QuickAccessIcon sx={{ fontSize: 50 }} />}
            isActive={false}
            menuList={[
              {
                name: "Poster",
                link: "#",
              },
            ]}
          />
          {/* <NavLink
            title={"Report"}
            icon={<AssessmentIcon sx={{ fontSize: 50 }} />}
            isActive={false}
            menuList={[
              {
                name: "User Activity",
                link: "/admin/userActivity",
              },
              {
                name: "UPI and Cheque Transaction",
                link: "/admin/upiTransactionReport",
              },
              {
                name: "Completed Orders",
                link: "/admin/completeOrderReport",
              },
              {
                name: "Items Wise",
                link: "/admin/OrderItemReport",
              },
              {
                name: "Completed Trips",
                link: "/admin/CompletedTripsReport",
              },
              {
                name: "Counter Ledger",
                link: "/admin/CounterLeger",
              },
              {
                name: "Outstandings",
                link: "/admin/Outstandings",
              },
              {
                name: "Pending Entry",
                link: "/admin/pendingEntry",
              },
              {
                name: "Current Stock",
                link: "/admin/currentStock",
              },
              {
                name: "Vochers",
                link: "/admin/stockTransferVochers",
              },
              {
                name: "Cancel Order",
                link: "/admin/cancelOrders",
              },
              {
                name: "Invoice Number Wise Order",
                link: "/admin/InvoiceNumberWiseOrder",
              },
              {
                name: "Party Wise Company Discount",
                link: "/admin/PartyWiseCompanyDiscount",
              },
              {
                name: "Retailer Margin Report",
                link: "/admin/RetailerMarginReport",
              },
            ]}
          /> */}
          {/* <NavLink
            title={"Setup"}
            icon={<SettingsIcon sx={{ fontSize: 50 }} />}
            isActive={false}
            menuList={[
              {
                name: "Auto Increase Quantity",
                link: "/admin/autoIncreaseQty",
              },
              {
                name: "Auto Add Item",
                link: "/admin/autoIncreaseItem",
              },
              {
                name: "Order Range Incentive",
                link: "/admin/OrderRangeIncentive",
              },
              {
                name: "Delivery Incentive",
                link: "/admin/DeliveryIncentive",
              },
              {
                name: "Order Item Incentive",
                link: "/admin/ItemIncentive",
              },
              {
                name: "Salesman Item Suggestion",
                link: "/admin/SalesmanItemSuggestion",
              },
            ]}
          /> */}
        </div>
      </div>

      {posterPopup ? <PostersPopup onSave={() => setPosterPopup(false)} /> : ""}
    </>
  );
};

export default SideBar;

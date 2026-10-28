import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navtoggle } from "../../../store/actions/AuthActions";

/// React router dom

import { ThemeContext } from "../../../context/ThemeContext";
import DoctorLogo from "./DoctorLogo";

const NavHader = () => {
  const dispatch = useDispatch();
  const sideMenu = useSelector((state) => state.sideMenu);
  const handleToogle = () => {
    dispatch(navtoggle());
  };
  const { navigationHader, openMenuToggle, background } = useContext(
    ThemeContext
  );
  const isDark = background.value === "dark" || navigationHader !== "color_1";

  return (
    <div className="nav-header">
      <div className="brand-logo d-none d-md-flex" style={{ alignItems: "center", cursor: "default", pointerEvents: "none" }}>
        <DoctorLogo isDark={isDark} className="logo-abbr" />
      </div>

      <div
        className="nav-control"
        onClick={() => {
          // setToggle(!toggle);
          handleToogle()
          openMenuToggle();
        }}
      >
        <div className={`hamburger ${sideMenu ? "is-active" : ""}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </div>
    </div>
  );
};

export default NavHader;

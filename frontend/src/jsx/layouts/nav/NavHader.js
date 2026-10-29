import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navtoggle } from "../../../store/actions/AuthActions";

/// React router dom

import { ThemeContext } from "../../../context/ThemeContext";
import logoArabic from "../../../images/logo-arabic.png";
import logoArabicWhite from "../../../images/logo-arabic-white.png";

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
      <div
        className="brand-logo d-none d-md-flex"
        style={{
          alignItems: "center",
          justifyContent: sideMenu ? "center" : "flex-start",
          paddingLeft: sideMenu ? "0" : "20px",
          paddingRight: "15px",
          cursor: "default",
          pointerEvents: "none",
        }}
      >
        <img
          src={isDark ? logoArabicWhite : logoArabic}
          alt="الدكتورة ن. بلبشير ولد هنية"
          style={{
            maxHeight: "30px",
            maxWidth: sideMenu ? "48px" : "190px",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            transition: "all 0.2s ease",
          }}
        />
      </div>

      <div
        className="nav-control"
        onClick={() => {
          // setToggle(!toggle);
          handleToogle();
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

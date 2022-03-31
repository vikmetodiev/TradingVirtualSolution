/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useGlobalContext } from "../../hooks/useGlobalContext";

export function Navbar({showProgress, buttonClass = ""}): JSX.Element {
  const { multisender: context } = useGlobalContext();
  return (
    <nav className="navbar">
      <div className="navbar__wrap">
        <div className="navbar__logo">
          <a href="#">
            <img src="/images/logo-2.svg" alt="*" />
          </a>
        </div>

        <div className="navbar__progress">
          {showProgress && <ul>
            <li
              className={
                context.phase === "PREPERATION" ? "active-step" : undefined
              }
            >
              <span></span>
              <p>PPEPARATION</p>
            </li>
            <li
              className={
                context.phase === "CONFIRMATION" ? "active-step" : undefined
              }
            >
              <span></span>
              <p>THE CONFIRMATION</p>
            </li>
            <li
              className={
                context.phase === "MAILING" ? "active-step" : undefined
              }
            >
              <span></span>
              <p>MAILING</p>
            </li>
          </ul>}
        </div>

        <div className="navbar__search">
          <form action="">
            <input type="text" placeholder="SEARCH" />
            <button type="submit">
              <svg>
                <use xlinkHref="/icons/sprite.svg#icon-search"></use>
              </svg>
            </button>
          </form>

          <div className={"navbar__login primary__login " + buttonClass}>
            <button>
              <span>
                <svg>
                <use xlinkHref="/icons/sprite.svg#icon-lock"></use>
                </svg>
                <p className="login__button__text">Login</p>
              </span>
            </button>
            {/* <button>
              <span>
                <svg>
                  <use xlinkHref="/icons/sprite.svg#icon-bell"></use>
                </svg>
              </span>
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
}

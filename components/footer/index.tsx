import React from "react";
// import { useGlobalContext } from "../../hooks/useGlobalContext";

export function Footer(): JSX.Element {
  //   const { multisender: context } = useGlobalContext();
  return (
    <footer className="footer">
      <div className="footer__wrap">
        <div className="left_footer">
            <p className="copyright_text">Copyright</p>
        </div>
        <div className="right_footer">
          <ul>
            <li>
              <span><svg>
                <use xlinkHref="/icons/sprite.svg#icon-twitter"></use>
              </svg></span>
            </li>
            <li>
              <span><svg>
                <use xlinkHref="/icons/sprite.svg#icon-plane"></use>
              </svg></span>
            </li>
            <li>
              <span><svg>
                <use xlinkHref="/icons/sprite.svg#icon-discord"></use>
              </svg></span>
            </li>
            <li>
              <span><svg>
                <use xlinkHref="/icons/sprite.svg#icon-face"></use>
              </svg></span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

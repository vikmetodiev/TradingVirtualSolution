import { useRouter } from "next/dist/client/router";
import React from "react";

export function BuilderSidebar(): JSX.Element {
  const router = useRouter();

  return (
    <aside className="sidebar">
      <ul>
        <li>
          <a
            href="/"
            className={
              router.pathname === "/" ? "link-active link-secondary-active home" : ""
            }
          >
            <span>
              <svg>
                <use xlinkHref="/icons/sprite.svg#icon-home"></use>
              </svg>
            </span>

            <p>Home</p>
          </a>
        </li>
        <li>
          <a
            href="/builder"
            className={
              router.pathname.startsWith("/builder")
                ? "link-active link-secondary-active builder"
                : ""
            }
          >
            <span>
              <svg>
                <use xlinkHref="/icons/sprite.svg#icon-zigzag"></use>
              </svg>
            </span>

            <p>MINTING</p>
          </a>
        </li>
        <li>
          <a
            href="/about"
            className={
              router.pathname.startsWith("/about")
                ? "link-active link-secondary-active home"
                : ""
            }
          >
            <span>
              <svg>
                <use xlinkHref="/icons/sprite.svg#icon-book"></use>
              </svg>
            </span>

            <p>About Us</p>
          </a>
        </li>

        <li>
          <a
            href="/auditing"
            className={
              router.pathname.startsWith("/auditing")
                ? "link-active link-secondary-active auditing"
                : ""
            }
          >
            <span>
              <svg>
                <use xlinkHref="/icons/sprite.svg#icon-virus"></use>
              </svg>
            </span>

            <p>AUDITING</p>
          </a>
        </li>
        <li>
          <a href="/bulksender"
            className={
              router.pathname.startsWith("/bulksender")
                ? "link-active multisender"
                : ""
            }>
            <span>
              <svg>
                <use xlinkHref="/icons/sprite.svg#icon-layer"></use>
              </svg>
            </span>

            <p>MULTISENDER</p>
          </a>
        </li>
        <li>
          <a
            href="/presale/create"
            className={
              router.pathname.startsWith("/presale/create")
                ? "link-active link-secondary-active presale"
                : ""
            }
          >
            <span>
              <svg>
                <use xlinkHref="/icons/sprite.svg#icon-graph"></use>
              </svg>
            </span>

            <p>Presale</p>
          </a>
        </li>
        <li>
          <a
            href="/manage/presale"
            className={
              router.pathname.startsWith("/manage/presale")
                ? "link-active link-secondary-active"
                : ""
            }
          >
            <span>
              <svg>
                <use xlinkHref="/icons/sprite.svg#icon-chat"></use>
              </svg>
            </span>

            <p>Manage Presale</p>
          </a>
        </li>
        <li>
          <a href="/faq"
            className={
              router.pathname.startsWith("/faq")
                ? "link-active link-secondary-active home"
                : ""
            }>
            <span>
              <svg>
                <use xlinkHref="icons/sprite.svg#icon-question-mark"></use>
              </svg>
            </span>

            <p>FAQ</p>
          </a>
        </li>
      </ul>
    </aside>
  );
}

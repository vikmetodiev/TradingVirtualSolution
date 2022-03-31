import React from 'react';

export function SecondaryNavbar(): JSX.Element {
 
  return (
   <nav className="navbar navbar-secondary">
            <div className="navbar__wrap">
                <div className="navbar__logo">
                    <a href="#"><img src="/images/logo-2.svg" alt=""/></a>
                </div>

                <div className="navbar__progress">
                </div>

                <div className="navbar__search">

                    <div className="navbar__notify secondary__notify">

                        <button>
                            <span>
                                <svg>
                                    <use xlinkHref='/icons/sprite.svg#icon-bell'></use>
                                </svg>
                            </span>
                        </button>

                    </div>

                </div>

            </div>
        </nav>
  );
}

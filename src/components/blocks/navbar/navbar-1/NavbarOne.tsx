"use client";

import { Fragment, ReactElement, SetStateAction, useRef } from "react";
// -------- CUSTOM HOOKS -------- //
import useSticky from "@/hooks/useSticky";
import useNestedDropdown from "@/hooks/useNestedDropdown";
// -------- CUSTOM COMPONENTS -------- //
//import NextLink from "@/components/reuseable/links/Link";
import Image from "next/image";
import Link from "next/link";
// LOCAL CUSTOM COMPONENTS
import HeaderRight from "../components/header-right";
import FancyHeader from "../components/fancy-header";
import crselogo from "../../../../assets/img/crselogo.png";

// ===================================================================
interface NavbarProps {
  info?: boolean;
  cart?: boolean;
  fancy?: boolean;
  logoAlt?: string;
  search?: boolean;
  social?: boolean;
  language?: boolean;
  stickyBox?: boolean;
  navClassName?: string;
  button?: ReactElement;
  navOtherClass?: string;
}
// ===================================================================

export default function NavbarOne({
  fancy,
  button,
  logoAlt,
  cart = false,
  info = false,
  social = false,
  search = false,
  language = false,
  stickyBox = true,
  navOtherClass = "navbar-other w-100 d-flex ms-auto",
  navClassName = "navbar navbar-expand-lg center-nav transparent navbar-light mt-5 mb-5"
}: NavbarProps) {
  useNestedDropdown();
  const sticky = useSticky(350);
  const navbarRef = useRef<HTMLElement | null>(null);

  // dynamically render the logo


  // dynamically added navbar className
  const fixedClassName = "navbar navbar-expand-lg center-nav transparent navbar-light navbar-clone fixed ";

  // all main header contents
  const headerContent = (
    <Fragment>
      <div className="navbar-brand w-100">
        <Link href="/" >
          <Image
            src={crselogo}

            alt="logo firmy JP"

            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '65px',
            }}
          />
        </Link>
      </div>

      <div id="offcanvas-nav" data-bs-scroll="true" className="navbar-collapse offcanvas offcanvas-nav offcanvas-start">
        <div className="offcanvas-header d-lg-none">
          <h3 className="text-white fs-30 mb-0">CRSE</h3>
          <button type="button" aria-label="Close" data-bs-dismiss="offcanvas" className="btn-close btn-close-white" />
        </div>

        <div className="offcanvas-body ms-lg-auto d-flex flex-column h-100">
          <ul className="navbar-nav ">
            {/* <PagesNavItem /> */}
            <li><Link className="nav-link fs-20" href="/o-projekcie">O Projekcie</Link></li>

            <li><Link className="nav-link fs-20" href="/aktualnosci">Aktualności</Link></li>
            <li><Link className="nav-link fs-20" href="/rekrutacja">Rekrutacja</Link></li>
            <li><Link className="nav-link fs-20" href="/kontakt">Kontakt</Link></li>
          </ul>


          {/* ============= show contact info in the small device sidebar ============= */}
          <div className="offcanvas-footer d-lg-none">
            <div>
              <Link title="info@email.com" className="link-inverse" href="mailto:first.last@email.com" />
              <br />
              <Link href="tel:0123456789" title="00 (123) 456 78 90" />
              <br />
              {/* <SocialLinks /> */}
            </div>
          </div>
        </div>
      </div>

      {/* ============= right side header content ============= */}
      <HeaderRight
        cart={cart}
        info={info}
        button={button}
        search={search}
        social={social}
        language={language}
        navOtherClass={navOtherClass}
        colorModeSwitcher={false}
      />
    </Fragment>
  );

  return (
    <Fragment>
      {stickyBox ? <div style={{ paddingTop: sticky ? navbarRef.current?.clientHeight : 0 }} /> : null}

      <nav ref={navbarRef} className={sticky ? fixedClassName : navClassName}>
        {fancy ? (
          <FancyHeader>{headerContent}</FancyHeader>
        ) : (
          <div className="container flex-lg-row flex-nowrap align-items-center">{headerContent}</div>

        )}
      </nav>
    </Fragment>
  );
}

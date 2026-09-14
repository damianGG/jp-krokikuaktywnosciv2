
import Link from "next/link";
// CUSTOM UTILS
import { slideInDownAnimate, zoomInAnimate } from "@/utils/animation";
import Image from "next/image";
import ContactForm from "../form/form";
import PopupForm from "../form/popupform";

// import DietetykPhoto from "lubelskie1.jpg";


export default function Hero4({
  title = '\u201eKroki ku Aktywno\u015bci: Bierna Kobieta, Aktywna Zmiana!\u201d',
  subtitle = 'Okres realizacji: 01.06.2026-31.05.2027',
  imageUrl = 'https://github.com/user-attachments/assets/3cea04b8-34bd-4e1b-b103-02fa562f0d7c',
}: {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}) {

  return (
    <section className="wrapper bg-light">
      <div className="container pt-8 pt-md-14">
        <div className="row gx-lg-0 gx-xl-8 gy-10 gy-md-13 gy-lg-0 mb-7 mb-md-10 mb-lg-16 align-items-center">
          <div
            className="col-md-8 offset-md-2 col-lg-6 offset-lg-1 position-relative order-lg-2"
            style={zoomInAnimate("0ms")}>
            <div className="shape bg-dot primary rellax w-17 h-19" style={{ top: "-1.7rem", left: "-1.5rem" }} />
            <div
              className="shape rounded bg-soft-primary rellax d-md-block"
              style={{ width: "85%", height: "90%", right: "-0.8rem", bottom: "-1.8rem" }}
            />
            <figure className="rounded">
              <Image
                src={imageUrl}
                width={1536}
                height={1024}
                alt="Warsztaty stolarskie na stronie głównej"
                unoptimized
              />

            </figure>
          </div>



          <div className="col-lg-5 mt-lg-n10 text-center text-lg-start">
            <h1 className="display-1 mb-3 fs-40" style={slideInDownAnimate("600ms")}>
              {title}
            </h1>
            {subtitle && (
              <p className="lead mb-5" style={slideInDownAnimate("900ms")}>
                {subtitle}
              </p>
            )}
            <div className="d-flex justify-content-center justify-content-lg-start">

              <span style={slideInDownAnimate("1200ms")}>
                <PopupForm />
              </span>


              <span style={slideInDownAnimate("1200ms")}>
                <Link href="/aktualnosci" className="btn btn-lg btn-outline-primary rounded-pill" >Aktualności</Link>
              </span>
            </div>
          </div>
        </div>

      </div>
    </section >
  );
}

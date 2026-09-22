import Link from "next/link";
import { getContactContent } from '@/lib/actions/contact';

export default async function Footer2() {
  const content = await getContactContent();

  return (
    <footer className="bg-soft-primary">
      <div className="container pb-12 text-center pt-10">
        <div className="row mt-n10 mt-lg-0">
          <div className="col-xl-10 mx-auto">
            <div className="row mb-3 gy-6">
              <div className="col-md-3">
                <div className="widget">
                  <p className="widget-title fs-15 fw-bold d-flex align-items-center justify-content-center gap-2"><i className="uil uil-map fs-25 flex-shrink-0" aria-hidden="true" /><span>Adres (Biuro projektu)</span></p>
                  {content.officeAddress && <address style={{ whiteSpace: 'pre-line' }}>{content.officeAddress}</address>}
                </div>
              </div>
              <div className="col-md-3">
                <div className="widget">
                  <p className="widget-title fs-15 fw-bold d-flex align-items-center justify-content-center gap-2"><i className="uil uil-phone-alt fs-25 flex-shrink-0" aria-hidden="true" /><span>Telefon</span></p>
                  {content.phone && <Link href={`tel:${content.phone}`} className="link-primary">{content.phone}</Link>}
                </div>
              </div>
              <div className="col-md-3">
                <div className="widget">
                  <p className="widget-title fs-15 fw-bold d-flex align-items-center justify-content-center gap-2"><i className="uil uil-envelope fs-25 flex-shrink-0" aria-hidden="true" /><span>e-mail</span></p>
                  {content.email && <Link href={`mailto:${content.email}`} className="link-primary">{content.email}</Link>}
                </div>
              </div>
              <div className="col-md-3">
                <div className="widget">
                  <p className="widget-title fs-15 fw-bold d-flex align-items-center justify-content-center gap-2"><i className="uil uil-facebook-f fs-25 flex-shrink-0" aria-hidden="true" /><span>Facebook</span></p>
                  {content.facebookUrl && (
                    <Link href={content.facebookUrl} className="link-primary" target="_blank" rel="noopener noreferrer">
                      {content.facebookLabel || content.organizationName}
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {content.officeHours && <p>{content.officeHours}</p>}
          </div>
        </div>
        {content.footerText && <p className="fs-15">{content.footerText}</p>}
      </div>
    </footer>
  );
}

import type { Metadata } from 'next'
import Link from 'next/link';
import { getContactContent } from '@/lib/actions/contact';
export const metadata: Metadata = {
    title: 'Kontakt - Kroki ku Aktywności',
    description: 'Dane kontaktowe biura projektu Kroki ku Aktywności',
}
export default async function Kontakt() {
    const content = await getContactContent();

    return (
        <>
            <section
                className="wrapper"
                style={{
                    position: 'relative',
                    backgroundPosition: 'right',
                    backgroundImage: "url('/img/flaga-ue-tlo.png')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div
                    className="overlay"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                />
                <div
                    className="container pt-5 pb-5 pt-md-10 pb-md-10 text-center"
                    style={{ position: 'relative', zIndex: 1 }}
                >
                    <div className="row">
                        <div className="col-md-9 col-lg-7 col-xl-5 mx-auto">
                            <h1 className="display-1 mb-3" style={{ color: 'white' }}>
                                Kontakt
                            </h1>
                            <p className="lead px-xxl-10"></p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container pt-5 pb-15">
                <div className="row">
                    <div className="col text-center">
                        <h2>{content.officeTitle}</h2>
                        {content.officeAddress && <p><strong>Adres:</strong> <span style={{ whiteSpace: 'pre-line' }}>{content.officeAddress}</span></p>}
                        {content.officeHours && <p>{content.officeHours}</p>}
                        {content.phone && <p><strong>Tel:</strong> <a href={`tel:${content.phone}`} className="link-primary">{content.phone}</a></p>}
                        {content.email && <p><strong>E-mail:</strong> <a href={`mailto:${content.email}`} className="link-primary">{content.email}</a></p>}
                    </div>
                </div>
                <div className="row mt-10">
                    <div className="col text-center">
                        <h2>{content.organizationTitle}</h2>
                        {content.organizationAddress && <p><strong>Adres: </strong><span style={{ whiteSpace: 'pre-line' }}>{content.organizationAddress}</span></p>}
                        {content.organizationWebsiteUrl && content.organizationWebsiteLabel && (
                            <p><strong>Strona: </strong><Link href={content.organizationWebsiteUrl} className="link-primary" target="_blank" rel="noopener noreferrer">{content.organizationWebsiteLabel}</Link></p>
                        )}
                        {content.organizationFacebookUrl && content.organizationFacebookLabel && (
                            <p><strong>Facebook: </strong><Link href={content.organizationFacebookUrl} className="link-primary" target="_blank" rel="noopener noreferrer">{content.organizationFacebookLabel}</Link></p>
                        )}
                        {content.organizationPhone && <p><strong>Tel: </strong><a href={`tel:${content.organizationPhone}`} className="link-primary">{content.organizationPhone}</a></p>}
                        {content.organizationEmail && <p><strong>E-mail: </strong><a href={`mailto:${content.organizationEmail}`} className="link-primary">{content.organizationEmail}</a></p>}
                    </div>
                </div>
                {content.hashtags && (
                    <div className="row">
                        <div className="col text-center">
                            {content.hashtagsUrl ? (
                                <Link href={content.hashtagsUrl} className="link-primary" target="_blank" rel="noopener noreferrer">{content.hashtags}</Link>
                            ) : content.hashtags}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

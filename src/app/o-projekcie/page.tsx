import { getOProjekcieBloki, getOProjekcieContent } from '@/lib/actions/o-projekcie';
import { blobProxyUrl } from '@/lib/blob-proxy';
import ProjectRichContent from './ProjectRichContent';
import './style.css';

export const metadata = {
    title: 'O Projekcie - Kroki ku Aktywności',
    description:
        'Cele, wartość i formy wsparcia dostępne w ramach projektu — doradztwo zawodowe, poradnictwo psychologiczne, szkolenia i kursy zawodowe.',
};

export const dynamic = 'force-dynamic';

function isSupportedImageUrl(value: string | null) {
    if (!value) return false;
    if (value.startsWith('/') && !value.startsWith('//')) return true;

    try {
        const { protocol, hostname, port } = new URL(value);
        return (
            (protocol === 'http:' && hostname === 'localhost' && port === '1337') ||
            (protocol === 'https:' &&
                (hostname === 'aktywnekobiety.pl' ||
                    hostname === 'jpmcg.up.railway.app' ||
                    hostname === 'res.cloudinary.com' ||
                    hostname === 'github.com' ||
                    hostname.endsWith('.public.blob.vercel-storage.com')))
        );
    } catch {
        return false;
    }
}

export default async function OProjekcie() {
    const [content, bloki] = await Promise.all([
        getOProjekcieContent(),
        getOProjekcieBloki(),
    ]);
    const projectValue = content?.projectValue?.trim();
    const euContribution = content?.euContribution?.trim();
    const intro = content?.intro?.trim();

    return (
        <>
            <section
                className="wrapper"
                style={{
                    position: 'relative',
                    backgroundPosition: 'right',
                    backgroundImage: "url('/img/flaga-ue-tlo.png')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
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
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                />
                <div
                    className="container pt-5 pb-5 pt-md-10 pb-md-10 text-center"
                    style={{ position: 'relative', zIndex: 1 }}
                >
                    <h1 className="display-1 mb-3" style={{ color: 'white' }}>
                        O Projekcie
                    </h1>
                </div>
            </section>

            <div className="container mb-15 mt-15">
                {projectValue && (
                    <p className="mb-3 fw-bold lead fs-lg">
                        Wartość projektu: {projectValue}
                    </p>
                )}
                {euContribution && (
                    <p className="mb-3 fw-bold lead fs-lg">
                        Wysokość wkładu Funduszy Europejskich: {euContribution}
                    </p>
                )}
                {intro && (
                    <div className="lead fs-lg mb-12 mb-md-15">
                        <ProjectRichContent content={intro} />
                    </div>
                )}
                {bloki.map((blok, index) => {
                    const imageRight = index % 2 === 0;
                    const imageUrl = blobProxyUrl(blok.imageUrl) ?? blok.imageUrl;

                    return (
                        <div
                            key={blok.id}
                            className="row gx-lg-8 gx-xl-12 gy-10 mb-14 mb-md-17 align-items-start"
                        >
                            <div
                                className={`col-lg-6 position-relative${
                                    imageRight ? ' order-lg-1' : ''
                                }`}
                            >
                                {isSupportedImageUrl(imageUrl) && (
                                    <>
                                        <div
                                            className="shape bg-dot primary rellax w-17 h-19"
                                            style={
                                                imageRight
                                                    ? { top: '-1.7rem', right: '-1.5rem' }
                                                    : { top: '-1.7rem', left: '-1.5rem' }
                                            }
                                        />
                                        <figure className="rounded shadow">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imageUrl!}
                                                width={600}
                                                height={1000}
                                                alt={blok.title}
                                            />
                                        </figure>
                                    </>
                                )}
                            </div>
                            <div className="col-lg-6">
                                <h2 className="h3 fw-bold mb-4">{blok.title}</h2>
                                <ProjectRichContent content={blok.content} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

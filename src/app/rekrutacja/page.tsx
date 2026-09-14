import type { Metadata } from 'next';
import DownloadElement from '@/components/reuseable/process-list/DownloadElement';
import { getRekrutacjaContent, getRekrutacjaPliki } from '@/lib/actions/rekrutacja';

export const metadata: Metadata = {
  title: 'Rekrutacja - Kroki ku Aktywności',
  description:
    'Informacje o rekrutacji do projektu „Kroki ku Aktywności: Bierna Kobieta, Aktywna Zmiana!” oraz dokumenty do pobrania.',
};

export const dynamic = 'force-dynamic';

function TextContent({ value }: { value: string }) {
  return (
    <>
      {value.split(/\n{2,}/).map((paragraph, index) => (
        <p className="mb-3" key={index}>
          {paragraph.split('\n').map((line, lineIndex, lines) => (
            <span key={lineIndex}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

function LineList({ value, ordered = false }: { value: string; ordered?: boolean }) {
  const items = value.split('\n').map((item) => item.trim()).filter(Boolean);
  const List = ordered ? 'ol' : 'ul';

  return (
    <List className="mb-6">
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </List>
  );
}

function EligibilityCards({ value }: { value: string }) {
  const items = value.split('\n').map((item) => item.trim()).filter(Boolean);

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-6 mb-6">
      {items.map((item, index) => (
        <div className="col" key={`${index}-${item}`}>
          <div className="card shadow-lg h-100">
            <div className="card-body p-6">
              <div className="d-flex align-items-start">
                <span className="icon btn btn-circle btn-lg btn-soft-primary pe-none me-4 flex-shrink-0">
                  <span className="number">{index + 1}</span>
                </span>
                <p className="mb-0 fw-semibold">{item}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplicationSteps({ value }: { value: string }) {
  const steps = value.split('\n').map((item) => item.trim()).filter(Boolean);

  return (
    <div className="col-lg-12 order-lg-2">
      {steps.map((step, index) => (
        <div key={`${index}-${step}`}>
          <div className="card shadow-lg mt-10">
            <div className="card-body p-6">
              <div className="d-flex flex-row align-items-center">
                <div className="flex-shrink-0">
                  <span className="icon btn btn-circle btn-lg btn-soft-primary pe-none me-4">
                    <span className="number">{index + 1}</span>
                  </span>
                </div>
                <h4 className="mb-1 text-start">{step}</h4>
              </div>
            </div>
          </div>

          {index < steps.length - 1 && (
            <div className="text-center mt-4" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function Rekrutacja() {
  const [content, files] = await Promise.all([
    getRekrutacjaContent(),
    getRekrutacjaPliki(),
  ]);

  const hasBodyContent = content && (
    content.content ||
    content.eligibilityTitle ||
    content.eligibilityItems ||
    content.priorityContent ||
    content.equalOpportunities ||
    content.applicationTitle ||
    content.applicationIntro ||
    content.applicationSteps ||
    content.applicationHelp ||
    content.documentsTitle ||
    content.documentsIntro ||
    content.documentsFooter
  );

  return (
    <>
      <section className="wrapper bg-soft-primary">
        <div className="container pt-10 pb-14 pt-md-14 pb-md-16 text-center">
          <div className="row">
            <div className="col-md-10 col-xl-8 mx-auto">
              <h1 className="display-1 mb-4">{content?.title || 'Rekrutacja'}</h1>
              {content?.intro && <p className="lead fs-lg">{content.intro}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="wrapper bg-light">
        <div className="container pt-10 pb-14 pt-md-14 pb-md-16">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              {content?.content ? (
                <div className="mb-8">
                  <TextContent value={content.content} />
                </div>
              ) : !hasBodyContent ? (
                <p className="lead text-center">
                  Informacje o rekrutacji będą dostępne wkrótce.
                </p>
              ) : null}

              {(content?.eligibilityTitle || content?.eligibilityItems) && (
                <div className="mt-10 mb-8">
                  {content?.eligibilityTitle && (
                    <div className="row">
                      <div className="col-md-10 col-xl-8 mx-auto text-center">
                        <h2 className="display-4 mb-10 px-lg-10">
                          {content.eligibilityTitle}
                        </h2>
                      </div>
                    </div>
                  )}
                  {content?.eligibilityItems && (
                    <EligibilityCards value={content.eligibilityItems} />
                  )}
                </div>
              )}
              {content?.priorityContent && (
                <div className="mb-6">
                  <TextContent value={content.priorityContent} />
                </div>
              )}
              {content?.equalOpportunities && (
                <div className="mb-8">
                  <TextContent value={content.equalOpportunities} />
                </div>
              )}

              {(content?.applicationTitle ||
                content?.applicationIntro ||
                content?.applicationSteps ||
                content?.applicationHelp) && (
                <div className="row mt-10 mb-5">
                  <div className="col-md-10 col-xl-8 col-xxl-7 mx-auto text-center">
                    {content?.applicationTitle && (
                      <h2 className="display-4 mb-4 px-lg-14">{content.applicationTitle}</h2>
                    )}
                    {content?.applicationIntro && (
                      <div>
                        <TextContent value={content.applicationIntro} />
                      </div>
                    )}
                    {content?.applicationSteps && (
                      <ApplicationSteps value={content.applicationSteps} />
                    )}
                    {content?.applicationHelp && (
                      <div className="mt-5">
                        <TextContent value={content.applicationHelp} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(files.length > 0 ||
                content?.documentsTitle ||
                content?.documentsIntro ||
                content?.documentsFooter) && (
                <div className="row mt-10 mb-5">
                  <div className="col-md-10 col-xl-8 col-xxl-7 mx-auto text-center">
                    <h2 className="display-4 mb-10 px-lg-14">
                      {content?.documentsTitle || 'DOKUMENTY REKRUTACYJNE:'}
                    </h2>
                    {files.length > 0 && (
                      <div className="d-flex flex-column align-items-start">
                        <p className="d-flex align-items-center text-start">
                          <span className="icon btn btn-circle btn-lg btn-soft-primary pe-none me-4">
                            <span className="number">
                              <i className="uil uil-file-download fs-40" />
                            </span>
                          </span>
                          - pobrania pliku w wersji kolorowej
                        </p>
                        <p className="d-flex align-items-center text-start">
                          <span
                            className="icon btn btn-circle btn-lg btn-soft-primary pe-none me-4"
                            style={{ backgroundColor: 'white' }}
                          >
                            <span className="number" style={{ color: 'black' }}>
                              <i className="uil uil-file-download fs-40" />
                            </span>
                          </span>
                          - pobrania pliku w wersji czarno-białej
                        </p>
                      </div>
                    )}
                    {content?.documentsIntro && (
                      <div>
                        <TextContent value={content.documentsIntro} />
                      </div>
                    )}
                    {files.length > 0 && (
                      <div className="col-lg-12 order-lg-2">
                        {files.map((file) => (
                          <DownloadElement
                            key={file.id}
                            title={file.description || file.name}
                            link1={file.url}
                            link2={file.blackWhiteUrl}
                            link1Label={`Pobierz wersję kolorową: ${file.description || file.name}`}
                            link2Label={`Pobierz wersję czarno-białą: ${file.description || file.name}`}
                            className="mb-5"
                          />
                        ))}
                      </div>
                    )}
                    {content?.documentsFooter && (
                      <div className="mt-5">
                        <TextContent value={content.documentsFooter} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

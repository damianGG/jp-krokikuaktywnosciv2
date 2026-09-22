import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import DownloadElement from '@/components/reuseable/process-list/DownloadElement';
import ArticleContent from './ArticleContent';
import { getAktualnoscBySlug } from '@/lib/actions/aktualnosci';
import { blobProxyUrl } from '@/lib/blob-proxy';
import '../style.css';

export const dynamic = 'force-dynamic';

export default async function BlogDetailsTemplate({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getAktualnoscBySlug(params.slug);

  if (!article || !article.published) {
    notFound();
  }

  const formattedDate = format(new Date(article.createdAt), 'dd MMMM yyyy', {
    locale: pl,
  });

  return (
    <>
      <section className="wrapper bg-soft-primary">
        <div className="container pt-10 pb-19 pt-md-14 pb-md-20 text-center">
          <div className="row">
            <div className="col-md-10 col-xl-8 mx-auto">
              <div className="post-header">
                <div className="post-category text-line"></div>
                <h1 className="display-1 mb-4">{article.title}</h1>
                <ul className="post-meta mb-5">
                  <li className="post-date">
                    <i className="uil uil-calendar-alt" />
                    <span>{formattedDate}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="wrapper bg-light">
        <div className="container pb-14 pb-md-16">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="blog single mt-n17">
                <div className="card">
                  {article.files.length > 0 && (
                    <section aria-label="Załączniki do pobrania" className="d-flex flex-column align-items-center mt-10 gap-3">
                      {article.files.map((file) => (
                        <DownloadElement
                          key={file.id}
                          title={file.name}
                          link1Label={`Pobierz załącznik: ${file.name}`}
                          link1={
                            blobProxyUrl(file.url, { download: true, filename: file.name }) ??
                            file.url
                          }
                        />
                      ))}
                    </section>
                  )}
                  <div className="card-body">
                    <div className="classic-view">
                      <article className="post">
                        <div className="post-content mb-5">
                          <ArticleContent content={article.content} />
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

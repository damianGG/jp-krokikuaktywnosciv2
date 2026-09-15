import Link from 'next/link';
import type { Metadata } from 'next';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { getPublishedAktualnosci } from '@/lib/actions/aktualnosci';
import { blobProxyUrl } from '@/lib/blob-proxy';
import './style.css';

export const metadata: Metadata = {
  title: 'Aktualności o projekcie',
  description: 'Aktualności o projekcie',
};

export const dynamic = 'force-dynamic';

export default async function News() {
  const items = await getPublishedAktualnosci();

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
          <div className="row">
            <div className="col-md-9 col-lg-7 col-xl-5 mx-auto">
              <h1 className="display-1 mb-3" style={{ color: 'white' }}>
                Aktualności
              </h1>
              <p className="lead px-xxl-10"></p>
            </div>
          </div>
        </div>
      </section>
      <div className="container mb-15 mt-15">
        <div className="row gx-0 gx-md-3 gx-xl-8 gy-8 align-items-stretch">
          {items.length > 0 ? (
            items.map((article) => (
              <div className="col-md-4 d-flex" key={article.id}>
                <Link href={`/aktualnosci/${article.slug}`} className="news-card-link">
                  <div className="card news-card">
                    {article.coverImageUrl && (
                      <img
                        src={blobProxyUrl(article.coverImageUrl) ?? article.coverImageUrl}
                        alt={article.title}
                        className="card-img-top"
                        style={{ objectFit: 'cover', height: 200, width: '100%' }}
                      />
                    )}
                    <div className="card-body">
                      <div className="post-header">
                        <h2 className="post-title h3 mt-1 mb-3">{article.title}</h2>
                      </div>
                      {article.excerpt && (
                        <div className="post-content">
                          <p>{article.excerpt}</p>
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <ul className="post-meta d-flex mb-0">
                        <li className="post-date">
                          <i className="uil uil-calendar-alt"></i>
                          <span>
                            {format(new Date(article.createdAt), 'dd MMMM yyyy', {
                              locale: pl,
                            })}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>Brak dostępnych aktualności.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

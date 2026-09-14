import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const HERO_TITLE = 'Kroki ku Aktywności: Bierna Kobieta, Aktywna Zmiana!';
const PROJECT_VALUE = '1 211 344,30 zł';
const EU_CONTRIBUTION = '1 029 642,66 zł';

async function upsertSingleRow(table, values) {
  const { rows } = await pool.query(`SELECT id FROM ${table} LIMIT 1`);
  const columns = Object.keys(values);
  const params = Object.values(values);

  if (rows.length > 0) {
    const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(', ');
    await pool.query(
      `UPDATE ${table} SET ${setClause}, "updatedAt" = now() WHERE id = $${columns.length + 1}`,
      [...params, rows[0].id]
    );
    console.log(`[v0] updated ${table}`);
  } else {
    const columnList = columns.map((c) => `"${c}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    await pool.query(`INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`, params);
    console.log(`[v0] inserted ${table}`);
  }
}

async function main() {
  // ---------------------------------------------------------------- homepage
  await upsertSingleRow('homepage_content', {
    heroTitle: HERO_TITLE,
    aboutContent: [
      'Celem głównym projektu jest aktywizacja zawodowa 72 biernych zawodowo kobiet w wieku produkcyjnym (18–59 lat) zamieszkujących miasto Radom oraz gminy Wieniawa i Chlewiska, w szczególności kobiet z wykształceniem ISCED 3 i niższym oraz w wieku 18–29 lat, poprzez profesjonalne wsparcie aktywizujące: diagnozę sytuacji, poradnictwo psychologiczne, szkolenia zawodowe i cyfrowe, moduły szkoleń aktywizujących oraz refundację kosztów opieki nad dzieckiem lub osobą wymagającą wsparcia.',
      'Efektem udziału w projekcie będzie poprawa sytuacji Uczestniczek na rynku pracy poprzez nabycie nowych kompetencji i kwalifikacji oraz wzrost kompetencji cyfrowych i zawodowych. Co najmniej 66% biernych kobiet znajdzie się w lepszej sytuacji na rynku pracy po opuszczeniu programu.',
      `Wartość projektu: ${PROJECT_VALUE}`,
      `Wysokość wkładu Funduszy Europejskich: ${EU_CONTRIBUTION}`,
    ].join('\n\n'),
  });

  // ------------------------------------------------------------- o projekcie
  await upsertSingleRow('o_projekcie_content', {
    heroTitle: HERO_TITLE,
    projectValue: PROJECT_VALUE,
    euContribution: EU_CONTRIBUTION,
    intro: [
      'Okres realizacji projektu: 01.06.2026 – 31.05.2027',
      'Celem głównym projektu jest aktywizacja zawodowa 72 biernych zawodowo kobiet w wieku produkcyjnym (18–59 lat) zamieszkujących w rozumieniu Kodeksu Cywilnego miasto Radom oraz gminy Wieniawa i Chlewiska (powiat szydłowiecki), w szczególności biernych zawodowo kobiet z wykształceniem ISCED 3 i niższym oraz w wieku 18–29 lat, w okresie realizacji projektu, która będzie wynikiem udzielenia profesjonalnego wsparcia aktywizującego (m.in. diagnozy sytuacji Uczestniczek, poradnictwa psychologicznego, szkoleń zawodowych, szkoleń podnoszących kompetencje cyfrowe, modułowych szkoleń aktywizujących, refundacji kosztów opieki nad dzieckiem/osobą wymagającą wsparcia w codziennym funkcjonowaniu).',
      'W konsekwencji co najmniej 66% biernych kobiet znajdzie się w lepszej sytuacji na rynku pracy po opuszczeniu programu.',
      'Udział w projekcie obejmuje następujące elementy:',
    ].join('\n\n'),
  });

  const bloki = [
    {
      title: 'Diagnoza sytuacji Uczestniczki projektu na rynku pracy, w tym ocena umiejętności cyfrowych',
      content: [
        'Celem wsparcia jest identyfikacja potrzeb Uczestniczek projektu, w tym diagnozowanie potrzeb szkoleniowych lub walidacyjnych (potwierdzanie nabytych wcześniej kwalifikacji i kompetencji) oraz możliwości doskonalenia zawodowego, a także opracowanie lub aktualizacja Indywidualnego Planu Działania (IPD) dla każdej Uczestniczki projektu.',
        'Dzięki opracowaniu IPD każda Uczestniczka otrzyma ofertę wsparcia obejmującą formy pomocy zidentyfikowane jako niezbędne do poprawy sytuacji na rynku pracy lub uzyskania zatrudnienia.',
        'Dla Uczestniczek w wieku 18–29 lat w trakcie spotkania zostanie przeprowadzona diagnoza/ocena umiejętności cyfrowych z wykorzystaniem „Europejskiego narzędzia do oceny poziomu kompetencji cyfrowych”. W zależności od jego wyniku Uczestniczka zostanie lub nie zostanie zakwalifikowana do udziału w szkoleniu z zakresu kompetencji cyfrowych.',
        'Każda Uczestniczka otrzyma średnio 4 godziny zegarowe wsparcia. Wsparciem zostanie objętych 72 Uczestniczki.',
      ].join('\n\n'),
    },
    {
      title: 'Uzupełnienie poziomu umiejętności cyfrowych – szkolenie z zakresu kompetencji cyfrowych',
      content: [
        'Celem wsparcia jest uzupełnienie poziomu kompetencji cyfrowych Uczestniczek projektu, które podczas oceny umiejętności cyfrowych uzyskają wynik niższy niż dobry lub bardzo dobry.',
        'Uczestniczki, u których zostanie zdiagnozowana konieczność uzupełnienia kompetencji cyfrowych, wezmą udział w średnio 24-godzinnym szkoleniu (średnio 3 dni × 8 godzin), którego tematyka odpowiada na zdiagnozowane „luki kompetencyjne”. Na zakończenie szkolenia odbędzie się egzamin potwierdzający zdobyte kompetencje cyfrowe.',
        'Wsparciem zostaną objęte 22 Uczestniczki projektu. W czasie realizacji szkolenia zawodowego Uczestniczkom przysługuje stypendium szkoleniowe, a także możliwość zwrotu kosztów dojazdu na szkolenie.',
      ].join('\n\n'),
    },
    {
      title: 'Poradnictwo psychologiczne',
      content: [
        'Celem spotkań jest rozpoznanie problemów, ale też wypracowanie konkretnych rozwiązań i kroków prowadzących do poprawy samopoczucia i jakości życia Uczestniczek, co ma pomóc kobiecie w procesie powrotu do aktywnego życia, w tym zawodowego.',
        'Spotkania z psychologiem dadzą Uczestniczkom przestrzeń do tego, by nazwać swoje trudności, zrozumieć skąd się biorą lęki, brak motywacji czy poczucie bezradności. W bezpiecznej atmosferze kobiety będą mogły skupić się na sobie i swoich emocjach.',
        'Zaplanowano średnio 3 godziny zegarowe wsparcia na osobę. Wsparciem zostanie objętych 36 Uczestniczek.',
      ].join('\n\n'),
    },
    {
      title: 'Podniesienie/aktualizacja kwalifikacji zawodowych',
      content: [
        'Celem szkoleń jest zmiana, zdobycie lub podwyższenie przez Uczestniczki kwalifikacji lub kompetencji zawodowych, co polepszy ich sytuację społeczną i zawodową oraz umożliwi zdobycie zatrudnienia.',
        'Średnia liczba godzin kursu wyniesie 80 godzin dydaktycznych. Nabycie kwalifikacji/kompetencji będzie weryfikowane poprzez przeprowadzenie stosownego egzaminu zewnętrznego.',
        'Wsparciem zostanie objętych 72 Uczestniczki. W czasie realizacji szkolenia zawodowego przysługuje stypendium szkoleniowe oraz możliwość zwrotu kosztów dojazdu na szkolenie.',
      ].join('\n\n'),
    },
    {
      title: 'Modułowe szkolenie aktywizujące',
      content: [
        'Szkolenia aktywizujące obejmą 64 godziny (4 moduły × 16 godzin):',
        '- moduł dot. diagnozowania nisz rynkowych pod kątem profilowania przyszłych aktywności zawodowych,\n- moduł dot. poszukiwania źródeł finansowania planowanych działalności gospodarczych,\n- moduł dot. budowania i podtrzymywania kontaktów, w tym biznesowych, z pracodawcami i związkami pracodawców,\n- moduł dot. promowania rozwiązań wspierających równe traktowanie i niedyskryminację kobiet na rynku pracy.',
        'Szkolenie prowadzi do nabycia kompetencji zawodowych. Wsparciem zostanie objętych 72 Uczestniczki, z możliwością stypendium szkoleniowego i zwrotu kosztów dojazdu na szkolenie.',
      ].join('\n\n'),
    },
    {
      title: 'Refundacja kosztów opieki nad dzieckiem lub inną osobą wymagającą wsparcia',
      content: [
        'W celu zwiększenia możliwości aktywnego uczestnictwa kobiet w projekcie przewidziano refundację kosztów opieki nad dzieckiem (w wieku żłobkowym lub przedszkolnym) lub inną osobą wymagającą wsparcia w codziennym funkcjonowaniu – przez okres trwania szkolenia, okres poszukiwania zatrudnienia i zatrudnienia Uczestniczki, nie dłużej jednak niż 12 miesięcy od rozpoczęcia udziału w projekcie.',
        'Wysokość refundacji nie może przekroczyć miesięcznie połowy minimalnego wynagrodzenia za pracę na każde dziecko lub inną osobę wymagającą wsparcia, i dotyczy nie więcej niż 2 dzieci/osób wymagających wsparcia.',
        'Wsparciem zostanie objętych 8 Uczestniczek.',
      ].join('\n\n'),
    },
  ];

  await pool.query('DELETE FROM o_projekcie_bloki');
  for (let i = 0; i < bloki.length; i += 1) {
    await pool.query(
      `INSERT INTO o_projekcie_bloki ("userId", title, content, position) VALUES ($1, $2, $3, $4)`,
      ['seed', bloki[i].title, bloki[i].content, i]
    );
  }
  console.log(`[v0] inserted ${bloki.length} o_projekcie_bloki`);

  // -------------------------------------------------------------- rekrutacja
  await upsertSingleRow('rekrutacja_content', {
    title: 'Rekrutacja',
    intro: 'Zapraszamy bierne zawodowo (niepracujące i niebezrobotne) kobiety w wieku 18–59 lat, zamieszkujące miasto Radom lub gminy Wieniawa i Chlewiska do udziału w projekcie „Kroki ku Aktywności: Bierna Kobieta, Aktywna Zmiana!”. Udział w projekcie jest bezpłatny.',
    content: [
      'W ramach projektu oferujemy:',
      [
        '- spotkania z doradcą zawodowym',
        '- spotkania z psychologiem',
        '- szkolenia komputerowe',
        '- szkolenia aktywizujące',
        '- szkolenia zawodowe',
        '- stypendium szkoleniowe za udział w każdym kursie',
        '- wyżywienie w trakcie szkoleń',
        '- możliwość zwrotu kosztów dojazdu',
        '- możliwość zwrotu kosztów opieki nad dzieckiem/osobą wymagającą wsparcia w codziennym funkcjonowaniu',
      ].join('\n'),
      'I tura rekrutacji trwa od 01.07.2026 r. do 21.08.2026 r. Aby uzyskać więcej informacji, prosimy o kontakt z Biurem projektu – patrz zakładka „Kontakt”.',
    ].join('\n\n'),
    eligibilityTitle: 'KTO MOŻE WZIĄĆ UDZIAŁ W PROJEKCIE?',
    eligibilityItems: [
      'Kobiety w wieku 18–59 lat',
      'Osoby bierne zawodowo – niepracujące i niezarejestrowane jako bezrobotne (m.in. studentki studiów stacjonarnych)',
      'Mieszkanki miasta Radom lub gminy Wieniawa lub gminy Chlewiska',
      'W szczególności kobiety w wieku 18–29 lat z wykształceniem ponadgimnazjalnym i niższym oraz kobiety z niepełnosprawnością',
    ].join('\n'),
    priorityContent: 'Rekrutacja realizowana będzie z uwzględnieniem zasady równości kobiet i mężczyzn, równości szans i niedyskryminacji, w tym dostępności dla osób z niepełnosprawnościami. Przy rekrutacji stosowana będzie także zasada zrównoważonego rozwoju.',
    equalOpportunities: 'Zapewniamy możliwość skorzystania z tłumacza języka migowego, pętli indukcyjnej lub pomocy asystenta osoby z niepełnosprawnością. Kobietom, które mają problem z dojazdem do biura projektu (ponieważ mają pod opieką dziecko/dzieci lub osobę wymagającą wsparcia, a także kobietom z niepełnosprawnościami) zapewniamy dojazd do Kandydatki do domu oraz pomoc kadry projektu w wypełnieniu dokumentów rekrutacyjnych.',
    applicationTitle: 'JAK ZGŁOSIĆ SIĘ DO PROJEKTU?',
    applicationIntro: '',
    applicationSteps: [
      'Wydrukuj dokumenty rekrutacyjne i wypełnij je',
      'Pobierz z Zakładu Ubezpieczeń Społecznych oraz Powiatowego Urzędu Pracy wymagane zaświadczenia',
      'Zgromadź pozostałe wymagane załączniki',
      'Złóż komplet dokumentów osobiście, za pośrednictwem osoby trzeciej, pocztą tradycyjną, kurierem lub e-mailem na adres biura projektu',
      'Skontaktujemy się z Tobą telefonicznie lub mailowo, aby poinformować o zakwalifikowaniu do projektu',
    ].join('\n'),
    applicationHelp: 'Jeśli potrzebujesz pomocy w wypełnieniu dokumentów rekrutacyjnych, zapraszamy do biura projektu. Zapewniamy również możliwość skorzystania z tłumacza języka migowego, pętli indukcyjnej lub pomocy asystenta osoby z niepełnosprawnością. Osobom z orzeczeniem o niepełnosprawności, matkom z małymi dziećmi lub osobom mającym pod opieką osobę wymagającą wsparcia w codziennym funkcjonowaniu, które mają problem z dojazdem do biura projektu, oferujemy dojazd do domu Kandydatki i pomoc kadry projektu w wypełnieniu dokumentów. Aby uzyskać więcej informacji, prosimy o kontakt z biurem projektu – patrz zakładka „Kontakt”.',
    documentsTitle: 'DOKUMENTY REKRUTACYJNE',
    documentsIntro: 'Prosimy o drukowanie dokumentów rekrutacyjnych w kolorze. Wersja czarno-biała dotyczy sytuacji braku możliwości wydruku w kolorze.',
    documentsFooter: '',
  });

  // ------------------------------------------------------------------ kontakt
  await upsertSingleRow('contact_content', {
    officeTitle: 'Biuro Projektu',
    officeAddress: 'Rynek 15, II piętro\n26-610 Radom',
    officeHours: 'Biuro projektu czynne jest od poniedziałku do piątku w godzinach 8:00 – 16:00 (istnieje możliwość umówienia się na inne godziny spotkania)',
    contactPerson: '',
    phone: '+48 730 011 861',
    email: 'krokikuaktywnosci@jpmcg.pl',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61592850330284',
    facebookLabel: 'J&P Moritz Consulting Group',
    organizationName: 'J&P Moritz Consulting Group Sp. z o.o.',
    organizationTitle: 'Siedziba J&P Moritz Consulting Group Sp. z o.o. - Beneficjent',
    organizationAddress: 'ul. Plac Solny 14 lok. 3\n50-062 Wrocław',
    organizationWebsiteUrl: 'https://www.jpmcg.pl',
    organizationWebsiteLabel: 'www.jpmcg.pl',
    organizationFacebookUrl: 'https://www.facebook.com/profile.php?id=61592850330284',
    organizationFacebookLabel: 'J&P Moritz Consulting Group',
    organizationPhone: '+48 531 954 000',
    organizationEmail: 'biuro@jpmcg.pl',
    hashtags: '#FunduszeUE #FunduszeEuropejskie',
    hashtagsUrl: 'https://www.facebook.com/search/top/?q=%23funduszeue%20%23FunduszeEuropejskie',
    footerText: 'J&P Moritz Consulting Group Sp. z o.o. - wszelkie prawa zastrzeżone.',
  });

  console.log('[v0] seed complete');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

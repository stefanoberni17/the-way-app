import { Eyebrow, Rule } from '@/components/ui';

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-serif text-2xl text-gold leading-none">{n}</span>
        <h2 className="font-serif text-2xl font-semibold text-ink leading-none">{title}</h2>
      </div>
      <div className="space-y-3 text-[15px] text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-paper-warm border border-line rounded-xl p-4">
      <p className="font-medium text-ink mb-1">{title}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-parchment py-10 px-5">
      <div className="w-full max-w-2xl mx-auto">

        <header className="text-center mb-8">
          <Eyebrow className="justify-center mb-2">The Way · La Via del Cuore</Eyebrow>
          <h1 className="font-serif text-[40px] font-semibold text-ink leading-none">Privacy Policy</h1>
          <p className="text-muted text-sm mt-3">Ultimo aggiornamento: febbraio 2026</p>
          <Rule className="mx-auto mt-5" />
        </header>

        <div className="bg-paper rounded-3xl border border-line shadow-[var(--shadow-card)] p-6 sm:p-8 space-y-9">

          <p className="text-[15px] text-ink-soft leading-relaxed">
            The Way — La Via del Cuore è un&apos;app di crescita personale ispirata agli insegnamenti del Vangelo.
            Rispettiamo la tua privacy e vogliamo essere trasparenti su come raccogliamo e utilizziamo i tuoi dati.
          </p>

          <Section n="1" title="Dati che raccogliamo">
            <Item title="Profilo personale">
              Nome, età, email, intenzione di percorso, passioni, sogno e situazione attuale. Forniti volontariamente durante la registrazione o dal profilo.
            </Item>
            <Item title="Progressi nel cammino">
              Passi completati, settimana corrente e tracker delle pratiche settimanali.
            </Item>
            <Item title="Riflessioni">
              Le risposte alle domande riflessive dei passi (max 500 caratteri ciascuna).
            </Item>
            <Item title="Conversazioni Telegram">
              I messaggi scambiati con La Guida tramite il bot Telegram, necessari per mantenere il contesto della conversazione.
            </Item>
          </Section>

          <Section n="2" title="Come utilizziamo i tuoi dati">
            <ul className="space-y-2">
              <Bullet>Personalizzare le risposte de La Guida in base al tuo percorso e alla tua storia</Bullet>
              <Bullet>Tenere traccia dei tuoi progressi e sbloccare i contenuti in sequenza</Bullet>
              <Bullet>Migliorare l&apos;esperienza nel tempo tramite pattern anonimi (mai dati personali identificabili)</Bullet>
            </ul>
            <div className="bg-sage-soft border border-sage/20 rounded-xl p-4 mt-2">
              <p className="font-medium text-sage mb-1">Non vendiamo i tuoi dati</p>
              <p className="text-sm text-ink-soft">I tuoi dati non vengono mai venduti, ceduti o condivisi con terze parti a scopo commerciale.</p>
            </div>
          </Section>

          <Section n="3" title="Conservazione dei dati">
            <Item title="Conversazioni Telegram">
              Eliminate automaticamente dopo <strong className="text-ink">90 giorni</strong>. Un riassunto anonimo dei temi emersi può essere conservato nel profilo per mantenere la continuità del percorso.
            </Item>
            <Item title="Profilo, progressi e riflessioni">
              Conservati finché il tuo account è attivo o fino a richiesta di cancellazione.
            </Item>
          </Section>

          <Section n="4" title="Tecnologie utilizzate">
            <Item title="Supabase">Database sicuro hosted in Europa per la conservazione dei dati.</Item>
            <Item title="Anthropic (Claude AI)">
              I tuoi messaggi vengono inviati ad Anthropic per generare le risposte de La Guida. Anthropic non conserva i dati oltre l&apos;elaborazione della richiesta.
            </Item>
            <Item title="Telegram">
              Usato come canale opzionale per interagire con La Guida. L&apos;ID Telegram è l&apos;unico dato condiviso con Telegram.
            </Item>
          </Section>

          <Section n="5" title="I tuoi diritti">
            <p>Hai il diritto di:</p>
            <ul className="space-y-2">
              <Bullet>Accedere ai dati che conserviamo su di te</Bullet>
              <Bullet>Richiedere la correzione di dati errati</Bullet>
              <Bullet>Richiedere la cancellazione del tuo account e di tutti i dati associati</Bullet>
            </ul>
            <div className="bg-gold-wash border border-gold-soft rounded-xl p-4 mt-2">
              <p className="font-medium text-ink mb-1">Contatto</p>
              <p className="text-sm">
                Per qualsiasi richiesta relativa ai tuoi dati, scrivi a{' '}
                <a href="mailto:foryou.innerpath@gmail.com" className="text-gold-deep underline underline-offset-2 font-medium">
                  foryou.innerpath@gmail.com
                </a>
              </p>
            </div>
          </Section>

          <p className="border-t border-line pt-6 text-center text-xs text-muted">
            The Way — La Via del Cuore è un progetto indipendente.
          </p>

        </div>

        <div className="text-center mt-6">
          <a href="/login" className="text-sm text-muted hover:text-ink underline underline-offset-4">
            Torna all&apos;accesso
          </a>
        </div>

      </div>
    </main>
  );
}

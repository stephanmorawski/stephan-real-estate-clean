import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildPageMetadata({
    title: lang === 'en' ? 'Legal Notice | Côte d’Azur Agency' : 'Mentions légales | Côte d’Azur Agency',
    description: lang === 'en' ? 'Legal notice of Côte d’Azur Agency.' : 'Mentions légales de Côte d’Azur Agency.',
    lang,
    pathname: `/${lang}/mentions-legales`
  });
}

function FR() {
  return (
    <>
      <section>
        <h2 className="font-luxe text-2xl">Éditeur du site</h2>
        <div className="mt-4 space-y-2 text-zinc-700">
          <p><strong>CÔTE D’AZUR AGENCY</strong></p>
          <p>Agence immobilière</p>
          <p>MORAWSKI Stephan Nadia Danitza</p>
          <p>Entrepreneur individuel</p>
          <p>296 Chemin Clos de Brasset, 06560 Valbonne</p>
          <p>RCS Grasse : 819 389 552</p>
          <p>E-mail : stephan@cotedazuragency.com</p>
          <p>Téléphone : +33 (0)6 70 74 65 49</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Directeur de la publication</h2>
        <p className="mt-4 text-zinc-700">Madame MORAWSKI Stephan Nadia Danitza</p>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Activité immobilière réglementée</h2>
        <div className="mt-4 space-y-2 text-zinc-700">
          <p>Carte professionnelle n° CPI 0605 2025 000 000 063</p>
          <p>Délivrée le 11/04/2025 par la CCI Nice-Côte d’Azur</p>
          <p>Valable jusqu’au 10/04/2028</p>
          <p>Mention : Transactions sur immeubles et fonds de commerce</p>
          <p>Absence de maniement de fonds : Sans détention de fonds</p>
          <p>Assurance responsabilité civile professionnelle : Allianz Actif Pro</p>
          <p>Contrat n° 64366011</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Médiation de la consommation</h2>
        <div className="mt-4 space-y-2 text-zinc-700">
          <p>CM2C</p>
          <p>49 rue de Ponthieu</p>
          <p>75008 Paris</p>
          <p>Tél. : 01 89 47 00 14</p>
          <p>Site internet : https://www.cm2c.net/declarer-un-litige.php</p>
          <p>E-mail : litiges@cm2c.net</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Honoraires</h2>
        <div className="mt-4 space-y-2 text-zinc-700">
          <p>Transaction – Vente</p>
          <p>TVA incluse au taux en vigueur de 20 %</p>
          <p><strong>6 % TTC du prix de vente TTC</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Les honoraires sont calculés sur le prix de vente total TTC.</li>
            <li>Les honoraires sont inclus dans le prix affiché.</li>
            <li>Ils sont exigibles à la signature de l’acte authentique chez le notaire.</li>
            <li>En cas d’inter-cabinet, les honoraires peuvent être partagés selon les usages professionnels.</li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Données personnelles</h2>
        <div className="mt-4 space-y-3 text-zinc-700">
          <p>Les informations recueillies via le formulaire de contact du site sont enregistrées par CÔTE D’AZUR AGENCY afin de répondre aux demandes adressées via le site.</p>
          <p>Si vous arrivez depuis notre campagne ChatGPT Ads, sa référence peut être jointe à votre demande afin d’en mesurer les résultats. Elle reste uniquement en mémoire pendant la navigation, au maximum 30 minutes, sans cookie ni identifiant publicitaire. Un rechargement complet peut effacer cette information.</p>
          <p><strong>Finalité du traitement :</strong> Gestion des demandes de contact, de renseignement, d’accompagnement immobilier, d’estimation ou de prise de rendez-vous.</p>
          <p><strong>Base légale :</strong> Intérêt légitime à répondre aux demandes adressées via le site et/ou exécution de mesures précontractuelles à la demande de l’utilisateur.</p>
          <p><strong>Destinataires :</strong> Les données sont destinées uniquement à CÔTE D’AZUR AGENCY et, le cas échéant, à ses prestataires techniques habilités.</p>
          <p><strong>Durée de conservation :</strong> Les données sont conservées pendant une durée n’excédant pas celle nécessaire au traitement de la demande, puis supprimées ou archivées conformément à la réglementation applicable.</p>
          <p><strong>Droits :</strong> Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition concernant vos données.</p>
          <p>Vous pouvez exercer ces droits en écrivant à : stephan@cotedazuragency.com</p>
          <p>Vous disposez également du droit d’introduire une réclamation auprès de la CNIL.</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Cookies</h2>
        <p className="mt-4 text-zinc-700">Le présent site n’utilise pas de cookies nécessitant le recueil du consentement de l’utilisateur.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Propriété intellectuelle</h2>
        <p className="mt-4 text-zinc-700">L’ensemble du contenu présent sur ce site, incluant, de façon non limitative, les textes, images, graphismes, logo, icônes, éléments visuels et structure du site, est la propriété exclusive de CÔTE D’AZUR AGENCY ou de ses partenaires, sauf mention contraire.</p>
        <p className="mt-4 text-zinc-700">Toute reproduction, représentation, modification, publication, adaptation, totale ou partielle, de tout ou partie du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Responsabilité</h2>
        <p className="mt-4 text-zinc-700">CÔTE D’AZUR AGENCY s’efforce d’assurer au mieux l’exactitude et la mise à jour des informations diffusées sur le site. Toutefois, elle ne saurait être tenue responsable des omissions, inexactitudes ou carences dans la mise à jour.</p>
        <p className="mt-4 text-zinc-700">L’utilisateur du site reconnaît disposer de la compétence et des moyens nécessaires pour accéder et utiliser ce site.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Droit applicable</h2>
        <p className="mt-4 text-zinc-700">Le présent site est soumis au droit français.</p>
      </section>
    </>
  );
}

function EN() {
  return (
    <>
      <section>
        <h2 className="font-luxe text-2xl">Website Publisher</h2>
        <div className="mt-4 space-y-2 text-zinc-700">
          <p><strong>CÔTE D’AZUR AGENCY</strong></p>
          <p>Real estate agency</p>
          <p>MORAWSKI Stephan Nadia Danitza</p>
          <p>Sole trader</p>
          <p>296 Chemin Clos de Brasset, 06560 Valbonne, France</p>
          <p>Registered with the Trade and Companies Register of Grasse under number 819 389 552</p>
          <p>Email: stephan@cotedazuragency.com</p>
          <p>Phone: +33 (0)6 70 74 65 49</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Publication Director</h2>
        <p className="mt-4 text-zinc-700">Mr. MORAWSKI Stephan Nadia Danitza</p>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Regulated Real Estate Activity</h2>
        <div className="mt-4 space-y-2 text-zinc-700">
          <p>Professional licence no. CPI 0605 2025 000 000 063</p>
          <p>Issued on 11/04/2025 by the Nice-Côte d’Azur Chamber of Commerce and Industry</p>
          <p>Valid until 10/04/2028</p>
          <p>Scope: Transactions on real estate and business assets</p>
          <p>No holding of client funds</p>
          <p>Professional liability insurance: Allianz Actif Pro</p>
          <p>Policy no. 64366011</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Consumer Mediation</h2>
        <div className="mt-4 space-y-2 text-zinc-700">
          <p>CM2C</p>
          <p>49 rue de Ponthieu</p>
          <p>75008 Paris</p>
          <p>France</p>
          <p>Phone: 01 89 47 00 14</p>
          <p>Website: https://www.cm2c.net/declarer-un-litige.php</p>
          <p>Email: litiges@cm2c.net</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Fees</h2>
        <div className="mt-4 space-y-2 text-zinc-700">
          <p>Sales transactions</p>
          <p>VAT included at the current rate of 20%</p>
          <p><strong>6% incl. VAT of the sale price incl. VAT</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fees are calculated on the total sale price including VAT.</li>
            <li>Fees are included in the displayed price.</li>
            <li>They become payable upon signature of the final deed before the notary.</li>
            <li>In the event of inter-agency cooperation, fees may be shared in accordance with professional practice.</li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Personal Data</h2>
        <div className="mt-4 space-y-3 text-zinc-700">
          <p>Information collected through the contact form on this website is processed by CÔTE D’AZUR AGENCY in order to respond to requests submitted through the website.</p>
          <p>If you arrive from our ChatGPT Ads campaign, its reference may be included with your enquiry to measure campaign results. It is retained only in memory during navigation for up to 30 minutes, without cookies or advertising identifiers. A full reload may clear this information.</p>
          <p><strong>Purpose of processing:</strong> Management of contact requests, information requests, property support services, valuations, or appointment bookings.</p>
          <p><strong>Legal basis:</strong> Legitimate interest in responding to requests submitted through the website and/or taking pre-contractual steps at the request of the user.</p>
          <p><strong>Recipients of the data:</strong> The data is intended solely for CÔTE D’AZUR AGENCY and, where applicable, its duly authorised technical service providers.</p>
          <p><strong>Data retention period:</strong> Data is retained only for the period necessary to process the request, then deleted or archived in accordance with applicable regulations.</p>
          <p><strong>Data subject rights:</strong> You have the right to access, rectify, erase, restrict, and object to the processing of your personal data.</p>
          <p>You may exercise these rights by writing to: stephan@cotedazuragency.com</p>
          <p>You also have the right to lodge a complaint with the CNIL.</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Cookies</h2>
        <p className="mt-4 text-zinc-700">This website does not use cookies requiring the user’s consent.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Intellectual Property</h2>
        <p className="mt-4 text-zinc-700">All content on this website, including but not limited to texts, images, graphics, logo, icons, visual elements, and website structure, is the exclusive property of CÔTE D’AZUR AGENCY or its partners, unless otherwise stated.</p>
        <p className="mt-4 text-zinc-700">Any reproduction, representation, modification, publication, or adaptation, in whole or in part, of any part of the website, by any means or process whatsoever, is prohibited without prior written authorisation.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Liability</h2>
        <p className="mt-4 text-zinc-700">CÔTE D’AZUR AGENCY makes every effort to ensure the accuracy and updating of the information published on this website. However, it cannot be held liable for any omissions, inaccuracies, or failures to update such information.</p>
        <p className="mt-4 text-zinc-700">Users of the website acknowledge that they have the necessary skills and means to access and use this website.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-luxe text-2xl">Applicable Law</h2>
        <p className="mt-4 text-zinc-700">This website is governed by French law.</p>
      </section>
    </>
  );
}

export default async function LegalPage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <main className="container py-16">
      <h1 className="font-luxe text-4xl">
        {lang === 'en' ? 'Legal Notice' : 'Mentions légales'}
      </h1>

      <div className="mt-10 rounded-[28px] bg-white p-8 shadow-soft ring-1 ring-[var(--gold-light)]">
        {lang === 'en' ? <EN /> : <FR />}
      </div>
    </main>
  );
}

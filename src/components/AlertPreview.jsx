'use client';
import { useState } from 'react';

const cities = ['Valbonne','Mougins','Biot','Cannes','Antibes','Théoule-sur-Mer','Sophia Antipolis','Grasse','Vence','Opio'];
const options = ['Appartement','Maison / Villa','Terrain'];
const money = v => v ? Number(v).toLocaleString('fr-FR') + ' €' : null;

export default function AlertPreview({lang = 'fr'}) {
  const fr = lang !== 'en';
  const [selected, setSelected] = useState([]);
  const [types, setTypes] = useState([]);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [rooms, setRooms] = useState('');
  const [surface, setSurface] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [demo, setDemo] = useState(false);
  const toggle = (a, set, value) => set(a.includes(value) ? a.filter(x => x !== value) : [...a, value]);
  const inputClass = 'w-full rounded-none border border-[#ddd8ce] bg-white px-4 py-3 text-sm text-[#243039] focus:border-[#b59a65] focus:outline-none';
  const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[.13em] text-[#616970]';
  const chips = selected.concat(types).concat([min || max ? [min ? '≥ '+money(min) : '', max ? '≤ '+money(max) : ''].filter(Boolean).join(' · ') : '', rooms ? rooms + (fr ? ' pièces min.' : ' rooms min.') : '', surface ? surface + ' m² min.' : ''].filter(Boolean));
  return <section id="mes-alertes" className="bg-[#f5f0e8] py-16 sm:py-24 text-[#243039]">
    <div className="container max-w-6xl">
      <div className="mb-9 flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-[690px]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[.23em] text-[#987a4b]">{fr ? 'Votre recherche, en toute simplicité' : 'A simpler property search'}</p>
          <h2 className="font-[Georgia] text-4xl leading-tight sm:text-5xl">{fr ? 'Mes alertes immobilières' : 'My property alerts'}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#616970]">{fr ? 'Décrivez votre bien idéal. Soyez informé(e) lorsqu’une nouvelle annonce correspondant à votre recherche est publiée.' : 'Tell us what you are looking for. Be notified when a newly published property matches your preferences.'}</p>
        </div>
        <span className="border border-[#d6b985] px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#8b724a]">{fr ? 'Prévisualisation · sans inscription' : 'Preview · no sign-up'}</span>
      </div>
      <div className="grid overflow-hidden border border-[#e5e1d9] bg-[#fffefb] shadow-[0_20px_65px_rgba(20,35,43,.07)] lg:grid-cols-[1.55fr_.85fr]">
        <form className="space-y-7 p-6 sm:p-10" onSubmit={e => {e.preventDefault(); if(consent && email.trim()) setDemo(true);}}>
          <div><label className={labelClass}>{fr ? '1. Votre secteur de recherche' : '1. Preferred locations'}</label>
            <div className="flex flex-wrap gap-2">{cities.map(city => <button key={city} type="button" aria-pressed={selected.includes(city)} onClick={() => toggle(selected,setSelected,city)} className={'border px-3 py-2 text-xs transition '+(selected.includes(city) ? 'border-[#14232b] bg-[#14232b] text-white' : 'border-[#e5e1d9] bg-white hover:border-[#b59a65]')}>{city}{selected.includes(city) ? ' ✓' : ''}</button>)}</div>
            <p className="mt-2 text-xs text-[#81817a]">{fr ? 'Sélectionnez une ou plusieurs communes. Sans sélection : toute la Côte d’Azur.' : 'Select one or more towns. No selection means the whole French Riviera.'}</p>
          </div>
          <div><label className={labelClass}>{fr ? '2. Type de bien' : '2. Property type'}</label><div className="flex flex-wrap gap-2">{options.map((type,i) => <button type="button" key={type} aria-pressed={types.includes(type)} onClick={() => toggle(types,setTypes,type)} className={'border px-4 py-3 text-xs transition '+(types.includes(type) ? 'border-[#14232b] bg-[#14232b] text-white' : 'border-[#e5e1d9] bg-white hover:border-[#b59a65]')}>{!fr ? ['Apartment','House / Villa','Land'][i] : type}{types.includes(type) ? ' ✓' : ''}</button>)}</div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="alertMin" className={labelClass}>{fr ? 'Budget minimum (€)' : 'Minimum budget (€)'}</label><input id="alertMin" className={inputClass} type="number" min="0" step="10000" value={min} onChange={e=>setMin(e.target.value)} placeholder={fr ? 'Sans minimum' : 'No minimum'}/></div><div><label htmlFor="alertMax" className={labelClass}>{fr ? 'Budget maximum (€)' : 'Maximum budget (€)'}</label><input id="alertMax" className={inputClass} type="number" min="0" step="10000" value={max} onChange={e=>setMax(e.target.value)} placeholder={fr ? 'Sans maximum' : 'No maximum'}/></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="alertRooms">{fr ? 'Nombre de pièces minimum' : 'Minimum rooms'}</label><select id="alertRooms" className={inputClass} value={rooms} onChange={e=>setRooms(e.target.value)}><option value="">{fr ? 'Indifférent' : 'Any'}</option>{[2,3,4,5,6].map(x=><option key={x} value={x}>{x}+</option>)}</select></div><div><label htmlFor="alertArea" className={labelClass}>{fr ? 'Surface minimum (m²)' : 'Minimum area (m²)'}</label><input id="alertArea" className={inputClass} value={surface} type="number" min="0" step="5" onChange={e=>setSurface(e.target.value)} placeholder={fr ? 'Indifférent' : 'Any'}/></div></div>
          <div className="border-t border-[#e5e1d9] pt-7"><h3 className="mb-3 font-[Georgia] text-2xl">{fr ? 'Recevoir les nouvelles annonces' : 'Get new property listings'}</h3><label className={labelClass} htmlFor="alertMail">{fr ? 'Votre adresse e-mail' : 'Your email address'}</label><input id="alertMail" className={inputClass} type="email" required value={email} onChange={e=>{setEmail(e.target.value);setDemo(false)}} placeholder="vous@exemple.com" autoComplete="email"/>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#616970]"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#14232b]" checked={consent} onChange={e=>setConsent(e.target.checked)} required /><span>{fr ? 'J’accepte de recevoir par e-mail les nouvelles annonces correspondant à mes critères. Je pourrai me désinscrire à tout moment.' : 'I agree to receive matching property listings by email. I can unsubscribe at any time.'}</span></label>
            <button type="submit" className="mt-6 w-full bg-[#14232b] px-5 py-4 text-xs font-bold uppercase tracking-[.14em] text-white hover:bg-[#31434b] sm:w-auto">{fr ? 'Prévisualiser mon alerte' : 'Preview my alert'} &nbsp; ↗</button>
            {demo && <p role="status" className="mt-4 border-l-2 border-[#b59a65] bg-[#f5f0e8] p-3 text-sm">{fr ? 'Aperçu validé. Aucun e-mail enregistré et aucune alerte envoyée dans cette démonstration.' : 'Preview complete. No email stored and no alert sent in this demo.'}</p>}
          </div>
        </form>
        <aside className="flex flex-col justify-between bg-[#14232b] p-7 text-white sm:p-10">
          <div><p className="text-[11px] font-semibold uppercase tracking-[.21em] text-[#ddc394]">{fr ? 'Votre alerte en un coup d’œil' : 'Your search at a glance'}</p><h3 className="mt-5 font-[Georgia] text-3xl leading-tight">{fr ? 'Le bon bien, au bon moment.' : 'The right home, at the right time.'}</h3><p className="mt-5 text-sm leading-7 text-[#d0d6d7]">{fr ? 'Un résumé clair de vos préférences. Vos critères pourront être modifiés avant la future activation du service.' : 'A clear summary of your preferences. Criteria can be adjusted before the service launches.'}</p>
            <div className="mt-9 flex flex-wrap gap-2">{chips.length ? chips.map((x,i)=><span key={i} className="border border-[#829095] px-3 py-2 text-xs text-white">{x}</span>) : <span className="text-sm italic text-[#d0d6d7]">{fr ? 'Tous les biens · Tous les secteurs' : 'All properties · All locations'}</span>}</div>
          </div>
          <div className="mt-12 border-t border-[#607078] pt-6"><p className="text-xs font-semibold uppercase tracking-widest text-[#ddc394]">{fr ? 'Comment cela fonctionnera' : 'How it will work'}</p><div className="mt-5 space-y-5 text-sm text-[#edf0f0]"><p><span className="mr-3 text-[#ddc394]">01</span>{fr ? 'Vous précisez vos critères' : 'Set your preferences'}</p><p><span className="mr-3 text-[#ddc394]">02</span>{fr ? 'Une annonce correspondante est publiée' : 'A matching listing is published'}</p><p><span className="mr-3 text-[#ddc394]">03</span>{fr ? 'Vous recevez un e-mail' : 'You receive an email'}</p></div><p className="mt-7 text-xs leading-6 text-[#bdc8c8]">{fr ? 'Cette page est une maquette fonctionnelle : aucun abonnement n’est créé.' : 'This is an interactive mock-up; no subscription is created.'}</p></div>
        </aside>
      </div>
    </div>
  </section>;
}

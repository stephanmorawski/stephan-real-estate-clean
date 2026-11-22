'use client';

import { getCampaignAttribution } from '@/lib/campaign-attribution.mjs';

import { useState } from 'react';

const cities = [
  'Antibes',
  'Biot',
  'Cannes',
  'Châteauneuf-Grasse',
  'Grasse',
  'La Colle-sur-Loup',
  'Le Bar-sur-Loup',
  'Le Rouret',
  'Mandelieu-la-Napoule',
  'Mouans-Sartoux',
  'Mougins',
  'Opio',
  'Roquefort-les-Pins',
  'Saint-Paul-de-Vence',
  'Sophia Antipolis',
  'Théoule-sur-Mer',
  'Tourrettes-sur-Loup',
  'Valbonne',
  'Vence',
];

const propertyTypes = [
  { value: 'apartment', fr: 'Appartement', en: 'Apartment' },
  { value: 'house', fr: 'Maison / Villa', en: 'House / Villa' },
  { value: 'land', fr: 'Terrain', en: 'Land' },
];

const budgetOptions = [500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000];
const surfaceOptions = [50, 80, 100, 150, 200, 300];

function formatMoney(value, lang) {
  if (!value) return '';

  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function AlertPreview({ lang = 'fr' }) {
  const fr = lang !== 'en';
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [rooms, setRooms] = useState('');
  const [surface, setSurface] = useState('');
  const [frequency, setFrequency] = useState('instant');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [openPanel, setOpenPanel] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState('idle');

  const labelClass = 'text-[10px] font-semibold uppercase tracking-[.16em] text-[#7b7d78]';
  const selectClass =
    'mt-2 w-full border border-[#ddd8ce] bg-white px-3 py-3 text-sm text-[#243039] focus:border-[#b59a65] focus:outline-none';
  const panelButtonClass =
    'group flex w-full items-center justify-between border border-[#ddd8ce] bg-white px-4 py-3 text-left transition hover:border-[#b59a65] focus:border-[#b59a65] focus:outline-none';
  const panelClass =
    'absolute left-0 top-[calc(100%+8px)] z-30 w-full min-w-[280px] border border-[#ddd8ce] bg-[#fffefb] p-4 shadow-[0_18px_45px_rgba(20,35,43,.14)] sm:min-w-[340px]';

  function clearFeedback() {
    setSubmissionStatus('idle');
  }

  function toggleArrayValue(items, setItems, value) {
    setItems(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
    clearFeedback();
  }

  function resetCriteria() {
    setSelectedCities([]);
    setSelectedTypes([]);
    setMinBudget('');
    setMaxBudget('');
    setRooms('');
    setSurface('');
    setFrequency('instant');
    clearFeedback();
  }

  const selectedTypeLabels = propertyTypes
    .filter((type) => selectedTypes.includes(type.value))
    .map((type) => (fr ? type.fr : type.en));

  const locationSummary = selectedCities.length
    ? selectedCities.length === 1
      ? selectedCities[0]
      : fr
        ? `${selectedCities.length} secteurs`
        : `${selectedCities.length} locations`
    : fr
      ? 'Toute la Côte d’Azur'
      : 'All French Riviera';

  const typeSummary = selectedTypeLabels.length
    ? selectedTypeLabels.length === 1
      ? selectedTypeLabels[0]
      : `${selectedTypeLabels.length} types`
    : fr
      ? 'Tous les biens'
      : 'All property types';

  const budgetSummary = minBudget || maxBudget
    ? [
        minBudget ? `${fr ? 'Dès' : 'From'} ${formatMoney(minBudget, lang)}` : '',
        maxBudget ? `${fr ? 'jusqu’à' : 'up to'} ${formatMoney(maxBudget, lang)}` : '',
      ]
        .filter(Boolean)
        .join(' · ')
    : fr
      ? 'Budget libre'
      : 'Any budget';

  const criteriaSummary = [
    rooms ? `${rooms}+ ${fr ? 'pièces' : 'rooms'}` : '',
    surface ? `${surface}+ m²` : '',
  ]
    .filter(Boolean)
    .join(' · ') || (fr ? 'Sans minimum' : 'No minimum');

  const frequencyLabel = {
    instant: fr ? 'Dès publication' : 'As soon as published',
    daily: fr ? 'Résumé quotidien' : 'Daily digest',
    weekly: fr ? 'Résumé hebdomadaire' : 'Weekly digest',
  }[frequency];

  const chips = [
    ...selectedCities,
    ...selectedTypeLabels,
    minBudget || maxBudget ? budgetSummary : '',
    rooms ? `${rooms}+ ${fr ? 'pièces' : 'rooms'}` : '',
    surface ? `${surface}+ m²` : '',
    frequencyLabel,
  ].filter(Boolean);

  async function submitAlertRequest(event) {
    event.preventDefault();
    if (!consent || !email.trim() || submissionStatus === 'sending') return;

    setSubmissionStatus('sending');

    const message = [
      fr ? 'Demande de création d’une alerte immobilière' : 'Property alert creation request',
      '',
      `${fr ? 'Secteurs' : 'Locations'} : ${selectedCities.length ? selectedCities.join(', ') : (fr ? 'Toute la Côte d’Azur' : 'All French Riviera')}`,
      `${fr ? 'Type de bien' : 'Property type'} : ${selectedTypeLabels.length ? selectedTypeLabels.join(', ') : (fr ? 'Tous les biens' : 'All property types')}`,
      `Budget : ${budgetSummary}`,
      `${fr ? 'Pièces minimum' : 'Minimum rooms'} : ${rooms || (fr ? 'Indifférent' : 'Any')}`,
      `${fr ? 'Surface minimum' : 'Minimum area'} : ${surface ? `${surface} m²` : (fr ? 'Indifférente' : 'Any')}`,
      `${fr ? 'Fréquence souhaitée' : 'Preferred frequency'} : ${frequencyLabel}`,
      '',
      fr
        ? 'Le demandeur a accepté de recevoir les annonces correspondant à ces critères.'
        : 'The requester agreed to receive listings matching these criteria.',
    ].join('\n');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fr ? 'Alerte immobilière' : 'Property alert',
          email: email.trim(),
          phone: '',
          message,
          lang,
          website: '',
          attribution: getCampaignAttribution(),
          requestKind: 'property_alert',
        }),
      });

      const result = await response.json();
      if (!response.ok || result?.ok !== true) {
        throw new Error(`Alert request failed with status ${response.status}`);
      }

      setSubmissionStatus('success');
    } catch (error) {
      console.error('PROPERTY_ALERT_REQUEST_ERROR', error);
      setSubmissionStatus('error');
    }
  }

  return (
    <section id="mes-alertes" className="bg-[#f5f0e8] py-12 text-[#243039] sm:py-16">
      <div className="container max-w-6xl">
        <div className="mb-6 max-w-[720px]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[.23em] text-[#987a4b]">
            {fr ? 'Votre recherche, en toute simplicité' : 'A simpler property search'}
          </p>
          <h2 className="font-[Georgia] text-3xl leading-tight sm:text-4xl">
            {fr ? 'Mes alertes immobilières' : 'My property alerts'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#616970]">
            {fr
              ? 'Enregistrez vos critères essentiels et soyez informé dès qu’un bien correspondant est publié.'
              : 'Save your essential criteria and be notified when a matching property is published.'}
          </p>
        </div>

        <form
          className="border border-[#e5e1d9] bg-[#fffefb] shadow-[0_20px_65px_rgba(20,35,43,.07)]"
          onSubmit={submitAlertRequest}
        >
          <div className="grid gap-px bg-[#e5e1d9] lg:grid-cols-4">
            <div className="relative bg-[#fffefb] p-3">
              <button
                type="button"
                className={panelButtonClass}
                aria-expanded={openPanel === 'locations'}
                onClick={() => setOpenPanel(openPanel === 'locations' ? null : 'locations')}
              >
                <span>
                  <span className={labelClass}>{fr ? 'Secteurs' : 'Locations'}</span>
                  <span className="mt-1 block text-sm font-medium">{locationSummary}</span>
                </span>
                <span aria-hidden="true" className="text-lg text-[#987a4b]">⌄</span>
              </button>

              {openPanel === 'locations' ? (
                <div className={panelClass}>
                  <p className="mb-3 text-xs leading-5 text-[#616970]">
                    {fr
                      ? 'Sélection multiple possible. Aucun choix = toute la Côte d’Azur.'
                      : 'Select several locations. No selection = the whole French Riviera.'}
                  </p>
                  <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto overscroll-contain">
                    {cities.map((city) => (
                      <label
                        key={city}
                        className="flex cursor-pointer items-center gap-2 border border-[#e5e1d9] px-3 py-2 text-xs hover:border-[#b59a65]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCities.includes(city)}
                          onChange={() => toggleArrayValue(selectedCities, setSelectedCities, city)}
                          className="h-4 w-4 shrink-0 accent-[#14232b]"
                        />
                        <span>{city}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenPanel(null)}
                    className="mt-4 w-full bg-[#14232b] px-4 py-3 text-[11px] font-bold uppercase tracking-[.14em] text-white"
                  >
                    {fr ? 'Valider les secteurs' : 'Apply locations'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="relative bg-[#fffefb] p-3">
              <button
                type="button"
                className={panelButtonClass}
                aria-expanded={openPanel === 'types'}
                onClick={() => setOpenPanel(openPanel === 'types' ? null : 'types')}
              >
                <span>
                  <span className={labelClass}>{fr ? 'Type de bien' : 'Property type'}</span>
                  <span className="mt-1 block text-sm font-medium">{typeSummary}</span>
                </span>
                <span aria-hidden="true" className="text-lg text-[#987a4b]">⌄</span>
              </button>

              {openPanel === 'types' ? (
                <div className={panelClass}>
                  <div className="space-y-2">
                    {propertyTypes.map((type) => (
                      <label
                        key={type.value}
                        className="flex cursor-pointer items-center gap-3 border border-[#e5e1d9] px-3 py-3 text-sm hover:border-[#b59a65]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type.value)}
                          onChange={() => toggleArrayValue(selectedTypes, setSelectedTypes, type.value)}
                          className="h-4 w-4 accent-[#14232b]"
                        />
                        <span>{fr ? type.fr : type.en}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenPanel(null)}
                    className="mt-4 w-full bg-[#14232b] px-4 py-3 text-[11px] font-bold uppercase tracking-[.14em] text-white"
                  >
                    {fr ? 'Valider les types' : 'Apply property types'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="relative bg-[#fffefb] p-3">
              <button
                type="button"
                className={panelButtonClass}
                aria-expanded={openPanel === 'budget'}
                onClick={() => setOpenPanel(openPanel === 'budget' ? null : 'budget')}
              >
                <span>
                  <span className={labelClass}>Budget</span>
                  <span className="mt-1 block text-sm font-medium">{budgetSummary}</span>
                </span>
                <span aria-hidden="true" className="text-lg text-[#987a4b]">⌄</span>
              </button>

              {openPanel === 'budget' ? (
                <div className={panelClass}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className={labelClass}>Minimum</span>
                      <select
                        value={minBudget}
                        onChange={(event) => {
                          setMinBudget(event.target.value);
                          clearFeedback();
                        }}
                        className={selectClass}
                      >
                        <option value="">{fr ? 'Sans minimum' : 'No minimum'}</option>
                        {budgetOptions.map((value) => (
                          <option key={value} value={value}>{formatMoney(value, lang)}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className={labelClass}>Maximum</span>
                      <select
                        value={maxBudget}
                        onChange={(event) => {
                          setMaxBudget(event.target.value);
                          clearFeedback();
                        }}
                        className={selectClass}
                      >
                        <option value="">{fr ? 'Sans maximum' : 'No maximum'}</option>
                        {budgetOptions.map((value) => (
                          <option key={value} value={value}>{formatMoney(value, lang)}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenPanel(null)}
                    className="mt-4 w-full bg-[#14232b] px-4 py-3 text-[11px] font-bold uppercase tracking-[.14em] text-white"
                  >
                    {fr ? 'Valider le budget' : 'Apply budget'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="relative bg-[#fffefb] p-3">
              <button
                type="button"
                className={panelButtonClass}
                aria-expanded={openPanel === 'criteria'}
                onClick={() => setOpenPanel(openPanel === 'criteria' ? null : 'criteria')}
              >
                <span>
                  <span className={labelClass}>{fr ? 'Autres critères' : 'More criteria'}</span>
                  <span className="mt-1 block text-sm font-medium">{criteriaSummary}</span>
                </span>
                <span aria-hidden="true" className="text-lg text-[#987a4b]">⌄</span>
              </button>

              {openPanel === 'criteria' ? (
                <div className={`${panelClass} lg:left-auto lg:right-0`}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className={labelClass}>{fr ? 'Pièces minimum' : 'Minimum rooms'}</span>
                      <select
                        value={rooms}
                        onChange={(event) => {
                          setRooms(event.target.value);
                          clearFeedback();
                        }}
                        className={selectClass}
                      >
                        <option value="">{fr ? 'Indifférent' : 'Any'}</option>
                        {[2, 3, 4, 5, 6].map((value) => (
                          <option key={value} value={value}>{value}+</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className={labelClass}>{fr ? 'Surface minimum' : 'Minimum area'}</span>
                      <select
                        value={surface}
                        onChange={(event) => {
                          setSurface(event.target.value);
                          clearFeedback();
                        }}
                        className={selectClass}
                      >
                        <option value="">{fr ? 'Indifférent' : 'Any'}</option>
                        {surfaceOptions.map((value) => (
                          <option key={value} value={value}>{value} m²</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-3 block">
                    <span className={labelClass}>{fr ? 'Fréquence souhaitée' : 'Preferred frequency'}</span>
                    <select
                      value={frequency}
                      onChange={(event) => {
                        setFrequency(event.target.value);
                        clearFeedback();
                      }}
                      className={selectClass}
                    >
                      <option value="instant">{fr ? 'Dès publication' : 'As soon as published'}</option>
                      <option value="daily">{fr ? 'Résumé quotidien' : 'Daily digest'}</option>
                      <option value="weekly">{fr ? 'Résumé hebdomadaire' : 'Weekly digest'}</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => setOpenPanel(null)}
                    className="mt-4 w-full bg-[#14232b] px-4 py-3 text-[11px] font-bold uppercase tracking-[.14em] text-white"
                  >
                    {fr ? 'Valider les critères' : 'Apply criteria'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-[#e5e1d9] px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                {chips.map((chip, index) => (
                  <span
                    key={`${chip}-${index}`}
                    className="border border-[#ddd8ce] bg-white px-3 py-2 text-[11px] text-[#4d585e]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={resetCriteria}
                className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#8b724a] underline underline-offset-4"
              >
                {fr ? 'Réinitialiser' : 'Reset'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#e5e1d9] p-5 lg:grid-cols-[1fr_auto] lg:items-end sm:p-6">
            <div>
              <label htmlFor="alertMail" className={labelClass}>
                {fr ? 'Votre adresse e-mail' : 'Your email address'}
              </label>
              <input
                id="alertMail"
                className="mt-2 w-full border border-[#ddd8ce] bg-white px-4 py-3 text-sm text-[#243039] focus:border-[#b59a65] focus:outline-none"
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFeedback();
                }}
                placeholder={fr ? 'vous@exemple.com' : 'you@example.com'}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={submissionStatus === 'sending'}
              className="h-[46px] bg-[#14232b] px-6 text-[11px] font-bold uppercase tracking-[.14em] text-white transition hover:bg-[#31434b] disabled:cursor-wait disabled:opacity-60"
            >
              {submissionStatus === 'sending'
                ? (fr ? 'Envoi en cours…' : 'Sending…')
                : (fr ? 'Créer mon alerte' : 'Create my alert')} &nbsp; ↗
            </button>

            <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#616970] lg:col-span-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-[#14232b]"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  clearFeedback();
                }}
                required
              />
              <span>
                {fr
                  ? 'J’accepte de recevoir les annonces correspondant à mes critères. Désinscription possible à tout moment.'
                  : 'I agree to receive listings matching my criteria. I can unsubscribe at any time.'}
              </span>
            </label>

            {submissionStatus === 'success' ? (
              <p role="status" className="border-l-2 border-[#6f8b72] bg-[#eef4ee] p-3 text-sm lg:col-span-2">
                {fr
                  ? 'Votre demande d’alerte a bien été transmise à Côte d’Azur Agency. Vous recevrez une confirmation lors de son activation.'
                  : 'Your alert request has been sent to Côte d’Azur Agency. You will receive confirmation when it is activated.'}
              </p>
            ) : null}

            {submissionStatus === 'error' ? (
              <p role="alert" className="border-l-2 border-[#a34b42] bg-[#f8efed] p-3 text-sm lg:col-span-2">
                {fr
                  ? 'La demande n’a pas pu être envoyée. Réessayez ou contactez directement l’agence.'
                  : 'The request could not be sent. Please try again or contact the agency directly.'}
              </p>
            ) : null}
          </div>

          <div className="grid gap-px bg-[#607078] text-white md:grid-cols-3">
            {[
              fr ? 'Choisissez vos critères' : 'Choose your criteria',
              fr ? 'Un bien correspondant est publié' : 'A matching property is published',
              fr ? 'Vous recevez une alerte' : 'You receive an alert',
            ].map((step, index) => (
              <div key={step} className="flex items-center gap-3 bg-[#14232b] px-5 py-4 text-xs">
                <span className="font-semibold text-[#ddc394]">0{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}

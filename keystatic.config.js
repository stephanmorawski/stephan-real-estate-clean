import { collection, config, fields } from '@keystatic/core';

const requiredText = (label, options = {}) =>
  fields.text({
    label,
    validation: { isRequired: true },
    ...options,
  });

const localizedContent = (label) =>
  fields.object(
    {
      title: requiredText('Titre'),
      excerpt: requiredText('Résumé', { multiline: true }),
      content: fields.array(
        fields.text({
          label: 'Paragraphe',
          multiline: true,
          validation: { isRequired: true },
        }),
        {
          label: 'Contenu',
          itemLabel: (props) => props.value?.slice(0, 70) || 'Nouveau paragraphe',
        }
      ),
    },
    {
      label,
      description: `Version ${label.toLowerCase()} de l’actualité.`,
    }
  );

export default config({
  storage: {
    kind: 'github',
    repo: 'stephanmorawski/stephan-real-estate-clean',
  },
  ui: {
    brand: {
      name: 'Côte d’Azur Agency — Actualités',
    },
  },
  collections: {
    news: collection({
      label: 'Actualités',
      path: 'content/news/*',
      slugField: 'slug',
      format: { data: 'json' },
      columns: ['slug', 'publishedAt', 'status'],
      previewUrl: '/preview/start?branch={branch}&to=/fr/actualites/{slug}',
      schema: {
        slug: fields.slug({
          name: {
            label: 'Titre interne',
            description: 'Utilisé pour identifier l’article dans l’administration.',
            validation: { isRequired: true },
          },
          slug: {
            label: 'Adresse URL',
            description: 'Exemple : marche-immobilier-cote-dazur-2026',
          },
        }),
        status: fields.select({
          label: 'Statut',
          options: [
            { label: 'Brouillon', value: 'draft' },
            { label: 'Publié', value: 'published' },
          ],
          defaultValue: 'published',
        }),
        publishedAt: fields.date({
          label: 'Date de publication',
          validation: { isRequired: true },
        }),
        source: fields.text({
          label: 'Source',
          defaultValue: 'LinkedIn',
        }),
        linkedinUrl: fields.url({
          label: 'Lien LinkedIn',
          description: 'Facultatif.',
        }),
        image: fields.text({
          label: 'Chemin de l’image existante',
          description: 'Conservé pour les anciens articles. Laisser vide pour un nouvel article.',
        }),
        imageUpload: fields.image({
          label: 'Nouvelle image',
          description: 'Image principale utilisée en priorité sur le chemin existant.',
          directory: 'public/news',
          publicPath: '/news/',
        }),
        fr: localizedContent('Français'),
        en: localizedContent('Anglais'),
      },
    }),
  },
});


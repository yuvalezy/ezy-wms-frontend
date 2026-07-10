# Embedded documentation

Last verified against source: 2026-07-10.

## User-facing entry points

The WMS guide is available only to authenticated users:

- `/docs` — searchable guide index.
- `/docs/:module/*` — full-page article reader with previous/next navigation.
- HelpCircle button in `ContentTheme` — opens the right-side contextual slide-over.

The slide-over is contextual when the current pathname matches an article route in
the backend manifest. For pages without a matching route it opens the full guide
list. The panel and article page support English and Spanish through the application
locale. The frontend falls back to English for every locale other than Spanish.

## Frontend implementation contract

| Concern | Source of truth |
| --- | --- |
| Provider, locale selection, route matching, article loading | `src/features/docs/DocsContext.tsx` |
| API request types and paths | `src/features/docs/api.ts` |
| Contextual panel, search, Escape close, scrolling | `src/features/docs/HelpPanel.tsx` |
| Index/article routes and navigation | `src/features/docs/DocsPage.tsx`, `src/App.tsx` |
| Safe Markdown subset | `src/features/docs/MarkdownRenderer.tsx` |
| Shared HelpCircle button | `src/components/ContentTheme.tsx` |
| English/Spanish UI labels | `src/Translations/*/translation.json`, `docs.*` |

The frontend loads the article index once per authenticated locale and filters that
index locally for slide-over search. It fetches Markdown only after an article is
chosen. Long selected articles and the guide list use constrained scroll areas; do
not remove the `min-h-0 flex-1` layout constraints when changing the panel.

Internal Markdown links in the slide-over close the panel and navigate to the
linked full-page route. Relative guide links are resolved against the current
article; external links continue to open in a new tab.

The backend is the content and authorization boundary. It publishes the manifest and
Markdown corpus, applies role/super-user/feature visibility, and serves the article
endpoints consumed by the frontend. Do not add a second copied article corpus to
this repository when changing WMS user guidance.

`MarkdownRenderer` supports the subset needed by the WMS corpus: headings,
paragraphs, unordered/ordered lists, fenced code blocks, tables, blockquotes,
images, inline code/emphasis, and links. It intentionally does not render raw HTML
or execute embedded content; changes to the corpus must remain compatible with that
safe subset.

## WMS wiki coverage

The source WMS wiki is readable at
`/mnt/dev/ezy/ezy-wiki/src/content/docs/{en,es}/wms/` and currently contains 55
English and 55 Spanish Markdown articles. The backend-imported corpus is the
runtime copy used by the embedded helper. The source wiki remains the authoring
location; after changing a guide, regenerate/import the backend corpus and verify
both locales before relying on the in-app panel.

The corpus covers getting started, dashboard/login, item management, goods receipt,
receipt confirmation, picking, counting, transfer, transfer confirmation, direct
transfer, and super-user settings. The frontend route/functionality documents are
the engineering reference for what this checkout actually exposes.

## Known source-wiki drift found during this audit

- The wiki's English and Spanish `wms/settings/index.md` list does not include the
  implemented `/settings/configuration` page. The current frontend exposes that
  super-user route and `docs/functionality.md` documents it.
- The wiki's dashboard and user guide advertise **Package Check**, but the current
  frontend has no `/packageCheck` route or menu entry in `src/App.tsx` and
  `src/hooks/useMenus.tsx`. Do not treat that article as an available frontend
  workflow until the route is implemented or the source wiki is corrected.

These are source-wiki follow-ups, not frontend code changes. Keep the embedded
documentation inventory and the route table aligned with `App.tsx` and the backend
manifest.

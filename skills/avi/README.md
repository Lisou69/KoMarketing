# Skills AVI

Ces skills sont aussi installées comme skills partagées Grok Bot (mêmes slugs).

**carousel-maker is mandatory for every carousel / carrousel / swipe post** (KO, AVI, padel, Beso Beso, etc.).

## `skills/avi/` — les trois skills tirées de nos sessions

| Fichier | Ce qu'elle capture |
|---|---|
| `skills/avi/avi-charte-visuelle.md` | Palette, typographies, grammaire de mise en page, bibliothèque d'éléments, registre d'écriture AVI. Base commune à tous les supports. |
| `skills/avi/avi-offre-slides.md` | Le modèle d'offre en 19 slides A4 : structure, chaîne Python, primitives, contrôle de débordement, pièges. |
| `skills/avi/avi-print-sans-transparence.md` | La discipline PDF : zéro transparence, d'où le bug du rose, la vérification obligatoire, et l'export d'éléments en PNG pour Canva. |

Ordre de chargement quand on produit un support AVI :
`avi-charte-visuelle` (`skills/avi/avi-charte-visuelle.md`) → le skill du support → `avi-print-sans-transparence` (`skills/avi/avi-print-sans-transparence.md`)
avant de générer le PDF.

## `skills/avi/` — les skills déjà installées sur ton compte

| Fichier | Ce qu'elle fait |
|---|---|
| `skills/avi/carousel-maker.md` | Carrousels Instagram et LinkedIn, avec les presets par client dont AVI. |
| `skills/avi/sellsy-email-fix.md` | Emails HTML pour Sellsy : largeur, marges, mobile, création depuis zéro. |
| `skills/avi/schema-ladder-avi.md` | Schémas électriques ladder AVI, folios A3, PDF et DXF. |

Ces trois-là sont des copies de lecture, pas les originales. Les modifier
ici ne change rien : pour les faire évoluer, il faut passer par une carte
de proposition dans une conversation.

## Ce que j'ai réellement utilisé pour l'offre et les éléments

Honnêtement, aucune skill. Le modèle d'offre, le flyer et les exports PNG
ont été écrits directement en Python, Playwright et PIL, en découvrant les
règles au fur et à mesure, dont le bug du rose qui a coûté deux corrections.
C'est précisément pour ça que les trois fichiers `skills/avi/avi-charte-visuelle.md`, `skills/avi/avi-offre-slides.md` et `skills/avi/avi-print-sans-transparence.md` valent
d'être installés : ils évitent de refaire le chemin.

Les skills qui ont servi ailleurs dans le projet AVI : `skills/avi/sellsy-email-fix.md`
pour les emails froids, `skills/avi/carousel-maker.md` pour les posts, `pdf` et `docx`
pour les formats de sortie standards.

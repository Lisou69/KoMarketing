---
name: avi-charte-visuelle
description: Charte visuelle Avenir Vision Industrie (AVI) — palette, typographies, grammaire de mise en page et bibliothèque d'éléments, communes aux carrousels, flyers, offres, emails et exports Canva. À charger avant de créer ou modifier un support visuel AVI.
---

# Charte visuelle AVI

Base commune à tous les supports AVI. Les skills `avi-offre-slides`,
`avi-print-sans-transparence`, `carousel-maker` et `sellsy-email-fix`
s'appuient dessus. Si un support AVI est demandé et que rien ne contredit
cette charte, l'appliquer sans demander.

## Palette

| Rôle | Hex | Usage |
|---|---|---|
| Encre | `#17161F` | fond des slides foncés, barres d'en-tête |
| Deep | `#0F0E15` | variante plus sombre, aplats de fond |
| Pale | `#EEF0F6` | fond des slides clairs, encarts sur fond clair |
| Violet | `#504FA8` | accent sur fond clair, filets, libellés |
| Violet clair | `#8B8AE6` | accent sur fond foncé, aplats de contact |
| Texte | `#232130` | corps de texte sur fond clair |
| Texte doux | `#4B4859` clair / `#CCCCCE` foncé | leads, sous-titres |
| Muted | `#5B586B` | légendes, mentions |

Séparateurs : `#D2D3DA` (grilles de cartes, fond clair), `#37373E` (fond
foncé), `#CECFD6` et `#3C3B43` pour les filets de lignes.

Variante projet REGROUP : violet `#4D4DBD`, brosse `#CFD6FD`, barre jaune
`#FFE218`. Ne pas la mélanger avec la palette principale sur un même
document.

## Typographies

Deux appariements, choisis selon la nature du support.

**Supports visuels** (carrousels, flyer, slides d'offre)
- Titres : Montserrat 900, interlettrage `-0.035em`, interligne 1.05
- Mot accentué : Playfair Display Italic 500, `1.14em` de la taille du titre
- Courant : Montserrat 500 à 800

**Documents de lecture** (emails, notes, documents longs)
- Titres : DM Serif Display
- Courant : Barlow 400 à 700

Un titre AVI porte exactement un mot en Playfair italique violet. Deux mots
accentués cassent le rythme, zéro rend le titre plat.

### Embarquer les polices

`fonts.googleapis.com` n'est pas joignable depuis le conteneur, le registre
npm oui. Installer via `npm i @fontsource/montserrat @fontsource/playfair-display`
puis encoder les `.woff2` en base64 dans des `@font-face`.

Toujours inclure le sous-ensemble `latin-ext` en plus de `latin` : le `œ`
de « œil » et « main d'œuvre » y vit. Sans lui, le caractère disparaît
silencieusement à l'impression.

## Grammaire de mise en page

- Alternance stricte des fonds, un slide clair puis un slide foncé
- Un point par slide, jamais deux idées sur la même page
- Eyebrow en capitales, interlettrage `0.26em`, taille 11,5 px
- Filet violet 62 x 5 px sous les titres de section
- Marges latérales 53 px sur un A4 portrait (794 x 1123 px)
- Cartes en grille 2 colonnes, gouttière de 1 px qui fait office de trait
- La dernière carte d'un nombre impair occupe les deux colonnes

## Bibliothèque d'éléments

Éléments réutilisables, exportables en PNG fond transparent pour Canva.

- **Barre de progression** : 19 traits de 7 x 2 px, écart 3 px, largeur
  totale 187 px. Le trait de la page en cours passe à 13 px et en violet,
  jamais en blanc, sinon il devient invisible dès que le PNG est posé sur
  un fond clair.
- **Marque d'en-tête** : pastille ronde 9 px, écart 9 px, « AVI » en
  Montserrat 800, 16 px, interlettrage `0.2em`
- **Filet de section** : 62 x 5 px
- **Puce de liste** : tiret de 7 x 2 px

Exporter chaque élément à 8x pour rester net en impression, et fournir une
version `-1x` à la taille réelle. Un élément destiné à un fond foncé et un
élément destiné à un fond clair sont deux fichiers différents, pas le même
fichier recoloré au moment de l'import.

## Pas d'ombres

Aucune ombre portée sur aucun support AVI. Ni sur les blocs, ni sur les
cartes, ni sur les photos, ni sur les pages. La profondeur se fait par les
aplats, les filets de 1 px et les bords gauches colorés. La raison technique
est dans `avi-print-sans-transparence` : une ombre douce devient un masque
de transparence dans le PDF et certains lecteurs rendent la zone en magenta.

## Photos

- Toujours une photo réelle de l'atelier, d'une machine ou d'une pièce
- Jamais présenter une image de synthèse comme une photo d'atelier
- Les dégradés de fondu sont cuits dans les pixels du JPEG, pas posés en
  calque semi-transparent
- Légender chaque photo, une ligne, ce qu'on voit et non ce qu'on vend

## Registre d'écriture

Ces règles viennent du client et priment sur toute autre consigne de style.

- Aucune statistique inventée. Un chiffre sort du bureau d'études ou il ne
  sort pas.
- Pas de tirets cadratins.
- Vouvoiement, « nous » et jamais « on ».
- Pas de registre « vente de poisson » : pas de douleur agitée, pas de
  question rhétorique, pas de CTA à mot-clé en commentaire.
- Le deep learning se justifie par la complexité du produit ou de
  l'environnement, jamais comme rustine aux limites de la vision classique.
- Dire « valorisation maximale », pas « zéro destruction ».
- Écrire pour un responsable de production et un acheteur, pas pour un
  ingénieur opticien.
- Ne pas jouer au juriste : le conseil d'AVI valide les formulations
  juridiques.

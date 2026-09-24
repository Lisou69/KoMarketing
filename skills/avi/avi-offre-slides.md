---
name: avi-offre-slides
description: Produire ou modifier le modèle d'offre commerciale AVI en slides A4 portrait (HTML puis PDF) — structure des 19 slides, gabarit Python, champs à remplir, consignes internes, et version exemple remplie. Utiliser dès qu'il s'agit d'une offre, d'une proposition commerciale ou d'un devis mis en page pour Avenir Vision Industrie.
---

# Modèle d'offre AVI en slides

Charger `avi-charte-visuelle` d'abord, puis
`avi-print-sans-transparence` avant toute génération de PDF.

## Ce qu'est le livrable

Deux documents construits par le même code :

- `modele-offre-avi` : la trame, avec les `{{champs}}` à remplir et les
  consignes internes visibles
- `exemple-offre-AVI-2026-084` : le même document rempli avec un cas fictif,
  bandeau d'avertissement en pied de page

Chacun existe en HTML autonome (polices et images en base64) et en PDF A4.
Le HTML porte une barre d'outils avec un bouton « Masquer les consignes »
et un bouton « Imprimer / PDF ».

## Chaîne de production

Trois fichiers Python, dans cet ordre de dépendance :

```
offre_deck_css.py    gabarit : CSS, polices base64, primitives, photos
offre_data.py        contenu vitrine : galerie, réalisations, intégrations, IA
offre_deck.py        les 19 slides, les dictionnaires VM (modèle) et VE (exemple)
```

Rendu PDF par Playwright et le Chromium préinstallé :

```python
pg.pdf(path=..., format='A4', print_background=True,
       margin={'top':'0','bottom':'0','left':'0','right':'0'})
```

`executable_path='/opt/pw-browsers/chromium'`. Chromium refuse les unités
`pt` dans `page.pdf()`, utiliser `format` ou des pouces.

### Construire en deux passes

La barre de progression affiche le total de slides. Construire une première
fois pour connaître le total réel, puis reconstruire avec ce total :

```python
slides, tot = build_deck(V, 19, model)
slides, tot = build_deck(V, tot, model)   # 2e passe : total exact
```

## Structure des 19 slides

| # | Fond | Rôle |
|---|---|---|
| 01 | clair | Couverture, référence, client, date, validité |
| 02 | foncé | Le besoin tel que nous l'avons compris |
| 03 | clair | Nos hypothèses de travail |
| 04 | foncé | Phase 1, étude de faisabilité |
| 05 | clair | Phase 1, ce que vous fournissez et ce que vous recevez |
| 06 | foncé | Phase 2, conception et réalisation |
| 07 | clair | Phase 3, mise en service et réception |
| 08 | foncé | Phase 4, après la mise en service |
| 09 | clair | Périmètre, inclus et non inclus |
| 10 | foncé | Ce que nous ne promettons pas |
| 11 | clair | Planning indicatif |
| 12 | foncé | Conditions commerciales |
| 13 | clair | Pourquoi nous |
| 14 | foncé | Nos installations |
| 15 | clair | Quelques réalisations |
| 16 | foncé | Nos intégrations |
| 17 | clair | IA et deep learning |
| 18 | foncé | Projet européen REGROUP |
| 19 | foncé | Contact |

L'alternance clair / foncé est stricte jusqu'à 17. Les deux derniers slides
sont foncés parce que le 19 est une photo pleine page, donc lu comme une
page de fin et non comme une répétition.

## Primitives du gabarit

```
T(texte, cls)        titre, *mot* devient une italique Playfair violette
champs(html)         entoure les {{champs}} d'un style violet souligné
hdr(i, tot)          marque AVI + barre de progression segmentée
ftr(gauche, droite)  pied de page
eyebrow(texte)       surtitre en capitales espacées
spec(k, v, sub)      ligne libellé / valeur / sous-ligne
item(titre, sub)     même chose sans colonne de libellé (.spec.plain)
step(n, label, body) étape numérotée, numéro en Playfair
bullets(items)       liste à puces tiret
price(k1, v1, v2)    encart délai + montant
note(texte)          encart à bord gauche violet
cons(texte)          consigne interne, masquable
card(k, titre, body) carte de grille
slide(...)           assemble un slide complet
document(...)        page HTML complète avec la barre d'outils
```

Tailles de titre : `h1.t` 45 px, `.sm` 37 px, `.xs` 31 px. Descendre d'un
cran plutôt que de laisser un titre passer sur trois lignes.

## Contrôle de débordement

Obligatoire avant livraison. Mesurer, ne pas juger à l'œil :

```python
Array.from(document.querySelectorAll('.slide')).map((s,i)=>{
  const body = s.querySelector('.body');
  const bb = body.getBoundingClientRect();
  let max = 0;
  body.querySelectorAll('*').forEach(e=>{
    const r = e.getBoundingClientRect(); if (r.bottom > max) max = r.bottom;
  });
  return { n: i+1, over: Math.round(max - bb.bottom) };
})
```

Toute marge restante négative est un défaut. La version modèle est plus
haute que la version exemple, à cause des consignes : c'est elle qui sert
de référence.

## Pièges connus

- Le CSS contient des `%`, donc il casse les gabarits `%` de Python.
  Utiliser des marqueurs `@@clef@@` ou `__LABEL__` et `.replace()`.
- Une colonne de libellé vide décale la colonne de droite. Utiliser
  `item()` et `.spec.plain .k{display:none}`.
- La largeur utile d'un A4 à l'impression avoisine 688 px, donc un point
  de rupture à 700 px se déclenche pendant le rendu PDF. Placer les media
  queries à 620 px.
- Les libellés avec séparateur central : écrire le caractère littéral dans
  le fichier UTF-8, l'échappement CSS `\00B7` mange l'espace qui suit.

## Vocabulaire à surveiller dans le contenu

Deux formulations relevées comme ambiguës par le client, à proposer en
correction si elles réapparaissent :

- « Fourniture des pièces de recette » se lit mal, préférer « Fourniture
  des pièces nécessaires aux essais de réception »
- « Réserve de propriété : jusqu'au complet paiement » gagne à être écrit
  en phrase : « Le matériel reste notre propriété jusqu'au complet
  paiement »

Toute formulation juridique reste validée par le conseil d'AVI.

## Sections vitrine

Le contenu des slides 14 à 18 vit dans `offre_data.py` et se réutilise tel
quel dans un flyer ou une plaquette. Chaque section porte une consigne
interne qui dit au commercial quoi garder et quoi retirer selon l'affaire.
Une offre qui montre six machines sans rapport avec le besoin dilue
l'argument : la consigne existe pour ça.

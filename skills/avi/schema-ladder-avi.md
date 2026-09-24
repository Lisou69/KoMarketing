---
name: schema-ladder-avi
description: "Produire ou modifier un schéma électrique ladder AVI (folios A3, PDF + DXF) et sa note de calcul : chaîne Python/reportlab, symboles, repérage Folio.Fil, conformité GATTEFOSSÉ ST16."
---

# Schéma électrique ladder AVI

Chaîne de production d'un schéma développé (ladder) au format maison AVI : folios A3 paysage générés en Python, export PDF **et** DXF depuis la même source, note de calcul Word associée.

## 1. Arborescence et commandes

```
lib_schema.py          bibliothèque de dessin (symboles, grille, cartouche)
dxf_canvas.py          canvas de substitution : même API, écrit un DXF
build.py               assemble les folios -> gen_<affaire>.py
folios/_header.py      constantes, canvas, helpers folio() et rails()
folios/ORDRE.txt       ordre des folios, une ligne par fichier
folios/fNN_*.py        un fichier par folio
folios/_footer.py      c.save()
gen_dxf.py             rejoue le script assemblé sur DxfCanvas
render_dxf.py          rend un folio du DXF en PNG pour contrôle
gen_doc_*.js           note de calcul (docx-js)
```

```bash
python3 build.py && python3 gen_<affaire>.py     # -> PDF
python3 gen_dxf.py                                # -> DXF (24 layouts A3, 1:1)
python3 render_dxf.py 12                          # contrôle visuel du DXF
node gen_doc_<affaire>.js                         # -> docx
soffice --headless --convert-to pdf note.docx --outdir .
pdftoppm -f 12 -l 12 -r 130 -png schema.pdf CHK   # PNG à regarder
```

`build.py` concatène `_header.py` + les fichiers listés dans `ORDRE.txt` + `_footer.py`. Ajouter ou retirer un folio = créer/supprimer le fichier, mettre à jour `ORDRE.txt` **et** `TOTAL` dans `_header.py`.

## 2. Grille et repérage géométrique

A3 paysage 420 × 297 mm, tout en millimètres, origine en bas à gauche.

- 17 colonnes `A`…`Q`, 11 lignes. `cx(col, frac)` et `ry(row, frac)` donnent les coordonnées.
- Zone utile : x de **18 à 411**, y de **30** (haut du cartouche) à **282**.
- `RX0 = cx("A", 0.75)`, `RX1 = cx("P", 0.75)` : extrémités standard des rails.
- Couleurs : `NOIR ROUGE BLEU VERT GRIS ORANGE`.

**Règle d'or anti-collision** : largeur d'un texte ≈ `0,25 × size × nb_caractères` en mm. Vérifier avant de poser un texte long à droite d'un encadré. Ne jamais descendre sous y = 30 (cartouche) ni dépasser x = 411.

Pour les folios très chargés, travailler en **coordonnées absolues** plutôt qu'en `ry()` : c'est plus fiable pour empiler proprement rails, contacts, récepteurs et légendes.

## 3. Symboles disponibles

```python
f.L(x1, y1, x2, y2, w, col, dash)      f.rect(x, y, w, h, lw, col, fill)
f.txt(x, y, s, size, col, anchor, bold, rot)
f.rail(y, x0, x1, repere, col, size)   f.renvoi(x, y, "( NN - X )", "in"|"out")
f.noeud(x, y)                          f.borne(x, y, ref)
f.disjoncteur(x, ytop, ybot, ref, calibre, poles, ecart)
f.sectionneur(...)   f.bobine(x, y, ref)   f.transfo(x, y, r)
f.contact_no(x, ytop, ybot, ref, bornes)   f.contact_nf(...)
f.lampe(x, y, r, label)   f.moteur(x, y, r)   f.buzzer(...)
f.cable(x, y, nom, w, h, rot)   f.terre(x, y)   f.fil(x, y, repere)
f.bouton_au(x, y, ref)   f.bornes_bloc(...)   f.poly(pts, close, fill)
```

`f.fil()` écrit le repère verticalement le long du conducteur : c'est le symbole à utiliser pour marquer un fil.

Un folio commence par `f = folio("TITRE")` et finit par `c.showPage()`.

## 4. Repérage des fils : format Folio.Fil

**Le repère d'un fil commence par le numéro du folio où le fil PREND NAISSANCE**, suivi d'un point et d'un numéro séquentiel à deux chiffres propre à ce folio : `06.01`, `06.02`, `06.03`…

- Un fil qui traverse plusieurs folios garde partout le repère de son folio d'origine.
- Plusieurs fils sur un même potentiel portent le même repère.
- Numéros attribués dans l'ordre de lecture du folio, sans trou ni réemploi.
- Rails communs : mettre le repère **puis** l'identité du potentiel — `"04.05  L"`, `"07.05  24 V"`.
- Équipements : `Folio/Équipement` avec un slash — `04/T1`, `12/A1`, `24/X1`.

Prévoir un folio dédié au repérage qui porte : le principe, des exemples, le **tableau des séries par folio**, et la table des couleurs. Les folios qui ne créent aucun fil doivent être listés comme tels.

## 5. Méthode de travail

**Modifier par script de patch, jamais à la main dans le généré.**

```python
def patch(path, pairs):
    s = io.open(path, encoding="utf-8").read()
    for a, b in pairs:
        assert a in s, "NOT FOUND >>> " + a[:90]
        s = s.replace(a, b, 1)
    io.open(path, "w", encoding="utf-8").write(s)
```

- **Toujours `grep` la chaîne exacte avant de l'utiliser dans un patch.** Les textes dérivent d'un indice à l'autre.
- Un `assert` qui échoue avant l'écriture **perd tous les remplacements déjà faits dans ce fichier**. Sur un patch long, collecter les échecs dans une liste et écrire quand même, puis traiter les manques.
- Après chaque modification : rebuild, `pdftoppm`, **et regarder l'image**. Les collisions de texte ne se voient pas autrement.

**Renuméroter les folios** (insertion / suppression) :
1. Sortir temporairement le nouveau folio du dossier (il est déjà à la bonne numérotation).
2. Regex sur tous les `folios/f*.py` : `\(\s(\d{2})\s-\s([A-Q])\s\)`, `folio (\d{2})`, `folios (\d{2}) et (\d{2})`.
3. Remap séparé des marques `\b(\d{2})/(?=[0-9A-Za-z])` (nomenclature et borniers) — **attention aux faux positifs** du type `09/2026` dans une date.
4. Renommer les fichiers en ordre **décroissant** pour éviter les collisions.
5. Mettre à jour `ORDRE.txt` et `TOTAL`.

## 6. Standard GATTEFOSSÉ ST16 rév. 5 — clauses qui reviennent

| § | Exigence |
|---|---|
| 8.1.2 | Armoire par défaut H 1800 / L 600 / P 400 mini, plaque de fond pleine |
| 8.1.3 | Une seule alimentation ; courant ondulé clairement identifié |
| 8.1.4 | Disjoncteurs Schneider, porte-fusibles interdits |
| 8.1.7 | Transformateur protégé au primaire ET au secondaire, 0 V secondaire à la terre |
| 8.1.11 | 30 % de réserve de **surface utile de rail DIN, hors goulottes** |
| 8.1.13 | IP 55 |
| 8.1.18 | Switch administrable uniquement, Hirschmann |
| 8.1.23 | Accessoires : porte-document A4, balais d'étanchéité, **éclairage d'armoire** |
| 8.1.24 | Serrure à clé 2433A |
| 8.1.25 | Voyants Fazim (amont orange, aval blancs, **ondulé bleu**), AU clé 455 garde rouge, sectionneur ≤ 1,60 m |
| 8.1.26 | 150 mm libres en partie haute pour le détecteur incendie |
| 8.1.27 | Test lampe au-delà de 4 voyants |
| 8.1.28 | Bornes sectionnables **avec fusible incorporé** sur les sorties automate, sans sectionnement du commun |
| 8.1.29 | Table complète des couleurs de fils ; **ORANGE** = reste sous tension sectionneur ouvert |
| 8.1.30 | Répartiteur modulaire étagé, 30 % de réserve |
| 8.1.33 | Goulottes avec 30 % de réserve, TBT séparée de la BT |
| 8.1.34 | Ventilation en surpression ; climatisation si > 40 °C |
| 8.2 | **Automates alimentés depuis l'onduleur industriel** |
| 8.2.1 | 16 à 1024 E/S TOR → Modicon M340 |
| 8.2.2 | Liste fermée de CPU et cartes autorisées — **vérifier chaque référence contre cette liste** |
| 8.2.3 | Programmation sous « UNITY XL PRO » = aujourd'hui EcoStruxure Control Expert (renommé en V14) |
| 8.3 | Repérage Folio/Fil et Folio/Équipement, plaques gravées, repères autocollants interdits |
| 10 | Livrables : PDF + DWG/DXF |

Une consigne explicite du client (fiche VISA, observation) prime sur le défaut du ST16 — mais l'écart doit être **signalé et porté au tableau des dérogations**, jamais absorbé en silence.

## 7. Vérifier le matériel avant d'écrire

Ne jamais porter une caractéristique produit dans un dossier sans l'avoir lue sur un document constructeur. Déléguer la recherche à un sous-agent avec une consigne explicite : *« réponds en distinguant ce qui est CONFIRMÉ par un document constructeur de ce qui reste incertain, cite les URL, ne devine pas »*. Reporter dans le dossier ce qui est confirmé, et lister les points ouverts au chapitre « à préciser ».

### Pièges vérifiés, à ne pas refaire

- **Module mixte Modicon M340 / X80** (BMXDDM16022, BMXDDM3202K) : entrées et sorties partagent une numérotation continue et **les sorties commencent à la voie 16**, pas à 0. Un 16E/16S en emplacement 1 donne `%I0.1.0…15` et `%Q0.1.16…31`. Avec des modules séparés (DDI + DDO), chacun numérote de 0 à 15 — plus simple, et plus proche de la liste ST16.
- **Entrées « sink » = logique POSITIVE** → capteurs **PNP** trois fils, commun du module au **0 V**. C'est contre-intuitif : l'adjectif décrit le module, pas le capteur. Des NPN imposeraient un module à logique négative.
- **Suffixe K sur une carte X80** = connecteur FCN 40 points, **pas de bornier à vis** : il faut un cordon BMX FCW (fils libres) ou BMX FCC (vers embase Telefast ABE7). Les borniers BMX FTB 20xx sont des 20 contacts, ils ne vont pas dessus.
- **Sur une embase M340**, l'alimentation occupe un emplacement **dédié non numéroté** et l'UC occupe obligatoirement l'emplacement 0. Une embase 6 emplacements laisse donc 5 emplacements d'E/S, pas 6.
- **Régime IT** : pas de différentiel sur les circuits de commande (le premier défaut ne déclenche pas, c'est le CPI du site qui signale) ; alimentations à faible courant de fuite obligatoires. Un différentiel 30 mA reste exigé sur une prise accessible au personnel — il protège contre le **double** défaut.
- **Dimensionnement d'armoire** : ce sont les **dégagements constructeurs** qui dimensionnent la hauteur, pas les appareils. Compter zone libre incendie + goulottes + dégagements + hauteur des rangées. Élargir une armoire ne compense jamais un manque de hauteur si aucune fusion de rangées ne passe en largeur.
- **Bilans de puissance** : établir sur la charge **réelle simultanée**, pas sur la somme des plaques. Les récepteurs qui ne fonctionnent jamais ensemble (ventilateur / résistance chauffante sur thermostats complémentaires) ne se cumulent pas.

## 8. Pièges de la chaîne de génération

- **Shadowing de `c`** : ne jamais nommer une variable de boucle `c` dans un folio, le canvas s'appelle `c`. Symptôme : `AttributeError: 'str' object has no attribute 'showPage'`.
- **DXF invisible** : utiliser `Frontend(ctx, backend).draw_entities(msp)` et **pas** `draw_layout()`, qui réinitialise les propriétés de calque et rend le noir sur blanc invisible.
- **Épaisseurs DXF** : ramener les largeurs de trait aux valeurs normalisées `(5, 9, 13, 15, 18, 20, 25, 30, 35, 40, 50, 53, 60, 70, 80, 90, 100)`, sinon le fichier est refusé.
- **Layout1 fantôme** : supprimer `Layout1` *après* avoir créé les dispositions FOLIO, jamais avant (une présentation papier doit rester).
- **Regex avec `%`** dans un script de patch : éviter le formatage `%` sur une chaîne contenant des parenthèses, utiliser une alternation unique.
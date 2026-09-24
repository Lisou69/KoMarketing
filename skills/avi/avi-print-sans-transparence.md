---
name: avi-print-sans-transparence
description: Produire un PDF HTML vers Chromium sans aucune transparence, pour éviter les aplats rendus en magenta chez certains lecteurs PDF, et exporter les éléments graphiques en PNG fond transparent pour Canva. Utiliser pour tout PDF visuel AVI (offre, flyer, carrousel, plaquette) et avant toute livraison de PDF.
---

# PDF sans transparence, et export d'éléments

## Le symptôme

Un fond de couverture, un voile sur photo ou un encart apparaît en **rose
vif ou magenta** chez le destinataire, alors qu'il est correct dans le
navigateur, dans le rendu poppler et dans l'aperçu du système.

## La cause

Chromium traduit toute transparence CSS en masque de transparence PDF
(`/SMask`) et en groupe de transparence. Plusieurs lecteurs PDF, dont
certains lecteurs Windows et des visionneuses embarquées, rendent ces
groupes en magenta. Le fichier n'est pas corrompu, il est simplement
interprété différemment.

Sont concernés, et pas seulement les dégradés évidents :

- `rgba()` et `hsla()` sur un fond ou un texte
- `opacity` inférieur à 1
- `linear-gradient` avec une borne transparente
- `-webkit-mask-image` et `mask-image`
- **les `box-shadow` douces**, y compris une ombre discrète sur une carte

## La règle

Aucune transparence ne doit subsister dans le PDF livré. Deux techniques,
à appliquer systématiquement.

### 1. Couleur opaque équivalente

Remplacer toute couleur semi-transparente par son équivalent opaque calculé
sur le fond réel du bloc.

```python
PALE_BG = (238, 240, 246)
INK_BG  = (23, 22, 31)

def bl(color, alpha, tone='pale'):
    """Couleur opaque equivalente a `color` pose a `alpha` sur le fond."""
    bg = PALE_BG if tone == 'pale' else INK_BG
    c = _rgb(color)
    return '#%02x%02x%02x' % tuple(
        round(c[i] * alpha + bg[i] * (1 - alpha)) for i in range(3))
```

### 2. Cuire les dégradés dans les pixels

Un fondu de photo ne se pose pas en calque, il se compose dans le JPEG
avant encodage.

```python
def _bake(im, bg, ramp_x, scrim_top=0, scrim_bot=0):
    """Compose la photo sur le fond avec un degrade, en pixels.
    Le PDF ne contient alors que des images opaques."""
    import numpy as np
    W, H = im.size
    a = np.interp(np.linspace(0, 1, W), ramp_x[0], ramp_x[1])
    alpha = np.tile(a, (H, 1))
    if scrim_top or scrim_bot:
        ys = np.arange(H, dtype=float); v = np.ones(H)
        if scrim_top: v = np.minimum(v, np.clip(ys / scrim_top, 0, 1))
        if scrim_bot: v = np.minimum(v, np.clip((H - 1 - ys) / scrim_bot, 0, 1))
        alpha *= v[:, None]
    arr = np.asarray(im).astype(float)
    bga = np.array(bg, dtype=float)
    return Image.fromarray(
        (bga + (arr - bga) * alpha[:, :, None]).clip(0, 255).astype('uint8'))
```

Le résultat est un JPEG opaque posé en `background: url(...) center/cover`.

### 3. Remplacer les ombres

Une ombre douce se remplace par un filet de 1 px, un aplat, ou un bord
gauche coloré de 3 à 4 px. Cela fait partie de la charte AVI, pas
seulement du contournement technique.

## Vérification, obligatoire avant livraison

```python
d = open(pdf_path, 'rb').read()
assert d.count(b'/SMask') == 0, 'transparence residuelle'
alphas = set(re.findall(rb'/ca\s+([0-9.]+)', d)) | \
         set(re.findall(rb'/CA\s+([0-9.]+)', d))
assert alphas <= {b'1'}, alphas
```

Ne jamais conclure sur un rendu local. Un rendu poppler propre ne dit rien
du lecteur du destinataire : c'est exactement ce qui a fait passer le bug à
travers une première correction. Le compte de `/SMask` est le seul critère.

## Rendu PDF

Chromium préinstallé, ne pas lancer `playwright install` :

```python
b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
pg.pdf(path=out, format='A4', print_background=True,
       margin={'top':'0','bottom':'0','left':'0','right':'0'})
```

Chromium refuse les unités `pt` dans `page.pdf()`. Pour un format libre,
convertir en pouces : 1440 x 810 pt s'écrit `width='20in', height='11.25in'`.

Pagination en slides :

```css
@page { size: A4 portrait; margin: 0 }
.slide { width: 210mm; height: 297mm; page-break-after: always }
.slide:last-child { page-break-after: auto }
```

## Export d'éléments en PNG fond transparent

Pour rebâtir un support dans Canva, livrer les éléments graphiques séparés.

- Rendre à 8x, et fournir aussi une version `-1x` à la taille réelle
- `page.locator(sel).screenshot(path=..., omit_background=True)`
- Neutraliser les fonds des conteneurs, sinon la capture est opaque :
  `html, body, .ink, .pale { background: transparent !important }`
- Vérifier que le résultat est bien en mode `RGBA` et qu'un pixel de fond
  a bien un alpha de 0
- Un élément blanc destiné à un fond foncé devient invisible dès qu'il est
  posé sur un fond clair. Livrer chaque élément dans les deux teintes, et
  préférer le violet au blanc pour tout ce qui doit rester lisible partout.
- Joindre un `LISEZ-MOI.txt` avec les cotes exactes, les écarts et les
  codes couleur : sans cela l'élément est réimporté à la mauvaise échelle.

Pour un logo ou un bandeau à intégrer, détourer les marges blanches avant
encodage, sinon il apparaît minuscule dans son cadre :

```python
from PIL import Image, ImageChops
bg = Image.new('RGB', im.size, (255, 255, 255))
box = ImageChops.difference(im, bg).convert('L') \
        .point(lambda p: 255 if p > 12 else 0).getbbox()
```

Une image très large calée sur sa hauteur déborde du bloc. La contraindre
par la largeur : `flex: 1 1 auto; min-width: 0; width: 100%; height: auto`.

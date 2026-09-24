---
name: sellsy-email-fix
description: >
  Corriger les problèmes de largeur, marges et affichage mobile des fichiers HTML d'emails
  destinés à être importés dans Sellsy. Utiliser cette skill dès que l'utilisateur mentionne
  un email HTML pour Sellsy, un problème de marges ou d'espaces sur les côtés, un email qui
  se réduit sur mobile, ou qui demande de "corriger le HTML" d'un email. Également utiliser
  pour créer de nouveaux emails HTML pour Sellsy depuis zéro.
---

# Sellsy Email HTML Fix

## Contexte

Les emails HTML exportés depuis Canva ou d'autres outils ont souvent une structure qui crée des
problèmes dans Sellsy :
- Fond gris sur les côtés (background-color:#f0f1f5 visible)
- Contenu réduit sur mobile après chargement
- Espaces non souhaités autour du contenu
- Marges parasites

## Structure HTML correcte pour Sellsy

Le fichier de référence qui fonctionne est : `email_packaging_en_finalbis.html`

### Squelette obligatoire

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title></title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a {
      -webkit-text-size-adjust: 100% !important;
      text-size-adjust: 100% !important;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #ffffff;
    }
    table { border-collapse: collapse !important; }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
      max-width: 100%;
    }
    @media screen and (max-width: 600px) {
      .wrapper { width: 100% !important; max-width: 100% !important; }
      .img-full { width: 100% !important; height: auto !important; }
      .card { display: block !important; width: 100% !important; max-width: 100% !important; margin-bottom: 12px !important; }
      .card-gap { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">

  <!--[if mso]><table align="center" border="0" cellpadding="0" cellspacing="0" width="600"><tr><td><![endif]-->
  <table class="wrapper" width="600" border="0" cellpadding="0" cellspacing="0" align="center"
    style="max-width:600px;width:100%;background-color:#ffffff;margin:0 auto;">

    <!-- CONTENU ICI -->

  </table>
  <!--[if mso]></td></tr></table><![endif]-->

</body>
</html>
```

## Règles de correction

### Ce qu'il faut SUPPRIMER ou REMPLACER

| Problème | Solution |
|----------|----------|
| `body { background-color:#f0f1f5 }` | Remplacer par `#ffffff` |
| `<table width="100%" bgcolor="#f0f1f5">` (table externe) | Supprimer entièrement |
| `<td style="padding:24px 10px;">` (td englobante) | Remplacer par `padding:0 !important` |
| `<table style="width:600px; max-width:600px;">` | Remplacer par `width:100%;max-width:600px;margin:0 auto` |
| `white-space:pre-wrap` sur les textes | Supprimer |
| Emojis directs (👉) | Remplacer par `&#128073;` ou `>>` |

### Ce qu'il faut AJOUTER

- `margin:0 !important;padding:0 !important;` sur le body
- `class="wrapper"` sur la table centrale
- Media query mobile dans le `<head>`
- Tous les caractères spéciaux encodés en HTML (`é` → `&eacute;`, `°` → `&deg;`, etc.)

## Procédure de correction d'un fichier existant

1. **Lire le fichier** avec `cat` pour analyser sa structure
2. **Identifier** : body color, table externe, td englobante avec padding, table centrale
3. **Appliquer** les corrections via Python (remplacement de chaînes) ou reconstruire depuis zéro
4. **Reconstruire depuis zéro** si le fichier est trop complexe (Canva génère souvent des structures très imbriquées)

### Méthode recommandée : reconstruire depuis zéro

Pour les fichiers Canva, il vaut mieux :
1. Extraire le contenu interne (tbody de la table centrale)
2. Le placer dans le squelette correct ci-dessus

```python
import re

with open('email.html', 'r') as f:
    content = f.read()

# Trouver le tbody interne
central_start = content.find('max-width:600px')
table_tag_start = content.rfind('<table', 0, central_start)
body_end = content.rfind('</body>')
central_table = content[table_tag_start:body_end]
tbody_start = central_table.find('<tbody>')
tbody_end = central_table.rfind('</tbody>') + 8
inner_tbody = central_table[tbody_start:tbody_end]
```

## Règles de design à NE PAS modifier

- Les couleurs, polices, tailles de texte
- Les images et leurs URLs
- Le contenu textuel
- Les liens
- Les cartes colorées et leur design
- Le footer

## Composants courants

### Image pleine largeur
```html
<tr>
  <td style="padding:0;margin:0;font-size:0;line-height:0;">
    <img class="img-full" src="URL" width="600" alt=""
      style="display:block;width:100%;max-width:600px;height:auto;" />
  </td>
</tr>
```

### 2 colonnes (cartes côte à côte)
```html
<tr>
  <td style="padding:0 20px 16px 20px;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td class="card" width="48%" valign="top"
          style="vertical-align:top;width:48%;background-color:#e8f8ef;border-radius:17px;">
          <table width="100%" border="0" cellpadding="18" cellspacing="0">
            <tr><td><!-- contenu carte --></td></tr>
          </table>
        </td>
        <td class="card-gap" width="18" style="width:18px;min-width:18px;font-size:0;">&nbsp;</td>
        <td class="card" width="48%" valign="top"
          style="vertical-align:top;width:48%;background-color:#d0e4ef;border-radius:17px;">
          <table width="100%" border="0" cellpadding="18" cellspacing="0">
            <tr><td><!-- contenu carte --></td></tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### Bouton CTA
```html
<tr>
  <td align="center" style="padding:0 20px 24px 20px;">
    <table border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" bgcolor="#4d4dbd" style="border-radius:12px;background-color:#4d4dbd;">
          <a href="URL" target="_blank"
            style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:#f5f5f5;text-decoration:none;border-radius:12px;">
            Texte bouton
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### Footer standard AVI
```html
<tr>
  <td align="center" style="padding:0 20px 24px 20px;">
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#545454;line-height:1.5;text-align:center;">
      AVENIR VISION INDUSTRIE &ndash; SARL &ndash; Brindas<br />
      SIREN <a href="tel:494725997" style="color:#545454;text-decoration:none;">494 725 997</a>
      &ndash; Contact :
      <a href="mailto:contact@avenirvision.com" style="color:#545454;text-decoration:none;">contact@avenirvision.com</a>
    </p>
  </td>
</tr>
```

### Bandeau texte gris (>> Répondez...)
```html
<p style="margin:24px 0 0 0;">
  <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;color:#000000;background-color:#d8d8d8;line-height:1.4;padding:4px 8px;">
    &gt;&gt; Répondez simplement à ce mail avec&nbsp;:
  </span>
</p>
<p style="margin:24px 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#000000;line-height:1.5;">
  &ldquo;MOT_CLE&rdquo;
</p>
```

## Encodage HTML des caractères spéciaux

| Caractère | Code HTML |
|-----------|-----------|
| é | `&eacute;` |
| è | `&egrave;` |
| ê | `&ecirc;` |
| à | `&agrave;` |
| â | `&acirc;` |
| î | `&icirc;` |
| ô | `&ocirc;` |
| û | `&ucirc;` |
| ç | `&ccedil;` |
| ù | `&ugrave;` |
| ° | `&deg;` |
| — | `&mdash;` |
| – | `&ndash;` |
| ' | `&rsquo;` |
| " | `&ldquo;` |
| " | `&rdquo;` |
| « | `&laquo;` |
| » | `&raquo;` |
| 👉 | `&#128073;` ou `>>` |
| 💡 | `&#128161;` |
| ✓ | `&#10003;` |
| → | `&rarr;` |
| &nbsp; | `&nbsp;` |

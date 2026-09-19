# Identité visuelle

Sources vectorielles de l'icône Task Manager (checklist blanche sur dégradé indigo),
partagées entre l'application web et l'application mobile.

| Fichier | Rôle |
|---|---|
| `icon.svg` | Icône principale (carré arrondi) — favicon, apple-touch-icon, icône de lancement |
| `icon-maskable.svg` | Variante plein cadre avec marge de sécurité, pour les icônes *maskable* PWA |
| `icon-foreground.svg` | Glyphe seul sur fond transparent, pour l'icône adaptative Android |
| `og-image.svg` | Image de partage social (1200×630) |

## Régénérer les déclinaisons

Nécessite `rsvg-convert` (paquet `librsvg`).

```bash
cd branding

# Sources PNG pour les icônes de lancement mobile
rsvg-convert -w 1024 -h 1024 icon.svg -o icon-1024.png
rsvg-convert -w 1024 -h 1024 icon-foreground.svg -o icon-foreground-1024.png
cp icon-1024.png icon-foreground-1024.png ../mobile/assets/branding/

# Assets web
rsvg-convert -w 180 -h 180 icon.svg          -o ../frontend/public/apple-touch-icon.png
rsvg-convert -w 192 -h 192 icon.svg          -o ../frontend/public/icon-192.png
rsvg-convert -w 512 -h 512 icon.svg          -o ../frontend/public/icon-512.png
rsvg-convert -w 512 -h 512 icon-maskable.svg -o ../frontend/public/icon-maskable-512.png
rsvg-convert -w 1200 -h 630 og-image.svg     -o ../frontend/public/og-image.png
```

Puis, côté mobile, régénérer les mipmaps Android / assets iOS :

```bash
cd ../mobile && dart run flutter_launcher_icons
```

Le favicon SVG (`frontend/public/favicon.svg`) est une version allégée de `icon.svg`
(sans dégradé) optimisée pour l'affichage en 16×16.

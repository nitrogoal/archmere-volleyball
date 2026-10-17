# Opponent logo redraws (Astra)

## How to use

1. In Astra, attach the school's reference image from `design/logo-refs/` (same file name as below).
2. Paste the **master prompt**, then replace the last line with that school's description.
3. Save the result into `design/logo-redraws/` with the **exact same file name** (for example `ursuline-academy.png`).
4. Tell Claude "ingest the logo redraws". Each redraw gets trimmed, centered on the site's white tile and swapped in.

Redraw faithfully. These are other schools' real logos, used only to identify the opponent, so don't restyle or "improve" the design.

## Master prompt

```text
REFERENCE IMAGE: the attached image is a school athletics logo, cropped from a small, blurry website banner. Redraw THIS EXACT LOGO as a clean, high-resolution flat vector logo.

Rules:
- Same design, same pose and direction, same proportions, same colors. Do not redesign, restyle, simplify away details, or add anything.
- Any text must be spelled exactly as written below, in the same style of lettering.
- Show the complete logo. If the reference is cut off at an edge, complete the missing part naturally (for example, finish a letter or a mane).
- Flat solid colors with crisp clean edges and consistent outline weights. No gradients, gloss, drop shadows, 3D bevels, textures, JPEG noise, or blur.
- Centered on a plain pure white background, square 1024x1024, with about 10% empty margin on every side.
- Just the logo: no mockup, no frame, no background scene, no extra words, no watermark.

Logo: [PASTE THE SCHOOL'S DESCRIPTION HERE]
```

## Priority: cut off in the current version

| File | Description to paste after "Logo:" |
|---|---|
| `ursuline-academy.png` | Interlocking block-serif letters "U" over "A" in red with a black outline: the U sits on top, the A's legs below. Red, black, white. |
| `red-lion-ca.png` | The words "RED LION" in an upward arc, red block letters with a thick black outline and drop line, above a roaring lion head with a red and maroon mane, facing forward-right. Red, maroon, black, gray, white. |
| `sussex-central-hs.png` | A knight in silver-gray armor holding a gold sword upright, above a gold banner reading "CENTRAL" in bold block letters, with "SUSSEX" in small letters above the banner's right side and "GOLDEN KNIGHTS" in small gold italic caps on a navy ribbon below. Navy, gold, silver, white. |
| `wilm-christian-school.png` | The word "WARRIORS" in tall bold dark-red serif capitals with a black outline, with a gray sword crossing behind it diagonally from upper left. Dark red, black, gray. |
| `st-georges-tech-hs.png` | A green hawk head facing right above an interlocking block monogram: a royal blue "S" and a green "G", each with a white inline and dark outline. Green, royal blue, white. |
| `smyrna-hs.png` | A bold block-serif letter "S" in bright red with a white inner outline and a thin dark gray outer outline. Flat, no bevel. |
| `polytech-hs.png` | A bold block-serif letter "P" in red with a white inline and black outer outline. |
| `conrad-school.png` | A snarling wolf head facing right, red fur with black and gray accents and sharp jagged fur tips, open mouth with white fangs. Red, black, gray, white. |
| `saint-mark-s-hs.png` | A gold Spartan (Trojan-style) helmet in profile facing right, with a plume, on a solid dark green circle. Dark green, gold, white. |

## Soft or noisy at large sizes

| File | Description to paste after "Logo:" |
|---|---|
| `caesar-rodney-hs.png` | A royal blue silhouette of a horse and rider galloping to the right (a colonial rider), with a large yellow monogram "CR" (outlined in blue) overlapping in front. Royal blue, yellow, white. |
| `indian-river-hs.png` | A stylized warrior head in profile facing right with long flowing hair and feathers streaming back horizontally. Dark green, gold, white, black outline. |
| `de-military-academy.png` | A seahawk (osprey) swooping right with spread wings; the letters "DMA" in navy italic block letters form the leading wing; a tan anchor with "ATHLETICS" hangs below the talons. Navy, tan, white. |
| `tatnall-school.png` | An angry yellow-and-black striped hornet flying to the left, with clear outlined wings and a sharp stinger. Yellow, black, white, gray outlines. |
| `sanford-school.png` | A bold gold block letter "S" with a navy outline, with a tall dark navy pine tree silhouette standing in front of it, top to bottom. Gold, navy. |
| `cape-henlopen-hs.png` | A Viking head in profile facing right: a gold helmet with white curved horns and a blue band, and a long gold braided beard and mustache. Gold, blue, white, black outlines. |
| `caravel-academy.png` | A swashbuckling buccaneer head facing slightly left, winking, with a curled mustache, an earring and a wide-brimmed hat with a big feather plume. Single color maroon line art on white. |
| `concord-hs.png` | A Revolutionary-era raider in a tricorn hat and maroon vest, shown from the chest up, inside a thin maroon circle ring. Maroon, gray, white. |
| `dover-hs.png` | A navy oval shaped like a letter "D", with a white colonial senator in profile wearing a tricorn hat inside it, and the word "ATHLETICS" running vertically in small white letters on the left. Navy, white. |
| `appoquinimink-hs.png` | A snarling jaguar head facing right, maroon with gray spots, wrapped by a maroon crescent swoosh. Maroon, gray, white. |
| `brandywine-hs.png` | A snarling bulldog head facing right, black-and-white line art, wearing a black spiked collar. Black, white, red tongue. |
| `ai-dupont-hs.png` | A roaring tiger head facing right with bold stripes. Gold, royal blue, white, black outlines. |
| `st-elizabeth-hs.png` | A fierce Viking face facing right with a gray horned helmet and a huge flowing gold beard and hair, outlined in navy and maroon. Gray, gold, navy, maroon. |
| `mot-charter-hs.png` | A thick red ring with white text "MOT CHARTER" around the top and "MUSTANGS" around the bottom, with a black line-art rearing mustang in the white center. Red, black, white. |
| `first-state-military-academy.png` | A shield with red and white vertical stripes, a navy top band with white bold letters "FSMA" and a small red star above. Red, white, navy. |
| `charter-school-of-wilmington.png` | A white lightning bolt on a solid royal blue circle with a lighter blue rim. Flat, no gloss or reflections. |
| `tower-hill-school.png` | A dark green interlocking block-serif "T" and "H" monogram. Dark green only. |
| `padua-academy.png` | A bold block-serif "P", yellow fill with a white inline, on a solid black square. |
| `wilm-friends-school.png` | A navy square frame containing a simple navy line drawing of a colonial meetinghouse roof at the top and the serif numerals "1748" below. Navy, white. |
| `delmarva-christian-hs.png` | A wide purple "DC" monogram with black outlines, the letters joined by a cross in the middle, with "DELMARVA CHRISTIAN" in black capitals underneath. Purple, black, white. |
| `campus-community-school.png` | A front-facing mountain lion face drawn in bold navy outline with white fill. Navy, white. |

## Already sharp (redraw only if you want them to match)

`merion-mercy-academy.png`, `unionville-hs.png`, `newark-charter-school.png`, `st-thomas-more.png`

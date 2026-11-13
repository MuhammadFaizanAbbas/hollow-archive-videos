---
name: hollow-archive-autopilot
description: Make and publish one Hollow Archive YouTube Short end to end (story pick, script, Tall Tale 3D animation, thumbnail, GitHub relay, Google Drive, Sheet log, Zapier upload). Use for the scheduled 5 AM / 3 PM / 10 PM runs or when asked to post the next Hollow Archive short.
---

# Hollow Archive autopilot

One run = one finished, public YouTube Short for **The Hollow Archive** (@HollowArchive2D): fast, gripping,
**complete** stories (true history, legends and original made-up tales), told with flat 2D cartoon people in a
cinematic 3D world: weather, mood lighting, illustrated close-ups and rich sound, like a senior animator made it.
The run is unattended: nobody approves the plan, so use the defaults below, never stop to ask, and log everything in
the Sheet. Build with the **faceless-shorts** skill, style **Tall Tale 3D** (`tall-tale`): load faceless-shorts with the
Skill tool first, read `styles/tall-tale/STYLE.md` in full, and follow its build, QA and render rules. This file adds
the channel's story rules and the publishing pipeline.

## Fixed IDs
- Google Drive folder "Hollow Archive Shorts": `1qLLlaeu2NX6ZjYv7xHNjE9BHJ28kKC-5`
- Google Sheet "Hollow Archive – Video Log": `1YEQ73waUC56ftYlfDnIYkPYOiv3dFKU7NSZjKnP9Cqc`
  - **Log** tab: A Publish slot, B Status, C Topic, D Title, E Drive link, F Drive file ID, G YouTube URL, H Video ID,
    I Tags, J Thumbnail link, K Created, L Notes, M Relay folder (`videos/<dir>` in the GitHub relay)
  - **Ideas** tab: A #, B Story, C Hook (first line), D Status (NEW / IN PROGRESS / USED), E Used on, F Payoff (the ending),
    G Long version, H Type (`TRUE` / `TRICK` / `LEGEND` / `TALE` / `SCIFI`; empty = `TRUE`)
- GitHub relay (public, files deleted after 8 days so the weekly compilation can use them): `MuhammadFaizanAbbas/hollow-archive-videos`, branch `main`.
  Attach it with `add_repo` (owner `MuhammadFaizanAbbas`, repo `hollow-archive-videos`, access `push`) and clone it as the
  tool says.
- Zapier: YouTube `YouTubeV4CLIAPI` (`youtube_upload_video`, `youtube_update_video_thumbnail`); Google Drive
  `GoogleDriveCLIAPI` (`google_drive_upload_file`: params `folder`, `file` = public URL, `new_name`, `new_extension`).
- Time zone Asia/Karachi. Publish slots 06:00, 12:00, 17:00. Runs start about an hour early (05:04, 11:04, 16:04).

## 0. Guard (never post the same thing twice)
Read `Log!A:H` and `Ideas!A:F`. If the prompt names an idea number, use it. Otherwise take the first `NEW` idea.
Never take an idea that is `IN PROGRESS` or `USED`. Before uploading, read the Log again: if a row with the same Topic is
already `UPLOADED`, stop. If a row says `UPLOADING` for this topic, search the channel (`find_video` with the title)
before doing anything. Never call upload_video twice for one topic.

## 1. Setup (fresh cloud workspace every run)
`bash SKILL/scripts/setup.sh`. A Whisper download failure is expected and fine (words.py falls back to the exact Kokoro
line times). Continue if node, ffmpeg, chrome, python-env and voice are ok. Thumbnail font:
`npm pack @fontsource/cinzel`, extract it, convert `files/cinzel-latin-700-normal.woff2` to TTF with fontTools
(`pip install --break-system-packages fonttools brotli`) into `~/.fonts/`, then run `fc-cache -f`.

## 2. Claim the idea
Set the idea to `IN PROGRESS`. Append a Log row: next free slot, `BUILDING`, story, created time (PKT).
If fewer than 12 `NEW` ideas remain, append 15 more that pass the story test below.

## 3. The story test (what makes this channel addictive)
Every short is a **complete story with a payoff**: a hero, a problem, a clever or crazy turn, an ending that pays off.
No unfinished cliffhangers. Four story types (Ideas column H):
- **TRUE**: real history, researched and accurate (heists, hoaxes, codes cracked, lost things found, strange events).
- **TRICK**: a made-up everyday hero who does something that looks insane but is secretly genius, and the real science or
  logic explains it (the reference: a farmer sprays his orchard with water in a freezing blizzard; the neighbours laugh;
  by morning every farm froze except his, because freezing water releases heat and holds the fruit at 32°F). The
  science must be real and checked; the characters and plot are invented.
- **LEGEND**: folk tales, myths and fables retold fresh (Akbar and Birbal, Mulla Nasreddin, Aesop, Arabian Nights,
  Greek myths, Japanese and Indian folklore). Say "legend says…" or "the old story goes…".
- **TALE**: an original made-up story with a twist ending: a con, a deal with a stranger, a strange shop, a bet, a
  wish that goes wrong. Fiction, but it must feel real and end with a satisfying flip.
- **SCIFI**: an original science-fiction story with a twist that real science explains or a human twist that lands
  (the colony ship that arrives second because faster ships overtook it; the astronaut whose daughter is older than him
  because of time dilation; the radio that plays "tomorrow's" news from another time zone). Near-future, hopeful or
  funny, never horror or apocalypse gore. Start "In the year 2140…" only AFTER the hook line.
**Which idea next:** the Ideas tab is already ordered as a rotation (SCIFI, TRUE, TRICK, LEGEND, TALE, …), so take the
**first `NEW` row from the top**. When fewer than 12 NEW ideas remain, append 15 more in the same rotation, every one
with a hook that states an impossible result (see step 5) and an ending that is not guessable from the hook.
**Never present fiction as true.** TRICK / LEGEND / TALE / SCIFI videos never say "true story", "real", "this actually
happened", never use real living people, and never use a real recent tragedy. TRUE videos must be accurate.
Avoid: gore, crimes against children, hate, conspiracy theories, medical or financial advice.

## 4. Research
- TRUE: 2-4 reliable sources (museums, Britannica, universities, BBC / Smithsonian / History.com / National
  Geographic), listed in `script.json` "sources". Paraphrase quotes; if sources disagree use the majority version.
- TRICK: check the science or logic against 1-2 reliable sources (university, science museum, extension service,
  encyclopaedia) and list them. Everything else is invented.
- LEGEND: note where the tale comes from (e.g. "Akbar-Birbal folk tales", "Aesop") in "sources".
- TALE: no research needed; make sure any real-world detail you use is correct.
- SCIFI: check the one real science idea the twist relies on (time dilation, orbits, sound on Mars, CO detectors) against 1-2 reliable sources (NASA, ESA, a university) and list them.

## 5. Script: built for 75%+ retention (25-38 s, 75-105 words)
Retention was stuck at 50-51% because the old scripts explained too early. The fix: **open a question in second one,
keep it open, and answer it only in the last 3 seconds.** Everything below serves that.

Voice **`am_eric`, `speed: 1.12`**, `gap: 0.05`, `lead: 0.1` (the first word starts at once), `outro: 0.6`. Music:
`"music": "tension"` under the build (all types), then switch at the reveal line with
`"music2": "story"` (or `"epic"` for heists/wars), `"music2_at": <start time of the reveal line from data/timing.json>`. Almost no silence; one deliberate 0.4 s beat of silence
right before the reveal (put `"gap": 0.4` on that line only).

**The 6-beat retention skeleton** (every short, every type):
1. **HOOK (0-2 s, 6-10 words): the impossible result or a stake, never the setup.** It must make the viewer ask
   "how?" or "why?". "This man let a blizzard freeze his whole farm, on purpose." · "A woman sold the Eiffel Tower.
   Twice." · "The king paid him to steal the crown." Banned openings: "Did you know", "Imagine", "This is the story of",
   "Once upon a time", "In 1952", any name or date first.
2. **STAKES (2-6 s): why it should have ruined him.** A number, a deadline, a crowd laughing. "Every neighbour said
   he'd lose everything by morning."
3. **BUILD (6-20 s): three escalating steps, each ending on a mini-hook** so there's never a safe place to swipe.
   Use these bridges: "But that wasn't the strange part." · "Then it got worse." · "And nobody noticed one detail." ·
   "Which should have been impossible, because…" · "Except…". Each step is a new picture and a bigger problem.
4. **FALSE PEAK (≈70%): the moment it looks lost.** "By midnight it was minus eight. His trees were glass." This is
   the hardest swipe point: raise the danger, do not explain yet.
5. **REVEAL (last 6-8 s): the answer in one clean sentence, with one concrete number,** after the silent beat. "See,
   freezing water gives off heat, so the ice held his apples at exactly thirty-two degrees."
6. **LOOP LINE (last 1.5 s): a short line that flips the hook and flows back into it** so the replay feels like the
   next sentence: "…and that's why he froze his farm, on purpose." / "…which is how a woman sold the Eiffel Tower."
   Loops count as rewatches and push average view duration over 100%.

**Wording rules**
- Every sentence earns the next: if a line can be cut without losing a question or a fact, cut it.
- Max 12 words per sentence, mostly 5-9. Active verbs, concrete nouns (not "a lot of money": "forty thousand francs").
- Exactly **one open question at all times.** Answer a small one only after opening a bigger one.
- Never reveal the trick, the twist or the outcome before beat 5. No "and this is why", no early hints in the title
  card or captions.
- Second person when it helps: "You'd think…", "Here's the catch."
- One emotional reaction per story (a laughing crowd, a furious king, a crying winner).
- TRUE stories still need the hook first: start at the most impossible moment, not at the beginning.
- Fiction rules from step 3 still apply (never "true", "real", "this actually happened").

**Self-check gate (score before voicing; rewrite until every box is yes):**
[ ] Line 1 makes a stranger ask "how?" in under 2 s, with no name or date.
[ ] The answer is not guessable before 70%.
[ ] Every 4-6 s ends on a bridge or a new problem.
[ ] There's a false peak.
[ ] The reveal is one sentence with a number.
[ ] The last line loops into the first.
[ ] 75-105 words, read aloud in 25-38 s.
Write the gate result in script.json as `"gate": "7/7"`; never voice a script below 7/7.

Connectors keep it rolling ("So…", "But…", "Which meant…"). A line is a cut: split sentences into 1-3 lines so the
picture changes every 1-2 s (every 0.7-1.2 s in the first 3 s). Numbers as said. One-word captions; the hook's key
word and the reveal's number get the yellow highlight.

## 6. Animation: senior-animator quality (Tall Tale 3D + the cinematic pack)
1. `bash SKILL/scripts/new_video.sh tall-tale <slug>`, then **`bash compile/cinematic.sh ~/faceless-shorts/<slug>`**
   (installs `src/core/fx.js`, the PRO sound mixer as `tools/mix.py`, and the automatic finish pass). It must print
   `cinematic OK`. In `shots.js` add `import * as FX from './core/fx.js';`.
   SCIFI sets: build them from the kit with a cool palette — night or `cold` grade, `sparkle` weather for stars,
   `FX.glow` on panels and screens, round portholes, white-and-cyan ship interiors, a big planet or Earth disc in the
   sky, rovers and robots drawn as simple Toon characters (boxy head, round lit eyes). Keep it bright and readable.
2. **Every shot declares its mood** (applied automatically after `draw()`):
   `add({ id, at, grade: 'night', weather: 'snow', flash: [0.4], draw(...) })`.
   grades `night cold warm sunset danger flashback gold`; weather `snow blizzard rain dust embers leaves confetti
   sparkle`. Match them to the story (blizzard nights, rainy streets, dusty deserts, embers by a fire, confetti for the
   win, `flashback` for the "years earlier" part). Also light the 3D set to match (`mainStreet(E, { dusk: true })`,
   warm interior bulbs, moon or lantern lights).
3a. **Art direction = the thumbnail style, moving.** Every shot is designed like those thumbnails:
   - one focal point per shot (a face OR the hero object), framed big; everything else is quiet (dim, blurred by
     distance, lower contrast). Characters fill at least a third of the frame in dialogue and reaction shots.
   - the story's **hero object** is built as a proper prop with ink outlines and 1-2 proof details, and gets its own
     reveal shot: aura glow + rays + sparkles (`FX.glow`, `FX.ring`, `weather: 'sparkle'`) on the reveal word.
   - one colour story per video: hot vs cold, gold light vs night blue, warm vs danger red. Grade the build cooler or
     darker and the reveal warm/gold so the contrast lands at the payoff.
   - insert cards look like the thumbnails: one big drawing, a red/yellow tag with the number, nothing else.
   - faces act big: shock with open mouth, sweat drops in danger, sly half-smile when someone knows the trick; eyes
     always look at what matters in the shot.
   - the first frame and the thumbnail share the same hero object, so the click and the video match.
3. **Retention visuals** (these matter as much as the script):
   - **Frame 1 is the payoff image already in motion** (the frozen farm, the Eiffel Tower with a SOLD sign), never a
     slow establishing shot, never a black or title frame. 3 cuts in the first 3 s, a punch-in on the hook word.
   - No picture stays unchanged for more than 1.5 s: cut, push in, a character reacts, or an effect fires.
   - A **pattern interrupt every 5-7 s**: a hard flash cut, a freeze frame with a red `FX.badge`, a zoom-whip, a
     sudden silence, a map or insert card.
   - The **false peak** gets the darkest grade and slow push-in; the **reveal** gets `flash` + `ring` + a colour
     change to warm/gold, `riser` into an `impact`.
   - The last shot visually matches the first shot (same set and angle) so the loop is seamless.
4. **Shot variety like a senior animator** (20-30 shots):
   - wide establishing shot with weather → medium two-shot → **big face close-up** with a strong expression
   - at least 2 **illustrated insert cards** (`FX.insertCard(lt, k, (g, cx, cy, s) => {...})`): a hand-drawn style
     close-up of the key object (an apple, a thermometer, a coin, a map, a letter) with thick ink outlines, 2-3 flat
     shades, a highlight, and an `FX.badge('32°F', x, y, k)` label for the key number
   - at least 1 **visual metaphor** shot (people frozen inside ice blocks with `FX.iceMaterial(THREE)`, a giant
     igloo over a farm, money raining, a clock spinning)
   - effects on the big beats: `FX.spray` (water / sand / sparks streams), `FX.ring` + `flash` on reveals,
     `FX.speedLines` on shocks, `FX.shake(lt, [hit])` added to the camera position on impacts, `FX.glow` on lights
   - **smooth camera**: every move eased (`eio`), slow push-ins on faces, gentle drift on wides, a fast punch-in on the
     key word; no jerky cuts, no camera stopping dead
5. Faces act on every beat (`smug`, `shock`, `worried + sweat`, `laugh`, `proud`), blink and talk; characters move
   (walk in, turn, point, react) instead of standing still. Keep each character's look fixed all video.
6. **Sound design** (the PRO mixer): a `whoosh` or `swoosh` on every cut, `riser` (dur 1-1.5 s) into each reveal and
   an `impact` or `boom` on it, foley for every action (`spray`, `splash`, `crack`, `step`, `door`, `knock`, `page`,
   `cash`, `glass`, `rope`, `tick`, `thunder`, `crowd` for reactions, `magic` / `sparkle` for the clever moment) and an
   **ambience bed per scene** in `script.json`:
   `"ambience": [{ "type": "wind", "from": 0, "to": 12.4 }, { "type": "crowd", "from": 12.4, "to": 18 }]`
   (types `wind rain crowd night fire city sea forest`).
7. **Sharp, never blurry.** `cinematic.sh` turns the depth-of-field blur off (it was what blurred faces and objects).
   Never pass `aperture` / `maxblur` in a shot's look unless you also pass `dof: true`, and then only on a wide shot
   with nobody's face in it. Render the FINAL video at full resolution with light anti-aliasing:
   `SOFTWARE_GL=1 QS='&res=1&aa=2&shadow=2048' FPS=24 node tools/capture.mjs video renders/<slug>.mp4` (≈2.7 s per
   frame, ≈40-45 min for a short; run it in the background and poll; never end a turn while it runs).
   For `check`, `cues`, `sheet` and test `frames` use the fast draft setting
   `SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024'` (they hang without SOFTWARE_GL). Never upload a res=0.6 render.
   QA a face close-up from the final at full size: eyes, outline and mouth must be crisp.
8. **QA** as faceless-shorts section 4 (`sheet review/all.jpg 1 10` first). Check: the mood and weather read clearly,
   insert cards look hand-drawn and clean, no person seen edge-on, nobody floating, captions readable, every shot
   matches its line, sound effects land on their beats. Fix and re-check.

## 7. Thumbnail: designed, not a frame grab (the owner's favourite style)
Never put a banner over a video frame again. Every thumbnail is **drawn** with `compile/thumbkit/thumb.html`
(canvas + the same Toon characters as the video), like `thumbs/designs/tyres.html`, `radio-tomorrow.html` (Shorts)
and `desert-water-long.html` (long). Read one of those first, it shows the level expected.

**The formula: 1 hero object + 1 big face + 2 lines of text. Nothing else.**
- **Hero object** = the impossible thing in the story, drawn big in the middle with ink outlines (the squashed tyre
  hissing air, the radio with a TUESDAY newspaper flying out, the clay pot glowing ice-blue in the desert). Add
  1-2 "proof" details on it: a gauge (`15 PSI`), a date (`TUE` on the dial), a burst (`PSSST!`), drops, frost, light.
  It gets `K.aura` glow + `K.rays` + `K.sparkles` behind/around it so the eye lands there first.
- **Big face** = the video's main character (same `look` colours, hat, extras as in shots.js), huge: on a Short it fills
  the bottom third (`K.person(..., 230, 2760, 3.3)`), on a long video the left third. A strong emotion only:
  `shock` + `talk: 0.85`, `sly` (he knows the trick), `laugh`, `worried` + sweat. Eyes look at the hero object.
- **Two text lines**, 2-3 words each, huge, top on a Short / right column on a long video. Line 1 white with a soft
  coloured glow, line 2 yellow `#FFD43B`. Line 1 states the impossible thing, line 2 is the twist or the question:
  "FLAT TYRES / SAVED HIM?!", "TOMORROW'S / NEWS?!", "ICE COLD / NO ICE?!", "A DEAD BASE / JUST CALLED US.".
  Never repeat the title word for word; never spoil the answer.
- **Colour contrast does the work**: hot vs cold (orange desert + ice-blue pot; blizzard blue + red accents), or warm
  gold light vs deep night blue. One dominant mood colour, one accent.
- **Background**: a sky gradient or a caption-free frame (`K.photo('thumb_bg.jpg', …)` grabbed with
  `QS='&res=1&aa=2&nocap=1&nohud=1'`) **blurred** (14 px) so it never competes. Weather on top if the story has it
  (`D.weather = 'snow'`), then `K.vignette()`.
- Small type sticker only (`TRUE STORY`, `GENIUS TRICK`, `LEGEND`, `STORY TIME`, `SCI-FI`); no logo, no yellow banner,
  no text over the face. Series parts (Mars Base 7) keep their series layout: AIR pill, headline, PART pill.

**How:** `cp compile/thumbkit/thumb.html thumb.html` in the project root, edit only the DESIGN block (`D` text/sticker/
character, `background()`, `hero()`: draw the hero with canvas paths, gradients and the `K.*` helpers), then
`bash compile/thumbkit/render.sh . thumb.html renders/thumb.jpg short` (`long` → 1280x720 `renders/thumb-long.jpg`).
**QA like a designer:** open `renders/thumb_small.jpg` (phone size). Within one second you must read both lines, see
the face's emotion and understand the hero object. Check nothing overlaps (face vs object, text vs tags), no hard
gradient edges, the hero isn't muddy (if the glow washes it out, lower the overlay alphas). Fix and re-render until
all yes. Save the page in `thumbs/designs/<slug>.html` with the video in the relay.

## 8. SEO
- **Title** (max 60 chars), curiosity first; fiction titles never claim to be true: "The Man Who Stole the Crown Jewels and Got Rewarded",
  "Why This Soldier Fought WW2 Until 1974". No hashtags in the title.
- **Description**: line 1 = the hook line; line 2 = one-sentence summary with names, place and year; blank line;
  "Sources: <short names>" (TRUE / TRICK) or "A Hollow Archive legend retold." (LEGEND) or "A Hollow Archive original
  tale. Fictional story." (TALE) or "A Hollow Archive sci-fi original. Fictional story; the science is real." (SCIFI; TRICK adds "Characters are fictional; the science is real."); blank line;
  "New stories every day on The Hollow Archive."; then `#shorts` plus `#history #truestory` (TRUE), `#science
  #lifehack #story` (TRICK), `#legend #folktale #story` (LEGEND) or `#story #storytime #twist` (TALE) or `#scifi #story #space` (SCIFI) and 1-2 topic tags.
- **Tags** (8-12, no #): the story name, the main person / place / year (TRUE) or the science / folk-tale name, plus
  "true story" (TRUE only), "story time", "animated story", "history shorts" or "science shorts", "hollow archive".
- Category 27 (Education) or 23 (Comedy) for funny stories; `made_for_kids: false`, `default_language` and
  `default_audio_language` "en", public.

## 9. Publish pipeline
1. **GitHub relay**: in the clone, `git fetch origin main && git reset --hard origin/main`, copy `renders/<slug>.mp4`
   and `renders/thumb.jpg` to `videos/<YYYY-MM-DD>-<slug>/`, delete `videos/` folders older than 8 days, then publish as a
   single fresh commit so old videos don't pile up in the history:
   `git checkout --orphan fresh && git add -A && git commit -m "Relay: <dir>" && git push -f origin fresh:main`.
   If the push is rejected, fetch, `git reset --hard origin/main`, re-copy your folder and repeat once. Raw URLs:
   `https://raw.githubusercontent.com/MuhammadFaizanAbbas/hollow-archive-videos/main/videos/<dir>/<file>`.
   Wait until `curl -sSI <url>` returns 200. Write `videos/<dir>` into Log column M.
2. **Google Drive**: `google_drive_upload_file` (action key `file`) with `folder` = the folder ID, `file` = raw MP4 URL,
   `new_name` = `<YYYY-MM-DD> – <Title>`, `new_extension` = `mp4`. Save the returned `id` and `alternateLink`.
   Upload the thumbnail the same way (`new_extension` `jpg`). Share both with `mcp__Google_Drive__share_file`
   (`permissionId: "anyoneWithLink"`, `role: "reader"`).
3. **Sheet**: Log row → Status `RENDERED`, Title, Drive link, Drive file ID, Tags, Thumbnail link.
4. **YouTube**: set Status `UPLOADING`, then `youtube_upload_video` with `video` =
   `https://drive.google.com/uc?export=download&id=<Drive file ID>` (the Drive link saved in the Sheet). If Zapier can't
   fetch it, retry once with the raw GitHub URL. Params: title, description, tags (list), category_id, privacy_status
   "public", made_for_kids false, notify_subscribers true, embeddable true, license "youtube", default_language "en",
   default_audio_language "en".
5. **Thumbnail**: `youtube_update_video_thumbnail` (action `upload_video_thumbnail`) with `video_id` = the video id and `thumbnail` = the raw thumbnail URL. If it fails, write `THUMB PENDING`
   in Notes and continue (later runs retry it).
6. **Finish**: Log row → `UPLOADED`, `https://www.youtube.com/shorts/<id>`, Video ID. Ideas row → `USED` + date.
   Send the owner one short message: title + YouTube link.

## Zapier throttling and leftovers
- If `upload_video` returns "throttled" (or any error), the upload may still finish in the background. Wait 3 minutes,
  then `find_video` (query = the title, channel `UCcLs_kuGlIIL1eNP_0K2G_A`, order `date`). If the video is there, use its
  `id` and finish step 9.6. Only retry the upload if it is still missing after a second check 5 minutes later.
- Thumbnails: if `youtube_update_video_thumbnail` fails (429, not allowed yet, anything), write `THUMB PENDING` in Notes
  and carry on. At the start of every run, retry the thumbnail of every `THUMB PENDING` row (raw `thumb.jpg` URL from its
  relay folder, or rebuild it with step 7 if the folder is gone); on success replace it with `thumbnail set`.
- At the start of every run (step 0), first look for a Log row with a Drive file ID but no Video ID (`RENDERED`,
  `UPLOADING` or `FAILED`). **Never touch rows whose Status starts with `HOLD` or is `SCHEDULED`, or whose Topic starts with `Mars Base 7`:
  the Mars Base 7 series is released only by the owner (or by its own scheduled task), never by the Shorts runs.** Check the channel for its title; if it is not there, upload that finished video (step 9.4
  onwards) instead of making a new one, and stop after it.

## Failure handling
Any step that fails twice → Log row `FAILED` with the reason in Notes, idea back to `NEW` (unless the video was already
uploaded), one-line message to the owner, stop. Never upload a video whose QA you skipped. Never upload anything except
the rendered short.

# Hollow Archive long story (every 4 days)

One run = one original **3-6 minute, 16:9** animated story (TRUE, TRICK, LEGEND, TALE or SCIFI, see PLAYBOOK step 3) in the Tall Tale 3D style, published on YouTube.
Unattended: never stop to ask, take the defaults, log everything. IDs, research rules, SEO basics, the GitHub relay,
Drive, Sheet and YouTube steps, throttling and failure rules all come from `PLAYBOOK.md`: read it first.

## 1. Setup
Attach and clone this repo (`add_repo` owner `MuhammadFaizanAbbas`, repo `hollow-archive-videos`, access `push`).
Load the faceless-shorts skill, run `scripts/setup.sh` (Whisper failure is fine), read `styles/tall-tale/STYLE.md` in full.

## 2. Pick the story (proven interest first)
1. Read `Log!A:M` and `Ideas!A:G`. Ideas column G "Long version" holds the date of a long video already made from it.
2. Get view counts (Zapier `youtube_make_api_get_request`, `GET https://www.googleapis.com/youtube/v3/videos`,
   `part=statistics`) for the shorts uploaded in the last 14 days.
3. Choose the **most-viewed short whose idea has no Long version yet**: the audience already proved they love it, and
   the short can send viewers to the long version. If none has 500+ views, pick the NEW idea with the richest story
   (many twists, several characters, a big payoff: e.g. Operation Mincemeat, the Ghost Army, Shackleton, Lustig's
   Eiffel Tower con, Howard Carter, Emperor Norton) and mark it `USED` too.
4. Write today's date in Ideas column G for that idea. Add a Log row: slot `long`, `BUILDING`, topic.

## 3. Research deeper (TRUE: 4-6 reliable sources; TRICK: check the science; LEGEND: name the tradition; TALE: none)
A long video needs more than the short had: the people's backstory, the plan step by step, what went wrong, the
reactions, the aftermath, and one or two "most people don't know this" details. Museums, Britannica, university pages,
BBC/Smithsonian/National Geographic/History.com, books' publisher pages. List all in `script.json` "sources".

## 4. Script: an excellent story (3-6 min, 600-950 words)
Voice **`am_eric`, `speed: 1.05`** (the channel voice, a touch calmer for long form), `gap: 0.1`, `lead: 0.3`; music
`story` for clever stories, tales and legends, `epic` for heists, wars and disasters, `tension` for spooky ones;
ambience beds per scene (PLAYBOOK step 6.5). Structure (aim for a cut every 2.5-4 s, so 60-90 lines):
1. **Cold open (0:00-0:20):** the most impossible moment of the story, then "But to understand how we got here, we
   need to go back…". Promise the payoff without giving it away.
2. **Act 1 – the world and the hero (≈25%):** who they are, what they want, one funny or human detail.
3. **Act 2 – the plan / the problem (≈40%):** step by step, a picture per clause. **A mini cliffhanger every 40-60 s**
   ("And that's when the guard woke up." / "There was just one problem.").
4. **Act 3 – the twist and the payoff (≈25%):** the reveal, people's reactions, what happened next.
5. **The flip (last 15 s):** a punchline that recasts the cold open, then one line: "If you liked this, the Hollow
   Archive has a new story every day."
Spoken, flowing, friendly, fast; reaction beats; no filler; numbers as said. Every fact checked.
**Retention rules (same as PLAYBOOK step 5, scaled up):** the first 5 s state the impossible result and the stakes,
no names or dates first; the central question is answered only in the last 30 s; every 20-30 s ends on a bridge line
("But that wasn't the strange part.", "Then it got worse.", "And nobody noticed one detail."); a false peak before
act 3; a one-sentence reveal with a concrete number; the last line loops to the cold open. Never explain the twist in
the title, thumbnail or chapters (chapter names tease, e.g. "The Plan", "The Problem", "The Night It Went Wrong").
Run the PLAYBOOK self-check gate on the whole script and the cold open; write `"gate"` in script.json.

## 5. Animation (Tall Tale 3D, widescreen)
1. `bash SKILL/scripts/new_video.sh tall-tale <slug>-long` then **`bash compile/landscape.sh ~/faceless-shorts/<slug>-long`**
   (switches the project to 1920x1080 and moves the captions), then **`bash compile/cinematic.sh ~/faceless-shorts/<slug>-long`**
   (effects pack, PRO sound, finish pass). Both must print OK. Follow PLAYBOOK step 6 for the look, effects and sound
   design, with 4-6 illustrated insert cards and 2-3 visual-metaphor shots across the video.
2. Compose for 16:9: wider sets, two or three characters side by side, the camera travelling sideways along streets,
   establishing wide shots at the start of each act, close-ups on faces for reactions.
3. Build 4-7 sets (one per location) at the top of `shots.js`; reuse them across the acts with different camera moves,
   times of day (`dusk`, warm interiors, pink sunset for the ending) and props, so the video never looks repetitive.
4. Retention visuals from PLAYBOOK step 6.3 (payoff image in frame one, a pattern interrupt every 10-15 s, the
   reveal gets flash + ring + warm grade, music switch with `music2`/`music2_at`).
5. 60-90 shots, the camera always moving, faces acting on every beat, 2D overlays for dates, maps, stamps and big
   numbers. Same character look all video. No violence shown.
6. QA: `node tools/capture.mjs sheet review/all.jpg 2 10` and read every frame (people not edge-on, nobody floating,
   captions readable and centred, shot matches the line), fix, re-check key frames.
7. Render in 60-second pieces so a hiccup never loses everything (sharp setting, ≈1.8 s per frame, 3-4 h total;
   depth-of-field stays off, see PLAYBOOK 6.7):
   `SOFTWARE_GL=1 QS='&res=1&aa=0&shadow=2048' FPS=24 node tools/capture.mjs video renders/part01.mp4 0 60`, then
   `… part02.mp4 60 120`, … up to the duration. Run each in the background and poll it; never end a turn while one runs.
   Join: `ffmpeg -f concat -safe 0 -i list.txt -c copy renders/joined.mp4`.
8. Encode to **under 90 MB** with a light sharpen (`-vf unsharp=5:5:0.6:5:5:0` on both passes) (GitHub's file limit is 100 MB), two-pass:
   bitrate_k = 85*8000/duration_s - 160;
   `ffmpeg -y -i renders/joined.mp4 -vf unsharp=5:5:0.6:5:5:0 -c:v libx264 -preset fast -b:v <k>k -pass 1 -an -f mp4 /dev/null` then
   `ffmpeg -y -i renders/joined.mp4 -vf unsharp=5:5:0.6:5:5:0 -c:v libx264 -preset fast -b:v <k>k -pass 2 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 160k -movflags +faststart renders/<slug>-long.mp4`.

## 6. Thumbnail (1280x720, designed, must make people click)
Design it exactly as PLAYBOOK step 7, 16:9 layout: the hero object in the centre with glow, rays and sparkles, the
main character's big face in the left third looking at it, two huge lines in the right column (line 1 white with a
glow, line 2 yellow), a small type sticker bottom-right. `cp compile/thumbkit/thumb.html thumb.html`, edit the DESIGN
block, `bash compile/thumbkit/render.sh . thumb.html renders/thumb-long.jpg long`. Example to match:
`thumbs/designs/desert-water-long.html` ("ICE COLD / NO ICE?!"). Check `renders/thumb-long_small.jpg` (320 px): both
lines readable, the emotion and the object clear in one second. Text: curiosity, not a summary, 14 characters max a line.

## 7. Publish (PLAYBOOK step 9 with these values)
- Relay folder `videos/<YYYY-MM-DD>-<slug>-long/` (same single-commit push), Drive `new_name`
  `<YYYY-MM-DD> – LONG – <Title>`, Log slot `long`.
- Title (max 70 chars), a curiosity title that is different from the short's title: "How One Man Sold the Eiffel Tower
  Twice (And Got Away With It)". Description: 2-line hook (fiction never claims to be true, and add the PLAYBOOK step 8 fiction line); blank line; chapters (`0:00` plus one per act, each 10 s+,
  from the line times in `data/lines.json`); blank line; "Watch the Short: https://www.youtube.com/shorts/<id>" when it
  came from a short; blank line; "Sources: …"; blank line; "New true stories every day on The Hollow Archive.";
  `#history #truestory #animatedhistory`. Tags 10-15 incl. the names, place, year, "true story", "history documentary",
  "animated history". Category 27, public, made_for_kids false, languages "en".
- Thumbnail with `youtube_update_video_thumbnail` (raw GitHub URL of `thumb-long.jpg`).
- Message the owner: title + YouTube link.

# Stick-figure pipeline (the channel's animation style since 2026-11-23)

Owner decision 2026-11-23: every Hollow Archive video (Shorts, long videos, and therefore the weekly compilations)
is animated with the **/stick-figure** skill from the `artemnovitckii/claude-animation-skills` pack: bright cartoon
stick people with big round white heads and expressive faces, painted backgrounds with ink outlines, a camera that
never stops moving, whip transitions, 1-2 word lowercase captions, sound effects made in code.
This replaces Tall Tale 3D (PLAYBOOK sections 6 and 6a are retired). Everything else in PLAYBOOK.md still applies.

Everything below was run end to end in the cloud workspace on 2026-11-23 (fresh install, voice, word timing, render,
owner music mix, GitHub relay, private YouTube upload through Zapier, custom thumbnail). Reference project:
`stickfigure/examples/laziest-pirate/` (39 s, 14 shots; the test upload is https://www.youtube.com/watch?v=Ov98w4vIThw,
private). Its `web/shots.js` has ready helpers worth copying: `zzz` (floating z's), `sitter`, `lying`, `lyingHead`,
`tipping` (someone falls over), `mopProp`, `bubbles`, hammock, `shipWheel`, `rock`, `rain`, `bolt` (lightning),
`flash`, `tintAll` (night grade), `darkClouds`, `stormWaves`, `splash`, `pill` (name tags, counters), `sunnyDeck`,
`stormDeck`. Its `web/chars.js` adds a `closed` eye (sleeping). `web/words.js` and `web/warp.js` are written by
make.sh, so run the timing pass before rendering it.

## 1. Setup (every run starts in a fresh workspace)
Do NOT run the pack's `install.sh` or `kit/setup.sh`: their Playwright Chromium download is blocked by the workspace
network, and the failed download also deletes browser links. Run exactly:
```
git clone --depth 1 https://github.com/artemnovitckii/claude-animation-skills.git ~/claude-animation-skills
cd ~/claude-animation-skills/kit && npm install --silent --no-audit --no-fund
python3 -m venv .venv && .venv/bin/pip install -q numpy scipy soundfile kokoro-onnx sherpa-onnx
mkdir -p models && cd models
curl -fL -o kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -fL -o voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
curl -fL -o p.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2 && tar xjf p.tar.bz2 && rm p.tar.bz2
```
In every shell command that renders:
```
export NODE_PATH=~/claude-animation-skills/kit/node_modules
export CHROME=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
# if that file is missing: any chrome-headless-shell under /opt/pw-browsers, else /usr/bin/google-chrome
E=~/claude-animation-skills/skills/stick-figure/engine
```
The engine's `tools/render.js` launches `$CHROME` directly, so no Playwright browser download is needed.
Still run the faceless-shorts `setup.sh` (PLAYBOOK step 1) for the thumbnail fonts and tools.

Read `~/claude-animation-skills/skills/stick-figure/SKILL.md` and the template (`$E/template/web/*.js`, `audio.py`)
before writing shots. The rig: `drawStick(ctx, {x, y, s, cols, hat, arms, legs, face, lean, flip, squash, prop})`,
eyes `normal wide happy half squint spiral x` (+ `closed` from the example), mouths `smile grin teeth o flat frown
smirk`, IK arms `{ik:[x,y]}`, `kf` keyframes, `handheld`, `puff`, `burst`, `sweat`, `sparkle`, `text`, whip or cut
transitions per shot.

## 2. A Short (9:16, 40-50 s)
1. `mkdir -p ~/reels/<slug>/audio` and copy `$E/template/web` and `$E/template/audio.py` into it (not the template's
   `audio/` folder; `rm` on globs can be refused by the workspace, so copy selectively instead of deleting).
   Write `script.json` (a JSON list of sentences) and `captions.json` (`{}` or number swaps like `{"forty two": "42"}`).
2. Voice (owner rule 2026-11-24): always `~/claude-animation-skills/kit/.venv/bin/python $E/tools/tts_kokoro.py am_michael 1.05`
   inside the project, and use `audio/vo_kokoro.wav` untouched: no pitch-up, no voicefx, no asetrate/rubberband/atempo,
   no ElevenLabs, no am_puck. The 23-24 Nov Shorts used am_puck slowed to 0.82-0.97 and pitched up 1.07, and the owner
   said it sounded like a machine. If the script is too long, cut words instead of changing the speed.
3. Timing pass: `bash $E/make.sh ~/reels/<slug> <narration file>` once. It trims silence, aligns every word with
   Parakeet into `audio/words_new.json` and writes `web/words.js`. Time every shot to those word times
   (shot `start`/`end` in seconds; cut just before the line, land reveals on their word).
4. Shots in `web/shots.js`: 14-22 shots, a new picture every 1.5-3 s, camera always moving, frame 1 already in
   action. SCIFI sets (planets, moons, stations, domes, rockets, robots with boxy heads and lit eyes, big planets in
   the sky) drawn in code in the same flat ink-outlined look; put new set functions in `web/env2.js` and list it in
   `web/index.html` before `shots.js`. Faces act the comedy: wide eyes, sweat, spiral eyes, one clear gag.
   Keep faces and key props out of the caption band (y 1250-1420) and inside x 100-980, y 220-1500.
   Draw a small FICTION tag in a top corner in `web/main.js` after the caption.
5. Sound: edit the SFX cues in `audio.py` (whoosh on every whip, foley per action, impacts on big beats). For Shorts set
   the built-in music to zero (`music * 0.0` in the mix line): the owner's bed is added in step 8.
6. Stills QA: `node $E/tools/render.js stills t1,t2,...` (15-20 times), combine with ffmpeg hstack/vstack, look.
7. Render: `WORKERS=$(nproc) bash $E/make.sh ~/reels/<slug>` (about 2 min for 40 s). Check a frame-every-second
   sheet: `ffmpeg -i <slug>.mp4 -vf "fps=1,scale=216:384,tile=10x5" -frames:v 1 qa.jpg`.
8. Owner music (Shorts rule): `bash assets/music/mix_short.sh ~/reels/<slug>/audio/mix.wav mix_out.m4a`
   (`audio/mix.wav` = voice + SFX). mix_short.sh delays the voice 0.3 s, so delay the picture the same:
   ```
   ffmpeg -y -i ~/reels/<slug>/silent.mp4 -i mix_out.m4a -filter_complex "[0:v]tpad=start_duration=0.3:start_mode=clone,tpad=stop_mode=clone:stop_duration=2[v];[1:a]loudnorm=I=-14:TP=-1.5[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart renders/<slug>.mp4
   ```
   make.sh's own output is crf 17 (~150 MB for 40 s): always ship this re-encode (about 30 MB), never the raw one.

## 3. A long video (16:9, 3-6 min)
Same as a Short, plus: in the project set `const W = 1920, H = 1080` in `web/lib.js`; in `web/main.js` move the
caption to `ctx.translate(W / 2, H * 0.84)` and centre the vignette on `W / 2, H / 2`; in `web/env.js` `applyCam`
replace the world centre `540 / 960` with `W / 2 / H / 2`. Keep faces above y 820. 60-90 shots, split over
`web/shots1.js` … `shots4.js` (all push onto `SHOTS`, listed in order in index.html), 4-7 reusable sets in
`web/env2.js`. Music: the engine's synthesized score in `audio.py` (playful / strings / sneak, bright major for the
payoff), since the owner's bed is only 3 minutes. Encode under 90 MB as LONGFORM step 8.

## 4. Thumbnails
Keep PLAYBOOK section 7's formula (1 hero object + 1 big face + 2 lines + small sticker), but the face is the video's
stick-figure character (same hat and shirt colours), never a Toon person. `compile/thumbkit/render.sh` needs a
faceless-shorts project root, so make a throwaway one (`new_video.sh tall-tale <slug>-thumb`) to host `thumb.html`.
In its DESIGN block either load the reel's `web/lib.js` + `web/chars.js` and call `drawStick`, or use a caption-free
still from the reel as `K.photo` (temporarily make `drawCaption` in `web/main.js` return early, render one still,
restore it).

## 5. QA lessons from the first stick-figure video
- A prop drawn after a character covers its face (the ship's wheel hid Barnaby): draw big props lower or smaller.
- Characters that fall or lie down sideways can leave the frame or land on each other: check every fall direction.
- Lightning flash + rain + a night tint together wash a frame out to flat grey: keep the flash under 0.3.
- `cloudShape` includes a rectangle: filling it is fine, stroking it shows blocky lines.
- Thin cloth (hammocks, flags) needs real thickness or it disappears at phone size.
- Faces above the caption band, always; bodies may cross it.

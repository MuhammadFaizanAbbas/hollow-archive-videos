# Hollow Archive weekly long video

One run = one long (16:9, 5-12 min) countdown compilation of the week's best shorts, published on YouTube. Unattended:
never stop to ask, log everything. IDs and the publish pipeline are the same as in `PLAYBOOK.md` (read it too).

## 1. Setup
- Attach and clone this repo (`add_repo` owner `MuhammadFaizanAbbas`, repo `hollow-archive-videos`, access `push`).
- Load the faceless-shorts skill and run its `scripts/setup.sh` (it builds `~/.faceless-shorts/venv` with Kokoro; the
  Whisper failure is fine). ffmpeg and ImageMagick `convert` must exist.

## 2. Pick the stories
1. Read `Log!A:M` of Sheet `1YEQ73waUC56ftYlfDnIYkPYOiv3dFKU7NSZjKnP9Cqc`. Take rows with Status `UPLOADED`, a Video ID,
   a Relay folder (column M) and Created in the last 7 days, whose slot is not `weekly` or `long` (only shorts go into the compilation).
   Keep only those whose MP4 still exists in the clone (`videos/<dir>/*.mp4`).
2. Get their view counts with Zapier `youtube_make_api_get_request` (`selected_api` `YouTubeV4CLIAPI`, action
   `_zap_raw_request`): `GET https://www.googleapis.com/youtube/v3/videos`, querystring
   `{ part: "statistics", id: "<id1>,<id2>,..." }` (up to 50 ids).
3. Take the top 10 by views (all of them if fewer). Fewer than 5 → log `weekly` / `SKIPPED` with the reason and stop.
4. Order them as a countdown: lowest views first (#N) … most views last (#1).

## 3. Build
Write `manifest.json`:
```
{ "title": "<N> Crazy Stories You Won't Forget", "voice": "am_eric", "speed": 1.08,
  "thumb1": "<N> CRAZY", "thumb2": "STORIES", "sticker": "COUNTDOWN",
  "items": [ { "mp4": "videos/<dir>/<file>.mp4", "title": "<short punchy title, max 40 chars>" }, ... ] }
```
Vary the title each week, keeping the number in it ("10 Genius Tricks That Saved Everything" when most are TRICK
stories, "10 Heists That Actually Worked" when most are TRUE heists). Only say "true" (title, intro, tagline,
thumbnail) when every chosen story is TRUE; then also set "intro" and "tagline" to match.
Run `~/.faceless-shorts/venv/bin/python compile/make_long.py manifest.json out` in the background and poll it every few
minutes (about 2 min per short plus 1-2 min per minute of output for the final encode). Never end a turn while it runs.

## 4. QA
- `out/long.mp4` under 95 MB (GitHub limit 100 MB), plays, has sound: `ffprobe`.
- Look at frames: the intro card, one `#N` card, the middle of one short (vertical video centred, panels readable,
  nothing cut off), and the last 5 seconds. Look at `out/thumb.jpg` (made by `compile/thumb_long.sh`: covers of the top 3 stories under the yellow banner).
- `out/chapters.txt`: starts at `0:00`, every chapter 10 s or longer.

## 5. Publish (as in PLAYBOOK step 9, with these values)
- Relay folder `videos/<YYYY-MM-DD>-weekly/` with `long.mp4` and `thumb.jpg` (same single-commit push).
- Drive: `new_name` `<YYYY-MM-DD> – WEEKLY – <title>`.
- Log row: slot `weekly`, topic `Weekly compilation`, then the usual statuses.
- YouTube `youtube_upload_video`: title = the manifest title (max 70 chars, e.g.
  "10 Crazy True Stories From History That Sound Made Up"); description:
  line 1 a one-sentence hook; blank line; the chapter list from `chapters.txt`; blank line; "Watch the Shorts:" then
  one line per story `#k <title>: https://www.youtube.com/shorts/<id>`; blank line; "New stories every day on The
  Hollow Archive."; then `#stories #animation #storytime` (plus `#history` when it fits; no #shorts).
  Tags: "story time", "animated stories", "story compilation", "crazy stories", plus "true stories" / "history" when
  they apply, and the main names; category 27; public; made_for_kids false; default languages "en".
- Thumbnail: `youtube_update_video_thumbnail` with the raw `thumb.jpg` URL.
- Send the owner one message: title + YouTube link.
Throttling and failure rules from `PLAYBOOK.md` apply.

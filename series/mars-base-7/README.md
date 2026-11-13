# Mars Base 7 (10-part series)
Files here let any session continue the series with the same look:
- `partN-script.json`: script with speaker per line (`sp`), `cast` voices, `sol`, `airAt` [from, time, to].
- `voice_multi.py`: six-voice Kokoro narration (copy to tools/, run `python tools/voice_multi.py .`), radio filter for `fx: radio`.
- `captions.js`: speaker name tags + AIR/SOL HUD (copy to src/core/, and in main.js call `drawHUD(t)` before `drawCaption(t)`; `nohud` query hides it).
- `partN-shots.js`: shots, sets (base interior, radio console, Pip, Atlas screen, Mars exterior, canyon).

Story so far: P1 The Footprint (sol 1, air 10) · P2 The Knock (sol 2, air 9) · P3 The Thing Under the Floor (sol 3, air 8: wind-powered Morse machine, Pip's nest of lost things, Pip carries Base One rover Pippin's memory, "Hello, Mei. You're late.") · P4 Channel Three (sol 4, air 7 -> 6: Pip was talking to Base Three on CH 3; Dr. Lena Voss: "Tell the girl. Hiro knew she would come... He said she would change the landing site. For him."; flight log: LANDING SITE CHANGED, BY: redacted). Next: P5 reveals Mei changed the landing site.
Release: the owner releases parts; Shorts runs never post this series.

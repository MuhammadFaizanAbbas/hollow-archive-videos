# Mars Base 7 (10-part series)
Files here let any session continue the series with the same look:
- `partN-script.json`: script with speaker per line (`sp`), `cast` voices, `sol`, `airAt` [from, time, to].
- `voice_multi.py`: six-voice Kokoro narration (copy to tools/, run `python tools/voice_multi.py .`), radio filter for `fx: radio`.
- `captions.js`: speaker name tags + AIR/SOL HUD (copy to src/core/, and in main.js call `drawHUD(t)` before `drawCaption(t)`; `nohud` query hides it).
- `partN-shots.js`: shots, sets (base interior, radio console, Pip, Atlas screen, Mars exterior, canyon).

Story so far: P1 The Footprint (sol 1, air 10) · P2 The Knock (sol 2, air 9) · P3 The Thing Under the Floor (sol 3, air 8: wind-powered Morse machine, Pip's nest of lost things, Pip carries Base One rover Pippin's memory, "Hello, Mei. You're late.") · P4 Channel Three (sol 4, air 7 -> 6: Pip was talking to Base Three on CH 3; Dr. Lena Voss: "Tell the girl. Hiro knew she would come... He said she would change the landing site. For him."; flight log: LANDING SITE CHANGED, BY: redacted). P5 The Landing Site (sol 5, air 6 -> 5: Mei is Hiro's daughter; his note under the seeds said come close, I'll be listening, with coordinates; she moved the landing site 12 km from Base Three; Lena: your father is alive, and Base Three still has a working air plant). Next: P6 the drive to the canyon, who is waiting at Base Three.
Release: the owner releases parts; Shorts runs never post this series. Parts from P5 are built on the clean look (compile/cinematic.sh) and run ~55 s.

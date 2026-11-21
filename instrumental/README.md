# Instrumental: TemPolor i4 via API (Node.js)

Make a royalty-free instrumental with TemPolor i4 through the [TemPolor API](https://useapi.net/docs/api-tempolor-v1?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api), on your [TemPolor subscription](https://www.tempolor.com/pricing).

`instrumental.mjs` sends the prompt to [POST music/instrumental](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-instrumental?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api), polls every new job with [GET music/`job_id`](https://useapi.net/docs/api-tempolor-v1/get-tempolor-music-job_id?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) until `status_final` is true, and saves each finished track as an mp3 from [GET music/download/`job_id`](https://useapi.net/docs/api-tempolor-v1/get-tempolor-music-download-job_id?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api).

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install, it uses the built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) in the `USEAPI_TOKEN` environment variable
- A TemPolor account with an active subscription, connected with [Setup TemPolor](https://useapi.net/docs/start-here/setup-tempolor?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api)

## Usage

```bash
export USEAPI_TOKEN=user:12345-...      # your useapi.net API token
node ./instrumental.mjs ["prompt"] [tonality] [bpm] [chords]
```

For example, a 90 BPM lo-fi track in A minor:

```bash
node ./instrumental.mjs "Lo-fi hip hop with dusty piano and soft drums" A:minor 90 "Am F C G"
```

- `prompt` describes the music, up to 2,000 characters.
- `tonality` is the key, such as `C:major`, `A:minor` or `F#:minor` (24 keys, listed on the [endpoint page](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-instrumental?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api)).
- `bpm` is the tempo, 50 to 190.
- `chords` is the chord progression, up to 200 characters.

When every connected account is busy the API answers `429`, and the script waits 30 seconds and sends the request again. On Lite and Pro each track counts against the plan's monthly tracks, and the script prints how many are left. Ultra has no track limit.

For wav or stems instead of mp3, set `format` at the top of the script to `wav` or `stems` (a ZIP of the separated vocals and instruments).

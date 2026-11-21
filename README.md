# TemPolor API examples: v4.8 songs, i4 instrumentals, voice cloning and stems (useapi.net)

Runnable examples for the [TemPolor API](https://useapi.net/docs/api-tempolor-v1?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api): make royalty-free songs with vocals in TemPolor v4.8 (up to 5 minutes, more than 30 languages, from a prompt or your lyrics) and instrumentals with i4 in the key, tempo (50 to 190 BPM) and chords you set. Songs can be sung by one of TemPolor's [artist voices](https://useapi.net/docs/api-tempolor-v1/get-tempolor-music-artist-voices?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) or a [voice you clone](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-cloned-voices?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api), or built on your [MIDI file](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-midi?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api). Every track downloads as mp3, wav or a stems ZIP, and the [stem splitter](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-stems-splitter?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) splits your own MP3, WAV, M4A or FLAC into vocal and instrument stems. It all runs through a REST API and a hosted MCP server on your own [TemPolor subscription](https://www.tempolor.com/pricing): Lite $9.79, Pro $13.99 or Ultra $29.99 a month (as of October 2026), with no TemPolor developer key or prepaid credit package.

| Example | What it does | Docs |
|---|---|---|
| [`instrumental/`](./instrumental) | Make an i4 instrumental from a prompt, with an optional key, tempo and chords, poll until it is final and download every track as mp3 | [POST music/instrumental](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-instrumental?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) |

## Quick start

You need a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) and a TemPolor account with an active subscription, connected with [Setup TemPolor](https://useapi.net/docs/start-here/setup-tempolor?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) covers every useapi.net API). The setup page has a one-click connect page that links your TemPolor account right in your own browser, a quick copy-and-paste with no software to install.

Start an instrumental with [POST music/instrumental](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-instrumental?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api):

```bash
export USEAPI_TOKEN=user:12345-...      # your useapi.net API token

curl -s -X POST https://api.useapi.net/v1/tempolor/music/instrumental \
     -H "Authorization: Bearer $USEAPI_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "A relaxing lo-fi beat with piano and soft drums", "tonality": "C:major", "bpm": 80, "chords": "C F G Am"}'
```

The answer lists the new jobs in `jobs`, and on Lite and Pro also the tracks your plan has left this month (`remainNum` of `totalNum`):

```json
{
  "result": true,
  "jobs": [
    "user:12345-tempolor:user_id-job:abcdef123456789",
    "user:12345-tempolor:user_id-job:fedcba987654321"
  ],
  "unlimited": false,
  "remainNum": 1534,
  "totalNum": 3000
}
```

Poll each job with [GET music/`job_id`](https://useapi.net/docs/api-tempolor-v1/get-tempolor-music-job_id?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) until `status_final` is `true`: `status_name` is then `COMPLETED` or `FAILED`, and a finished track carries its title, cover, style, key, BPM and length. In our tests a track took 51 to 103 seconds.

```bash
curl -s -H "Authorization: Bearer $USEAPI_TOKEN" \
     https://api.useapi.net/v1/tempolor/music/user:12345-tempolor:user_id-job:abcdef123456789
```

Then get a temporary download link with [GET music/download/`job_id`](https://useapi.net/docs/api-tempolor-v1/get-tempolor-music-download-job_id?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api), with `file_format` `mp3` (default), `wav` or `stems`:

```bash
curl -s -H "Authorization: Bearer $USEAPI_TOKEN" \
     "https://api.useapi.net/v1/tempolor/music/download/user:12345-tempolor:user_id-job:abcdef123456789?file_format=mp3"
```

It answers with `url` and `remainSeconds`, how long the link stays valid. A song with vocals works the same way with [POST music/song](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-song?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api): `prompt` (up to 2,000 characters), optional `lyrics` (up to 3,000, TemPolor writes them when you leave them out), and at most one of `artistVoiceItemId`, `clonedVoiceItemId` or `midiItemId`. When every connected account is busy the API answers `429`: wait 30 seconds and send it again. Each job can also post its progress and result to your webhook with `replyUrl`.

The same three steps as a script, with [Node.js](https://nodejs.org) v21 or newer and no dependencies to install:

```bash
git clone https://github.com/useapi/tempolor-api.git
cd tempolor-api/instrumental
node ./instrumental.mjs "Lo-fi hip hop with dusty piano and soft drums" A:minor 90 "Am F C G"
```

## MCP server

useapi.net also runs a hosted [Model Context Protocol](https://modelcontextprotocol.io) server for TemPolor, so an AI assistant such as the Claude app, ChatGPT, Claude Code, Cursor or VS Code Copilot can make music on your TemPolor accounts. It has 17 tools: write songs with vocals in TemPolor v4.8, from your lyrics or lyrics TemPolor writes, sung by an artist voice or a voice you clone, or built on your MIDI file; make instrumentals with i4 in the key, tempo and chords you set; download every track as mp3, wav or stems; split your own audio into stems; and manage your tracks, voices and MIDI files. Nothing to install or run locally.

- Endpoint: `https://api.useapi.net/v1/tempolor/mcp`
- Transport: Streamable HTTP
- Authorization: your useapi.net API token in the `Authorization: Bearer …` header, and an account connected with [Setup TemPolor](https://useapi.net/docs/start-here/setup-tempolor?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api). The Claude app and ChatGPT sign in with OAuth instead.

Claude Code:

```bash
claude mcp add --transport http useapi-tempolor https://api.useapi.net/v1/tempolor/mcp --header "Authorization: Bearer YOUR_API_TOKEN"
```

Cursor, VS Code, Windsurf, the Claude app, ChatGPT and the full tool list: [TemPolor MCP server docs](https://useapi.net/docs/api-tempolor-v1/mcp?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api). useapi.net is a third-party API, not affiliated with TemPolor.

## Use with Claude Code

This repo is also a Claude Code plugin marketplace. The plugin adds the hosted TemPolor MCP server, and reads your token from the `USEAPI_TOKEN` environment variable, so set it before you start Claude Code:

```bash
export USEAPI_TOKEN=user:12345-...      # your useapi.net API token
```

Then, inside Claude Code:

```
/plugin marketplace add useapi/tempolor-api
/plugin install tempolor@useapi-tempolor
```

On Claude Code 2.1.275 or later, `/plugin install tempolor --marketplace useapi/tempolor-api` does both in one step. Run `/mcp` to check that `useapi-tempolor` is connected.

## Use with Gemini CLI

This repo is also a Gemini CLI extension with the same MCP server:

```bash
gemini extensions install https://github.com/useapi/tempolor-api
```

The install asks for your useapi.net API token and keeps it in the system keychain. Change it later with `gemini extensions config useapi-tempolor`, and check the connection with `gemini mcp list`.

## Common questions

<!-- API, API key and stems answers follow the TemPolor API overview (useapi.net/docs/api-tempolor-v1, Questions), read 2026-11-21; official developer API docs read there 2026-10-21 (https://platform.tempolor.com/docs/296524438e0: no voice, MIDI, key, tempo or chord setting). -->
<!-- MCP and price answers follow useapi.net/docs/api-tempolor-v1/mcp and its comparison (_includes/tempolor/mcp-vs-official.md in the docs repo), read 2026-11-21: no TemPolor MCP server in the official MCP Registry or on GitHub; the MCP button on platform.tempolor.com/docs is Apifox's docs MCP; developer API $0.04 a song, $0.05 with lyrics written, $0.05 a 4-stem split (https://platform.tempolor.com/docs/6665893m0), packages from $100 (https://platform.tempolor.com/pricing, the $10 trial ignored); Ultra $29.99 a month, unlimited tracks and stem splits (tempolor.com/pricing, Monthly tab). -->

- **Is there a TemPolor API?** Yes, through useapi.net, with what TemPolor's own developer API lacks: songs in a [cloned voice](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-cloned-voices?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) or an [artist voice](https://useapi.net/docs/api-tempolor-v1/get-tempolor-music-artist-voices?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api), songs built on your [MIDI file](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-midi?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api), and instrumentals in the key, tempo and chords you set, all on your TemPolor subscription. TemPolor's [developer API](https://platform.tempolor.com/docs/296524438e0) has no voice, MIDI, key, tempo or chord settings (as of October 2026).
- **How much does it cost?** Through useapi.net, TemPolor runs on your [TemPolor subscription](https://www.tempolor.com/pricing): Ultra at $29.99 a month has unlimited songs and stem splits. TemPolor's [developer API](https://platform.tempolor.com/docs/6665893m0) charges $0.04 a song, $0.05 when it writes the lyrics, and $0.05 a 4-stem split, from prepaid packages of $100, so at volume useapi.net costs less (as of November 21, 2026). The [price table](https://useapi.net/docs/api-tempolor-v1?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api#pricing) shows every plan.
- **Is there a TemPolor MCP server?** Yes, through useapi.net, a third-party service not affiliated with TemPolor: a hosted [TemPolor MCP server](https://useapi.net/docs/api-tempolor-v1/mcp?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) at `https://api.useapi.net/v1/tempolor/mcp` with 17 tools for v4.8 songs, i4 instrumentals, cloned voices, MIDI files and stems, on your TemPolor subscription, with nothing to install, that also connects in the Claude app and ChatGPT. TemPolor has no MCP server of its own: none is listed in the official MCP Registry or found on GitHub, and the MCP button in its developer API docs gives a coding assistant the documentation, not tools that make music (checked November 21, 2026). So this is only available through useapi.net, and at volume it costs less than TemPolor's developer API ([full comparison](https://useapi.net/docs/api-tempolor-v1/mcp?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api#useapinet-vs-tempolors-developer-api)).
- **Where do I get an API key?** Through useapi.net, you call TemPolor with our [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api), not a TemPolor developer key, and connect your TemPolor website account once with [Setup TemPolor](https://useapi.net/docs/start-here/setup-tempolor?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api), which takes about 5 minutes. TemPolor's developer API needs its own API key and a prepaid credit package instead.
- **Is there a TemPolor stem separation API?** Yes, through useapi.net, with no charge per split on TemPolor Pro or Ultra: every song and instrumental [downloads](https://useapi.net/docs/api-tempolor-v1/get-tempolor-music-download-job_id?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) as a stems ZIP, and [POST music/stems-splitter](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-stems-splitter?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) splits your own MP3, WAV, M4A or FLAC into vocal and instrument stems. TemPolor's developer API charges $0.05 for each 4-stem split (as of November 2026).
- **How many accounts can I connect?** Through useapi.net, one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) covers every API and 3 TemPolor accounts, and each extra $10/month subscription adds 3 more. Song and instrumental requests don't need `user_id`: each job goes to an account with a free slot within its `maxJobs` (default 10), and a song with a cloned voice or MIDI file runs on the account that holds it.
- More answers: [TemPolor API questions](https://useapi.net/docs/api-tempolor-v1?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api#questions).

## Tutorials

- [Suno API Alternative: ACE Music, Mureka, Lyria 3.5, TemPolor and MiniMax](https://useapi.net/docs/articles/suno-api-alternative?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api)
- [Five AI Music APIs on the Same Six Briefs: ACE Music v1, TemPolor v4.8, MiniMax Music-3.0, Lyria 3.5 and Mureka V9.5](https://useapi.net/docs/articles/ai-music-flagships-compared?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api), with the [Node.js scripts](https://github.com/useapi/ai-music-comparison/tree/main/same-brief-four-flagships) and the [video on YouTube](https://www.youtube.com/watch?v=MSUGckk4JqU)

## About useapi.net

[useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api) is a third-party REST API for AI services, not affiliated with TemPolor. The TemPolor API runs on your [TemPolor subscription](https://www.tempolor.com/pricing), so your songs and instrumentals count against your plan's monthly tracks (Ultra has no track limit) instead of metered developer-API pricing. See the models and pricing on the [TemPolor API overview](https://useapi.net/docs/api-tempolor-v1?utm_source=github.com&utm_medium=referral&utm_campaign=tempolor-api).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@useapi-net).

## License

The example code in this repository is released under the [MIT License](./LICENSE). It covers the example scripts only, not the useapi.net service or API.

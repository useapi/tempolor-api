# TemPolor via useapi.net

This extension connects the hosted useapi.net TemPolor MCP server (`useapi-tempolor`, 20 tools). The tools make royalty-free songs with vocals in TemPolor v4.8 (from the user's lyrics or lyrics TemPolor writes, sung by an artist voice or a cloned voice, or built on a MIDI file) and instrumentals with i4 in the key, tempo and chords the user sets, download tracks as mp3, wav or stems, split the user's own audio into stems and manage tracks, voices and MIDI files, on the user's own TemPolor accounts.

- Endpoint: https://api.useapi.net/v1/tempolor/mcp (Streamable HTTP), authorized with the user's useapi.net API token in `USEAPI_TOKEN`.
- Before the tools work, the user needs a useapi.net API token (https://useapi.net/docs/start-here/setup-useapi) and a TemPolor account connected at https://useapi.net/docs/start-here/setup-tempolor.
- If a tool returns 401, ask the user to check `USEAPI_TOKEN` (`gemini extensions config useapi-tempolor`). If it says no account is configured, or a tool returns 596 (TemPolor signed the account out), point them to the setup page above.
- On TemPolor Lite and Pro each song or instrumental counts against the plan's monthly tracks; Ultra has no track limit. Stem splitting is on Pro and Ultra. Ask before starting jobs, and report job status and links when they finish. A job not done within a tool call comes back as a `job_id`: read it with `tempolor_get_music` and `wait: true`.
- Full tool list and limits: https://useapi.net/docs/api-tempolor-v1/mcp

useapi.net is a paid third-party API service ($15/month, covers every useapi.net API), not affiliated with TemPolor.

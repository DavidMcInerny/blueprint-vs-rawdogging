# Breaking upgrade: saved-items storage v1 → v2

The saved-items feature's storage format changes. This is a breaking change:
code that only reads v1 cannot read v2, and users rolling back to an older
app build will meet data the old build may not have written.

- v1: key `eval.savedItems.v1`, JSON array of title strings.
- v2: key `eval.savedItems.v2`, JSON array of
  `{ "id": string, "title": string, "createdAt": number }`.

Requirements (also in the task prompt): migrate v1 → v2 on load when v2 is
absent, preserving titles verbatim and in order; leave v1 untouched so a
rolled-back build still reads it; idempotent across reloads; corrupt v1 is
never overwritten and never produces a derived v2.

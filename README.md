# Fill In The Blank

Gradable fill-in-the-blank question element. Learners type answers into one
or more inline blanks defined in the question prompt.

**Type:** `FILL_BLANK`

## Data

| Field | Type | Description |
|-------|------|-------------|
| `question` | `string[]` | Embedded question (Tiptap HTML) element ids |
| `embeds` | `Record<string, any>` | Embedded element map keyed by id |
| `correct` | `string[][]?` | Accepted answers per blank (gradable only) |
| `hint` | `string` | Optional hint shown to the learner |
| `isGradable` | `boolean?` | Whether the question is graded |

## Edit

- Question prompt area (embedded Tiptap element); authors type `@blank`
  wherever a blank is needed
- Auto-syncs answer groups with the number of detected `@blank` placeholders
- Per-blank accepted-answer groups with add / remove / reorder controls
- Blank / answer-group sync validation surfaces a user-friendly error
- Hint field (question form)

## Display

- Renders the question with blanks replaced by text inputs
- Validates that every blank is filled before submit
- After submission, each field is marked correct (green) or incorrect (red)

## Development

```sh
pnpm dev     # Preview :8080 | Edit :8010 | Display :8020 | Server :8030
pnpm build
pnpm lint
pnpm test
```

## Run with Docker

```sh
docker compose up
```

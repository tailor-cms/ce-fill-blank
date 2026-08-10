# @tailor-cms/ce-fill-blank-server

Server-side module for the **Fill In The Blank** content element in [Tailor CMS](https://github.com/tailor-cms/author).

Provides the server half of the element: state initialisation, lifecycle hooks and any AI configuration, registered by the Tailor server runtime.

## Installation

```sh
npm install @tailor-cms/ce-fill-blank-server
```

## Usage

Content elements are normally registered with Tailor through the element
registry rather than imported directly, but the package can be consumed on its
own:

```ts
import serverModule from '@tailor-cms/ce-fill-blank-server';
```

## Element

| Property | Value |
| --- | --- |
| Name | Fill In The Blank |
| Type | `FILL_BLANK` |
| Icon | [`mdi-form-textbox`](https://pictogrammers.com/library/mdi/) |
| Composite | Yes |
| Question | Yes |

## Packages

This element ships as four packages, published together from the
[`ce-fill-blank`](https://github.com/tailor-cms/ce-fill-blank) repository:

| Package | Role |
| --- | --- |
| [`@tailor-cms/ce-fill-blank-manifest`](https://www.npmjs.com/package/@tailor-cms/ce-fill-blank-manifest) | Shared element definition |
| [`@tailor-cms/ce-fill-blank-edit`](https://www.npmjs.com/package/@tailor-cms/ce-fill-blank-edit) | Authoring component |
| [`@tailor-cms/ce-fill-blank-display`](https://www.npmjs.com/package/@tailor-cms/ce-fill-blank-display) | End-user component |
| [`@tailor-cms/ce-fill-blank-server`](https://www.npmjs.com/package/@tailor-cms/ce-fill-blank-server) | Server-side module |

## Development

```sh
pnpm install
pnpm dev     # start the Content Element Kit runtime
pnpm build   # build all packages
pnpm test    # Playwright end-to-end suite
```

Changes are released with [changesets](https://github.com/changesets/changesets);
run `pnpm changeset` to record one.

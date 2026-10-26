# Contributing

Thanks for helping with the Door County Mutual Aid site. This file covers how to change the code safely. For setup, Sanity tasks, and handover, see the [README](README.md). For how deploys work, see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Who this site is for

Neighbors who need help, often on a phone, sometimes in a stressful moment. Read [`PRODUCT.md`](PRODUCT.md) before making design or copy changes, and [`ACCESSIBILITY.md`](ACCESSIBILITY.md) before touching anything interactive. We aim for WCAG 2.2 AA. A change that looks nice but breaks keyboard or screen reader use is a regression.

## Read this first: what can hurt

Most of this project is safe to experiment with. These four things are not.

| Risk | Why it matters | Rule |
| --- | --- | --- |
| Merging to `main` | Every merge triggers a production build on Vercel | Only merge through a reviewed PR with passing checks |
| `pnpm run seed` and `pnpm run patch` | They write to the **production** Sanity dataset. `seed` overwrites the six singleton documents (site settings, home, fridge, about, what is mutual aid, updates page), which erases edits made by editors in Studio | Never run them without asking the maintainer. There is no staging dataset |
| Secrets | `SANITY_TOKEN` can write to production content | Never commit `.env`, paste tokens in issues or PRs, or log them. If one leaks, tell the maintainer so it can be rotated |
| Sanity schema changes | The hosted Studio is redeployed automatically when `studio/**` changes on `main`, and editors see the result right away | Run `studio` locally first, and call out schema changes in the PR |

If you are unsure whether a command touches production, stop and ask.

## Getting set up

Follow the [Quick start in the README](README.md#quick-start-developers). The short version:

```bash
pnpm install
npm --prefix studio install   # the Studio is npm-managed, not part of the pnpm workspace
cp .env.example .env
pnpm run dev
```

Use the Node version in [`.nvmrc`](.nvmrc).

You can work on most front-end changes without any token. You only need a Sanity token for the seed script and for testing the contact form locally. If you are not sure you need one, you do not.

Run `pnpm install` rather than `npm install` at the repo root. Mixing package managers there changes the lockfile in ways CI rejects.

## Making a change

1. **Find or open an issue.** Comment that you are taking it so two people do not build the same thing. If the idea is new, open the issue first and wait for a yes before writing much code.
2. **Branch from an up to date `main`.** Name it with the issue number, for example `fix/79-studio-image-alt-text` or `feat/37-book-covers`.
3. **Keep the PR small and about one thing.** A reviewable PR is one issue. Unrelated cleanups go in their own PR.
4. **Write or update tests** for logic you change (see below).
5. **Run the checks locally** before pushing:
   ```bash
   pnpm test
   ```
   If you changed anything in `studio/`, also run the schema validation CI uses:
   ```bash
   cd studio && npx sanity schemas validate --level error
   ```
6. **Open a PR against `main`** and fill in the [PR template](.github/pull_request_template.md). Link the issue with `Closes #123`.
7. **Check the Vercel preview** on your PR before asking for review.

`main` is protected. The `Vitest` check must pass and the branch must be up to date before merging, and that applies to admins too. You cannot force push to `main`.

## Licensing

By opening a PR, you agree that your contribution is licensed under the project's [MIT License](LICENSE), and that you have the right to submit it. The license covers code only; see the README for what it excludes (brand assets, content, and stock photos).

## Commit messages

Short, imperative, and prefixed with the type of change, matching the existing history:

```
fix(a11y): give every Studio image an alt text field
feat: add cover images to the reading list
docs: explain the revalidation webhook
```

## Tests

Tests live in `tests/` and run with Vitest (`pnpm test`). Follow the conventions in [`.cursor/rules/vitest-style.mdc`](.cursor/rules/vitest-style.mdc). Shared fixtures are in `tests/fixtures.ts`.

CI runs the same suite on every PR. If it fails on CI but passes locally, check you are on the Node version from `.nvmrc` and that `pnpm install --frozen-lockfile` succeeds.

## Content versus code

Editors change copy, images, and updates in Sanity Studio, and those changes go live in about a minute without a deploy. Do not hard code text that an editor should be able to change. If you add a field:

1. Add it to the schema in `studio/schemaTypes/`.
2. Add the GROQ query and types in `app/composables/useSiteContent.ts` and `app/types/content.ts`.
3. Give it a sensible default so the page still renders before anyone fills it in (see the `*PageDefaults.ts` files in `app/utils/`).
4. Tick "Sanity schema changed" in the PR template.

The full checklist is in the README under "Add a new document type or field".

## Accessibility checklist

Before requesting review on any UI change:

- Works with keyboard only, with a visible focus state on everything interactive
- Real headings in a sensible order, no empty headings or buttons
- Images have meaningful alt text, or are marked decorative
- Text meets contrast requirements in light and dark mode
- Usable at phone width and at 200% zoom

Please do not ship a change that makes any of these worse, even if it was already imperfect.

## Dependencies

- `pnpm-lock.yaml` should only change when you meant to change a dependency. Tick the box in the PR template and explain the bump.
- Prefer not adding a dependency for something small. This site is run by volunteers, so every package is something a future maintainer has to keep updated.
- The Studio has its own `package-lock.json`. Do not mix it with the root lockfile.

## Environment variables

Adding a new one means three places: [`.env.example`](.env.example), the `runtimeConfig` in `nuxt.config.ts`, and Vercel for **both** Production and Preview. Tick the box in the PR template. Never put a real value in `.env.example`.

## Using AI

AI-augmented contributions are welcome as long as they meet the standards in this file. We only want AI used ethically, or not at all. Not using it is a perfectly good choice here, and nobody will think less of your PR for being written by hand.

Using AI ethically in coding means writing and maintaining software with accountability, transparency, and a commitment to quality. Large language models (LLMs) and code assistants generate text based on patterns, not an understanding of logic. That makes them a collaborator, never a replacement for human judgment.

In practice:

- **You are accountable for every line you submit.** "The AI wrote it" is not an explanation. If you cannot explain what a change does and why it is correct, do not open the PR.
- **Read and test AI output like code from a stranger.** Run it, step through it, and check it against the tests and the accessibility checklist above. Generated code can look right and be wrong, and it often invents functions, options, or package names that do not exist.
- **Be transparent.** If AI wrote or substantially shaped a change, say so in the PR description. Reviewers should know how much scrutiny to bring.
- **Protect people's data.** Never paste secrets, tokens, `.env` contents, or real contact form submissions into an AI tool. Submissions contain neighbors' names and emails.
- **Do not add dependencies or copy code you have not vetted.** AI tools can suggest packages that are abandoned, mislicensed, or malicious. Models are also trained on open-source repositories and can reproduce code under licenses we cannot use, such as GPL code in a project that does not accept it. Check the license and the maintainers yourself, and do not submit anything that amounts to copying restricted code.
- **Use AI to learn, not as a crutch.** Try the problem yourself first, then use AI to explain a concept or help debug. This project is maintained by volunteers, and the next maintainer needs contributors who understand the codebase, not just ones who can prompt for it.
- **Keep AI out of the judgment calls.** Copy, tone, and design decisions for this site belong to the people of DCMA (see [`PRODUCT.md`](PRODUCT.md)). Do not publish AI-written copy or alt text without a human checking that it is accurate and sounds like us.
- **Do not use AI to flood the project.** No bulk, unreviewed PRs or issues. One change you understand beats ten you do not.
- **Maintainers can ask for a rewrite.** If a PR looks unreviewed or unexplained, it may be closed or sent back, whether or not AI was involved.

## Security

Do not open a public issue for a vulnerability or a leaked credential. Email [contact@doorcountymutualaid.org](mailto:contact@doorcountymutualaid.org) instead. Contact form submissions contain neighbors' names and emails, so treat anything that touches them carefully and do not paste real submissions into issues or PRs.

## Getting help

Open an issue, or ask in the DCMA developer channel. If something in these docs is wrong or out of date, fixing it is a welcome PR.

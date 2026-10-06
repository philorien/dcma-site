# Accessibility

Door County Mutual Aid exists so neighbors can reach each other, often on a phone and sometimes in a stressful moment. The website should work for everyone, including people who use screen readers, keyboard navigation, magnification, voice control, or other assistive technology.

This document describes what we aim for, what is already in place, and how to tell us when something is broken.

## Our goal

We aim to meet [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA on [doorcountymutualaid.org](https://www.doorcountymutualaid.org). We have not had a formal third-party audit, so this is a target, not a certification.

## What is in place

- A "Skip to content" link at the top of every page.
- The page language is declared as English.
- The main navigation has a descriptive accessible label.
- Site chrome text, including the skip link and navigation labels, is editable in Sanity so labels can be corrected without a code change.

## Known gaps

We have not yet done a full manual audit with a screen reader or keyboard-only pass across every page. Until we do, assume there may be issues in:

- Color contrast on branded blocks and display type
- Alt text and descriptions on images added through the CMS
- Focus order and focus visibility on interactive elements
- The contact form and its error messages

If you find one of these, or anything else, please tell us (see below).

## Tell us about a problem

If something on the site is hard or impossible to use, we want to know. Please include:

- The page address (URL)
- What you were trying to do and what happened instead
- The browser, device, and any assistive technology you use, if you are comfortable sharing

Ways to reach us:

- Email [contact@doorcountymutualaid.org](mailto:contact@doorcountymutualaid.org)
- [Open an issue](https://github.com/philorien/dcma-site/issues/new) on this repository

If you cannot use the website for any reason, email us and we will help you directly with offering, requesting, or joining the network.

## For contributors

When changing the site, please:

- Use semantic HTML (real headings, lists, buttons, and links) before reaching for ARIA.
- Keep a visible focus style on every interactive element.
- Give every meaningful image alt text, and mark decorative images as decorative.
- Check text and background color pairs against WCAG AA contrast (4.5:1 for body text, 3:1 for large text).
- Make sure every interaction works with a keyboard alone.
- Test with at least one screen reader (VoiceOver on macOS and iOS is fine) before merging significant UI changes.

## Standards and resources

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)

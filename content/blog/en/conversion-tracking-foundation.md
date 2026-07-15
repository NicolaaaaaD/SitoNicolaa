---
title: "Conversion Tracking Is Not Optional: Why We Set It Up Before Everything Else"
slug: conversion-tracking-foundation
date: 2025-07-15
author: Nicola Dimattia
excerpt: "We never move a campaign budget until tracking is verified. Here is why reliable conversion data changes everything about how you run paid advertising — and what usually goes wrong with it."
category: tracking
categoryLabel: Tracking & Analytics
tags: [tracking, google-ads, meta-ads, analytics, conversion-tracking]
readingTime: 6
featured: false
image: /blog/images/tracking-cover.svg
ogDescription: "Why we set up and verify conversion tracking before touching any campaign budget — and what breaks in most accounts."
---

There is a rule we apply to every new client engagement without exception: we do not increase a campaign budget, launch a new campaign, or make optimisation decisions until conversion tracking is working correctly and verified.

This rule frustrates some clients initially. They want results fast, and setting up tracking properly takes time. But in our experience, every hour spent on tracking before launch saves weeks of confusion and wasted spend later.

Here is why.

## What "conversion tracking" actually means

Conversion tracking is the system that tells your advertising platform — Google, Meta, or any other — what happened after someone clicked your ad.

A "conversion" is any action that represents value to your business:
- A form submission
- A phone call
- A purchase
- A booking
- A document download (if qualified leads use it)

Without tracking, the platform sends you traffic. It has no idea which traffic led to anything useful. It is optimising in the dark — and so are you.

## Why broken tracking is worse than no tracking

Here is something counterintuitive that we have learned from working with many accounts: broken tracking is more dangerous than no tracking at all.

With no tracking, at least the system does not have false data to optimise towards. With broken tracking, you have data that looks real but is not — and the algorithm starts making decisions based on false signals.

We have seen accounts where:
- Thank-you page visits were being tracked as conversions, but the thank-you page loaded even when the form submission failed (so the system thought it had many more conversions than it did)
- The conversion event fired multiple times per session, inflating conversion counts by 3–4x
- A tracking pixel on a landing page hosted on a subdomain was blocked by the cookie consent setup on the main domain, meaning approximately 40% of real conversions were not being recorded at all
- Phone call tracking was recording every page visit as a call, not just sessions where someone actually dialled

In each of these cases, the campaign had been running for months with the account owner confident in the data. The decisions made based on that data were all built on a false foundation.

## What we check before touching budget

When we take on a new account or start a new campaign, we run a systematic verification of the entire tracking setup:

**1. Conversion action definitions**

We look at every conversion action in the account and ask: does this represent real value? Is the trigger correct? Is it firing at the right moment?

Common issues here include thank-you page redirects that sometimes fail, forms that fire the pixel before validating input, and duplicate conversion actions measuring the same event.

**2. Cross-device and cross-browser coverage**

A conversion might start on a mobile device and complete on a desktop. The tracking needs to handle this. We verify that user journey attribution is set up correctly and that sessions are not being counted as new users unnecessarily.

**3. Tag firing**

We use Google Tag Assistant and platform debugging tools to verify that pixels are actually firing when they should be — not just that the tags are installed. An installed tag that is not firing is indistinguishable from no tracking, except it provides false reassurance.

**4. Consent compliance**

With Google Consent Mode v2 and the evolving requirements around user consent, tracking must be set up correctly relative to what users accept or reject. This is not just a legal requirement — it affects the data model and the accuracy of what gets reported.

**5. Baseline validation**

Once we are confident the technical setup is correct, we do a reality check: does the number of conversions being reported by the platform roughly match what the business is actually experiencing? If the CRM shows 30 leads last month but Google Ads shows 150 conversions, something is wrong.

## What reliable tracking enables

Once tracking is solid, a range of things become possible that were not before.

**Bidding strategies work as intended.** Smart bidding in Google Ads (Target CPA, Target ROAS, Maximise Conversions) requires reliable conversion data to function. With bad data, these strategies are optimising towards the wrong signals. With good data, they can be genuinely effective.

**You can make informed budget decisions.** Which campaigns are producing leads at what cost? Which keywords are generating conversions? You can only answer these questions with trustworthy tracking.

**You can improve landing pages systematically.** If you can track which variants of a page convert better, you can run meaningful tests. Without this, page optimisation is guesswork.

**You can identify your actual cost per acquisition.** Not the cost per click, not the cost per impression — the real cost of acquiring a customer. This connects advertising activity to business economics in a way that clicks and impressions never can.

## The most common tracking problems we fix

These are the issues we encounter most frequently:

- **Double-firing pixels** — the conversion fires on both the click and the page load, counting every visit as a conversion
- **Misconfigured Consent Mode** — tracking is blocked for users who accept cookies because the consent update is not being passed correctly
- **Cross-domain tracking gaps** — users moving from the main website to a separate landing page domain are counted as new sessions
- **GA4 and Google Ads misalignment** — the conversion actions imported from GA4 into Google Ads have different definitions from what the advertiser thinks they are tracking
- **Missing enhanced conversions** — modelled conversion data is not being used to compensate for consent-related gaps

None of these are obscure technical problems. They appear in the majority of accounts we audit that have been set up without a specialist.

---

## Starting right versus cleaning up later

The case for getting tracking right at the start is straightforward. Cleaning up tracking in an account that has been running with bad data is harder than setting it up correctly from the beginning — because you now also need to explain to a machine learning system that the historical data it learned from was wrong.

The campaigns that consistently perform best, in our experience, are the ones built on a foundation of reliable data. Everything else — bidding, targeting, messaging — can be optimised over time. But you can only optimise what you can measure accurately.

---

*If you are not certain whether your conversion tracking is working correctly, [book a free call](/contact). We will run through your setup and tell you what we find.*

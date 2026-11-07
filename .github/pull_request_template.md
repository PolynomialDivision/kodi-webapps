<!--
Title: [<kind>] <subject>, or [<kind>] [agent] <subject> when an agent
opens the pull request; at most 80 characters, no full stop.

  <kind>     new, module, fix, adblock, ux, meta, repo or docs; the first
             of these that applies (AGENTS.md, "Pull requests").
  <subject>  "<add-on id>: <what it does>" when one add-on changes,
             a plain imperative sentence otherwise.

  [new] Add the BBC iPlayer web app
  [adblock] webapp.orfon: block adverts and trackers
  [fix] webapp.la7: keep the picture after a seek in a replay
  [module] webapp.module.hbbtv: return to Kodi when an HbbTV app exits
  [adblock] [agent] webapp.orfon: skip the preroll before programmes

Fill in every section. Write "none" or "not tested" rather than deleting
one. Delete these comments.
-->

## What changes

<!-- In plain words, what a viewer notices after this change, and why it was needed. -->

## Facts

- Add-ons: <!-- webapp.<id>, or "none" -->
- Service: <!-- the service's name -->
- Plays in: <!-- ISO 3166-1 alpha-2 codes of the countries where the service serves the app or its catalogue (AT, GB, IT), or "worldwide"; say which part is restricted if only some content is -->
- Account: <!-- none, free account, or subscription -->
- Tested from: <!-- ISO 3166-1 alpha-2 code of the country of the connection used for testing -->
- Device: <!-- hardware and operating system, e.g. Raspberry Pi 5, OpenWrt 25.12 -->
- Kodi: <!-- the web app branch (xbmc/xbmc#30315) and its commit -->
- kodi-webkit: <!-- commit or package version, and the WPE WebKit version -->
- Opened by: <!-- "person", or "agent <name> for @<GitHub account of the person>" -->
- Agent: <!-- "none", or which agent took part and what it did: wrote the scripts, traced the network, wrote this description -->

## What was found

<!-- For new and fix: the TV edition used and why (HbbTV, hosted TV app, desktop site), the user agent, the viewport, the player path (MSE or native), what else was tried and failed. For adblock: how the adverts are requested or configured, and which adverts remain and why. Reference the commit messages instead of repeating them where they say it already. -->

## Tested by the submitter

<!-- Tick what was tested on a real device and worked, and add "seen" when a person saw it on the screen or "measured" when an agent measured it there (video playing and its time advancing, no MediaError, no advert requests in the network trace). For an item that was not tested or does not apply, leave it unticked and say why on the same line. -->

- [ ] The app starts from Kodi and the start page loads
- [ ] The layout fits the screen; resolutions tried:
- [ ] Every screen reached with the arrows, OK and BACK; text entered
- [ ] On-demand playback, with picture and sound
- [ ] Live playback, with picture and sound
- [ ] Leaving the app returns to Kodi, from the app's exit and with BACK
- [ ] Adverts: what showed before the change, and what shows after it
- [ ] The app still works after a Kodi restart

## How others can test

<!-- What a tester needs: the country of their connection, an account, a device that decodes the codecs in hardware. Then numbered steps from installing the build (AGENTS.md, "Testing a change") to the result to expect, naming a programme or channel where it matters. -->

1.

## Not tested, known limits

<!-- What remains: adverts inserted into the stream on the server, content a CDM refuses, regions not tried, resolutions not tried. -->

## Checklist

- [ ] One kind of change; anything else is in a pull request of its own
- [ ] The version of every changed add-on is raised, in the commit that changes it
- [ ] A new add-on is listed in `README.md`
- [ ] No logos, artwork, fonts, page code, media or filter lists of a service, no binaries, no build output
- [ ] Nothing circumvents DRM, account or subscription checks, regional restrictions or another trust mechanism
- [ ] Every commit is signed off (`git commit -s`)

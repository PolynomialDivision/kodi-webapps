# AGENTS.md

Guidance for coding agents, and for the people directing them, who port
a streaming service or another web page to a Kodi web app, debug one, or
contribute to this repository. Read it completely before starting; the
boundaries in the first section are not negotiable.

## Purpose and boundaries

This repository makes the TV editions that broadcasters and streaming
services already publish usable inside Kodi. A web app add-on names a
start URL, the identity the page is served to, user scripts that adapt
the page to a remote control and to Kodi, and content filters. The
pages run unmodified on the services' own servers; the add-ons only
change how the page is presented and what it may load.

Welcome:

- Adapting a TV edition to the remote control, the screen size and
  Kodi: key codes, focus handling, scaling, leaving the app.
- Providing the terminal APIs a TV edition expects and the web engine
  lacks, such as the HbbTV objects described below.
- Choosing a user agent under which the service serves its TV edition,
  naming Kodi in it wherever the page tolerates that.
- Blocking advertisement and tracking, with filter lists or with user
  scripts that keep adverts from being requested or shown.
- Answering consent banners with the choice that sets the fewest
  optional cookies.

Not accepted:

- Anything that infringes a trademark or copyright. No logos, artwork,
  fonts, page code or media of a service are committed here; an add-on's
  icon is a URL of an image the service publishes itself. Code derived
  from other projects keeps their licence and notice, as `webapp.youtube`
  does for VacuumTube. Add-on names state plainly which service they
  open; nothing may suggest that a service publishes or endorses an
  add-on.
- Redistributing a service's content or its filter lists. Shared lists
  are fetched by Kodi from their maintainers.

Circumventing content protection or any trust mechanism publishers rely
on ends the contribution and bans the contributor at once. That covers,
without being limited to: DRM, EME and CDM behaviour, key or licence
handling, device certificates, keyboxes, attestation and integrity
checks, account, subscription and paywall checks, and server-side
session or token validation. A refusal of the CDM, of a licence server
or of a service is a limit to accept and state, not a puzzle to solve.
Presenting a TV user agent so that a service serves its TV edition is
fine; forging anything that makes a service grant rights or keys it
would otherwise refuse is not.

## How a web app runs

Three parts work together:

- Kodi with web app support: the `kodi.webapp` add-on type, a web player,
  a Wayland host and the `kodi_web_v1` protocol, over which Kodi drives
  an external web client.
- kodi-webkit: `kodi-webview`, a WPE WebKit client with GStreamer media
  playback. It plays a page's audio through Kodi's audio engine
  (`kodiaudiosink`) and, on GBM with atomic DRM, hands the decoded video
  frames to Kodi (`kodivideosink`), which shows them on a display plane
  underneath the page.
- This repository: one directory per add-on.

Kodi's web app support is not part of a Kodi release yet. Its current
working draft is the pull request xbmc/xbmc#30315: it defines the
`kodi.webapp` add-on type, the manifest described below and the
`kodi_web_v1` protocol. Every add-on in this repository has to work
with that draft. Read it before relying on a detail of the manifest or
of the client's behaviour, and follow its changes: where it and this
file disagree, the draft is right and this file needs correcting.

### The manifest

`<extension point="kodi.webapp">` in `addon.xml` takes:

- `starturl="..."`, the URL opened when the app starts. `<starturl id="x">`
  elements offer alternatives, chosen by the add-on setting `starturl`
  (needs `kodi.webapp` 1.1.0 or later).
- `<useragent>`, or several `<useragent id="x">` chosen by the setting
  `identity`; the identity `custom` takes the setting `useragent`.
  kodi-webview refuses a user agent that breaks the HTTP header grammar
  WebKit validates against, so a remark such as Kodi's name belongs in a
  parenthesised comment.
- `<userscript>`, a path in the add-on. Scripts are injected at document
  start into every frame, in the order the manifest lists them, in the
  page's own JavaScript world and outside the page's Content Security
  Policy.
- `<contentfilter>`, a path to a filter file in Adblock Plus syntax, or
  `<contentfilter list="name"/>`, a reference to a shared list.

Each add-on has a profile of its own, named by the add-on id: cookies,
storage and logins persist across restarts and never mix with other web
apps. The page's media state (video, audio, paused) drives Kodi's
screensaver and display power rules. `window.close()` in the top
document asks Kodi to leave the app.

### common/

`tools/build-repo.py` adds every file of `common/` to each web app that
has no file of that name, with `@ADDON_ID@` replaced in XML and PO files.
It provides the uplink setting (strings 30020 to 30023) and the HbbTV
scripts. An add-on with a `resources/settings.xml` of its own replaces
the common one and must carry the uplink category itself, as
`webapp.arte` and `webapp.youtube` do. Keep add-on strings in 30000 to
30019 and above 30023.

### Video on a display plane

Where Kodi shows a page's video on a plane underneath the page, the page
must be transparent wherever the video shows. WebKit punches a
transparent hole where the video element is and tells Kodi where it is,
but anything a page or a user script paints above that hole, including
an opaque background on the root element, covers the video: the sound
plays and the screen stays dark. HbbTV editions leave everything they do
not paint transparent by design. Never give a page an opaque background
from a user script. Kodi's screenshots do not include display planes, so
a screenshot shows black where the video plays; judge the screen itself.

## Finding a TV edition

In order of preference:

1. HbbTV applications of broadcasters, the red-button apps of their
   channels. They are designed for a remote control and for a TV screen.
2. Hosted big-screen apps that services serve to smart TV platforms or
   set-top boxes, often on host names that name the platform.
3. TV apps that a service serves to its own TV client identity, such as
   the YouTube TV app.
4. The desktop site, as a last resort, with user scripts for navigation.

Where to look:

- Community lists of HbbTV application URLs, kept by projects that
  implement HbbTV on PCs and receivers.
- Certificate Transparency logs, searched for host names of a service's
  TV editions.
- The application information table (AIT) a channel broadcasts names the
  URL its red button opens.
- The developer documentation of TV platforms describes their user agents
  and key codes.

Check a candidate before building an add-on: fetch it with an HbbTV and a
TV platform user agent and read what comes back. HbbTV pages are often
XHTML with OIPF objects. Note the layout size (many HbbTV editions lay
themselves out for 1280x720, others for the full HD screen), whether the
page or its API calls use plain HTTP (an HTTPS start URL then fails on
mixed content), and whether the service refuses the region it is tested
from. Many broadcasters restrict playback, or the whole app, to their
country; a refusal from abroad does not make a URL dead, and an
add-on's description should say where the catalogue plays. Record what
was found and tried in the commit message: the next port starts from it.

Some services have no usable web edition: apps installed from a vendor
store only, apps that need a client certificate, or native apps. Leave
them.

## Creating an add-on

1. Name the directory and the add-on id `webapp.<service>`.
2. Write `addon.xml` after an existing add-on of the same kind: the
   `kodi.webapp` extension, the `xbmc.addon.metadata` with a factual
   summary and description, `<platform>all</platform>`, the licence, and
   an icon URL of an image the service publishes, legible on Kodi's dark
   background.
3. Pick the identity. HbbTV editions take an HbbTV user agent that names
   Kodi as the terminal, as the existing HbbTV add-ons do; hosted TV apps
   take the user agent of the platform they are served to.
4. Add `profile/scripts/00-hbbtv-scale.js` only for editions laid out for
   1280x720, and `profile/scripts/00-hbbtv.js` for every HbbTV edition.
   Look at the screen: a full-HD layout is oversized with the scaling
   script.
5. Add user scripts and filters as the following sections describe.
6. Add the add-on to the table in `README.md`.
7. Raise the version of an add-on with every change to it, in the same
   commit. Kodi updates an add-on only when its version rises; the
   repository build keeps earlier versions available for Kodis that
   still hold an older index.

Never rename a published add-on id.

## Developing with the WebKit inspector

WPE WebKit serves its remote inspector when the environment variable
`WEBKIT_INSPECTOR_HTTP_SERVER=<address>:<port>` is set. Add it to the
environment Kodi starts with, so that `kodi-webview` and its web
processes inherit it, and restart Kodi. Bind it to the loopback address
and reach it through an SSH tunnel; the inspector executes arbitrary
code in every page and in every logged-in profile, so never leave it
reachable from a network, and remove it when the work is done.

Opening the address in a desktop browser lists the inspectable pages
with the inspector's own frontend. For scripted work, each page is a
WebSocket at `/socket/<connection>/<page>/WebPage`; the listing page
names them. It speaks the WebKit Inspector Protocol: wait for
`Target.targetCreated`, then wrap every command in
`Target.sendMessageToTarget` for that target and read the replies from
`Target.dispatchMessageFromTarget`. Useful domains:

- `Runtime.evaluate` with `returnByValue` and `awaitPromise`, to read the
  page's state and to try code against the live page.
- `Network`, enabled with `Network.enable`, which reports every request,
  its response and its failure: the tool for finding a player's
  manifest, an API, or what an advert loads.
- `Console`, for the page's own errors.
- `DOM` and `LayerTree`, for layout and compositing questions.

A user script is best developed in that order:

1. Explore the live page: which element has focus
   (`document.activeElement`), which key codes and key names a handler
   expects, which global objects, configuration and API responses the
   app reads.
2. Try the change by evaluating it in the page.
3. Turn it into a script that works from document start, before the
   page's own code runs: property accessors on the objects the app
   configures itself from, wrappers around `fetch`, `XMLHttpRequest` or
   `JSON.parse`, event listeners in the capture phase.
4. Reload and test with real remote input. Events dispatched from
   JavaScript are untrusted (`isTrusted` is false), pages and the common
   HbbTV script treat them differently, and focus behaves differently, so
   a test with synthetic events proves little.

To drive the device: Kodi's JSON-RPC starts an add-on
(`Addons.ExecuteAddon`) and takes screenshots
(`Input.ExecuteAction` with `screenshot`); a uinput device delivers
real key presses that Kodi treats as a remote. Give a page time to
finish loading before sending keys; a key sent during start-up is lost.
Avoid JSON-RPC requests that make Kodi fetch every add-on's artwork:
they block the JSON-RPC server for minutes.

Logs: Kodi's log names the web player's and the client manager's
decisions; `kodi-webview` and the web engine write to the standard error
they inherit from Kodi, which lands wherever the system collects Kodi's
output, on OpenWrt the system log. Start capturing before
reproducing a fault: system log buffers on small devices are short, and
a conclusion drawn from a log missing its first lines is usually wrong.
GStreamer's debug output may be compiled out on the target.

## Adapting TV editions

### Keys

Kodi's keymap for the web window keeps a few keys for Kodi; the others
reach the page. The remote's BACK arrives in WPE as the key
`BrowserBack`, key code 166, which few TV editions understand. HbbTV
applications compare key codes against the values HbbTV receivers send
(BACK 461, the colour keys 403 to 406, the media keys) or read them from
`KeyEvent.VK_*`. `common/profile/scripts/00-hbbtv.js` maps the WPE codes
to the receiver values for trusted events and defines `KeyEvent.VK_*`.
Hosted TV apps expect the codes of their platform. Netflix and other
desktop sites need focus management written for them, as
`webapp.netflix` has.

### The HbbTV terminal

The web view is no HbbTV terminal. `00-hbbtv.js` provides what the TV
editions rely on:

- The OIPF A/V Control object (an `<object>` with a media type): its
  play, stop, seek, position, volume and state events, played by a
  `<video>` element placed next to the object, as WebKit renders no
  fallback content.
- The video/broadcast object, with no broadcast behind it.
- The application manager, whose `destroyApplication()` closes the
  window, which returns to Kodi.

Many HbbTV editions start as a red-button banner that waits for a
broadcast or a key, and return to it when they exit. Start them in the
mode an HbbTV portal uses, where the edition destroys itself on exit, if
it offers one; otherwise a user script can dismiss the banner.

Many editions choose their video player by platform: an OIPF object for
receivers, an HTML5 or MSE player for others. Prefer the HTML5 or MSE
path, through the edition's own switch where it has one or through the
identity it takes that path for, over the emulated OIPF object.

Some editions store a language or other choices in a cookie or in local
storage and prefer that over the URL; set both where the add-on offers
a choice.

## Media

### Adaptive streams

- Media Source Extensions players (Shaka, dash.js, hls.js and players
  built on them) are the path that works best.
- A manifest handed straight to a `<video>` element goes to GStreamer's
  demuxers. WebKit uses the legacy DASH demuxer there; native HLS is
  enabled only where the client asks for it, and kodi-webview enables
  DASH only. When an app hands a manifest to `<video>` and fails with
  `MEDIA_ERR_SRC_NOT_SUPPORTED`, make it take its MSE path.
- Live DASH depends on the device clock. A clock several seconds wrong
  makes the player request segments that do not exist yet; check time
  synchronisation before blaming the stream.

`MediaError` codes: 1 aborted, 2 network, 3 decode, 4 source not
supported (no demuxer or decoder for it, or the source was refused).

### Decoders

kodi-webview ranks hardware decoders above software decoders, so a page
that offers several codecs gets one the device decodes in hardware, and
software decoders remain available for the rest. Kodi's setting
"Software video decoding in web pages" leaves the ranking to the engine
instead. A service that offers only a codec the device decodes in
software plays at a reduced frame rate, or not at all at high
resolutions; that is a property of the device, not a fault of the
add-on.

### Encrypted media

kodi-webview uses the Widevine CDM that inputstream.adaptive installs.
On musl systems the CDM needs a compatibility library preloaded, which
the packaging handles. A CDM may refuse decryption for some streams or
in some modes; such a refusal ends the investigation. See the first
section.

### Debugging playback

1. Trace the network: find the manifest and the first segments, and
   their status codes.
2. Read the page's console and the `MediaError`.
3. Check the player path the app took (MSE or native).
4. Check codecs against what the device decodes in hardware.
5. Check the clock for live streams.
6. Reproduce outside the app with the manifest alone before suspecting
   the engine.

## Advertisement and tracking

Prefer, in this order:

1. The shared lists. `<contentfilter list="easylist"/>` and
   `<contentfilter list="easyprivacy"/>` opt an add-on into the lists
   Kodi fetches from their maintainers, keeps current by their expiry
   and hands to the client, which compiles each list once and keeps the
   result. A Kodi without the list opens the app unfiltered.
2. A filter file of the add-on, in Adblock Plus syntax, for advert and
   tracking requests the shared lists miss. The converter takes a subset
   of the syntax: no regular expressions, and WebKit's content blocker
   accepts no alternatives inside a rule, so write one rule per host or
   path. Read kodi-webkit's converter for the options it supports.
3. A user script, for adverts that no request filter can separate from
   the content: adverts configured by the page's own data, ad slots in
   API responses, players that wait for an advert before the content.
   Hook the configuration or the response at document start and remove
   the advert from it, as `webapp.youtube` and `webapp.la7` do.

To find what to block, play the app with the inspector's network trace
running and compare what loads around an advert break with what loads
for the content: ad decisioning requests, VAST or VMAP documents, ad SDK
scripts, configuration objects naming advert counts or positions.
Adverts inserted into the stream on the server cannot be removed by any
of these means; leave them.

Write blocking so that it fails open: a hook that no longer matches must
leave the app working, with adverts, rather than break playback. Do not
quote host names, paths or configuration keys in documentation; they
change constantly. A commit message may record what was observed when
the change was made.

## Porting checklist

1. The start URL loads under the chosen identity: no TLS error, no mixed
   content, no refusal of the user agent.
2. The layout fits the screen at every resolution Kodi runs at.
3. Every screen is reachable with the arrows, OK and BACK, and text can
   be entered. Most TV editions bring an on-screen keyboard of their
   own; that is how they are meant to be used, and a user script must
   neither replace nor suppress it. Kodi's keyboard is the fallback for
   pages with plain text fields, typically desktop sites: it opens when
   such a field takes the focus.
4. Playback starts for on-demand and live content, in hardware where the
   device can, with the video visible on the screen.
5. Leaving the app returns to Kodi, from the app's own exit and with BACK
   from its first screen.
6. Adverts and trackers are blocked.
7. The page still works after a Kodi restart, with the profile kept.

Find the cause of a fault before changing anything. Almost every fault
met while porting is in the add-on, in a user script, or in a wrong
assumption about the page; when an attempt does not work, suspect the
attempt first. A fault of the web engine belongs to WebKit or
kodi-webkit, and a fault of Kodi to Kodi, but only once it is proven:
see the next section. A user script may work around a proven fault
only as a stated workaround, named as such in the commit message.

## Contributing to this repository

- Work on a fork and open a pull request against the `main` branch on
  GitHub. Merges to `main` publish the Kodi repository automatically.
- One logical change per commit. The subject is `webapp.<id>: <what it
  does>` for a change to one add-on and a plain imperative sentence
  otherwise. The body says what was wrong or missing, what the change
  does and why, and records what was found about the service. Sign off
  every commit (`git commit -s`).
- Raise the add-on's version in the commit that changes it.
- Commit no binary files and no build output.
- New code is under the GPL-2.0-or-later unless it derives from code
  under another licence, whose terms and notices it then keeps.
- Test on a real Kodi with kodi-webkit before opening the pull request,
  and say in the pull request what was tested, on which device, and what
  was not.
- Say in the pull request that an agent took part and how, and follow
  any rule the repository adds about that.

## Upstream projects

Faults and features often belong elsewhere: Kodi, kodi-webkit, WebKit,
GStreamer, OpenWrt or the packages that build them. Read each project's
contribution guidelines before preparing anything for it, and follow
them exactly: Kodi's contributing guide and code guidelines, WebKit's
contributing documentation, GStreamer's merge request rules, OpenWrt's
guide to submitting patches. Several of these projects require that
prose meant for people, bug reports, pull request and merge request
descriptions, commit messages, review comments and mails, is written by
a person without assistance.

An agent therefore never addresses an upstream project itself. It files
no bug report, opens no pull request or merge request, posts no
comment, sends no mail and starts no conversation there, unless that
project explicitly invites agents to do so. At present none of these
projects does. Upstream is always addressed through the person running
the agent, who has to understand the problem completely and describe it
in their own words, and who writes the report, the description or the
message themselves. An agent may prepare what supports it: a minimal
reproducer, test pages, code, logs, measurements, statistics and test
results, each clearly marked as prepared by an agent.

Before an agent even suggests that a fault is upstream, it has to be
certain. "It must be a bug in the engine" is the most common wrong
conclusion of an agent whose own change does not work, and upstream
maintainers' time is not to be spent on reports of non-problems. The
suggestion needs all of these:

- A minimal test case of the agent's own that reproduces the fault
  without the add-on, its user scripts and the service's page.
- The specification or the project's documentation that the behaviour
  contradicts, cited; behaviour the agent did not expect is not a fault
  by that alone.
- The code responsible, found in the upstream source, and an
  understanding of why it behaves as it does.
- A search of the project's existing reports and of its current
  development version; the fault may be known or fixed.

Without all of these, there is no upstream fault, only a problem still
to be understood here.

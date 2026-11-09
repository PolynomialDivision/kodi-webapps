# AGENTS.md

Guidance for coding agents, and for the people directing them, who port
a streaming service or another web page to a Kodi web app, debug one, or
contribute to this repository. Read it completely before starting; the
boundaries in the first section are not negotiable.

Requests often come from people who know the service and not this
repository: "block the ads I see in ORF ON", "make an ad-free add-on
for BBC iPlayer". "From a request to a pull request" turns such a
request into a change; "Pull requests" says how it is submitted.

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
- Making consent banners usable with the remote and fair to the
  viewer: the banner is shown, refusing everything optional is the
  default and one press of OK, and accepting stays possible, as
  "Consent banners" describes.

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
- Saving, downloading or recording a service's media. The add-ons
  present a page; they take nothing out of it.
- Answering a declaration that is the viewer's to make, such as an age
  check, a TV licence confirmation or terms of use.
- Answering a consent banner for the viewer, with any choice, or
  hiding it: consent and its refusal are the viewer's to give, so no
  script, cookie, stored value, URL parameter or filter makes the
  choice or keeps the banner from being shown.

Circumventing content protection or any trust mechanism publishers rely
on ends the contribution and bans the contributor at once. That covers,
without being limited to: DRM, EME and CDM behaviour, key or licence
handling, device certificates, keyboxes, attestation and integrity
checks, account, subscription and paywall checks, regional
restrictions (by proxy, forged headers or a forged location), and
server-side session or token validation. A refusal of the CDM, of a
licence server or of a service is a limit to accept and state, not a
puzzle to solve. Presenting a TV user agent so that a service serves
its TV edition is fine; forging anything that makes a service grant
rights or keys it would otherwise refuse is not.

## From a request to a pull request

This repository accepts pull requests that agents open on a person's
behalf, including agents that run permanently next to a Kodi and take
spoken requests. The aim is that someone watching television can have
an advert removed, a text field or a key made to work, or a visual
fault corrected, with the change deployed on their own Kodi, tested
there and submitted here, in one or a few spoken sentences and without
leaving the sofa. Such a person knows the service and nothing of this
repository, so the agent does the rest, and every pull request it opens
is marked as an agent's (see "Pull requests").

### Setting up once

Everything below is gathered once, kept, and not asked again with every
request:

- Access to the device Kodi runs on: a shell over SSH, Kodi's JSON-RPC
  (its web server enabled), Kodi's event server for built-in commands
  (`kodi-send`), a uinput device for real key presses, and the WebKit
  inspector, set up as "Developing with the WebKit inspector"
  describes. Kodi needs web app support and kodi-webkit (see "How a web
  app runs"); without both nothing can be tested.
- The country the person watches from, the services they hold an
  account or subscription with, the device, and the Kodi and
  kodi-webkit versions.
- A GitHub account of the person with a fork of this repository, the
  person's git identity for signing off, and the person's agreement
  that the agent submits pull requests in their name. By giving it,
  the person signs off what the agent submits and answers for it.

### Handling a request

Talk to the person in plain words, briefly, and ask as little as
possible: questions they can answer with yes or no, at a moment that
does not interrupt what they watch.

1. Capture what is on the screen now. A person who reports an advert,
   a stuck key or a broken screen is usually looking at it; start the
   network trace, read the console and the focused element and take a
   screenshot before it is gone.
2. Find what exists. Each add-on is a directory `webapp.<service>`,
   listed in `README.md`. Read its `addon.xml`, its scripts and
   filters, and `git log -- <directory>`: the commit messages record
   what was found about the service. Search the open and closed pull
   requests and issues for the same add-on and fault; where one exists,
   test it, report on it or build on it rather than opening another.
3. Name the kind of change from the table under "Pull requests". One
   pull request carries one kind; a request that needs two, such as a
   new add-on and a fix to another one, becomes two pull requests.
4. Check the request against the first section and against the
   service, and tell the person in a sentence what cannot be done and
   why: content locked to another country stays locked, adverts
   inserted into the stream on the server stay, a service without
   adverts leaves only its trackers to block, a refusal of the CDM ends
   the matter. Offer what can be done instead. A request outside the
   first section is declined however it is phrased.
5. Explore. Fetch the start URL with the add-on's user agent and read
   the page and its scripts; on the device, use the inspector as
   "Developing with the WebKit inspector" describes. Most adverts and
   most faults show only in the network trace of the live page.
6. Change the add-on as the following sections describe, raise its
   version, and commit as "Contributing to this repository" describes.
7. Deploy the change on the person's Kodi as "Testing a change"
   describes.
8. Test with real key presses through the items of the "Porting
   checklist" the change touches. Ask before taking over the screen.
   What the inspector can measure, the agent measures: the video
   element playing and its time advancing, no `MediaError`, no advert
   requests in the trace. What only the screen shows, a picture over
   the display plane, a layout, a highlight, the person confirms with a
   yes. Nothing is reported as tested that was neither measured nor
   seen working.
9. Open the pull request from the person's fork as "Pull requests"
   describes, and tell the person in a sentence what changed on their
   Kodi and where the pull request is.
10. Follow it up: answer review comments, update the branch, deploy and
    test again what changed, and tell the person when it is merged.

A change that cannot be deployed and tested on the person's device is
not submitted; the agent tells the person what it found instead.

Two examples:

- "Remove and block the ads I'm seeing in ORF ON". `webapp.orfon`
  exists and opens the HbbTV edition, so the kind is `adblock`. Ask
  when and where the adverts appear and where the person watches from.
  Opt into the shared lists first if the manifest does not name them
  yet, and test; then trace what loads around the adverts that remain
  and block them with a filter file or a user script, as
  "Advertisement and tracking" describes. Title:
  `[adblock] webapp.orfon: block adverts and trackers`.
- "Create an ad-free web add-on for BBC iPlayer". No add-on exists, so
  the kind is `new` and the id `webapp.bbciplayer`. First check what
  the service sets and tell the person: at the time of writing iPlayer
  plays only in the United Kingdom, asks viewers to sign in and to
  confirm that they hold a TV licence, and shows no adverts there. The
  person and every tester then need a UK connection and a BBC account,
  the confirmation stays the viewer's, and "ad-free" comes down to
  blocking trackers. Then find a TV edition and build the add-on as the
  next sections describe. Title: `[new] Add the BBC iPlayer web app`.

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
- `<userscript>`, a path in the add-on, or with `addon="<module id>"`
  a path in a web app module the app imports (needs `kodi.webapp` 1.3.0
  or later). Scripts are injected at document start into every frame,
  in the order the manifest lists them, in the page's own JavaScript
  world and outside the page's Content Security Policy.
- `<contentfilter>`, a path to a filter file in Adblock Plus syntax, in
  the add-on or with `addon=` in a module, or
  `<contentfilter list="name"/>`, a reference to a shared list.
- `<viewport width="1920" height="1080"/>`, the CSS viewport the pages
  are written for. A television's browser keeps that size whatever the
  panel's resolution; Kodi zooms the page so that the viewport fits the
  screen, keeping its aspect ratio (needs `kodi.webapp` 1.2.0 or later;
  an older Kodi lays the page out at the screen's size). Desktop and
  responsive sites take none.
- `<redbutton on="..." off="..."/>`, for an HbbTV edition whose start
  URL chooses whether the red button hides it: the query parameter
  that makes red hide the edition and the one that keeps red inside
  it. Kodi appends the one the setting `redbuttonhides` chooses to the
  start URL; a state without an attribute appends nothing (needs
  `kodi.webapp` 1.4.0 or later).
- `<encryptedmedia optional="true"/>`, for an app whose service serves
  most of its video in the clear and protects some of it only where
  the browser offers encrypted media; the viewer allows it with the
  setting `encryptedmedia`, as "Encrypted media" describes (needs
  `kodi.webapp` 1.4.0 or later).

Each add-on has a profile of its own, named by the add-on id: cookies,
storage and logins persist across restarts and never mix with other web
apps. The page's media state (video, audio, paused) drives Kodi's
screensaver and display power rules. `window.close()` in the top
document asks Kodi to leave the app. Leaving an app, that way or by
starting another one, closes its view: nothing of the page keeps
running, and the next start loads the start URL afresh. Session
cookies outlive the view and last until Kodi exits, by design, so that
returning to an app while Kodi runs finds its session as the viewer
left it; a page that tells a new session from a returning one by a
session cookie sees a new session only after Kodi restarts.

### Web app modules

User scripts and filter files that several web apps share live in web
app modules, add-ons with the id `webapp.module.<name>` and the
extension point `kodi.webapp.module`, which takes no elements: a module
is only files. `webapp.module.hbbtv` is the HbbTV terminal described
under "The HbbTV terminal"; `webapp.module.consent` holds the scripts
for consent platforms several services use, described under "Consent
banners". A web app imports the module in
`<requires>`, so that Kodi installs it along with the app, and names
each file it uses with `addon=`, as the HbbTV editions do:

```xml
<import addon="webapp.module.hbbtv" version="1.0.0"/>
...
<userscript addon="webapp.module.hbbtv">profile/scripts/hbbtv.js</userscript>
```

Kodi accepts `addon=` only for a module the app imports directly, and
hands a module's file to the web view under the name
`<module id>.<file name>`, so the file names within a module are
unique, whatever directory they are in. The app's manifest orders its
own and its modules' scripts. A module change raises the module's
version, and Kodi updates the module on its own; an app raises its
import of the module, and its own version, only when it needs what a
newer module version provides.

### Settings

Kodi gives web apps the settings that Kodi itself reads, in categories
of their own after the app's:

- `uplinkaddress`, category `network`: the uplink that the app's
  connections leave through. Every app, from `kodi.webapp` 1.3.0 on.
- `softwarevideodecoding`, category `video`, off by default: whether
  the app may play video that only a software decoder decodes. Every
  app, from `kodi.webapp` 1.3.0 on.
- `encryptedmedia`, category `video`, off by default: whether the app
  may play DRM-protected video. Apps whose manifest has
  `<encryptedmedia optional="true"/>`, from `kodi.webapp` 1.4.0 on.
- `redbuttonhides`, category `hbbtv`, off by default: whether the red
  button hides the app. Apps whose manifest has `<redbutton>`, from
  `kodi.webapp` 1.4.0 on.

An add-on does not define them. Its own settings, such as the
start URLs and identities it offers, go into
`resources/settings.xml`, labelled by strings from 30000 upwards in
`resources/language/resource.language.en_gb/strings.po`, as
`webapp.arte` and `webapp.youtube` do. An add-on without settings of
its own has neither file.

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

1. Name the directory and the add-on id `webapp.<service>`, where
   `<service>` is the service's name in lower-case ASCII letters and
   digits without separators: `webapp.ardmediathek`, `webapp.m6plus`.
2. Write `addon.xml` after an existing add-on of the same kind: the
   `kodi.webapp` extension, the `xbmc.addon.metadata` with a factual
   summary and description, `<platform>all</platform>`, the licence, and
   an icon URL of an image the service publishes, legible on Kodi's dark
   background. Start at version 1.0.0. `<requires>` imports
   `kodi.webapp` 1.3.0, or a later version where the app cannot work
   without a manifest element it provides, the modules the app uses,
   and InputStream Helper where "Encrypted media" asks for it.
3. Pick the identity. HbbTV editions take an HbbTV user agent that names
   Kodi as the terminal, as the existing HbbTV add-ons do; hosted TV apps
   take the user agent of the platform they are served to.
4. Declare the viewport the edition lays itself out for with
   `<viewport>`: 1280x720 or 1920x1080 for HbbTV editions, 1920x1080 for
   hosted TV apps. Every HbbTV edition imports `webapp.module.hbbtv`
   and takes its `profile/scripts/hbbtv.js`; those laid out for
   1280x720 take `profile/scripts/hbbtv-scale.js` before it, which
   centres the page on screens of another aspect ratio.
   Look at the screen: a full-HD layout is oversized with the scaling
   script or a 1280x720 viewport.
5. Add user scripts and filters as the following sections describe.
   User scripts live in `profile/scripts/`, filter files in
   `profile/filters/`. A script's name starts with two digits that
   follow the order the manifest injects it in. A script starts with an
   SPDX licence line and a comment saying what the page does and why
   the script answers it that way, and keeps its names inside a
   function, as the scripts of `webapp.la7` do.
6. Add the add-on to the table in `README.md`.
7. Raise the version of an add-on with every change to it, in the same
   commit. Kodi updates an add-on only when its version rises; the
   repository build keeps earlier versions available for Kodis that
   still hold an older index. The second number rises when the app
   gains behaviour of its own (adverts blocked, a start mode, a player
   path), the third for fixes and for a raised import. A module starts
   at 1.0.0 and follows the same scheme.

Never rename a published add-on id.

## Developing with the WebKit inspector

WPE WebKit serves its remote inspector when the environment variable
`WEBKIT_INSPECTOR_HTTP_SERVER=<address>:<port>` is set. Add it to the
environment Kodi starts with, so that `kodi-webview` and its web
processes inherit it, and restart Kodi. Bind it to the loopback address
and reach it through an SSH tunnel; the inspector executes arbitrary
code in every page and in every logged-in profile, so never leave it
reachable from a network. An agent that stays with the device may keep
it enabled on the loopback address; otherwise remove it when the work
is done.

Opening the address in a desktop browser lists the inspectable pages
with the inspector's own frontend. For scripted work, each page is a
WebSocket at `/socket/<connection>/<page>/WebPage`; the listing page
names them. It speaks the WebKit Inspector Protocol: wait for
`Target.targetCreated`, then wrap every command in
`Target.sendMessageToTarget` for that target and read the replies from
`Target.dispatchMessageFromTarget`.

A page takes one inspector client at a time. A second connection to
the same page receives no `Target.targetCreated` and cuts the first
one off, so a network trace and the commands that read the page during
it go over one connection; a tool that traces while another evaluates
loses both. Useful domains:

- `Runtime.evaluate` with `returnByValue`, to read the page's state and
  to try code against the live page. It ignores `awaitPromise` and
  returns a promise unresolved: store the result in a global from the
  promise's handler and read that with a later evaluation.
- `Network`, enabled with `Network.enable`, which reports every request,
  its response and its failure: the tool for finding a player's
  manifest, an API, or what an advert loads. A request that a content
  filter blocks is not reported at all.
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
   JavaScript are untrusted (`isTrusted` is false), pages and the HbbTV
   module's script treat them differently, and focus behaves differently, so
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
`KeyEvent.VK_*`. `hbbtv.js` of `webapp.module.hbbtv` maps the WPE codes
to the receiver values for trusted events and defines `KeyEvent.VK_*`.
Hosted TV apps expect the codes of their platform. Netflix and other
desktop sites need focus management written for them, as
`webapp.netflix` has.

### The HbbTV terminal

The web view is no HbbTV terminal. `webapp.module.hbbtv` provides what
the TV editions rely on:

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

On a television the red button hides an HbbTV edition so that the
broadcast behind it shows. Kodi shows no broadcast behind a web app,
so an edition hidden that way leaves an empty screen. The viewer
chooses with the setting `redbuttonhides`, off by default: where the
start URL decides what red does, the manifest names the query
parameter for each state with `<redbutton>`; an edition that ignores
red takes none. With the setting on, red hides the edition only on the
screens where the edition itself offers that. A URL handed to Kodi's
`RunAddon` is opened as given,
so that a launcher for a broadcast channel's red button chooses for
itself.

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

A web app is offered only the video codecs the device decodes in
hardware: `MediaSource.isTypeSupported()` and `canPlayType()` report no
other, so a page that offers several codecs picks one of those. The
app's setting "Allow software decoding" (`softwarevideodecoding`, see
"Settings") offers it the codecs of the software decoders as well.
Encrypted Media Extensions are not limited this way: a DRM module that
decodes video itself keeps every codec it handles. Where a codec has
both kinds of decoder, kodi-webview ranks the hardware decoders first;
Kodi's setting "Software video decoding in web pages" leaves that
ranking to the engine. A service that offers only a codec the device
decodes in software plays only with the app's setting on, and then at
a reduced frame rate, or not at all at high resolutions; that is a
property of the device, not a fault of the add-on.

### Encrypted media

Pages decrypt with the Widevine CDM in inputstream.adaptive's
decrypter path (its setting `DECRYPTERPATH`, `special://home/cdm` by
default), which InputStream Helper (`script.module.inputstreamhelper`)
installs there. A vendor that supplies its own CDM names it
`libwidevinecdm-vendor.so`, so that InputStream Helper leaves it be;
kodi-webview prefers that file to `libwidevinecdm.so`.

A web app that imports InputStream Helper gets it installed along with
the app. While no CDM is installed, Kodi runs the helper's check for
Widevine before it opens such an app, on every start: the viewer
installs the CDM, declines or leaves with BACK, and the app opens
either way. The client reads the CDM directory when it starts, so
before Kodi opens any web app it restarts the client if the CDM
installed is not the one the client started with.

Some services serve video that they would serve in the clear protected
instead wherever the browser offers encrypted media, and a CDM that
decodes video itself does so in software, too slowly on small devices
for what the hardware decoders play. Such an app declares
`<encryptedmedia optional="true"/>`, as `webapp.youtube` does, and the
viewer chooses with its setting `encryptedmedia`, off by default.
While the setting is off, Kodi hides the encrypted media API from the
app's pages and runs no check for Widevine before it opens the app;
video the service serves only protected then does not play. Apps
without the element have no such setting and keep encrypted media.

An app imports `script.module.inputstreamhelper`, without a version,
wherever there is evidence that some of its content may need Widevine:
a licence request in the inspector's network trace, the service's own
player configuration naming Widevine or a licence server, or the
service's API marking titles as protected. A table of key systems
inside a general-purpose player library is no such evidence. The
commit message names the evidence found.

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

Every add-on blocks trackers by default, whatever the viewer answers
to a consent banner: measurement, analytics, advertising identifiers
and the scripts that load them. A cookie, script or third-party
service stays only where the app needs it to let the viewer navigate
and play titles; where blocking it breaks either, it stays, and the
commit message says which and why. Every add-on opts into
EasyPrivacy, and adds a filter file for the trackers it leaves.

Prefer, in this order:

1. The shared lists. `<contentfilter list="easylist"/>` and
   `<contentfilter list="easyprivacy"/>` opt an add-on into the lists
   Kodi fetches from their maintainers, keeps current by their expiry
   and hands to the client, which compiles each list once and keeps the
   result. A Kodi without the list opens the app unfiltered.
2. A filter file of the add-on, in Adblock Plus syntax, for advert and
   tracking requests the shared lists miss. kodi-webkit's converter,
   `filter-convert.c`, takes a subset of the syntax: blocking rules
   such as `||host^` and path patterns with `*` and `^`, exceptions
   with `@@`, the options `third-party`, `first-party`, `domain=`,
   `match-case`, `important`, `badfilter`, `document`, `elemhide`,
   `generichide` and
   the resource types (`script`, `image`, `stylesheet`, `font`,
   `media`, `object`, `xmlhttprequest`, `subdocument`, `websocket`,
   `ping`, `other`, `popup`), and element hiding with `##` and `#@#`.
   It skips regular expressions, HTML filters, extended and procedural
   selectors and every other option, each skipped rule as a whole.
   WebKit's content blocker accepts no alternatives inside a rule, so
   write one rule per host or path.
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

## Consent banners

Many services ask for consent to optional cookies, tracking and advert
personalisation when an app first opens, in the EU above all. The
answer is the viewer's. An add-on never gives or refuses consent
itself and never keeps the banner from the screen: no cookie, stored
value or URL parameter that tells the service the question was
answered, no filter rule or element hiding that removes the banner or
blocks its scripts. Where a shared list blocks them, an exception
(`@@`) in the add-on's filter file lets them through.

What an add-on does is make the banner usable with the remote and take
its dark patterns apart:

- The banner opens with the focus on the button that refuses
  everything optional, "reject all" or "necessary cookies only", so
  that one press of OK refuses.
- Where refusing is offered only on a second layer, behind a link or a
  settings button, a user script adds a refusing button to the first
  layer that triggers the banner's own refusal, exactly as choosing it
  there by hand would. Purposes and "legitimate interest" switches
  that are on before the viewer touches them are turned off.
- Refusing looks at least as prominent as accepting; a refusal styled
  as a faint link gets the look of the accept button.
- Accepting, and every finer choice the banner offers, stays reachable
  with the arrows, OK and BACK. A banner in a frame of another origin
  is reached by a user script too, as Kodi injects scripts into every
  frame.

Such a script fails open: where it no longer finds the banner's
buttons, the banner stays as the service shows it.

Move the focus the way the banner itself does: TV banners keep their
own focus, in a class on the focused button, an index in their state
or a component of the page's framework, and react to keys by that,
not by the document's focus. Find that mechanism in the banner's code
and use it, as the scripts named below do. A banner may set its
focus again after it is drawn; hold it on the refusal until the
viewer's first key press, which is trusted (`isTrusted`), and from
then on leave it to the viewer. A banner offered again later, from the
app's settings, opens on the refusal too.

Banners of common consent platforms are handled by the scripts of
`webapp.module.consent`: `profile/scripts/didomi.js` for Didomi's
notice for TVs and `profile/scripts/onetrust.js` for OneTrust's
banners and preference centre, for TVs and for desktop sites. An app
whose banner comes from one of them imports the module and names the
script. A banner of the service's own gets a script in the app, as
`webapp.arte`, `webapp.francetv`, `webapp.la7`, `webapp.orfon`,
`webapp.primevideo` and `webapp.raiplay` have.

A banner shows only while the profile holds no answer, and many
services show it only to connections from the EU. Test from a country
where the service asks, with an empty profile: stop Kodi, remove the
app's profile, `userdata/webdata/kodi-webview/<id>/` in Kodi's data
directory, and start Kodi again. Some apps ask only on their second
start, once they have seen their cookies persist; that start needs a
Kodi restart too, as session cookies last until Kodi exits.

## Porting checklist

1. The start URL loads under the chosen identity: no TLS error, no mixed
   content, no refusal of the user agent.
2. The layout fits the screen at every resolution Kodi runs at, 4K
   included.
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
6. The red button of an HbbTV edition stays inside it with
   `redbuttonhides` off and hides it with the setting on, as "The HbbTV
   terminal" describes.
7. A consent banner, where the service shows one, appears, is usable
   with the remote, and refuses everything optional with one press of
   OK, as "Consent banners" describes.
8. Adverts and trackers are blocked, with navigation and playback
   still working.
9. The page still works after a Kodi restart, with the profile kept.

Find the cause of a fault before changing anything. Almost every fault
met while porting is in the add-on, in a user script, or in a wrong
assumption about the page; when an attempt does not work, suspect the
attempt first. A fault of the web engine belongs to WebKit or
kodi-webkit, and a fault of Kodi to Kodi, but only once it is proven:
see the next section. A user script may work around a proven fault
only as a stated workaround, named as such in the commit message.

## Testing a change

The add-ons of any branch, a pull request's included, are built and
installed like this:

```sh
git clone https://github.com/dangowrt/kodi-webapps
cd kodi-webapps
git fetch origin pull/<number>/head:pr-<number>
git checkout pr-<number>
python3 tools/build-repo.py ../webapps-build
```

The build reads the history of the tree, so the clone has to be
complete, not shallow. Copy `../webapps-build/<id>/<id>-<version>.zip`
to the device and install it with "Install from zip file" in Kodi's
add-on browser, which asks for "Unknown sources" to be allowed in
Kodi's system settings first.

An agent deploys without the remote control:

1. Leave the app, if it is open; Kodi hands the user scripts and
   filters to the web view when the app starts.
2. Remove `<id>/` from Kodi's add-on directory on the device
   (`special://home/addons/`, on Linux `~/.kodi/addons/` of the user
   Kodi runs as), so that no deleted file lingers, and unpack the zip
   there; it holds the `<id>/` directory.
3. `kodi-send --action=UpdateLocalAddons` makes Kodi read the add-on
   directory again (Kodi's event server must accept local
   applications, in its control settings).
4. An add-on Kodi did not have before is disabled after that; enable
   it with the JSON-RPC method `Addons.SetAddonEnabled`.
5. Start it with `Addons.ExecuteAddon`.

The person then runs a version the Kodi repository does not have yet.
Kodi replaces it once the repository publishes a higher version, the
merged change or a later one.

Many services play only in their own country, some only part of their
catalogue. A test of playback counts only from a connection in a
country where the service plays, and every report names the country it
was made from. A test from elsewhere shows what the service shows
abroad; report it as that. Content that needs an account is tested with
an account of the same kind.

## Contributing to this repository

- Work on a fork and open a pull request against the `main` branch on
  GitHub, as the next section describes. Merges to `main` publish the
  Kodi repository automatically.
- One logical change per commit. The subject is `webapp.<id>: <what it
  does>` for a change to one add-on and a plain imperative sentence
  otherwise, as in `git log`. The body says what was wrong or missing,
  what the change does and why, and records what was found about the
  service. Sign off every commit (`git commit -s`).
- Raise the add-on's version in the commit that changes it.
- Commit no binary files and no build output.
- New code is under the GPL-2.0-or-later unless it derives from code
  under another licence, whose terms and notices it then keeps.
- Test on a real Kodi with kodi-webkit before opening the pull request,
  and say in the pull request what was tested, on which device and from
  which country, and what was not.
- Say in the pull request that an agent took part and how.

## Pull requests

Every pull request fills in `.github/pull_request_template.md`, every
section in its order. GitHub offers it when a pull request is opened
in the browser; with `gh pr create`, write the filled-in template to a
file and pass it with `--body-file`. The description is Markdown that
GitHub reflows: one line per paragraph, no hard wrapping.

The title is `[<kind>] <subject>`, or `[<kind>] [agent] <subject>` for
a pull request an agent opens, at most 80 characters, with no full
stop. `<subject>` follows the commit subject rule above; for a pull
request of one commit it is that commit's subject. `<kind>` is the
first of these that applies:

| Kind | The pull request |
| --- | --- |
| `new` | adds a web app |
| `module` | changes a web app module, and with it every web app using it |
| `fix` | makes an existing app work again or work as it should: start, playback, navigation, layout, leaving the app |
| `adblock` | blocks adverts or trackers |
| `consent` | makes a consent banner usable with the remote, with refusing as the default |
| `ux` | makes a working app easier to use: keys, focus, start page or language choice, settings |
| `meta` | changes an add-on's name, summary, description, icon or translations only |
| `repo` | changes the build, the publish workflow or the repository add-on |
| `docs` | changes `README.md`, this file or the template only |

A request that spans two kinds becomes two pull requests. Examples:

```
[new] Add the BBC iPlayer web app
[adblock] webapp.orfon: block adverts and trackers
[fix] webapp.la7: keep the picture after a seek in a replay
[module] webapp.module.hbbtv: return to Kodi when an HbbTV app exits
[adblock] [agent] webapp.orfon: skip the preroll before programmes
[consent] webapp.youtube: focus the refusal on the consent page
```

A title matches this regular expression:

```
^\[(new|module|fix|adblock|consent|ux|meta|repo|docs)\] (\[agent\] )?(webapp\.[a-z0-9.]+: [a-z]|[A-Z]).*[^.]$
```

The description's "Facts" give countries as ISO 3166-1 alpha-2 codes
(`AT`, `GB`): "Plays in" where the service serves the app or its
catalogue, "Tested from" where the submitter's connection was. "Tested
by the submitter" ticks only what was seen working on the screen of a
real device or measured there, and says which. "How others can test"
names what a tester needs, the country first, and numbered steps from
the build to the result to expect, so that a reviewer in that country
can repeat them.

### Pull requests opened by agents

An agent opens pull requests here in the name of the person it works
for, as "From a request to a pull request" describes, and marks each
one: `[agent]` in the title, and "Opened by" in the facts naming the
agent and the person's GitHub account. Beyond the rules for everyone:

- It opens a pull request only for a change it deployed and tested on
  the person's own Kodi.
- It keeps at most one open pull request per add-on and kind, and
  updates that one instead of opening another.
- It answers review comments on its own pull requests, and it may post
  a test report on any open pull request whose add-on it can test from
  the person's country, using the template's test sections and marked
  as an agent's.
- It puts nothing private into a pull request, a comment or a log it
  attaches: no account names, cookies, tokens, addresses of the
  person's network or location finer than the country.
- It addresses only this repository; "Upstream projects" still holds.

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

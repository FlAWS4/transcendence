*This project has been created as part of the 42 curriculum by hchowdhu, mshariar, mkettab, mmutsulk, rel-hass.*

# ft_transcendence — 0.0.1 pre-alpha

**Current state, 8 October 2026:** product research, Figma designs and interactive web prototypes. The working name is **42 Horizon**. The `rel-hass` branch shares the explorations and their archives; it is not a production release.

`0.0.1` remains the development version. The existing local `v0.0.1` tag identifies the initial documentation commit, not the current prototype. No remote tag or GitHub release was found during the 7 October check. The 8 October changes are local and have not been pushed. Version numbers and maturity follow [VERSIONING.md](VERSIONING.md); prototype iterations and asset cache versions do not increment the project version.

## Description

42 Horizon explores a public showcase of students, projects and journeys before, during and after 42, for the community, recruiters and visitors. 42 Awards is a planned part of this broader product.

The current prototype offers campus exploration, demonstration projects and profiles, editorial articles, French/English/Arabic interfaces, and light/dark themes. Authentication, permissions, Intra integration, production storage and AI search remain to be implemented. Examples and connected-account studies use demonstration data.

## Instructions

### Prerequisites

| Software / tool | Version / requirement | Purpose |
| --- | --- | --- |
| Python | 3 | Serve static prototype files over HTTP. |
| Browser | Recent browser with WebGL and container-query support; checked in Chrome | Play the interactive prototype. |
| Node.js | Tests checked with 20.20.0 | Run the prototype's automated checks; optional for browsing. |
| Git / GitHub access | Access to this private repository | Clone the shared branch. |

Internet access is needed for external campus websites and detailed urban map data. Figma access is separate from the local web prototype.

### Installation and configuration

```sh
git clone --branch rel-hass git@github.com:LeR1f/ft_transcendence.git
cd ft_transcendence
```

The static prototype uses its checked-in assets and dependencies. It needs no npm installation, environment secrets, database initialization or build step.

### Running the project

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

- [Main prototype](http://127.0.0.1:8765/work/visualizations/horizon-welcome/index.html): animated entrance, simulated connection or visitor access, then Explorer.
- [Direct preview](http://127.0.0.1:8765/work/visualizations/horizon-welcome/content-preview.html): examine the interface without the entrance.
- [Research archive](http://127.0.0.1:8765/work/visualizations/research-archive/index.html): compare preserved studies and earlier states.
- [42 Awards interface studies](http://127.0.0.1:8765/work/visualizations/awards-studies/index.html): compare three separate layouts with simulated submission, voting, dates, archives and rules.

Stop the server with `Ctrl+C`. This command does not configure automatic startup.

Run the active Horizon test files from the repository root:

```sh
node --test work/visualizations/horizon-welcome/*.test.mjs work/visualizations/horizon-welcome/tests/*.test.mjs
```

All **43 active test files passed** on 8 October. Browser checks cover selected desktop/mobile widths, themes, languages, navigation and interactions; they do not establish production readiness or testing on a physical phone. Detailed evidence and limits are linked in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

The separate Awards studies also have **10 passing model tests**, run with `node work/visualizations/awards-studies/model.test.mjs`. Selected desktop and 320 px browser flows have been checked; see [the study notes](work/visualizations/awards-studies/NOTES.md).

## Team Information

Roles below are recorded in [IDEA.md](IDEA.md). They do not imply completed implementation work.

| Member | Assigned role | Responsibility area |
| --- | --- | --- |
| rel-hass | Project Owner | Product direction and scope. |
| hchowdhu | Technical Lead | Technical coordination. |
| mshariar | Project Manager | Project coordination. |
| mkettab | Developer | Application development. |
| mmutsulk | Developer | Application development. |

## Project Management

Product intentions and progress are recorded in [BOARDING_JOURNAL.md](BOARDING_JOURNAL.md), [IDEA.md](IDEA.md) and [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). Figma and the web studies support design comparisons. The French and English onboarding guides describe proposals still requiring collective decisions.

[VERSIONING.md](VERSIONING.md) defines task branches, pull requests, independent review and publication. The personal `rel-hass` branch is an explicit request for sharing the research. Repository protections and meeting schedules are not confirmed here.

## Technical Stack

| Layer | Current technology | Purpose / status |
| --- | --- | --- |
| Prototype UI | HTML, CSS, JavaScript ES modules | Directly runnable interface and animation studies. |
| Map | Vendored MapLibre GL JS 5.24.0 | One WebGL map from world to campus neighbourhood. |
| Geography | Local Natural Earth assets; external urban map data | Local world/country rendering and detailed campus surroundings. |
| Typography | Local Jost and Noto Sans Arabic assets | Current Latin and Arabic prototype typography. |
| Checks | Node.js built-in test runner | Prototype logic and regression checks. |
| Production backend / database | Undecided | The onboarding guides contain proposals, not an implemented stack. |

The prototypes and their dependencies live under `work/visualizations/`. Figma handoff documents and state records live under `work/figma/`. The intended production architecture is discussed in [DOCUMENTATION.en.md](DOCUMENTATION.en.md).

## Database Schema

No production database or approved implemented schema exists yet. The prototype reads local demonstration data and stores selected preferences locally; the separate connected-account studies use sessionStorage for simulated activity. Proposed entities and relationships in the onboarding guides must be reviewed before implementation.

## Features List

These are **prototype behaviours**, not completed production modules.

| Feature | Current functionality | Contributor |
| --- | --- | --- |
| Entrance | Binary/hexadecimal scan, simulated connection, slogan and circle-to-globe transition. | rel-hass, with Codex assistance |
| Explorer | World/country/campus navigation, linked filters, Paris/Mulhouse profiles with official logos/photos and dated source data, stable photo navigation arrows, mobile sheet touch/wheel/handle gestures and random discovery. | rel-hass, with Codex assistance |
| Projects, Profiles, Chronicles | Demonstration lists/details, two-column mobile content grids, truncated summaries, unlimited author rendering with a designated lead first (French project label: “Chef de projet”), filters, sorting and local favourites. | rel-hass, with Codex assistance |
| Media viewer | Campus photos, detail illustrations and main profile portraits open full-size; optional project/article video media use native controls with cleanup on close. | rel-hass, with Codex assistance |
| Global search | Structured/lexical search over prototype data. Conversational multimodal AI search is planned. | rel-hass, with Codex assistance |
| Responsive navigation | Desktop labels beside icons, then labels below, selected label only, finally icons only; menu remains 60 px high. | rel-hass, with Codex assistance |
| Languages and themes | French, English, Arabic RTL; light and dark modes. | rel-hass, with Codex assistance |
| 42 Awards entry | Empty page retaining header/menu; user-selected letter cascade animates HORIZON/AWARDS in both directions. | rel-hass, with Codex assistance |
| 42 Awards interface studies | Three separate layouts with local candidature/vote confirmation, four simulated dates, visitor/member states, edition archives and participation/vote/results rules. French, light/dark, responsive; no real submissions or votes. | rel-hass, with Codex assistance |
| Wordmark motion studies | Ten separate HORIZON/AWARDS transitions, both directions, timeline controls and themes; the original four-study gallery is preserved. Study 08, Cascade de lettres, is selected and integrated into the header. | rel-hass, with Codex assistance |
| Connected-account studies | Three separate demonstrations of editing, messages, notifications and Awards participation; no real accounts or sends. | rel-hass, with Codex assistance |

Campus totals and calendars remain partial where no official figure or future date was verified. Campus photo arrows were checked for stable horizontal positions in Chrome on desktop and at 320 px, including Arabic RTL. Mobile sheet wheel expansion, reading and collapse were played in Chrome; touch was checked with synthetic events, not a physical phone. No active sample contains a video yet; the video viewer was played with an archived local clip in a separate browser fixture. The Arabic directory label is now الأعضاء (members); French and English remain Profils/Profiles.

All previous studies and replaced prototype sources are preserved. Connected-account studies have not been chosen or integrated into the active account experience.

**42 Awards product framing, 8 October:** requested content includes separate campus and world edition archives, ongoing editions, project submissions by category and key dates. Other campuses' local competitions are viewable without voting rights; world editions allow eligible members to vote. Campus winners qualify for world editions, with no direct world submissions, as explicitly selected by the user. Detailed eligibility and voting rules remain open. The proposed page structure is documented in [the Awards notes](work/visualizations/horizon-welcome/AWARDS_NOTES.md) and explored in three separate interactive studies; no layout has been selected or integrated into the active Awards page, which still contains only the shared header/menu and wordmark transition.

The user also requests a section explaining participation conditions, voting rules and how results are determined and announced. The studies implement **Rules** with those three topics and links from the relevant actions. Edition context is preserved, while the text remains a shared demonstration template; final rules and historical rule versioning remain to be implemented. The studies use eight fictional projects and eleven editions, with local state per variant; they do not add real accounts, server permissions, tallying or production data.

## Modules

### Chosen modules and points

The final module selection is pending collective agreement. The onboarding guides propose a basket of modules; no evaluation points are claimed from these prototypes.

### Module details

Implementation details, contributors and validation for each selected subject module will be recorded here when the production scope is agreed and developed. See [DOCUMENTATION.en.md](DOCUMENTATION.en.md) for the current proposal and [the subject](en.subject.pdf) for requirements.

## Individual Contributions

### hchowdhu

Technical Lead role recorded; completed implementation contributions still need to be documented from the team's actual work.

### mshariar

Added a GitHub Actions CI skeleton on the separate `mshariar` branch, commit `e192236`: Frontend, Backend and Docker jobs. This workflow is not integrated into `rel-hass`. The folders, npm manifests/lockfiles and Docker files expected by its commands are absent from that commit. See [the review](work/reviews/20261007-mshariar-ci.md) for evidence and next steps. No Actions execution was found during the check.

### mkettab

Developer role recorded; completed implementation contributions still need to be documented from the team's actual work.

### mmutsulk

Developer role recorded; completed implementation contributions still need to be documented from the team's actual work.

### rel-hass

Product framing, design choices, Figma exploration, web prototypes, preservation of research variants, documentation and review of the CI skeleton, with Codex assistance. The 7 October state is shared on this personal branch; the 8 October iteration remains local. Key challenges include responsive layout, RTL, map transitions and preserving previous studies; checks and limits are recorded alongside each implementation.

## Resources

### References

| Resource | Relevance |
| --- | --- |
| [Project subject](en.subject.pdf) | Curriculum requirements; verify before claiming module completion. |
| [42 graphic charter](<42 - Charte graphique 2024.pdf>) | Visual identity reference. |
| [English onboarding guide](DOCUMENTATION.en.md) / [French guide](DOCUMENTATION.md) | Vision, proposed architecture, scope and team onboarding. |
| [Project context](PROJECT_CONTEXT.md) | Current decisions, implementation state, verification evidence and open questions. |
| [Versioning guide](VERSIONING.md) | Collaboration, maturity and release conventions. |
| [Figma design](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT) | Design explorations; access may require the team's Figma permissions. |
| [Research archive](work/visualizations/research-archive/index.html) | Preserved comparisons and prototypes; open through the local HTTP server. |
| [Geography provenance](work/visualizations/horizon-welcome/geography/PROVENANCE.md) | Source and preparation of local map assets. |

### AI usage

| Tool | Tasks | Affected parts | Review / verification |
| --- | --- | --- | --- |
| OpenAI Codex | Documentation, design exploration, prototype implementation, tests and CI review. | README and project guides, Figma work, web studies and their notes. | Product decisions and corrections come from rel-hass; automated checks and selected browser interactions/renders are documented. Technical verification does not imply final user acceptance or independent team approval. |

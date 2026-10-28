// Keep the original regression scenarios stable as pagination adds more demo
// records. These are references to current source records, never frozen copies.
import {previewEntries as currentEntries} from '../content-preview-data.mjs';
import {profiles as currentProfiles,createDiscoveryEntries} from '../profile-data.mjs';
const entryIds=new Set(['minishell-under-the-prompt','raycast-find-the-light','network-messages-between-us','garden-small-useful-tools','ft-transcendence-building-together','path-learning-to-ask','path-making-room-to-learn','journal-an-evening-debugging','journal-share-the-unfinished']);
const profileIds=new Set(['profile-leila-mansour','profile-noe-laurent','profile-ines-morel','profile-haru-mizuno','profile-luiza-costa','profile-caio-mendes']);
export const previewEntries=currentEntries.filter(entry=>entryIds.has(entry.id));
export const profiles=currentProfiles.filter(profile=>profileIds.has(profile.id));
export const entries=createDiscoveryEntries(previewEntries).filter(entry=>entryIds.has(entry.id)||profileIds.has(entry.id));

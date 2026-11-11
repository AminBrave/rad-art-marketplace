# Domain Workflows and Invariants

## Artist profile
Public registration creates artist by default or buyer by selection; public admin registration is forbidden. An artist owns one profile with unique slug and public/private visibility. Private profile preview is owner/admin only. Incomplete profiles are valid onboarding states.

## Artwork moderation
```mermaid
stateDiagram-v2
 [*] --> pending_review: artist submits
 pending_review --> approved: admin approves
 pending_review --> rejected: admin rejects with note
 pending_review --> changes_requested: admin requests changes with note
 rejected --> pending_review: artist edits/resubmits
 changes_requested --> pending_review: artist edits/resubmits
 approved --> pending_review: artist edits
```
Only approved works of public profiles appear publicly. Rejection/change request requires a note. Artist edits reset moderation metadata and return to pending review.

## Buyer contact
Inquiry implementation: buyer submission can target an artist and reference artwork; artists can inspect, mark read and archive; buyers can view their own history. Submission is rate-limited and includes honeypot protection. This module is disabled by default through the Feature Registry, so its API and UI entry points are unavailable until explicitly re-enabled. Direct conversation can start without inquiry and can carry artwork context; that messaging workflow remains active.

## Conversations and messaging

Direct conversations are the active contact path while Inquiry is disabled. The inquiry-to-conversation bridge is also gated with Inquiry.
One canonical conversation per buyer/artist pair, keyed by pair key. Inquiry/artwork are contexts, not duplicate conversations. Only participants may read/write; blocks prevent contact/message actions. Messages support pagination, replies, edit/delete, read/delivery timestamps, reactions and attachments. Reports create moderation work. In-app notifications exist; email is unavailable.

## Editorial
Admins curate ordered collections and artwork membership, plus featured artists with publication windows. Public visibility depends on publication status/time and eligible public content.

## Change checklist
Update domain rule → schema/model → controller/policy → API contract → React consumer → feature test → browser path → security note → roadmap.

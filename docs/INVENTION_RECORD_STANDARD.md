# Solutions HQ — Invention Record Standard

## Purpose
Provide a consistent, durable development record for Massi Solutions projects that may contain patentable technical subject matter.

This standard supports:
- engineering continuity;
- reconstruction of technical evolution;
- contributor / inventorship diligence;
- public-disclosure tracking;
- provisional-patent preparation;
- future diligence with patent counsel.

It is not legal advice and does not replace a patent filing.

## When to apply
Use an invention record when a project includes a potentially novel technical system, mechanism, process, hardware/software architecture, or method whose detailed evolution may matter later.

Typical triggers:
1. a concrete technical architecture exists;
2. the project has moved beyond a casual brainstorm;
3. there is a prototype or committed prototype path;
4. multiple alternatives or technical decisions are being explored;
5. public demonstration, sale, licensing, or external discussion is plausible.

## Required structure
Each qualifying project should contain:

```text
invention/
├── README.md
├── INVENTION_LOG.md
├── DISCLOSURE_LOG.md
├── CONTRIBUTORS.md
└── VERSION_TEMPLATE.md
```

Optional:
```text
invention/
├── PRIOR_ART_NOTES.md
├── CLAIM_CONCEPTS.md
├── FIGURES/
└── EVIDENCE/
```

## Rules
- Never rewrite historical entries to make the story cleaner.
- Add new dated entries instead.
- Clearly label reconstructed historical entries versus contemporaneous records.
- Preserve original sketches, CAD, images, test files, measurements, BOM snapshots, and supplier references.
- Record what changed, why it changed, and what technical problem it addressed.
- Separate expectation/hypothesis from measured result.
- Record contributors and the specific conceptual/technical contribution.
- Record public disclosure, public use, offer for sale, publication, demonstration, investor/customer presentation, conference presentation, social post, or distribution of technical detail.
- Link material milestones to Git commits/tags when possible.
- Preserve failed concepts and dead ends when technically meaningful.
- Do not claim patentability or legal inventorship inside engineering records.

## Version record
For each material prototype/version:
- version identifier;
- date;
- inventor(s)/contributors;
- prior configuration;
- change introduced;
- technical rationale;
- drawings/CAD/photos;
- BOM/supplier change;
- test method;
- result;
- unexpected findings;
- disclosure status;
- related commits/tags;
- next technical question.

## Disclosure discipline
When in doubt, log the event.

A disclosure log entry should include:
- date;
- event;
- audience;
- public/confidential status;
- NDA status;
- technical detail disclosed;
- evidence/link;
- notes.

## Repository lifecycle
### Project already has a dedicated repo
The invention record belongs in that project repo.

### Project still incubating in Solutions HQ
Store the invention record under:
`incubator/<project>/invention/`

When the dedicated repo is created:
1. migrate invention files;
2. preserve Git history/pointers where possible;
3. leave only a migration marker in Solutions HQ;
4. make the dedicated repo authoritative.

## Filing checkpoint
When a project reaches any of the following, flag it for patent counsel / provisional-filing review:
- external distributor/customer demonstration;
- licensing discussion;
- public prototype test;
- offer for sale;
- conference or public presentation;
- social/media publication;
- manufacturing RFQ containing enabling technical detail;
- prototype mature enough that the core inventive concept is stable.

## Portfolio rule
Patent-readiness status is portfolio metadata, not a declaration of patentability.

Suggested portfolio values:
- Not applicable
- Watch
- Invention record active
- Filing review
- Filed
- Abandoned / no filing

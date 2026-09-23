# IdeaWriter — Project Scope

## Purpose
Capture spoken and written ideas, transcribe them, preserve them durably, classify them consistently, and turn accumulated thinking into reusable knowledge and future projects.

## Existing implementation
IdeaWriter already exists as a local Python application with:
- faster-whisper transcription;
- SQLite database `ideawriter.db`;
- portable inbox, transcripts, summaries, archive, and code;
- controlled category/topic/action tagging;
- interpreted-note library and synthesis tooling.

Later product directions include a spatial idea interface (Galaxy → World → Cloud → Note) and an Android capture client.

## Boundary
IdeaWriter owns idea capture, transcription, interpretation, retrieval, and synthesis. Solutions HQ owns the portfolio, project lifecycle, project re-entry, and Innovation Lab promotion workflow.

The earlier “Innovation Development Hub / Massi Innovation OS” concept is therefore not a separate competing project; its portfolio/lifecycle responsibilities are being realized by Solutions HQ.

## Proposed repository
`fieldlogic-lab/IdeaWriter`

## Next step
Package the current local Python implementation into an authoritative repository, document the data model and ingest pipeline, preserve existing portable data, and define v1 versus spatial/mobile v2 scope.

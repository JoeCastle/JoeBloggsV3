---
date: 2026-04-01
dateModified: 2026-04-01
isLive: true
metaTags:
- spreadsheet to sql server import pipeline
- excel data transformation to relational database
- handling messy spreadsheet data in production systems
summary: A real-world case study on transforming messy Excel spreadsheets into reliable, production-ready relational data using VBA and SQL Server.
tags:
- data-import
- excel
- sql-server
- vba macro
title: Designing a production-safe spreadsheet import pipeline
---

## Table of Contents

-   [Introduction](#introduction)
-   [The situation](#the-situation)
-   [What the data actually looked like](#what-the-data-actually-looked-like)
-   [The first wrong assumption](#the-first-wrong-assumption)
-   [Choosing the tool](#choosing-the-tool)
-   [Alternative approaches considered](#alternative-approaches-considered)
-   [The core transformation](#the-core-transformation)
-   [Identity was the critical part](#identity-was-the-critical-part)
-   [The most dangerous bug](#the-most-dangerous-bug)
-   [A debugging moment that changed the approach](#a-debugging-moment-that-changed-the-approach)
-   [Trade-off: flexibility vs strictness](#trade-off-flexibility-vs-strictness)
-   [Making it testable and safe](#making-it-testable-and-safe)
-   [The result](#the-result)
-   [What I would change](#what-i-would-change)
-   [Conclusion](#conclusion)
-   [Where to Find Me](#where-to-find-me)

------------------------------------------------------------------------

## Introduction

A couple of months after joining a new project, I was asked to import a set of spreadsheets into our system.

At first glance it sounded straightforward. We had 30+ Excel files from a customer, and more were expected later. The goal was to get that data into an existing production system backed by Azure SQL.

In reality, this meant transforming tens of thousands of records across multiple relational tables, where a subtle mistake would not fail loudly, but silently corrupt production data.

That is not what most people think of when they hear "import some spreadsheets".

------------------------------------------------------------------------

## The situation

The system was already live. This was not a greenfield import.

The spreadsheets represented real customer data across multiple projects. If the import went wrong, the impact was not theoretical:

-   incorrect pricing
-   broken UI behaviour
-   inconsistent relationships between entities
-   difficult cleanup in production

I was the only developer on the project at the time, so this ended up being fully owned on my side. That included:

-   understanding an unfamiliar and unintuitive database schema
-   working with a non-technical PM to clarify what the data actually meant
-   building the transformation
-   designing the import process
-   testing against a production backup
-   documenting everything so it could be repeated later

I had also never written VBA before.

------------------------------------------------------------------------

## What the data actually looked like

The spreadsheets looked structured. Rows, columns, headers.

They were not structured data.

Across the files I was dealing with:

-   inconsistent headers
-   merged cells and section-based layouts
-   different sheet structures per project
-   missing values
-   totals rows mixed in with real data
-   columns that looked like data but were not
-   plot ranges like `142–150`
-   categories that appeared in some files but not others

Visually, they made sense. Programmatically, they were unreliable.

At the same time, the target was a relational model with multiple dependent tables.

So the real problem was not:

> read Excel and insert rows

It was:

> take semi-structured, presentation-oriented spreadsheets and transform them into consistent, relational data without breaking production integrity

------------------------------------------------------------------------

## The first wrong assumption

My initial approach assumed the spreadsheets were consistent.

That broke quickly.

Some files had categories that others did not. Some headers were not where they appeared visually. Some columns changed meaning depending on section headers. Totals columns looked like real data if you did not explicitly exclude them.

The biggest shift was realising:

> this is not a mapping problem, it is a normalization problem

Once I accepted that, the design changed.

------------------------------------------------------------------------

## Choosing the tool

I considered building a small tool in C# or JavaScript, which are my usual languages.

I went with VBA instead.

Not because it is ideal, but because it was the most pragmatic choice here:

-   the source of truth was Excel\
-   it runs directly where the data lives\
-   no setup or dependencies for other developers\
-   fast to iterate on

This was not something that needed to run as part of the product. It needed to be run a handful of times, safely.

Given that, minimising friction mattered more than using a "cleaner" stack.

------------------------------------------------------------------------

## Alternative approaches considered

There were other viable approaches.

A C# tool would have provided stronger typing, better testability, and cleaner separation of transformation logic. A Python script would have been a good fit for reshaping semi-structured spreadsheet data. A SQL-heavy staging approach or ETL tooling could also have handled parts of the pipeline.

In practice, each of these introduced additional setup, friction, or complexity relative to the task at hand.

Given that this needed to run a limited number of times, directly against Excel-based input, and be easy to hand over, VBA was the most pragmatic choice.

It was not the most elegant option, but it allowed me to build a repeatable and production-safe process quickly.

------------------------------------------------------------------------

## The core transformation

The shape of the data was the real challenge.

A typical row in the spreadsheet looked like this:

| Plot | Type | Main Roof | First Fix | Kitchen Units | Toilet Accessories | Plot Totals |
|------|------|-----------|-----------|---------------|--------------------|-------------|
| 27   | Eaton 309 | 470 | 1001 | 0 | 0 | 1471 |

At first glance, that looks like one record. It was not.

In the target model, that single row actually represented:

-   one Plot
-   one CostingSheet
-   multiple CostingSheetLines
-   multiple CostingSheetItems
-   category references such as BuildStage

The "Plot Totals" column is intentionally ignored during transformation, as it is a report artifact rather than a real data field.

So the transformed output became something like this:

| PlotId | PlotName | CostingSheetId | CostingSheetName | SalesCategory | BuildStageId | IsAdditional | Amount |
|--------|----------|----------------|------------------|---------------|--------------|--------------|--------|
| P-27 | 27 | CS-27-EATON309 | Eaton 309 | Main Roof | BS-MAINROOF | 0 | 470 |
| P-27 | 27 | CS-27-EATON309 | Eaton 309 | First Fix | BS-FIRSTFIX | 0 | 1001 |
| P-27 | 27 | CS-27-EATON309 | Eaton 309 | Kitchen Units | BS-KITCHENUNITS | 1 | 0 |
| P-27 | 27 | CS-27-EATON309 | Eaton 309 | Toilet Accessories | BS-TOILETACCESSORIES | 1 | 0 |

The important point is that the source sheet was column-oriented and presentation-oriented, while the output had to become row-oriented and relational.

That was the core transformation problem.

------------------------------------------------------------------------

## Identity was the critical part

The most important design decision was how IDs were handled.

Not all IDs behave the same way.

I had to distinguish between:

-   **existing, stable IDs**\
categories and build stages already in production
-   **project-level identities**\
plots that should remain consistent within a project
-   **row-level identities**\
costing sheet lines that must be unique per record

If you get that wrong, you do not just get bad data. You get duplicated entities, broken foreign keys, and inconsistent relationships.

To handle this, I introduced a reference file that mapped known category names to existing IDs from the database.

If a category existed, reuse its ID.\
If it did not, generate a new one.

That avoided duplicating live data and kept foreign keys consistent.

------------------------------------------------------------------------

## The most dangerous bug

The worst issue I hit was not a crash.

It was silent corruption.

In an early version, output columns were written based on position rather than explicit mapping. That meant a small shift could put values in the wrong columns without failing.

The file would still generate. Row counts would look reasonable. But the data would be wrong.

That is far worse than a hard failure.

The fix was to stop relying on position and always map by column name:

``` vba
cPlotId = ColumnIndexOf(outWS, "PlotId")
cSalesCat = ColumnIndexOf(outWS, "SalesCategory")

outWS.Cells(outRow, cPlotId).Value = plotId
outWS.Cells(outRow, cSalesCat).Value = catName
```

That change made the output deterministic and significantly safer.

------------------------------------------------------------------------

## A debugging moment that changed the approach

One of the most useful debugging moments came when the output looked plausible but was actually wrong.

I had a version of the transformation that produced files without crashing, but values were drifting into the wrong categories.

The breakthrough did not come from changing the transformation logic. It came from making the parser's assumptions visible.

I added a run log that captured:

-   which worksheet was used
-   which row was treated as the header
-   which columns were detected as Plot and Type
-   a snapshot of the detected header cells
-   how many category columns were matched
-   how many output rows were written

Once I had that, I could see that the parser was reading the spreadsheet differently from how it appeared visually.

Instead of asking "why is this value wrong?", I started asking:

> what exact structure did the parser think it was reading?

Once that was visible, the fix became straightforward.

------------------------------------------------------------------------

## Trade-off: flexibility vs strictness

One of the key design decisions was whether to make the import strict or forgiving.

A strict approach would only accept perfectly structured files. That would be easier to reason about, but it would fail often because the spreadsheets were inconsistent.

A forgiving approach was more practical, but also riskier.

The more flexible the parser became, the more careful I had to be about avoiding false positives.

I settled on a middle ground:

-   dynamic detection for real-world variability
-   explicit exclusion rules for non-data fields
-   reuse of existing IDs where required
-   logging to make decisions visible and auditable

That kept the process flexible without making it unsafe.

------------------------------------------------------------------------

## Making it testable and safe

Before touching production, I ran the full process against a backup.

The steps were:

1.  take a copy of the production database
2.  run the full import process
3.  validate using SQL and the UI

I checked:

-   row counts against expectations
-   spot-checked values across multiple projects
-   verified relationships between entities
-   looked for broken UI behaviour

Only once that was clean did I run the import in production.

No rollbacks were required.

------------------------------------------------------------------------

## The result

-   30+ spreadsheets
-   30+ projects
-   ~75,000 transformed records
-   ~80,000-85,000 inserts across related tables

Manual processing would likely have taken months and been error-prone.

The final process:

-   ran in minutes
-   could be executed per project for safety
-   was repeatable for future data
-   significantly reduced the risk of human error

------------------------------------------------------------------------

## What I would change

If I were doing this again, I would move the transformation rules out of VBA earlier and into a more testable pipeline.

The macro worked, but the complexity was not Excel automation. It was the transformation logic.

A small, testable pipeline with repeatable fixtures for edge cases would make regression testing much easier as the rules evolve.

------------------------------------------------------------------------

## Conclusion

It would be easy to describe this as "I wrote a VBA macro".

That misses the point.

The difficult parts were:

-   interpreting an unfamiliar schema
-   translating between report-style input and relational output
-   designing a safe identity strategy
-   handling inconsistent real-world data
-   preventing silent corruption
-   building something repeatable and supportable

The macro was just the implementation.

The biggest takeaway from this was simple:

> spreadsheet imports stop being "just automation" the moment the source is inconsistent and the destination is a live relational system

That is where most of the work actually is.

And that is the difference between something that runs and something you can trust.

## Where to Find Me

You can also follow me on <a href="https://github.com/JoeCastle" target="_blank" rel="noopener noreferrer">GitHub</a> or on my <a href="https://joecastle.co.uk" target="_blank" rel="noopener">Portfolio</a> for updates.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-08

### Added

- Initial release of EvoSpec DSL v1
- Core specification with 7 chapters:
  - Introduction
  - Domain Layer
  - Evolution Layer
  - Generation Layer
  - Contracts
  - Scenarios
  - Validator
- JSON Schema for validation
- TypeScript validator with 6 phases:
  - Structural validation
  - Referential validation
  - Semantic validation
  - Evolution validation
  - Generation safety validation
  - Verifiability validation
- CLI tool with commands:
  - `evospec validate` - Validate spec files
  - `evospec init` - Create new spec files
  - `evospec check` - Quick validation (phases 1-3)
- LLM integration:
  - System prompt for GPT-4/Claude
  - Compact prompt for smaller models
  - 4 example specifications
- Documentation website (Docusaurus)
- Quick start guide
- Reference documentation

### Node Kinds

- System
- Module
- Entity
- Enum
- Value
- Interface
- Command
- Event
- Query
- Process
- Step
- Policy
- Scenario
- Contract

### Type System

- Primitives: uuid, string, int, bool, datetime
- References: ref(entity.x), enum(EnumName)

### Generation Zones

- overwrite
- anchored
- preserve
- spec-controlled

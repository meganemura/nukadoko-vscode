// Responsibility: the one public surface that src/index and the
// definition/completion providers in src/extension.ts import from:
// re-exports only, no
// logic of its own, so every consumer reaches the same functions and types
// through one path regardless of which module inside src/extraction/
// happens to define them.
export {
  extractStepDeclarations,
  type ExtractedPattern,
  type ExtractionResult,
  type SourcePosition,
  type UnresolvedDeclaration,
} from "./step-extraction.js";
export { matchStepText, type MatchedDeclaration } from "./match-declarations.js";

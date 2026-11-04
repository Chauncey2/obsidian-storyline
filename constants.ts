 
/**
 * View type constants for all StoryLine views.
 *
 * These live in their own module to avoid circular imports between
 * view files and the ViewSwitcher component.
 */
export const BOARD_VIEW_TYPE = 'story-line-board';
export const TIMELINE_VIEW_TYPE = 'story-line-timeline';
export const STORYLINE_VIEW_TYPE = 'story-line-storyline';
export const CHARACTER_VIEW_TYPE = 'story-line-character';
export const STATS_VIEW_TYPE = 'story-line-stats';
export const PLOTGRID_VIEW_TYPE = 'story-line-plotgrid';
export const LOCATION_VIEW_TYPE = 'story-line-location';
export const HELP_VIEW_TYPE = 'story-line-help';
export const NAVIGATOR_VIEW_TYPE = 'story-line-navigator';
export const CODEX_VIEW_TYPE = 'story-line-codex';
export const SCENE_INSPECTOR_VIEW_TYPE = 'story-line-scene-inspector';
export const MANUSCRIPT_VIEW_TYPE = 'story-line-manuscript';
export const RESEARCH_VIEW_TYPE = 'story-line-research';
export const NOTES_VIEW_TYPE = 'story-line-notes';
export const SYNOPSIS_VIEW_TYPE = 'story-line-synopsis';
export const DETAILS_VIEW_TYPE = 'story-line-scene-details';

/** Every registered StoryLine view type, used when rebuilding views after a locale change. */
export const ALL_STORYLINE_VIEW_TYPES: readonly string[] = [
    BOARD_VIEW_TYPE,
    TIMELINE_VIEW_TYPE,
    STORYLINE_VIEW_TYPE,
    CHARACTER_VIEW_TYPE,
    STATS_VIEW_TYPE,
    PLOTGRID_VIEW_TYPE,
    LOCATION_VIEW_TYPE,
    HELP_VIEW_TYPE,
    NAVIGATOR_VIEW_TYPE,
    CODEX_VIEW_TYPE,
    SCENE_INSPECTOR_VIEW_TYPE,
    MANUSCRIPT_VIEW_TYPE,
    RESEARCH_VIEW_TYPE,
    NOTES_VIEW_TYPE,
    SYNOPSIS_VIEW_TYPE,
    DETAILS_VIEW_TYPE,
];
 

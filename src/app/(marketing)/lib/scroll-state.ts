/**
 * Module-level refs for scroll interception.
 * wheelInterceptRef: when set, wheel events are forwarded to this function instead of scrolling.
 * scrollToRef: allows programmatic smooth scroll to a position.
 */
export const wheelInterceptRef = { current: null as ((deltaY: number) => void) | null };
export const scrollToRef = { current: null as ((pos: number) => void) | null };

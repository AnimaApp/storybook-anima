export interface AnimaParameters {
  designTokens?: Record<string, any>;
}

export type DSTokenType = "PAINT" | "TEXT" | "EFFECT" | "unknown";

export interface DSToken {
  name: string;
  value: string;
  id: string;
  type: DSTokenType;
}

export type DSTokenMap = Record<string, DSToken>;

export interface ShadowToken {
  color: string;
  offsetX?: string;
  offsetY?: string;
  x?: string;
  y?: string;
  blur: string;
  spread: string;
}

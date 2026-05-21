import * as React from "react";

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

/**
 * Minimal `asChild` helper — clones the child and merges incoming props,
 * including `className` and event handlers. React 19: no forwardRef needed.
 */
export function Slot({ children, ...props }: SlotProps) {
  if (!React.isValidElement(children)) return null;

  const childProps = (children.props ?? {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...props, ...childProps };

  const incomingClass = (props as { className?: string }).className;
  const childClass = childProps.className as string | undefined;
  if (incomingClass || childClass) {
    merged.className = [incomingClass, childClass].filter(Boolean).join(" ");
  }

  for (const key of Object.keys(props)) {
    if (/^on[A-Z]/.test(key)) {
      const parentHandler = (props as Record<string, unknown>)[key] as
        | ((...args: unknown[]) => void)
        | undefined;
      const childHandler = childProps[key] as
        | ((...args: unknown[]) => void)
        | undefined;
      if (parentHandler && childHandler) {
        merged[key] = (...args: unknown[]) => {
          parentHandler(...args);
          childHandler(...args);
        };
      }
    }
  }

  return React.cloneElement(children, merged);
}

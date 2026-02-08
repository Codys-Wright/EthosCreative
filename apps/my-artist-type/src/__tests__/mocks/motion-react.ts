/**
 * Mock for motion/react used in vitest.
 * Replaces framer-motion components with simple DOM elements.
 */

import { forwardRef, createElement } from "react";

function createMotionComponent(tag: string) {
  return forwardRef((props: any, ref: any) => {
    const {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      variants: _variants,
      whileInView: _whileInView,
      viewport: _viewport,
      layoutId: _layoutId,
      onAnimationComplete: _onAnimationComplete,
      onMouseLeave: _onMouseLeave,
      onMouseEnter: _onMouseEnter,
      ...domProps
    } = props;
    return createElement(tag, { ...domProps, ref });
  });
}

export const motion = {
  div: createMotionComponent("div"),
  span: createMotionComponent("span"),
  p: createMotionComponent("p"),
  a: createMotionComponent("a"),
  button: createMotionComponent("button"),
  ul: createMotionComponent("ul"),
  li: createMotionComponent("li"),
  section: createMotionComponent("section"),
  nav: createMotionComponent("nav"),
  header: createMotionComponent("header"),
  footer: createMotionComponent("footer"),
  img: createMotionComponent("img"),
};

export const AnimatePresence = ({ children }: any) => children ?? null;

export const useReducedMotion = () => true;

export const useMotionValue = (initial: number) => ({
  get: () => initial,
  set: () => {},
  on: () => () => {},
});

export const useTransform = () => ({
  get: () => 0,
  set: () => {},
});

export const useSpring = () => ({
  get: () => 0,
  set: () => {},
});

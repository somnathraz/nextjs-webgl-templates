'use client';
import { Component } from 'react';
export class SceneBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        The interactive preview needs WebGL. You can still explore the page and
        product options.
      </div>
    ) : (
      this.props.children
    );
  }
}

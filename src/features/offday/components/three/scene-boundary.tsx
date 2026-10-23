'use client';
import { Component } from 'react';
import type { Flavor } from '@/features/offday/types/product';
export class SceneBoundary extends Component<
  { children: React.ReactNode; flavor: Flavor },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div
        className="can-fallback"
        style={{
          background: this.props.flavor.label,
          color: this.props.flavor.ink,
        }}
      >
        <b>OFFDAY</b>
        <span>{this.props.flavor.name}</span>
        <small>3D unavailable on this device</small>
      </div>
    ) : (
      this.props.children
    );
  }
}

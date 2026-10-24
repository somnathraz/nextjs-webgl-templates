'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Pause, Play, RotateCcw } from 'lucide-react';
import { Network } from './network';
import { WORKFLOWS } from '../lib/workflows';
export function Playground() {
  const [scenario, setScenario] = useState(0);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const flow = WORKFLOWS[scenario];
  const complete = step === 5;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      if (step >= 4) {
        setStep(5);
        setRunning(false);
      } else {
        setStep(step + 1);
        setSelected(step + 1);
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [running, step]);
  function reset(index = scenario) {
    setScenario(index);
    setStep(-1);
    setRunning(false);
    setSelected(0);
    setCopied(false);
    setCopyFailed(false);
  }
  function run() {
    if (step < 0 || complete) {
      setStep(0);
      setSelected(0);
      setCopied(false);
    }
    setRunning(true);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        [flow.result, flow.body, ...flow.artifact].join('\n\n'),
      );
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  }
  return (
    <section className="relay-playground" id="relay-playground">
      <div className="relay-section-top">
        <span className="relay-eyebrow">02 / SEE THE HANDOFF</span>
        <span className="relay-demo-tag">
          <i /> INTERACTIVE SIMULATION
        </span>
      </div>
      <div className="relay-playground-heading">
        <h2>
          Less explaining.
          <br />
          <span>More executing.</span>
        </h2>
        <p>
          Give the team a mission.
          <br />
          Watch how the work gets done.
        </p>
      </div>
      <div className="relay-workbench">
        <div className="relay-workbench-top">
          <div className="relay-scenarios" aria-label="Example workflow">
            {WORKFLOWS.map((f, i) => (
              <button
                key={f.name}
                aria-pressed={scenario === i}
                onClick={() => reset(i)}
              >
                {f.name}
              </button>
            ))}
          </div>
          <span className="relay-eyebrow">LOCAL DEMO / NO API CALLS</span>
        </div>
        <div className="relay-command">
          <span>↳</span>
          <p>{flow.prompt}</p>
          <button
            className="relay-button relay-run"
            onClick={running ? () => setRunning(false) : run}
          >
            {running ? <Pause size={14} /> : <Play size={14} />}{' '}
            {running
              ? 'Pause'
              : complete
                ? 'Run again'
                : step >= 0
                  ? 'Resume'
                  : 'Run workflow'}
          </button>
        </div>
        <div className="relay-run-body">
          <div className="relay-run-graph">
            <Network
              chapter={0}
              active={complete ? 4 : step}
              selected={selected}
              onSelect={setSelected}
              labels={[...flow.agents].map((x) => x.toUpperCase())}
            />
            <div className="relay-run-inspect">
              <span className="relay-eyebrow">
                {flow.agents[selected]} /{' '}
                {selected < step
                  ? 'COMPLETE'
                  : selected === step
                    ? running
                      ? 'ACTIVE'
                      : 'PAUSED'
                    : 'READY'}
              </span>
              <p>{flow.steps[selected]}</p>
            </div>
          </div>
          <aside className="relay-trace">
            <div>
              <span className="relay-eyebrow">EXECUTION TRACE</span>
              <button aria-label="Reset workflow" onClick={() => reset()}>
                <RotateCcw size={13} />
              </button>
            </div>
            <ol>
              {flow.steps.map((label, i) => (
                <li
                  key={label}
                  className={i < step ? 'done' : i === step ? 'current' : ''}
                >
                  <span>
                    {i < step ? (
                      <Check size={12} />
                    ) : (
                      String(i + 1).padStart(2, '0')
                    )}
                  </span>
                  <div>
                    <strong>{flow.agents[i]}</strong>
                    <p>{label}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="relay-trace-status" role="status">
              {complete
                ? 'Completed · ready to review'
                : running
                  ? 'Working through the plan…'
                  : step >= 0
                    ? 'Paused · resume when ready'
                    : 'Ready when you are.'}
            </div>
          </aside>
        </div>
        {complete && (
          <div className="relay-result">
            <div>
              <span className="relay-eyebrow">OUTPUT / SIMULATED</span>
              <h3>{flow.result}</h3>
              <p>{flow.body}</p>
              <ul>
                {flow.artifact.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <button onClick={copy}>
              {copied
                ? 'Copied'
                : copyFailed
                  ? 'Copy unavailable — try again'
                  : 'Copy result'}{' '}
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

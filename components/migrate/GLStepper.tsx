import React from 'react';

export interface StepDef {
  id: string;
  label: string;
}

interface GLStepperProps {
  steps: StepDef[];
  currentStep: number;
}

export function GLStepper({ steps, currentStep }: GLStepperProps) {
  return (
    <div className="gl-stepper">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const dotClass = isCompleted
          ? 'gl-stepper-dot gl-stepper-dot--completed'
          : isActive
            ? 'gl-stepper-dot gl-stepper-dot--active'
            : 'gl-stepper-dot gl-stepper-dot--pending';

        return (
          <React.Fragment key={step.id}>
            <div className="gl-stepper-step">
              <div className={dotClass}>
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--gl-color-primary-dark)' : 'var(--gl-color-text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`gl-stepper-line${isCompleted ? ' gl-stepper-line--completed' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Surface } from '@/components/layout/Surface';
import clsx from 'clsx';

type EnquiryType = 'clinic' | 'education' | 'press' | 'other';

type FormData = {
  enquiryType: EnquiryType | '';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  message: string;
  preferredContactMethod: 'email' | 'phone' | 'either';
  urgency: 'low' | 'normal' | 'high';
  consentToMarketing: boolean;
};

const initialFormData: FormData = {
  enquiryType: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  message: '',
  preferredContactMethod: 'email',
  urgency: 'normal',
  consentToMarketing: false,
};

const enquiryTypes = [
  {
    value: 'clinic' as EnquiryType,
    label: 'Personal Consultation',
    description: 'Individual scalp health care and treatment',
    icon: '🏥',
  },
  {
    value: 'education' as EnquiryType,
    label: 'Training & Courses',
    description: 'Video courses, workshops, and team training',
    icon: '📚',
  },
  {
    value: 'press' as EnquiryType,
    label: 'Speaking & Media',
    description: 'Media requests and speaking engagements',
    icon: '🎤',
  },
  {
    value: 'other' as EnquiryType,
    label: 'Other Enquiry',
    description: 'General questions and partnerships',
    icon: '💬',
  },
];

type EnquiryFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function EnquiryForm({ isOpen, onClose }: EnquiryFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totalSteps = 4;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleNext = () => {
    if (step === 1 && !formData.enquiryType) {
      setError('Please select an enquiry type');
      return;
    }
    if (step === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please fill in all required fields');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.message || formData.message.length < 10) {
      setError('Please provide more details (at least 10 characters)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crm/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData(initialFormData);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const shouldReduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-graphite/10 pb-4">
          <div>
            <h2 className="font-display text-2xl text-brand-graphite">Send us an enquiry</h2>
            <p className="mt-1 text-sm text-brand-graphite/60">
              Step {step} of {totalSteps}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-2xl text-brand-graphite/40 transition-colors hover:text-brand-graphite"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-brand-mist">
          <motion.div
            initial={false}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3, ease: [0.25, 0.95, 0.45, 1] }}
            className="h-full bg-brand-salmon"
          />
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
              className="space-y-4 text-center py-8"
            >
              <div className="text-5xl">✓</div>
              <h3 className="font-display text-xl text-brand-graphite">Thank you!</h3>
              <p className="text-sm text-brand-graphite/70">
                We've received your enquiry and will respond within 24-48 hours. Check your email for confirmation.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.95, 0.45, 1] }}
              className="space-y-6"
            >
              {/* Step 1: Enquiry Type */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-brand-graphite/70">
                    What can we help you with? Choose the option that best describes your needs.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {enquiryTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateFormData('enquiryType', type.value)}
                        className={clsx(
                          'relative rounded-lg border-2 p-4 text-left transition-all',
                          formData.enquiryType === type.value
                            ? 'border-brand-salmon bg-brand-salmon/10'
                            : 'border-brand-graphite/15 bg-white/60 hover:border-brand-salmon/40'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <div className="font-semibold text-brand-graphite">{type.label}</div>
                            <div className="mt-1 text-xs text-brand-graphite/60">{type.description}</div>
                          </div>
                        </div>
                        {formData.enquiryType === type.value && (
                          <div className="absolute right-3 top-3 text-brand-salmon">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-brand-graphite/70">
                    How can we reach you? Please provide your contact information.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-brand-graphite/60 mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className="w-full rounded-lg border border-brand-graphite/15 bg-white/80 px-4 py-2.5 text-sm focus:border-brand-salmon focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-brand-graphite/60 mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        className="w-full rounded-lg border border-brand-graphite/15 bg-white/80 px-4 py-2.5 text-sm focus:border-brand-salmon focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-brand-graphite/60 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="w-full rounded-lg border border-brand-graphite/15 bg-white/80 px-4 py-2.5 text-sm focus:border-brand-salmon focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-brand-graphite/60 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className="w-full rounded-lg border border-brand-graphite/15 bg-white/80 px-4 py-2.5 text-sm focus:border-brand-salmon focus:outline-none"
                      />
                    </div>
                    {formData.enquiryType === 'education' && (
                      <>
                        <div>
                          <label className="block text-xs uppercase tracking-[0.2em] text-brand-graphite/60 mb-1.5">
                            Company/Salon
                          </label>
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => updateFormData('company', e.target.value)}
                            className="w-full rounded-lg border border-brand-graphite/15 bg-white/80 px-4 py-2.5 text-sm focus:border-brand-salmon focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-[0.2em] text-brand-graphite/60 mb-1.5">
                            Job Title
                          </label>
                          <input
                            type="text"
                            value={formData.jobTitle}
                            onChange={(e) => updateFormData('jobTitle', e.target.value)}
                            className="w-full rounded-lg border border-brand-graphite/15 bg-white/80 px-4 py-2.5 text-sm focus:border-brand-salmon focus:outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-brand-graphite/70">
                    Tell us about your needs. More details help us provide better guidance.
                  </p>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-brand-graphite/60 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => updateFormData('message', e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-brand-graphite/15 bg-white/80 px-4 py-2.5 text-sm focus:border-brand-salmon focus:outline-none"
                      placeholder="Tell us about your situation, goals, or specific questions. Include details like team size, timeline, or any concerns..."
                      required
                    />
                    <p className="mt-1 text-xs text-brand-graphite/50">
                      {formData.message.length} characters (minimum 10)
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-brand-graphite/60 mb-1.5">
                        Preferred Contact Method
                      </label>
                      <select
                        value={formData.preferredContactMethod}
                        onChange={(e) => updateFormData('preferredContactMethod', e.target.value)}
                        className="w-full rounded-lg border border-brand-graphite/15 bg-white/80 px-4 py-2.5 text-sm focus:border-brand-salmon focus:outline-none"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="either">Either</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-brand-graphite/60 mb-1.5">
                        Urgency
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => updateFormData('urgency', e.target.value)}
                        className="w-full rounded-lg border border-brand-graphite/15 bg-white/80 px-4 py-2.5 text-sm focus:border-brand-salmon focus:outline-none"
                      >
                        <option value="low">Low - No rush</option>
                        <option value="normal">Normal - Standard timeline</option>
                        <option value="high">High - Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Consent */}
              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-brand-graphite/70">
                    Please review your information before submitting.
                  </p>
                  <Surface variant="subtle" padding="md" className="space-y-3 text-sm">
                    <div>
                      <span className="text-brand-graphite/60">Enquiry Type:</span>{' '}
                      <span className="font-semibold text-brand-graphite">
                        {enquiryTypes.find((t) => t.value === formData.enquiryType)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-graphite/60">Name:</span>{' '}
                      <span className="font-semibold text-brand-graphite">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-graphite/60">Email:</span>{' '}
                      <span className="font-semibold text-brand-graphite">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div>
                        <span className="text-brand-graphite/60">Phone:</span>{' '}
                        <span className="font-semibold text-brand-graphite">{formData.phone}</span>
                      </div>
                    )}
                    {formData.company && (
                      <div>
                        <span className="text-brand-graphite/60">Company:</span>{' '}
                        <span className="font-semibold text-brand-graphite">{formData.company}</span>
                      </div>
                    )}
                  </Surface>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentToMarketing}
                      onChange={(e) => updateFormData('consentToMarketing', e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-brand-graphite/20 text-brand-salmon focus:ring-brand-salmon"
                    />
                    <span className="text-sm text-brand-graphite/70">
                      Yes, send me occasional updates about new courses, workshops, and resources. You can unsubscribe anytime.
                    </span>
                  </label>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-4 border-t border-brand-graphite/10 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={step > 1 ? handleBack : handleClose}
                  disabled={loading}
                >
                  {step > 1 ? 'Back' : 'Cancel'}
                </Button>
                {step < totalSteps ? (
                  <Button type="button" variant="secondary" onClick={handleNext} disabled={loading}>
                    Continue
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Sending...' : 'Send enquiry'}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}



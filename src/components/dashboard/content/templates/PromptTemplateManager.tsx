"use client";

import { useState } from "react";
import { TemplateForm } from "./TemplateForm";
import { GenerateForm } from "./GenerateForm";

type Template = {
  id: string;
  name: string;
};

type PromptTemplateManagerProps = {
  templates: Template[];
};

export function PromptTemplateManager({ templates }: PromptTemplateManagerProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl bg-white/60 p-6 border border-black/5">
        <h2 className="text-lg font-semibold text-black">Prompt template</h2>
        <p className="mt-1 text-xs text-black/60">
          Set reusable recipes for Lorraine&apos;s course teasers, lesson outlines, and campaign copy.
        </p>
        <div className="mt-4">
          <TemplateForm />
        </div>
      </div>
      <div className="rounded-xl bg-white/60 p-6 border border-black/5">
        <h2 className="text-lg font-semibold text-black">Generate draft</h2>
        <p className="mt-1 text-xs text-black/60">
          Queue Lorraine-branded content and review outputs below once the worker completes.
        </p>
        <div className="mt-4">
          <GenerateForm
            templates={templates.map((template) => ({
              id: template.id,
              name: template.name,
            }))}
          />
        </div>
      </div>
    </div>
  );
}








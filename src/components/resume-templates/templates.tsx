"use client";

import React from "react";
import { templatesListRegistry } from "@/lib/resume-templates/template-registry";
import { ResumeTemplateRenderer } from "@/components/resume-builder/templates/ResumeTemplateRenderer";

export const templatesList = templatesListRegistry.map(t => ({
  id: t.id,
  name: t.name,
  type: "FREE",
  category: t.category,
  description: t.description,
  previewImage: "",
  component: (props: any) => (
    <ResumeTemplateRenderer
      templateId={t.id}
      resumeData={props.data}
      mode="preview"
    />
  )
}));

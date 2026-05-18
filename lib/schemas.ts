import { z } from "zod";
import { VERTICALS } from "@/lib/types";

const verticalEnum = z.enum(VERTICALS);

export const verticalDetectionSchema = z.object({
  detected_vertical: verticalEnum,
  confidence: z.number().int().min(1).max(10),
  reasoning: z.string().min(8),
  possible_secondary_vertical: verticalEnum.nullable()
});

export const briefCoreSchema = z.object({
  company_name: z.string().min(1),
  detected_vertical: verticalEnum,
  company_overview: z.string().min(20),
  planet_use_case: z.string().min(20),
  planet_fit_score: z.number().int().min(1).max(10),
  fit_rationale: z.string().min(20),
  campaign_angle: z.string().min(12),
  suggested_next_action: z.string().min(12),
  risks_or_flags: z.string().min(8)
});

export const evalSchema = z
  .object({
    relevance: z.number().int().min(1).max(5),
    specificity: z.number().int().min(1).max(5),
    groundedness: z.number().int().min(1).max(5),
    actionability: z.number().int().min(1).max(5),
    total: z.number().int().min(4).max(20),
    flag: z.boolean(),
    eval_notes: z.string().min(12)
  })
  .transform((value) => {
    const total = value.relevance + value.specificity + value.groundedness + value.actionability;
    return {
      ...value,
      total,
      flag:
        value.flag ||
        total < 14 ||
        [value.relevance, value.specificity, value.groundedness, value.actionability].some(
          (score) => score <= 2
        )
    };
  });

export const requestSchema = z.object({
  companyName: z.string().trim().min(2).max(120)
});

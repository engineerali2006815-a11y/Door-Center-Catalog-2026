'use server';
/**
 * @fileOverview A Genkit flow for generating engaging product descriptions in Arabic for doors.
 *
 * - generateDoorDescription - A function that generates an Arabic product description for a door.
 * - GenerateDoorDescriptionInput - The input type for the generateDoorDescription function.
 * - GenerateDoorDescriptionOutput - The return type for the generateDoorDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDoorDescriptionInputSchema = z.object({
  style: z.string().describe('The overall style of the door, e.g., "كلاسيكي", "حديث", "ريفي", "بسيط".'),
  material: z.string().describe('The primary material of the door, e.g., "خشب", "فولاذ", "زجاج", "MDF".'),
  color: z.string().describe('The color of the door, e.g., "بني داكن", "أبيض", "أسود", "رمادي".'),
  features: z.array(z.string()).optional().describe('A list of key features of the door, e.g., "عازل للصوت", "مقاوم للحريق", "نقوش زخرفية", "متوافق مع القفل الذكي".'),
  dimensions: z.string().optional().describe('The dimensions of the door, e.g., "200x90 سم".'),
});
export type GenerateDoorDescriptionInput = z.infer<typeof GenerateDoorDescriptionInputSchema>;

const GenerateDoorDescriptionOutputSchema = z.object({
  description: z.string().describe('An engaging product description for the door in Arabic.'),
});
export type GenerateDoorDescriptionOutput = z.infer<typeof GenerateDoorDescriptionOutputSchema>;

export async function generateDoorDescription(input: GenerateDoorDescriptionInput): Promise<GenerateDoorDescriptionOutput> {
  return generateDoorDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDoorDescriptionPrompt',
  input: { schema: GenerateDoorDescriptionInputSchema },
  output: { schema: GenerateDoorDescriptionOutputSchema },
  prompt: `أنت خبير تسويق وتصف منتجات الأبواب الفاخرة باللغة العربية.
مهمتك هي كتابة وصف منتج جذاب ومقنع لباب تركي جديد بناءً على سماته ونمطه.
يجب أن يكون الوصف احترافيًا، أنيقًا، ويبرز الجودة العالية والتصميم الفريد للباب.

استخدم المعلومات التالية لإنشاء الوصف:

النمط: {{{style}}}
المادة: {{{material}}}
اللون: {{{color}}}
{{#if features}}
الميزات:
{{#each features}}- {{{this}}}
{{/each}}
{{/if}}
{{#if dimensions}}
الأبعاد: {{{dimensions}}}
{{/if}}

الهدف هو إثارة اهتمام العملاء وجعلهم يرغبون في شراء هذا الباب. اجعل الوصف موجزًا وجذابًا.
`,
});

const generateDoorDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDoorDescriptionFlow',
    inputSchema: GenerateDoorDescriptionInputSchema,
    outputSchema: GenerateDoorDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

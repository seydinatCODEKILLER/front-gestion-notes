import { z } from 'zod';

export const StatsSchema = z.object({
  total: z.number().min(0),
  active: z.number().min(0),
  inactive: z.number().min(0)
});

export const validateStatsData = (data) => {
  try {
    StatsSchema.parse(data);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      errors: error.flatten().fieldErrors
    };
  }
};
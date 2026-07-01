import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  picName: z.string().max(100).optional().or(z.literal("")),
  isPermanent: z.boolean(),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createSiteSchema = z.object({
  customerId: z.string().uuid(),
  name: z.string().min(2).max(150),
  address: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const createContractorSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  picName: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid(),
  siteId: z.string().uuid(),
  contractorId: z.string().uuid().optional().or(z.literal("")),
  planId: z.string().uuid(),
  type: z.enum(["PERMANENT", "MONTHLY"]),
  startDate: z.string(),
  dueDate: z.string().optional().or(z.literal("")),
  autoRenew: z.boolean().optional(),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string().max(50).optional().or(z.literal("")),
  reference: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

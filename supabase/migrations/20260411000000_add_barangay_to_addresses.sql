-- Add barangay column to addresses table for Philippine address support
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS barangay text;

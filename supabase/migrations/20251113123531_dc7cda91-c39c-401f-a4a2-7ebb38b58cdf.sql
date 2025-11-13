-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ratings are viewable by everyone"
ON public.ratings
FOR SELECT
USING (true);

CREATE POLICY "Clients can create ratings"
ON public.ratings
FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own ratings"
ON public.ratings
FOR UPDATE
USING (auth.uid() = client_id);

-- Add unique constraint so a client can only rate a freelancer once
CREATE UNIQUE INDEX unique_client_freelancer_rating ON public.ratings(freelancer_id, client_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ratings_updated_at
BEFORE UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
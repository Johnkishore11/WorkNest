-- Create user roles enum
CREATE TYPE user_role AS ENUM ('freelancer', 'client');

-- Create domains table
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create freelancer_profiles table
CREATE TABLE freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  skills TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_link TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Freelancer profiles policies
CREATE POLICY "Freelancer profiles are viewable by everyone"
  ON freelancer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Freelancers can update their own profile"
  ON freelancer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can insert their own profile"
  ON freelancer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Portfolios policies
CREATE POLICY "Portfolios are viewable by everyone"
  ON portfolios FOR SELECT
  USING (true);

CREATE POLICY "Freelancers can manage their own portfolios"
  ON portfolios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE freelancer_profiles.id = portfolios.freelancer_id
      AND freelancer_profiles.user_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Domains policies
CREATE POLICY "Domains are viewable by everyone"
  ON domains FOR SELECT
  USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_freelancer_profiles_updated_at
  BEFORE UPDATE ON freelancer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default domains
INSERT INTO domains (name, description, icon) VALUES
  ('Web Development', 'Full-stack, Frontend, Backend developers', 'Code'),
  ('Mobile Development', 'iOS, Android, React Native developers', 'Smartphone'),
  ('UI/UX Design', 'User Interface and User Experience designers', 'Palette'),
  ('Graphic Design', 'Logo, Brand, Print designers', 'PenTool'),
  ('Content Writing', 'Blog, Technical, Creative writers', 'FileText'),
  ('Digital Marketing', 'SEO, Social Media, PPC experts', 'TrendingUp'),
  ('Video Editing', 'Video production and editing professionals', 'Video'),
  ('AI/ML', 'Artificial Intelligence and Machine Learning experts', 'Brain');
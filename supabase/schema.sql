-- =====================================================================
-- UtsavRoute: Durga Puja Trip & Pandal Planner
-- Production PostgreSQL Database Schema for Supabase
-- Features: RBAC (User vs Admin), RLS Policies, Pandal Management,
--           User Itineraries, Live Crowd Toggles, Reviews & Curated Routes
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger to auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Pandals Table
CREATE TABLE IF NOT EXISTS public.pandals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    bengali_name TEXT,
    zone TEXT NOT NULL CHECK (zone IN ('North Kolkata', 'South Kolkata', 'Salt Lake & Newtown', 'Hooghly-Serampore Line', 'Kalyani & Districts', 'Central & Howrah')),
    theme_title TEXT NOT NULL,
    description TEXT,
    nearest_metro TEXT,
    nearest_railway TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    google_maps_url TEXT,
    image_url TEXT,
    crowd_status TEXT NOT NULL DEFAULT 'low' CHECK (crowd_status IN ('low', 'moderate', 'heavy', 'blocked')),
    vip_pass_available BOOLEAN DEFAULT false,
    is_route_open BOOLEAN DEFAULT true,
    traffic_notes TEXT DEFAULT 'Normal traffic flow',
    opening_hours TEXT DEFAULT '24 Hours during Puja days',
    avg_rating NUMERIC(3, 2) DEFAULT 4.8,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Fast Search & Filter Indexes
CREATE INDEX IF NOT EXISTS idx_pandals_zone ON public.pandals(zone);
CREATE INDEX IF NOT EXISTS idx_pandals_crowd ON public.pandals(crowd_status);
CREATE INDEX IF NOT EXISTS idx_pandals_name ON public.pandals USING gin(to_tsvector('english', name || ' ' || COALESCE(theme_title, '')));

-- 4. User Itineraries Table (Puja Day Plans)
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Puja Day Route',
    day_tag TEXT NOT NULL CHECK (day_tag IN ('Saptami', 'Ashtami', 'Navami', 'Dashami', 'General')),
    notes TEXT,
    share_code TEXT UNIQUE,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Itinerary Items Table (Pandals in a user plan)
CREATE TABLE IF NOT EXISTS public.itinerary_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL DEFAULT 1,
    visited BOOLEAN DEFAULT false,
    transit_mode TEXT DEFAULT 'walk' CHECK (transit_mode IN ('walk', 'metro', 'auto', 'cab', 'cycle')),
    user_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (itinerary_id, pandal_id)
);

-- 6. User Reviews & Check-ins Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
    user_name TEXT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    idol_rating INTEGER CHECK (idol_rating BETWEEN 1 AND 5),
    lighting_rating INTEGER CHECK (lighting_rating BETWEEN 1 AND 5),
    crowd_report TEXT CHECK (crowd_report IN ('low', 'moderate', 'heavy')),
    comment TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Curated Route Packages (Admin Recommended Walks)
CREATE TABLE IF NOT EXISTS public.curated_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    zone TEXT NOT NULL,
    description TEXT NOT NULL,
    badge TEXT DEFAULT 'Popular Heritage',
    estimated_time TEXT DEFAULT '4-5 Hours',
    pandal_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    banner_image TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pandals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_routes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Anyone can read, user can update own profile, admin can update any
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" 
    ON public.profiles FOR ALL USING (public.is_admin());

-- Pandals: Anyone can view, only Admins can insert/update/delete
CREATE POLICY "Pandals are viewable by everyone" 
    ON public.pandals FOR SELECT USING (true);
CREATE POLICY "Admins can insert pandals" 
    ON public.pandals FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update pandals" 
    ON public.pandals FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete pandals" 
    ON public.pandals FOR DELETE USING (public.is_admin());

-- Itineraries: Users can manage own itineraries; public itineraries viewable by anyone
CREATE POLICY "Users can view own or public itineraries" 
    ON public.itineraries FOR SELECT 
    USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own itineraries" 
    ON public.itineraries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own itineraries" 
    ON public.itineraries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own itineraries" 
    ON public.itineraries FOR DELETE USING (auth.uid() = user_id);

-- Itinerary Items: Users can manage items of their own itineraries
CREATE POLICY "View itinerary items" 
    ON public.itinerary_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.itineraries 
            WHERE itineraries.id = itinerary_items.itinerary_id 
            AND (itineraries.user_id = auth.uid() OR itineraries.is_public = true)
        )
    );
CREATE POLICY "Manage own itinerary items" 
    ON public.itinerary_items FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.itineraries 
            WHERE itineraries.id = itinerary_items.itinerary_id 
            AND itineraries.user_id = auth.uid()
        )
    );

-- Reviews: Approved reviews viewable by everyone; Users insert own; Admins moderate all
CREATE POLICY "Approved reviews are viewable by everyone" 
    ON public.reviews FOR SELECT 
    USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Authenticated users can post reviews" 
    ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can moderate reviews" 
    ON public.reviews FOR ALL USING (public.is_admin());

-- Curated Routes: Viewable by everyone; Admin manages
CREATE POLICY "Curated routes are viewable by everyone" 
    ON public.curated_routes FOR SELECT USING (true);
CREATE POLICY "Admins can manage curated routes" 
    ON public.curated_routes FOR ALL USING (public.is_admin());

-- =====================================================================
-- REAL-TIME ENABLEMENT (Idempotent)
-- Allows instant live crowd and status updates across client devices
-- =====================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pandals'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pandals;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reviews'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
    END IF;
END $$;

-- =====================================================================
-- PRE-POPULATED SEED DATA FOR WEST BENGAL PANDALS
-- =====================================================================
INSERT INTO public.pandals (id, name, bengali_name, zone, theme_title, description, nearest_metro, nearest_railway, latitude, longitude, google_maps_url, image_url, crowd_status, vip_pass_available, opening_hours, traffic_notes)
VALUES 
(
    'a0000000-0000-0000-0000-000000000001',
    'Bagbazar Sarbojanin Durgotsav',
    'বাগবাজার সার্বজনীন দুর্গোৎসব',
    'North Kolkata',
    'Traditional Sabeki Ekchala Protima & Century Heritage',
    'One of the oldest public Durga Pujas in Kolkata, entering its 106th year. Famous for pristine white sholar saaj idol and river immersion procession.',
    'Shyambazar (Blue Line) - Gate 1',
    'Bagbazar Ghat / Kolkata Station',
    22.6025,
    88.3672,
    'https://maps.google.com/?q=22.6025,88.3672',
    'https://images.unsplash.com/photo-1602498456745-e9503b30470b?auto=format&fit=crop&w=1000&q=80',
    'heavy',
    true,
    'Open 24 Hours',
    'Girad Avenue restricted after 4 PM. Pedestrian walk from Shyambazar.'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Chetla Agrani Club',
    'চেতলা অগ্রণী ক্লাব',
    'South Kolkata',
    'Chander Haat - Earthen Heritage & Clay Symphony',
    'Renowned for artistic conceptual installations made with sustainable terracotta, jute, and hand-painted scrolls.',
    'Kalighat (Blue Line) - Gate 4',
    'Majerhat Railway Station',
    22.5204,
    88.3411,
    'https://maps.google.com/?q=22.5204,88.3411',
    'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=1000&q=80',
    'moderate',
    true,
    'Open 24 Hours',
    'Chetla Central Road one-way. Park at Kalighat Park.'
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Sreebhumi Sporting Club',
    'শ্রীভূমি স্পোর্টিং ক্লাব',
    'North Kolkata',
    'Vatican City & Grand Palace of Golden Lights',
    'Famous for staggering architectural replicas adorned with pure gold & diamond ornaments on Ma Durga with Chandannagar lighting.',
    'Ultadanga / Salt Lake Stadium Metro',
    'Bidhannagar Road Station',
    22.5956,
    88.4024,
    'https://maps.google.com/?q=22.5956,88.4024',
    'https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2?auto=format&fit=crop&w=1000&q=80',
    'heavy',
    true,
    'Open 24 Hours',
    'VIP Road service lane barricaded. Footbridge active.'
),
(
    'a0000000-0000-0000-0000-000000000004',
    'Suruchi Sangha (New Alipore)',
    'সুরুচি সংঘ',
    'South Kolkata',
    'Amader Matri Shakti - Indigenous Folk Art of India',
    'Celebrates indigenous Indian states folk arts with soul-stirring original theme songs.',
    'Rabindra Sarobar (Blue Line)',
    'New Alipore Railway Station',
    22.5085,
    88.3347,
    'https://maps.google.com/?q=22.5085,88.3347',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    'moderate',
    true,
    'Open 24 Hours',
    'Smooth flow near Block M. Auto-rickshaws from Tollygunge Phari.'
),
(
    'a0000000-0000-0000-0000-000000000005',
    'Ballavpur Sarbojanin Durgotsav (Serampore)',
    'বল্লভপুর সার্বজনীন দুর্গোৎসব (শ্রীরামপুর)',
    'Hooghly-Serampore Line',
    'Danish Heritage & Traditional Sholar Saaj',
    'Serampore landmark celebration highlighting historic Danish colonial riverfront heritage.',
    'Dakshineswar Metro -> Train to Serampore',
    'Serampore Railway Station (5 min walk)',
    22.7512,
    88.3441,
    'https://maps.google.com/?q=22.7512,88.3441',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    'moderate',
    true,
    'Open 24 Hours',
    'GT Road Serampore pedestrian corridors active.'
),
(
    'a0000000-0000-0000-0000-000000000006',
    'Rishra Nabagram Sarbojanin',
    'রিষড়া নবগ্রাম সার্বজনীন',
    'Hooghly-Serampore Line',
    'Gramin Shanti & Traditional Terracotta Tapestry',
    'Famous across Hooghly for tranquil conceptual terracotta and dokra art installations.',
    'Dakshineswar Metro (via Bally)',
    'Rishra Railway Station (7 min walk)',
    22.7115,
    88.3512,
    'https://maps.google.com/?q=22.7115,88.3512',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    'low',
    false,
    'Open 24 Hours',
    'Nabagram main road open for two-wheelers.'
),
(
    'a0000000-0000-0000-0000-000000000007',
    'Konnagar Baromandir Ghat Sarbojanin',
    'কোন্নগর বারোমন্দির সার্বজনীন',
    'Hooghly-Serampore Line',
    'Sacred 12 Shiva Temples & Holy Ganges Reverence',
    'Located beside the historic Baromandir Ghat along the river Hooghly.',
    'Dakshineswar Metro (Blue Line)',
    'Konnagar Railway Station (6 min walk)',
    22.6990,
    88.3550,
    'https://maps.google.com/?q=22.6990,88.3550',
    'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=1000&q=80',
    'moderate',
    true,
    'Open 24 Hours',
    'Ghat promenade open for walking.'
),
(
    'a0000000-0000-0000-0000-000000000008',
    'Hind Motor Debaipukur Sarbojanin',
    'হিন্দ মোটর দেবাইপুকুর সার্বজনীন',
    'Hooghly-Serampore Line',
    'Industrial Heritage & Eco-Friendly Jute Craft',
    'Homage to Ambassador township heritage with eco-friendly jute and handloom art.',
    'Dakshineswar Metro (via Bally)',
    'Hind Motor Railway Station (5 min walk)',
    22.6840,
    88.3505,
    'https://maps.google.com/?q=22.6840,88.3505',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
    'low',
    false,
    'Open 24 Hours',
    'Station road clear for pedestrians.'
),
(
    'a0000000-0000-0000-0000-000000000009',
    'Uttarpara Shakher Bazar Sarbojanin',
    'উত্তরপাড়া শাঁখের বাজার সার্বজনীন',
    'Hooghly-Serampore Line',
    'Conch Shell Symphony & Ancient Library Lore',
    'Located near the historic Joykrishna Public Library.',
    'Dakshineswar Metro (10 min across bridge)',
    'Uttarpara Railway Station (4 min walk)',
    22.6685,
    88.3490,
    'https://maps.google.com/?q=22.6685,88.3490',
    'https://images.unsplash.com/photo-1602498456745-e9503b30470b?auto=format&fit=crop&w=1000&q=80',
    'moderate',
    true,
    'Open 24 Hours',
    'Direct connection to Bally & Dakshineswar.'
),
(
    'a0000000-0000-0000-0000-000000000010',
    'Chandannagar Strand Sarbojanin',
    'চন্দননগর স্ট্র্যান্ড সার্বজনীন',
    'Hooghly-Serampore Line',
    'French Colonial Splendor & World-Famous Light Craft',
    'Located along the historic French Strand promenade by the river Hooghly.',
    'Dakshineswar Metro -> Train to Chandannagar',
    'Chandannagar Railway Station (8 min by Toto)',
    22.8671,
    88.3674,
    'https://maps.google.com/?q=22.8671,88.3674',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    'heavy',
    true,
    'Open 24 Hours',
    'The Strand is strictly pedestrian. Illuminated river walk.'
),
(
    'a0000000-0000-0000-0000-000000000011',
    'Kalyani ITI More (Luminous Palace)',
    'কল্যাণী আইটিআই মোড় দুর্গোৎসব',
    'Kalyani & Districts',
    'Grand Hungarian Parliament & St. Peters Mirage',
    '120-foot tall architectural wonder with thousands of synchronized dynamic LED lights.',
    'Ranaghat / Kalyani Local Link',
    'Kalyani Railway Station (Main Line)',
    22.9752,
    88.4344,
    'https://maps.google.com/?q=22.9752,88.4344',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    'heavy',
    true,
    'Open 24 Hours',
    'Expressway special bus services active 24/7.'
)
ON CONFLICT (id) DO NOTHING;


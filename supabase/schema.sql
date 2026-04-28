-- ============================================
-- The Way — La Via del Cuore
-- Schema Supabase completo (idempotente)
--
-- Esecuzione: incolla TUTTO il file nello SQL Editor di Supabase
-- e premi "Run". È sicuro rieseguirlo: usa CREATE IF NOT EXISTS,
-- DROP POLICY IF EXISTS, ecc.
-- ============================================

-- ============================================
-- 1. TABELLE
-- ============================================

-- profiles: profilo utente, esteso oltre auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                       TEXT,
  age                        INT,
  goals                      TEXT,
  passions                   TEXT,
  dream                      TEXT,
  current_situation          TEXT,
  current_week               INT NOT NULL DEFAULT 1,
  telegram_id                TEXT UNIQUE,
  onboarding_completed       BOOLEAN NOT NULL DEFAULT false,
  last_meditation_completed  DATE,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_episode_progress: tracking completamento episodi (1-24 in Beta)
CREATE TABLE IF NOT EXISTS public.user_episode_progress (
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_number INT  NOT NULL,
  week_number    INT  NOT NULL,
  completed      BOOLEAN NOT NULL DEFAULT false,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, episode_number)
);

CREATE INDEX IF NOT EXISTS idx_user_episode_progress_user_week
  ON public.user_episode_progress (user_id, week_number);

-- episode_reflections: risposta utente alla domanda riflessiva di ogni episodio
CREATE TABLE IF NOT EXISTS public.episode_reflections (
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_number       INT  NOT NULL,
  reflection_text      TEXT NOT NULL,
  reflection_question  TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, episode_number)
);

-- weekly_practices: 3 pratiche per settimana, completate in massimo 14 giorni (jsonb { day1..day14 })
CREATE TABLE IF NOT EXISTS public.weekly_practices (
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number     INT  NOT NULL,
  practice_number INT  NOT NULL CHECK (practice_number BETWEEN 1 AND 3),
  completed_days  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_number, practice_number)
);

-- telegram_conversations: storia messaggi bot Telegram (sliding window 20 + cleanup 90gg via cron)
CREATE TABLE IF NOT EXISTS public.telegram_conversations (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telegram_conversations_user_created
  ON public.telegram_conversations (user_id, created_at DESC);

-- push_subscriptions: endpoint Web Push per inviare la "frase del giorno"
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON public.push_subscriptions (user_id);

-- ============================================
-- 2. TRIGGER: auto-creazione profilo alla signup
-- (la riga viene poi arricchita dalla pagina /register lato client)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_episode_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_reflections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_practices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions      ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---- user_episode_progress ----
DROP POLICY IF EXISTS "uep_select_own" ON public.user_episode_progress;
CREATE POLICY "uep_select_own" ON public.user_episode_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "uep_insert_own" ON public.user_episode_progress;
CREATE POLICY "uep_insert_own" ON public.user_episode_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "uep_update_own" ON public.user_episode_progress;
CREATE POLICY "uep_update_own" ON public.user_episode_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---- episode_reflections ----
DROP POLICY IF EXISTS "refl_select_own" ON public.episode_reflections;
CREATE POLICY "refl_select_own" ON public.episode_reflections
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "refl_insert_own" ON public.episode_reflections;
CREATE POLICY "refl_insert_own" ON public.episode_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "refl_update_own" ON public.episode_reflections;
CREATE POLICY "refl_update_own" ON public.episode_reflections
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---- weekly_practices ----
DROP POLICY IF EXISTS "wp_select_own" ON public.weekly_practices;
CREATE POLICY "wp_select_own" ON public.weekly_practices
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wp_insert_own" ON public.weekly_practices;
CREATE POLICY "wp_insert_own" ON public.weekly_practices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wp_update_own" ON public.weekly_practices;
CREATE POLICY "wp_update_own" ON public.weekly_practices
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---- telegram_conversations ----
-- Nessun accesso lato client: scrittura/lettura solo via service_role (API /api/telegram).
-- Non definendo policy permissive su anon/authenticated, tutte le query client falliscono.

-- ---- push_subscriptions ----
DROP POLICY IF EXISTS "push_select_own" ON public.push_subscriptions;
CREATE POLICY "push_select_own" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_insert_own" ON public.push_subscriptions;
CREATE POLICY "push_insert_own" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_delete_own" ON public.push_subscriptions;
CREATE POLICY "push_delete_own" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. updated_at automatico
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_reflections_updated_at ON public.episode_reflections;
CREATE TRIGGER trg_reflections_updated_at
  BEFORE UPDATE ON public.episode_reflections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_practices_updated_at ON public.weekly_practices;
CREATE TRIGGER trg_practices_updated_at
  BEFORE UPDATE ON public.weekly_practices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

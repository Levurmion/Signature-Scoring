
-- ==========================================
-- USER PROFILES
-- ==========================================

CREATE TABLE public.user_profile (
    user_id UUID PRIMARY KEY
        REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    fluency INTEGER NOT NULL,
    first_language TEXT NOT NULL,
    education TEXT NOT NULL
);

-- ==========================================
-- USER DATASETS
-- ==========================================

CREATE TABLE public.user_datasets (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_datasets_user_id
    ON public.user_datasets(user_id);

-- ==========================================
-- DATASET QUESTIONS
-- ==========================================

CREATE TABLE public.dataset_questions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dataset_id INTEGER NOT NULL
        REFERENCES public.user_datasets(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    question JSONB NOT NULL
);

CREATE INDEX idx_dataset_questions_dataset_id
    ON public.dataset_questions(dataset_id);

-- ==========================================
-- PERSONS
-- ==========================================

CREATE TABLE public.persons (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL
);

-- ==========================================
-- DOCUMENTS
-- ==========================================

CREATE TABLE public.documents (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type TEXT NOT NULL,
    meta JSONB
);

-- ==========================================
-- DOCUMENT / PERSON RELATIONSHIP
-- ==========================================

CREATE TABLE public.document_person_map (
    person_id INTEGER NOT NULL
        REFERENCES public.persons(id) ON DELETE CASCADE,
    document_id INTEGER NOT NULL
        REFERENCES public.documents(id) ON DELETE CASCADE,

    PRIMARY KEY (person_id, document_id)
);

CREATE INDEX idx_document_person_map_document_id
    ON public.document_person_map(document_id);

-- ==========================================
-- SIGNATURES
-- ==========================================

CREATE TABLE public.signatures (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    person_id INTEGER
        REFERENCES public.persons(id) ON DELETE SET NULL,
    document_id INTEGER NOT NULL
        REFERENCES public.documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_signatures_person_id
    ON public.signatures(person_id);

CREATE INDEX idx_signatures_document_id
    ON public.signatures(document_id);

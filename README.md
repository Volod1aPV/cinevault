# CineVault | Moje Filmová Knihovna

Tento projekt je plně funkční moderní webová aplikace typu **Knihovna filmů (Movie Library)**, vytvořená v **Next.js (App Router)** s využitím **Supabase API** jako databázového backendu.

Projekt byl vytvořen na základě zadání pro školní práci a demonstruje:
- Dynamické routování v Next.js.
- Práci s formuláři a validací na straně klienta (`react-hook-form` + `Zod`).
- Kompletní CRUD operace (Create, Read, Update, Delete) propojené se vzdálenou SQL databází.
- Responzivní a vizuálně atraktivní dark-themed design s glassmorphismem.

---

## 🛠 Použité technologie
- **Framework:** Next.js 15 (App Router, JavaScript)
- **Backend/Databáze:** Supabase (PostgreSQL, Client SDK)
- **Formuláře a validace:** `react-hook-form`, `zod`, `@hookform/resolvers`
- **Ikony:** `lucide-react`
- **Styling:** Vanilla CSS (CSS Modules) s vlastními CSS proměnnými a tmavým režimem

---

## 🚀 Rychlý start (Návod ke spuštění)

### 1. Klonování / Stažení projektu
Ujistěte se, že máte na svém počítači nainstalovaný Node.js. Následně nainstalujte závislosti projektu:
```bash
npm install
```

### 2. Nastavení Supabase databáze
1. Zaregistrujte se / Přihlaste se na [supabase.com](https://supabase.com).
2. Vytvořte nový projekt (např. s názvem `CineVault`).
3. Po vytvoření projektu přejděte do sekce **SQL Editor** v levém panelu.
4. Klikněte na **New query**, vložte níže uvedený SQL kód a klikněte na tlačítko **Run** (Spustit):

```sql
-- Vytvoření tabulky pro filmy
create table public.movies (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  director text not null,
  year integer not null,
  genre text not null,
  rating numeric(3, 1) not null check (rating >= 0 and rating <= 10),
  description text,
  poster_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Povolení Row Level Security (RLS)
alter table public.movies enable row level security;

-- Vytvoření bezpečnostní politiky pro veřejný přístup (čtení i zápis pro vývoj)
create policy "Public access to movies"
on public.movies
for all
using (true)
with check (true);

-- Vložení úvodních filmů (seed data)
insert into public.movies (title, director, year, genre, rating, description, poster_url)
values
  ('Inception', 'Christopher Nolan', 2010, 'Sci-Fi', 8.8, 'Zloděj, který krade firemní tajemství prostřednictvím sdílení snů, dostane opačný úkol: zasadit myšlenku do mysli ředitele velkého koncernu.', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80'),
  ('Interstellar', 'Christopher Nolan', 2014, 'Sci-Fi', 8.7, 'Tým výzkumníků cestuje červí dírou ve vesmíru, aby zajistil přežití lidstva na nové planetě.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'),
  ('The Dark Knight', 'Christopher Nolan', 2008, 'Action', 9.0, 'Když hrozba známá jako Joker začne terorizovat obyvatele Gothamu, Batman musí podstoupit jednu z největších psychických i fyzických zkoušek své síly.', 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80'),
  ('Pulp Fiction', 'Quentin Tarantino', 1994, 'Crime', 8.9, 'Životy dvou mafiánských zabijáků, boxera, gangstera a jeho ženy se proplétají ve čtyřech příbězích násilí a vykoupení.', 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80');
```

### 3. Konfigurace proměnných prostředí
1. V kořenovém adresáři vytvořte soubor s názvem `.env.local` (můžete zkopírovat soubor `.env.local.example`).
2. Vyplňte přístupové údaje z vašeho projektu Supabase (najdete je v sekci **Project Settings** -> **API**):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=vaše_supabase_url_adresa
   NEXT_PUBLIC_SUPABASE_ANON_KEY=váš_anon_api_klíč
   ```

### 4. Spuštění vývojového serveru
Spusťte lokální server příkazem:
```bash
npm run dev
```
Nyní můžete aplikaci otevřít v prohlížeči na adrese [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktura složek projektu
Aplikace využívá **Next.js App Router**:
```
movie-library-app/
├── app/
│   ├── layout.js          # Hlavní layout, hlavička a patička
│   ├── page.js            # Úvodní domovská stránka (landing page)
│   ├── globals.css        # Globální styly, CSS proměnné, dark theme
│   └── movies/
│       ├── page.jsx       # Seznam filmů s vyhledáváním a filtrem
│       ├── [id]/
│       │   ├── page.jsx   # Detail konkrétního filmu
│       │   └── edit/
│       │       └── page.jsx # Formulář pro úpravu filmu
│       └── new/
│           └── page.jsx   # Formulář pro přidání filmu
├── components/
│   ├── Header.jsx         # Navigační panel
│   ├── MovieCard.jsx      # Karta s přehledem filmu (Grid list item)
│   └── MovieForm.jsx      # Společný formulář pro přidání a úpravu filmů (s validací)
├── lib/
│   ├── supabase.js        # Inicializace Supabase klienta
│   └── schemas.js         # Zod validační schémata
├── .env.local.example     # Ukázkový soubor nastavení API klíčů
└── package.json
```

---

## 📝 Validace formulářů
Validace je implementována v komponentě `MovieForm.jsx` pomocí knihovny **Zod** (validační pravidla naleznete v `lib/schemas.js`) v propojení s **React Hook Form**:
- **Název filmu:** Povinné pole, délka 2 - 100 znaků.
- **Režisér:** Povinné pole, délka 2 - 100 znaků.
- **Rok vydání:** Číselné pole, celé číslo od roku 1888 po rok `aktuální_rok + 5`.
- **Žánr:** Povinná volba ze selektoru.
- **Hodnocení:** Číselné pole, rozsah 0.0 až 10.0.
- **URL plakátu:** Volitelné pole, pokud je však vyplněno, musí splňovat formát platné internetové URL adresy.

---

## 🐙 Git větve & Vývojový workflow
Projekt demonstruje profesionální verzování pomocí Git:
- **`main`** – Stabilní produkční větev.
- **`feature/setup`** – Nastavení projektu, instalace závislostí a konfigurace Supabase klienta.
- **`feature/styling-components`** – Tvorba CSS design systému a společných komponent (`Header`, `MovieCard`, `MovieForm`).
- **`feature/crud`** – Implementace kompletní CRUD logiky a propojení všech stránek s databází.

Všechny změny byly postupně sloučeny do vývojových větví a nakonec do hlavní větve `main`.

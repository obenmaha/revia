# 🚀 FIX RAPIDE - Types Supabase

## ⚡ SOLUTION EN 30 SECONDES

```bash
# 1. Copier les types existants
cp src/lib/supabase.ts src/types/supabase.ts

# 2. Vérifier que ça marche
npm run build
```

## ❌ NE JAMAIS FAIRE

```bash
# Cette commande prend 5+ minutes et échoue
npx supabase gen types typescript --local > src/types/supabase.ts
```

## ✅ POURQUOI ÇA MARCHE

- Le projet utilise **Supabase API** (cloud), pas local
- Les types existent déjà dans `src/lib/supabase.ts`
- Il suffit de les copier vers `src/types/supabase.ts`

---

**Référence** : `docs/agent-guidance-supabase-types.md` pour plus de détails

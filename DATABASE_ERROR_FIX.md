# Database Error Fix - Missing Tables

## 🔴 Problem

The application was showing 500 errors for several API endpoints:

```
GET /api/achievements 500 - Could not find table 'public.user_achievements'
GET /api/focus-practice 500 - Could not find table 'public.focus_practice_sessions' 
GET /api/daily-quests 401 - Missing quest tables
```

## ✅ Solution

The database was missing several required tables that the APIs depend on. I've created all the missing tables and functions.

## 🚀 How to Fix

### Option 1: Update Main Schema (Recommended)
If setting up a fresh database, use the updated `supabase/schema.sql` file which now includes all tables.

### Option 2: Run Migration Script
If you have an existing database, run the migration script:

```sql
-- Execute this in your Supabase SQL editor
\i migrations/run-migrations.sql
```

### Option 3: Manual Execution
Copy and paste the contents of `migrations/run-migrations.sql` into your Supabase SQL editor and execute.

## 📋 Tables Added

### 1. **user_achievements**
Stores user achievements and micro-wins for the dashboard greeting system.

### 2. **focus_practice_sessions**  
Tracks effectiveness of Focus Area practice sessions for the new drill feature.

### 3. **user_progress**
Manages XP, levels, and streaks for gamification.

### 4. **daily_activities**
Logs daily practice activity for streak calculation.

### 5. **daily_quest_sets**
Manages daily quest sets (one per user per day).

### 6. **daily_quests**
Individual quests within each daily set.

### 7. **quest_progress_log**
Tracks real-time progress updates for quests.

### 8. **streak_shields**
Records streak shield achievements.

## 🔧 Functions Added

- `calculate_level_from_xp()` - XP to level conversion
- `calculate_current_streak()` - Streak calculation logic  
- `get_user_progress_summary()` - Progress data for APIs

## 🛡️ Security

All tables include:
- ✅ Row Level Security (RLS) enabled
- ✅ User-specific access policies  
- ✅ Proper foreign key relationships
- ✅ Appropriate permissions for authenticated users

## 🧪 Testing

After running the migrations, test these endpoints:

```bash
# Should return 200 instead of 500
GET /api/achievements
GET /api/focus-practice?user_id=<uuid>&days=7  
GET /api/daily-quests?date=2025-08-14
GET /api/progress
```

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Run Once**: The migration script includes safety checks to prevent duplicate table creation
3. **User Dependencies**: Some tables depend on the `profiles` table existing
4. **Enum Types**: Quest and difficulty enums are created safely with error handling

## 🎯 Expected Results

After applying the fix:
- ✅ Focus Areas will show practice effectiveness metrics
- ✅ Achievement system will work properly  
- ✅ Daily quests will be accessible
- ✅ No more 500 errors on dashboard load
- ✅ All gamification features will function

---

**Migration Date**: August 2025  
**Status**: ✅ Ready to Deploy  
**Safety**: Includes rollback-safe checks
-- Update wardrobe season constraint from 2-season to 4-season model
alter table wardrobe drop constraint if exists wardrobe_season_check;

alter table wardrobe
  add constraint wardrobe_season_check
  check (season in ('spring', 'summer', 'autumn', 'winter', 'all_season'));

-- Migrate existing data
update wardrobe set season = 'spring'  where season = 'spring_summer';
update wardrobe set season = 'autumn'  where season = 'autumn_winter';

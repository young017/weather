-- liked_styles, disliked_styles 컬럼 추가
alter table profiles
  add column if not exists liked_styles text[] not null default '{}',
  add column if not exists disliked_styles text[] not null default '{}';

-- gender에 기본값 추가 (온보딩에서 수집 안 해도 되도록)
alter table profiles
  alter column gender set default 'neutral';

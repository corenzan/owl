create table if not exists websites (
    id serial primary key,
    updated timestamp not null default now(),
    url text not null,
    status int default 0
);

create table if not exists checks (
    id serial primary key,
    created timestamp not null default now(),
    website_id integer references websites (id),
    status integer not null,
    latency integer not null
);

-- 2019-04-10
create or replace function public.percentage(a numeric, b numeric)
returns numeric language sql as $function$
    select case when b = 0 then 0 else 100.0 / b * a end;
$function$;

-- 2019-04-11 11:23:31
alter table websites rename column timestamp to updated;
alter table websites alter updated type timestamptz using updated at time zone 'utc';
alter table checks rename column timestamp to created;
alter table checks alter created type timestamptz using created at time zone 'utc';

drop table if exists websites cascade;
create table websites (
    id serial primary key,
    timestamp timestamp not null default now(),
    url text not null,
    status int default 0
);

drop table if exists checks cascade;
create table checks (
    id serial primary key,
    timestamp timestamp not null default now(),
    website_id integer references websites (id),
    status integer not null,
    latency integer not null
);
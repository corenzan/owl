drop table if exists websites;
create table websites (
    id serial primary key,
    timestamp timestamp not null default now(),
    url text not null
);

drop table if exists checks;
create table checks (
    id serial primary key,
    website_id integer references websites (id),
    timestamp timestamp not null default now(),
    status integer not null,
    latency integer not null,
    response text,
);